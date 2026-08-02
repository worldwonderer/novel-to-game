#!/usr/bin/env python3
"""Dependency-free structural validation for the NovelToGame skill set."""

from __future__ import annotations

import json
import hashlib
import re
import subprocess
import sys
from pathlib import Path


EXPECTED_SKILLS = {
    "game-art-direction",
    "novel-to-game",
    "novel-game-analyze",
    "game-concept",
    "game-world-design",
    "game-build",
    "game-qa",
}
EXAMPLE_MANIFEST = "example.json"
# 示例的原著结构因语言而异（回目写法、章数、覆盖节标题、引用格式），
# 不能写死在校验器里，否则仓库结构上只容得下中文章回体原著。
# 每个示例用 example.json 自述这些取值，校验器只校验「自述得对不对」。
MANIFEST_REQUIRED = {
    "language",
    "source",
    "coverageHeading",
    "citationPattern",
    "publicationTier",
}
SOURCE_REQUIRED = {"chapters", "headingPattern", "numeral"}
NUMERAL_KINDS = {"chinese", "arabic", "roman"}
PUBLICATION_TIERS = {
    "graybox",
    "playable-prototype",
    "polished-vertical-slice",
    "showcase",
}
GATE_STATUSES = {"NOT_RUN", "FAIL", "PASS"}
VISUAL_RUBRIC_FIELDS = {
    "focus",
    "silhouette",
    "depth",
    "materialLine",
    "lightColor",
    "hud",
    "motionFeedback",
    "artifacts",
    "failureExamples",
}
# The orchestrator owns the pipeline-wide language rule; every downstream skill has to
# restate it, because cross-skill links are rejected and skills must stay self-contained.
ORCHESTRATOR_SKILL = "novel-to-game"
OUTPUT_LANGUAGE_RULE = (
    "产物语言由 `PRODUCT_BRIEF.md` 锁定；未锁定时跟随对话语言，不默认产出中文。"
)
PLUGIN_MANIFESTS = {
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "kimi.plugin.json",
}
# These markers protect the small handoff contract between game-build and game-qa.
# The repository validator checks only its own skill prose; it does not impose a
# framework, schema package, or runtime dependency on generated projects.
MINIMAL_EVIDENCE_REQUIREMENTS = {
    "skills/game-art-direction/SKILL.md": (
        "语音策略",
        "采用门禁",
        "静音 / 缺音降级",
        "音色权利",
    ),
    "skills/game-art-direction/references/art-direction-method.md": (
        "硬否决",
        "增量价值",
        "触发窗口",
        "最小覆盖原则",
        "角色级选角",
        "宣传资产不自动变成游戏内资产",
    ),
    "skills/game-build/references/build-brief-contract.md": (
        "targetRuntime:",
        "testedRuntime:",
        "runtimeVersion:",
        "verify:",
        "completeRun: qa/verification.json#completeRun",
        "evidenceIndex: qa/verification.json#checkpoints",
        "语音资产台账",
        "request_sha256",
    ),
    "skills/game-build/SKILL.md": (
        "权威验证命令",
        "verify.log",
        "executed: true",
        "clean start",
        "tts-production-contract.md",
        "服务端",
    ),
    "skills/game-build/references/tts-production-contract.md": (
        "采用决策交接",
        "决定=采用",
        "构建期优先",
        "最小发送",
        "Retry-After",
        "请求指纹",
        "NOT_RUN: 原因",
        "人工试听",
        "不得只按语言选一个",
    ),
    "skills/game-qa/SKILL.md": (
        "ORPHANED_TEST_SUITE",
        "qa/verification.json",
        "discovered from",
        "clean start",
        "语音与 TTS",
    ),
    "skills/game-qa/references/qa-contract.md": (
        "目标运行环境",
        "suite | discovered from | files | runner | observed in verify | result",
        "NOT_RUN: reason",
        "同一个 complete-run step",
        "同一个 source commit",
        "API 密钥",
        "人工试听",
        "说话人与选角",
        "损坏文件",
        "采用范围",
        "scope drift",
    ),
}
EXAMPLE_PLANNING_FILES = {
    "analysis/SOURCE_BIBLE.md",
    "concepts/CONCEPT.md",
    "design/GAME_DESIGN.md",
    "design/ART_DIRECTION.md",
    "build/BUILD_BRIEF.md",
}
# Allowed but not required — legacy examples may predate coverage tracking, while
# richer examples may keep a build asset ledger beside the frozen build brief.
OPTIONAL_PLANNING_FILES = {
    "analysis/_coverage.md",
    "build/asset-ledger.json",
    "design/VISUAL_TARGETS.md",
    "design/VOICE_AUDITION.json",
}
FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---", re.DOTALL)
FIELD_RE = re.compile(r"^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*)$")
LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
CHAPTER_HEADING_RE = re.compile(r"^\s*第([〇零○一二三四五六七八九十百]+)回\s+(.+?)\s*$")
CHAPTER_CITATION_RE = re.compile(r"第(\d{1,3})(?:\s*[-–—至]\s*(\d{1,3}))?回")
LEVEL_TWO_HEADING_RE = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)
CHINESE_DIGITS = {
    "〇": 0,
    "零": 0,
    "○": 0,
    "一": 1,
    "二": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
}
VALIDATION_IGNORED_DIRECTORIES = {
    "node_modules",
    "dist",
    "coverage",
    "__pycache__",
}


def visible_directories(parent: Path) -> set[str]:
    """Directory names under `parent`, skipping dotted agent/tooling state dirs.

    `.omc/` and friends are gitignored but still present in a maintainer's working
    copy, so enumerating raw `iterdir()` made the documented verification command
    fail locally while CI (a clean checkout) stayed green.
    """
    return {
        path.name
        for path in parent.iterdir()
        if path.is_dir() and not path.name.startswith(".")
    }


def validation_json_files(root: Path) -> list[Path]:
    """Return authored JSON while excluding local state and generated trees."""
    return sorted(
        path
        for path in root.rglob("*.json")
        if not any(
            part.startswith(".") or part in VALIDATION_IGNORED_DIRECTORIES
            for part in path.relative_to(root).parts[:-1]
        )
    )


def parse_frontmatter(text: str) -> dict[str, str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}
    values: dict[str, str] = {}
    for line in match.group(1).splitlines():
        field = FIELD_RE.match(line)
        if field:
            values[field.group(1)] = field.group(2).strip().strip('"')
    return values


ROMAN_VALUES = {"i": 1, "v": 5, "x": 10, "l": 50, "c": 100, "d": 500, "m": 1000}


def parse_roman_number(value: str) -> int:
    total, previous = 0, 0
    for character in reversed(value.lower()):
        current = ROMAN_VALUES[character]
        total += current if current >= previous else -current
        previous = max(previous, current)
    return total


def parse_numeral(value: str, kind: str) -> int:
    if kind == "arabic":
        return int(value)
    if kind == "roman":
        return parse_roman_number(value)
    return parse_chinese_number(value)


def parse_chinese_number(value: str) -> int:
    if all(character in CHINESE_DIGITS for character in value):
        return int("".join(str(CHINESE_DIGITS[character]) for character in value))

    total = 0
    current = 0
    for character in value:
        if character in CHINESE_DIGITS:
            current = CHINESE_DIGITS[character]
        elif character == "十":
            total += (current or 1) * 10
            current = 0
        elif character == "百":
            total += (current or 1) * 100
            current = 0
        else:
            raise ValueError(f"unsupported Chinese numeral: {value}")
    return total + current


def extract_chapters(
    source: Path, pattern: re.Pattern[str] | None = None, numeral: str = "chinese"
) -> list[tuple[int, str, int]]:
    heading = pattern or CHAPTER_HEADING_RE
    chapters: list[tuple[int, str, int]] = []
    for line_number, line in enumerate(
        source.read_text(encoding="utf-8").splitlines(), start=1
    ):
        match = heading.match(line)
        if match:
            title = match.group(2) if match.lastindex and match.lastindex >= 2 else ""
            chapters.append((parse_numeral(match.group(1), numeral), title, line_number))
    return chapters


def markdown_section(text: str, heading: str) -> str | None:
    matches = list(LEVEL_TWO_HEADING_RE.finditer(text))
    for index, match in enumerate(matches):
        if match.group(1) != heading:
            continue
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        return text[match.end() : end].strip()
    return None


def chapter_citation_coverage(
    text: str, pattern: re.Pattern[str] | None = None
) -> set[int]:
    coverage: set[int] = set()
    for match in (pattern or CHAPTER_CITATION_RE).finditer(text):
        first = int(match.group(1))
        last = int(match.group(2) or first)
        if first <= last:
            coverage.update(range(first, last + 1))
    return coverage


def validate_skill(skill_dir: Path) -> list[str]:
    issues: list[str] = []
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.is_file():
        return [f"{skill_dir.name}: missing SKILL.md"]

    text = skill_md.read_text(encoding="utf-8")
    frontmatter = parse_frontmatter(text)
    if frontmatter.get("name") != skill_dir.name:
        issues.append(f"{skill_dir.name}: frontmatter name does not match directory")
    description = frontmatter.get("description")
    if not description:
        issues.append(f"{skill_dir.name}: missing description")
    elif not description[:1].isascii() or not description[:1].isalpha():
        # The description is what an agent routes an English request against, and what a
        # plugin directory shows as listing copy with no README_EN fallback.
        issues.append(f"{skill_dir.name}: description must lead with English")
    if skill_dir.name != ORCHESTRATOR_SKILL and OUTPUT_LANGUAGE_RULE not in text:
        issues.append(f"{skill_dir.name}: missing the output-language rule")
    if "TODO" in text:
        issues.append(f"{skill_dir.name}: unresolved TODO")

    metadata = skill_dir / "agents/openai.yaml"
    if not metadata.is_file():
        issues.append(f"{skill_dir.name}: missing agents/openai.yaml")
    elif f"${skill_dir.name}" not in metadata.read_text(encoding="utf-8"):
        issues.append(f"{skill_dir.name}: default prompt must name ${skill_dir.name}")

    for markdown in skill_dir.rglob("*.md"):
        body = markdown.read_text(encoding="utf-8")
        if "TODO" in body:
            issues.append(f"{markdown.relative_to(skill_dir)}: unresolved TODO")
        for raw_target in LINK_RE.findall(body):
            target = raw_target.split("#", 1)[0].strip()
            if not target or "://" in target or target.startswith(("#", "mailto:")):
                continue
            resolved = (markdown.parent / target).resolve()
            try:
                resolved.relative_to(skill_dir.resolve())
            except ValueError:
                issues.append(
                    f"{markdown.relative_to(skill_dir)}: link leaves skill: {target}"
                )
                continue
            if not resolved.exists():
                issues.append(
                    f"{markdown.relative_to(skill_dir)}: broken link: {target}"
                )
    return issues


def read_manifest(example_dir: Path) -> tuple[dict[str, object] | None, list[str]]:
    """读示例自述文件。返回 (manifest, issues)；manifest 为 None 表示不可用。"""
    path = example_dir / EXAMPLE_MANIFEST
    if not path.is_file():
        return None, [f"{example_dir.name}: missing {EXAMPLE_MANIFEST}"]
    try:
        manifest = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        return None, [f"{example_dir.name}/{EXAMPLE_MANIFEST}: invalid JSON: {error}"]
    if not isinstance(manifest, dict):
        return None, [f"{example_dir.name}/{EXAMPLE_MANIFEST}: must be an object"]

    issues: list[str] = []
    missing = MANIFEST_REQUIRED - manifest.keys()
    if missing:
        issues.append(
            f"{example_dir.name}/{EXAMPLE_MANIFEST}: missing {sorted(missing)}"
        )
    if manifest.get("publicationTier") not in PUBLICATION_TIERS:
        issues.append(
            f"{example_dir.name}/{EXAMPLE_MANIFEST}: publicationTier must be one of "
            f"{sorted(PUBLICATION_TIERS)}"
        )
    source = manifest.get("source")
    if not isinstance(source, dict):
        issues.append(f"{example_dir.name}/{EXAMPLE_MANIFEST}: source must be an object")
    else:
        source_missing = SOURCE_REQUIRED - source.keys()
        if source_missing:
            issues.append(
                f"{example_dir.name}/{EXAMPLE_MANIFEST}: source missing {sorted(source_missing)}"
            )
        if source.get("numeral") not in NUMERAL_KINDS:
            issues.append(
                f"{example_dir.name}/{EXAMPLE_MANIFEST}: numeral must be one of {sorted(NUMERAL_KINDS)}"
            )
    for key in ("headingPattern",):
        raw = (source or {}).get(key) if isinstance(source, dict) else None
        if isinstance(raw, str):
            try:
                re.compile(raw)
            except re.error as error:
                issues.append(f"{example_dir.name}/{EXAMPLE_MANIFEST}: {key}: {error}")
    raw_citation = manifest.get("citationPattern")
    if isinstance(raw_citation, str):
        try:
            re.compile(raw_citation)
        except re.error as error:
            issues.append(
                f"{example_dir.name}/{EXAMPLE_MANIFEST}: citationPattern: {error}"
            )
    return (None if issues else manifest), issues


def _read_json_object(path: Path, label: str) -> tuple[dict[str, object] | None, list[str]]:
    if not path.is_file():
        return None, [f"{label}: missing file"]
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        return None, [f"{label}: invalid JSON: {error}"]
    if not isinstance(value, dict):
        return None, [f"{label}: must be an object"]
    return value, []


def _workspace_evidence_issue(
    example_dir: Path, raw: object, field: str
) -> str | None:
    if not isinstance(raw, str) or not raw.strip():
        return f"{example_dir.name}/qa/release-gates.json: {field} must be a non-empty path"
    candidate = Path(raw)
    if candidate.is_absolute() or "://" in raw:
        return f"{example_dir.name}/qa/release-gates.json: {field} must be workspace-local: {raw}"
    resolved = (example_dir / candidate).resolve()
    try:
        resolved.relative_to(example_dir.resolve())
    except ValueError:
        return f"{example_dir.name}/qa/release-gates.json: {field} leaves the example workspace: {raw}"
    if not resolved.is_file():
        return f"{example_dir.name}/qa/release-gates.json: {field} does not exist: {raw}"
    return None


def _validate_evidence_list(
    example_dir: Path,
    value: object,
    field: str,
    *,
    required: bool,
) -> list[str]:
    prefix = f"{example_dir.name}/qa/release-gates.json"
    if not isinstance(value, list):
        return [f"{prefix}: {field} must be an array"]
    if required and not value:
        return [f"{prefix}: {field} must not be empty"]
    issues: list[str] = []
    for index, raw in enumerate(value):
        issue = _workspace_evidence_issue(example_dir, raw, f"{field}[{index}]")
        if issue:
            issues.append(issue)
    return issues


def _progress_gate_statuses(path: Path) -> dict[str, set[str]]:
    statuses: dict[str, set[str]] = {}
    if not path.is_file():
        return statuses
    pattern = re.compile(
        r"^\s*(?:[-*]\s*)?`?gate:(intake|analyze|concept|design|art|build|qa)"
        r"\s+(NOT_RUN|FAIL|PASS)(?=`|\s|\(|\[|—|–|-|$)",
        re.IGNORECASE | re.MULTILINE,
    )
    for gate, status in pattern.findall(path.read_text(encoding="utf-8")):
        statuses.setdefault(gate.lower(), set()).add(status.upper())
    return statuses


def _validate_target_finish_inheritance(
    example_dir: Path, target_finish: object, demonstrated_tier: object
) -> list[str]:
    issues: list[str] = []
    for relative in (
        "PRODUCT_BRIEF.md",
        "design/ART_DIRECTION.md",
        "build/BUILD_BRIEF.md",
        "qa/QA_REPORT.md",
    ):
        path = example_dir / relative
        if not path.is_file():
            issues.append(f"{example_dir.name}/{relative}: missing targetFinish source")
            continue
        values = re.findall(
            r"^\s*`?targetFinish:\s*([a-z-]+)`?\s*$",
            path.read_text(encoding="utf-8"),
            flags=re.MULTILINE,
        )
        unique = set(values)
        if not values:
            issues.append(f"{example_dir.name}/{relative}: missing canonical targetFinish")
        elif len(unique) != 1:
            issues.append(
                f"{example_dir.name}/{relative}: conflicting targetFinish values {sorted(unique)}"
            )
        elif next(iter(unique)) != target_finish:
            issues.append(
                f"{example_dir.name}/{relative}: targetFinish must match qa/release-gates.json"
            )
    visual_targets = example_dir / "design/VISUAL_TARGETS.md"
    if visual_targets.is_file() or demonstrated_tier != "graybox":
        relative = "design/VISUAL_TARGETS.md"
        if not visual_targets.is_file():
            issues.append(
                f"{example_dir.name}/{relative}: required above demonstrated graybox"
            )
        else:
            values = re.findall(
                r"^\s*`?targetFinish:\s*([a-z-]+)`?\s*$",
                visual_targets.read_text(encoding="utf-8"),
                flags=re.MULTILINE,
            )
            unique = set(values)
            if not values:
                issues.append(
                    f"{example_dir.name}/{relative}: missing canonical targetFinish"
                )
            elif len(unique) != 1:
                issues.append(
                    f"{example_dir.name}/{relative}: conflicting targetFinish values "
                    f"{sorted(unique)}"
                )
            elif next(iter(unique)) != target_finish:
                issues.append(
                    f"{example_dir.name}/{relative}: targetFinish must match "
                    "qa/release-gates.json"
                )
    return issues


def _validate_build_release_states(
    example_dir: Path,
    publication_tier: object,
    demonstrated_tier: object,
    graybox_status: object,
    promotion_status: object,
) -> list[str]:
    path = example_dir / "build/BUILD_BRIEF.md"
    if not path.is_file():
        return [f"{example_dir.name}/build/BUILD_BRIEF.md: missing release states"]
    text = path.read_text(encoding="utf-8")
    expected = {
        "publicationTier": publication_tier,
        "demonstratedTier": demonstrated_tier,
        "grayboxReady": graybox_status,
        "visualPromotion": promotion_status,
    }
    issues: list[str] = []
    for field, expected_value in expected.items():
        values = re.findall(
            rf"^\s*`?{field}:\s*([A-Za-z_-]+)`?\s*$", text, flags=re.MULTILINE
        )
        unique = set(values)
        label = f"{example_dir.name}/build/BUILD_BRIEF.md"
        if not values:
            issues.append(f"{label}: missing canonical {field}")
        elif len(unique) != 1:
            issues.append(f"{label}: conflicting {field} values {sorted(unique)}")
        elif next(iter(unique)) != expected_value:
            issues.append(f"{label}: {field} must match qa/release-gates.json")
    return issues


def _git_commit_app_fingerprint(example_dir: Path, commit: str) -> str | None:
    """Reproduce the app fingerprint from committed bytes when Git can expose them."""
    root_result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        cwd=example_dir,
        capture_output=True,
        text=True,
        check=False,
    )
    if root_result.returncode != 0:
        return None
    root = Path(root_result.stdout.strip()).resolve()
    app = (example_dir / "build/app").resolve()
    try:
        app_relative = app.relative_to(root).as_posix()
    except ValueError:
        return None
    tree_result = subprocess.run(
        ["git", "ls-tree", "-r", "--name-only", commit, "--", app_relative],
        cwd=root,
        capture_output=True,
        text=True,
        check=False,
    )
    if tree_result.returncode != 0:
        return None
    selected_by_relative: dict[str, str] = {}
    for repository_path in tree_result.stdout.splitlines():
        relative = Path(repository_path).relative_to(app_relative).as_posix()
        if relative in {"index.html", "package.json", "package-lock.json"} or relative.startswith(
            ("public/", "src/")
        ):
            selected_by_relative[relative] = repository_path
    if not selected_by_relative:
        return None
    ordered_relative = [
        relative
        for relative in ("index.html", "package.json", "package-lock.json")
        if relative in selected_by_relative
    ]
    ordered_relative += sorted(
        relative
        for relative in selected_by_relative
        if relative.startswith(("public/", "src/"))
    )
    digest = hashlib.sha256()
    for relative in ordered_relative:
        repository_path = selected_by_relative[relative]
        blob = subprocess.run(
            ["git", "show", f"{commit}:{repository_path}"],
            cwd=root,
            capture_output=True,
            check=False,
        )
        if blob.returncode != 0:
            return None
        digest.update(relative.encode())
        digest.update(b"\0")
        digest.update(blob.stdout)
        digest.update(b"\0")
    return digest.hexdigest()


def _validate_asset_ledger(
    example_dir: Path,
) -> tuple[dict[str, dict[str, object]], list[str]]:
    path = example_dir / "build/asset-ledger.json"
    ledger, issues = _read_json_object(path, f"{example_dir.name}/build/asset-ledger.json")
    entries_by_key: dict[str, dict[str, object]] = {}
    if ledger is None:
        return entries_by_key, issues
    entries = ledger.get("entries")
    if not isinstance(entries, list):
        return entries_by_key, issues + [
            f"{example_dir.name}/build/asset-ledger.json: entries must be an array"
        ]
    for index, entry in enumerate(entries):
        label = f"{example_dir.name}/build/asset-ledger.json: entries[{index}]"
        if not isinstance(entry, dict):
            issues.append(f"{label} must be an object")
            continue
        key = entry.get("key")
        if not isinstance(key, str) or not key.strip():
            issues.append(f"{label}.key must be a non-empty string")
            continue
        if key in entries_by_key:
            issues.append(f"{label}.key duplicates {key}")
        entries_by_key[key] = entry
        if not isinstance(entry.get("status"), str) or not entry["status"].strip():
            issues.append(f"{label}.status must be a non-empty string")
        if not isinstance(entry.get("releaseGatePassed"), bool):
            issues.append(f"{label}.releaseGatePassed must be boolean")
        evidence = entry.get("evidence")
        if not isinstance(evidence, list):
            issues.append(f"{label}.evidence must be an array")
        else:
            for evidence_index, raw in enumerate(evidence):
                if not isinstance(raw, str) or not raw.strip():
                    issues.append(f"{label}.evidence[{evidence_index}] must be a path")
                    continue
                candidate = Path(raw)
                resolved = (path.parent / candidate).resolve()
                try:
                    resolved.relative_to(example_dir.resolve())
                except ValueError:
                    issues.append(f"{label}.evidence[{evidence_index}] leaves workspace: {raw}")
                    continue
                if candidate.is_absolute() or "://" in raw:
                    issues.append(f"{label}.evidence[{evidence_index}] must be workspace-local: {raw}")
                elif not resolved.is_file():
                    issues.append(f"{label}.evidence[{evidence_index}] does not exist: {raw}")
        if not isinstance(entry.get("remaining"), str):
            issues.append(f"{label}.remaining must be a string")
        if entry.get("tier") == "release-gate" and isinstance(evidence, list) and not evidence:
            issues.append(f"{label}.evidence must not be empty")
        if entry.get("releaseGatePassed") is True and isinstance(
            entry.get("remaining"), str
        ):
            normalized_remaining = entry["remaining"].strip().lower()
            if normalized_remaining not in {"", "none", "nothing", "n/a", "无", "无剩余"}:
                issues.append(f"{label}.remaining must be empty/none when passed")
    return entries_by_key, issues


def validate_publication(example_dir: Path, publication_tier: str) -> list[str]:
    """Validate ordered publication claims against retained, workspace-local proof."""
    issues: list[str] = []
    prefix = f"{example_dir.name}/qa/release-gates.json"
    release, release_issues = _read_json_object(
        example_dir / "qa/release-gates.json", prefix
    )
    issues.extend(release_issues)
    if release is None:
        return issues

    required = {
        "schemaVersion",
        "sourceCommit",
        "evidenceCommit",
        "sourceFingerprint",
        "visualEvidenceManifests",
        "targetFinish",
        "publicationTier",
        "demonstratedTier",
        "pipelineGates",
        "grayboxReady",
        "visualPromotion",
        "visualFrames",
        "visualReview",
        "focalReleaseAssets",
        "degradableReleaseAssets",
        "unresolvedDefects",
    }
    missing = required - release.keys()
    if missing:
        issues.append(f"{prefix}: missing {sorted(missing)}")
    if release.get("schemaVersion") != 1:
        issues.append(f"{prefix}: schemaVersion must be 1")

    target_finish = release.get("targetFinish")
    demonstrated_tier = release.get("demonstratedTier")
    recorded_publication = release.get("publicationTier")
    for field, value in (
        ("targetFinish", target_finish),
        ("publicationTier", recorded_publication),
        ("demonstratedTier", demonstrated_tier),
    ):
        if value not in PUBLICATION_TIERS:
            issues.append(f"{prefix}: {field} must be one of {sorted(PUBLICATION_TIERS)}")
    if recorded_publication != publication_tier:
        issues.append(f"{prefix}: publicationTier must match example.json")
    rank = {tier: index for index, tier in enumerate((
        "graybox", "playable-prototype", "polished-vertical-slice", "showcase"
    ))}
    if recorded_publication in rank and target_finish in rank:
        if rank[recorded_publication] > rank[target_finish]:
            issues.append(f"{prefix}: publicationTier exceeds targetFinish")
    if recorded_publication in rank and demonstrated_tier in rank:
        if rank[recorded_publication] > rank[demonstrated_tier]:
            issues.append(f"{prefix}: publicationTier exceeds demonstratedTier")
    if demonstrated_tier in rank and target_finish in rank:
        if rank[demonstrated_tier] > rank[target_finish]:
            issues.append(f"{prefix}: demonstratedTier exceeds targetFinish")
    issues.extend(
        _validate_target_finish_inheritance(
            example_dir, target_finish, demonstrated_tier
        )
    )

    all_gates = ("intake", "analyze", "concept", "design", "art", "build", "qa")
    gates = release.get("pipelineGates")
    if not isinstance(gates, dict):
        issues.append(f"{prefix}: pipelineGates must be an object")
        gates = {}
    for gate in all_gates:
        if gates.get(gate) not in GATE_STATUSES:
            issues.append(f"{prefix}: pipelineGates.{gate} must be one of {sorted(GATE_STATUSES)}")
    extra_gates = set(gates) - set(all_gates)
    if extra_gates:
        issues.append(f"{prefix}: pipelineGates has unknown keys {sorted(extra_gates)}")

    graybox_ready = release.get("grayboxReady")
    if not isinstance(graybox_ready, dict):
        issues.append(f"{prefix}: grayboxReady must be an object")
        graybox_ready = {}
    if graybox_ready.get("status") not in GATE_STATUSES:
        issues.append(
            f"{prefix}: grayboxReady.status must be one of {sorted(GATE_STATUSES)}"
        )
    issues.extend(
        _validate_evidence_list(
            example_dir,
            graybox_ready.get("evidence"),
            "grayboxReady.evidence",
            required=True,
        )
    )
    if graybox_ready.get("status") != "PASS":
        issues.append(f"{prefix}: grayboxReady.status must be PASS")

    promotion = release.get("visualPromotion")
    if not isinstance(promotion, dict):
        issues.append(f"{prefix}: visualPromotion must be an object")
        promotion = {}
    if promotion.get("status") not in GATE_STATUSES:
        issues.append(f"{prefix}: visualPromotion.status must be one of {sorted(GATE_STATUSES)}")
    issues.extend(_validate_evidence_list(
        example_dir, promotion.get("evidence"), "visualPromotion.evidence", required=False
    ))
    issues.extend(
        _validate_build_release_states(
            example_dir,
            recorded_publication,
            demonstrated_tier,
            graybox_ready.get("status"),
            promotion.get("status"),
        )
    )

    frames = release.get("visualFrames")
    if not isinstance(frames, list):
        issues.append(f"{prefix}: visualFrames must be an array")
        frames = []
    frame_ids: set[str] = set()
    for index, frame in enumerate(frames):
        field = f"visualFrames[{index}]"
        if not isinstance(frame, dict):
            issues.append(f"{prefix}: {field} must be an object")
            continue
        frame_id = frame.get("id")
        if not isinstance(frame_id, str) or not frame_id.strip():
            issues.append(f"{prefix}: {field}.id must be a non-empty string")
        elif frame_id in frame_ids:
            issues.append(f"{prefix}: {field}.id duplicates {frame_id}")
        else:
            frame_ids.add(frame_id)
        if frame.get("status") not in GATE_STATUSES:
            issues.append(f"{prefix}: {field}.status must be one of {sorted(GATE_STATUSES)}")
        issues.extend(_validate_evidence_list(
            example_dir, frame.get("evidence"), f"{field}.evidence", required=True
        ))
        if not isinstance(frame.get("operationPath"), str) or not frame[
            "operationPath"
        ].strip():
            issues.append(f"{prefix}: {field}.operationPath must be a non-empty string")
        rubric = frame.get("rubric")
        if not isinstance(rubric, dict):
            issues.append(f"{prefix}: {field}.rubric must be an object")
        else:
            missing_rubric = VISUAL_RUBRIC_FIELDS - rubric.keys()
            extra_rubric = rubric.keys() - VISUAL_RUBRIC_FIELDS
            if missing_rubric:
                issues.append(
                    f"{prefix}: {field}.rubric missing {sorted(missing_rubric)}"
                )
            if extra_rubric:
                issues.append(
                    f"{prefix}: {field}.rubric has unknown keys {sorted(extra_rubric)}"
                )
            for dimension in VISUAL_RUBRIC_FIELDS & rubric.keys():
                if rubric[dimension] not in GATE_STATUSES:
                    issues.append(
                        f"{prefix}: {field}.rubric.{dimension} must be one of "
                        f"{sorted(GATE_STATUSES)}"
                    )

    review = release.get("visualReview")
    if not isinstance(review, dict):
        issues.append(f"{prefix}: visualReview must be an object")
        review = {}
    if not isinstance(review.get("required"), bool):
        issues.append(f"{prefix}: visualReview.required must be boolean")
    if review.get("status") not in GATE_STATUSES:
        issues.append(f"{prefix}: visualReview.status must be one of {sorted(GATE_STATUSES)}")
    if review.get("evidence") is not None:
        evidence_issue = _workspace_evidence_issue(
            example_dir, review.get("evidence"), "visualReview.evidence"
        )
        if evidence_issue:
            issues.append(evidence_issue)
    if review.get("status") in {"PASS", "FAIL"}:
        for field in ("reviewer", "independence"):
            if not isinstance(review.get(field), str) or not review[field].strip():
                issues.append(
                    f"{prefix}: visualReview.{field} is required for completed review"
                )
        if review.get("evidence") is None:
            issues.append(
                f"{prefix}: visualReview.evidence is required for completed review"
            )

    defects = release.get("unresolvedDefects")
    if not isinstance(defects, list):
        issues.append(f"{prefix}: unresolvedDefects must be an array")
        defects = []
    defect_ids: set[str] = set()
    for index, defect in enumerate(defects):
        field = f"unresolvedDefects[{index}]"
        if not isinstance(defect, dict):
            issues.append(f"{prefix}: {field} must be an object")
            continue
        defect_id = defect.get("id")
        if not isinstance(defect_id, str) or not defect_id.strip():
            issues.append(f"{prefix}: {field}.id must be a non-empty string")
        elif defect_id in defect_ids:
            issues.append(f"{prefix}: {field}.id duplicates {defect_id}")
        else:
            defect_ids.add(defect_id)
        if defect.get("severity") not in {"blocker", "major", "minor"}:
            issues.append(f"{prefix}: {field}.severity must be blocker, major, or minor")
        if defect.get("status") not in {"OPEN", "CLOSED"}:
            issues.append(f"{prefix}: {field}.status must be OPEN or CLOSED")
        if not isinstance(defect.get("summary"), str) or not defect["summary"].strip():
            issues.append(f"{prefix}: {field}.summary must be a non-empty string")
        if "owner" in defect and defect.get("owner") not in {
            "build",
            "design",
            "product",
        }:
            issues.append(f"{prefix}: {field}.owner must be build, design, or product")
        if "evidence" in defect:
            issues.extend(
                _validate_evidence_list(
                    example_dir,
                    defect.get("evidence"),
                    f"{field}.evidence",
                    required=defect.get("status") == "CLOSED",
                )
            )
        elif defect.get("status") == "CLOSED":
            issues.append(f"{prefix}: {field}.evidence is required when CLOSED")

    focal_assets = release.get("focalReleaseAssets")
    if not isinstance(focal_assets, list) or any(
        not isinstance(key, str) or not key.strip() for key in focal_assets
    ):
        issues.append(f"{prefix}: focalReleaseAssets must be an array of non-empty keys")
        focal_assets = []
    elif len(set(focal_assets)) != len(focal_assets):
        issues.append(f"{prefix}: focalReleaseAssets must not contain duplicates")
    degradable_assets = release.get("degradableReleaseAssets")
    if not isinstance(degradable_assets, list) or any(
        not isinstance(key, str) or not key.strip() for key in degradable_assets
    ):
        issues.append(
            f"{prefix}: degradableReleaseAssets must be an array of non-empty keys"
        )
        degradable_assets = []
    elif len(set(degradable_assets)) != len(degradable_assets):
        issues.append(f"{prefix}: degradableReleaseAssets must not contain duplicates")
    overlap = set(focal_assets) & set(degradable_assets)
    if overlap:
        issues.append(
            f"{prefix}: release assets cannot be both focal and degradable: {sorted(overlap)}"
        )

    source_commit = release.get("sourceCommit")
    evidence_commit = release.get("evidenceCommit")
    for field, value in (("sourceCommit", source_commit), ("evidenceCommit", evidence_commit)):
        if value is not None and (not isinstance(value, str) or not value.strip()):
            issues.append(f"{prefix}: {field} must be a non-empty string or null")
    for field, value in (("sourceCommit", source_commit), ("evidenceCommit", evidence_commit)):
        if value is None:
            continue
        if not re.fullmatch(r"[0-9a-f]{40}", value):
            issues.append(f"{prefix}: {field} must be a full lowercase commit ID or null")
            continue
        result = subprocess.run(
            ["git", "cat-file", "-e", f"{value}^{{commit}}"],
            cwd=example_dir,
            capture_output=True,
            check=False,
        )
        if result.returncode != 0:
            issues.append(f"{prefix}: {field} does not identify a repository commit")
        else:
            committed_fingerprint = _git_commit_app_fingerprint(example_dir, value)
            if (
                committed_fingerprint is not None
                and release.get("sourceFingerprint") is not None
                and committed_fingerprint != release.get("sourceFingerprint")
            ):
                issues.append(
                    f"{prefix}: {field} fingerprint does not match release sourceFingerprint"
                )

    source_fingerprint = release.get("sourceFingerprint")
    if source_fingerprint is not None and not (
        isinstance(source_fingerprint, str)
        and re.fullmatch(r"[0-9a-f]{64}", source_fingerprint)
    ):
        issues.append(f"{prefix}: sourceFingerprint must be a lowercase sha256 or null")
    verification_path = example_dir / "qa/verification.json"
    verification: dict[str, object] | None = None
    if verification_path.is_file():
        verification, verification_issues = _read_json_object(
            verification_path, f"{example_dir.name}/qa/verification.json"
        )
        issues.extend(verification_issues)
    if verification is not None:
        verification_fingerprint = verification.get("sourceFingerprint")
        if source_fingerprint != verification_fingerprint:
            issues.append(
                f"{prefix}: sourceFingerprint must match qa/verification.json"
            )

    visual_manifests = release.get("visualEvidenceManifests")
    if not isinstance(visual_manifests, list):
        issues.append(f"{prefix}: visualEvidenceManifests must be an array")
        visual_manifests = []
    unbound_visual_manifests: list[str] = []
    for index, binding in enumerate(visual_manifests):
        field = f"visualEvidenceManifests[{index}]"
        if not isinstance(binding, dict):
            issues.append(f"{prefix}: {field} must be an object")
            continue
        raw_path = binding.get("path")
        path_issue = _workspace_evidence_issue(
            example_dir, raw_path, f"{field}.path"
        )
        if path_issue:
            issues.append(path_issue)
            continue
        expected_hash = binding.get("sha256")
        if not isinstance(expected_hash, str) or not re.fullmatch(
            r"[0-9a-f]{64}", expected_hash
        ):
            issues.append(f"{prefix}: {field}.sha256 must be a lowercase sha256")
            continue
        actual_hash = hashlib.sha256((example_dir / str(raw_path)).read_bytes()).hexdigest()
        if expected_hash != actual_hash:
            issues.append(f"{prefix}: {field}.sha256 does not match the manifest file")
        manifest, manifest_issues = _read_json_object(
            example_dir / str(raw_path), f"{prefix}: {field}.path"
        )
        issues.extend(manifest_issues)
        if manifest is not None:
            manifest_fingerprint = manifest.get("sourceFingerprint")
            if manifest_fingerprint is None:
                unbound_visual_manifests.append(field)
            elif not (
                isinstance(manifest_fingerprint, str)
                and re.fullmatch(r"[0-9a-f]{64}", manifest_fingerprint)
            ):
                issues.append(
                    f"{prefix}: {field}.sourceFingerprint must be a lowercase sha256"
                )
            elif manifest_fingerprint != source_fingerprint:
                issues.append(
                    f"{prefix}: {field}.sourceFingerprint must match release sourceFingerprint"
                )

    public_host = release.get("publicHost")
    if public_host is not None:
        if not isinstance(public_host, dict):
            issues.append(f"{prefix}: publicHost must be an object")
        else:
            status = public_host.get("status")
            if status not in {"PASS", "HISTORICAL", "NOT_CURRENT"}:
                issues.append(
                    f"{prefix}: publicHost.status must be PASS, HISTORICAL, or NOT_CURRENT"
                )
            raw_path = public_host.get("evidence")
            path_issue = _workspace_evidence_issue(
                example_dir, raw_path, "publicHost.evidence"
            )
            if path_issue:
                issues.append(path_issue)
            else:
                report, report_issues = _read_json_object(
                    example_dir / str(raw_path), f"{prefix}: publicHost.evidence"
                )
                issues.extend(report_issues)
                if report is not None:
                    report_source = report.get("source")
                    report_fingerprint = report.get("sourceFingerprint")
                    if report_fingerprint is None and isinstance(report_source, dict):
                        report_fingerprint = report_source.get("sha256")
                    if public_host.get("sourceFingerprint") != report_fingerprint:
                        issues.append(
                            f"{prefix}: publicHost.sourceFingerprint must match deployed report"
                        )
                    if status == "PASS" and report_fingerprint != source_fingerprint:
                        issues.append(
                            f"{prefix}: publicHost PASS fingerprint must match release sourceFingerprint"
                        )

    evidence_tier = (
        demonstrated_tier
        if demonstrated_tier in PUBLICATION_TIERS
        else publication_tier
    )
    if evidence_tier != "graybox":
        for field in unbound_visual_manifests:
            issues.append(
                f"{prefix}: {field}.sourceFingerprint is required above graybox"
            )
    ledger_entries: dict[str, dict[str, object]] = {}
    ledger_path = example_dir / "build/asset-ledger.json"
    if ledger_path.is_file() or evidence_tier != "graybox":
        ledger_entries, ledger_issues = _validate_asset_ledger(example_dir)
        issues.extend(ledger_issues)

    progress_statuses = _progress_gate_statuses(example_dir / "_progress.md")
    for gate, statuses in progress_statuses.items():
        if len(statuses) > 1:
            issues.append(
                f"{example_dir.name}/_progress.md: gate:{gate} has conflicting statuses {sorted(statuses)}"
            )

    if promotion.get("status") == "PASS":
        issues.extend(_validate_evidence_list(
            example_dir,
            promotion.get("evidence"),
            "visualPromotion.evidence",
            required=True,
        ))

    if evidence_tier == "graybox":
        return issues

    for gate in all_gates:
        statuses = progress_statuses.get(gate, set())
        if statuses != {"PASS"}:
            issues.append(f"{example_dir.name}/_progress.md: missing unambiguous gate:{gate} pass")
        if gates.get(gate) != "PASS":
            issues.append(f"{prefix}: pipelineGates.{gate} must be PASS")
    if not source_fingerprint:
        issues.append(f"{prefix}: non-graybox tier requires sourceFingerprint")
    if verification is None:
        issues.append(f"{prefix}: non-graybox tier requires qa/verification.json")
    if not visual_manifests:
        issues.append(f"{prefix}: non-graybox tier requires visualEvidenceManifests")
    if promotion.get("status") != "PASS":
        issues.append(f"{prefix}: visualPromotion.status must be PASS")
    issues.extend(_validate_evidence_list(
        example_dir, promotion.get("evidence"), "visualPromotion.evidence", required=True
    ))
    if not frames:
        issues.append(f"{prefix}: visualFrames must not be empty")
    for index, frame in enumerate(frames):
        if isinstance(frame, dict) and frame.get("status") != "PASS":
            issues.append(f"{prefix}: visualFrames[{index}].status must be PASS")
        if isinstance(frame, dict) and isinstance(frame.get("rubric"), dict):
            for dimension in VISUAL_RUBRIC_FIELDS:
                if frame["rubric"].get(dimension) != "PASS":
                    issues.append(
                        f"{prefix}: visualFrames[{index}].rubric.{dimension} must be PASS"
                    )
    if review.get("required") is not True:
        issues.append(f"{prefix}: visualReview.required must be true")
    if review.get("status") != "PASS":
        issues.append(f"{prefix}: visualReview.status must be PASS")
    for field in ("reviewer", "independence"):
        if not isinstance(review.get(field), str) or not review[field].strip():
            issues.append(f"{prefix}: visualReview.{field} is required")
    if review.get("evidence") is None:
        issues.append(f"{prefix}: visualReview.evidence is required")
    for index, defect in enumerate(defects):
        if isinstance(defect, dict) and defect.get("status") == "OPEN" and defect.get("severity") in {"blocker", "major"}:
            issues.append(
                f"{prefix}: unresolvedDefects[{index}] has open {defect.get('severity')}"
            )
    if not focal_assets:
        issues.append(f"{prefix}: focalReleaseAssets must not be empty")
    for key in focal_assets:
        entry = ledger_entries.get(key)
        if entry is None:
            issues.append(f"{prefix}: focal release asset {key} is missing from asset ledger")
            continue
        if entry.get("tier") != "release-gate":
            issues.append(f"{prefix}: focal release asset {key} must use tier release-gate")
        if entry.get("releaseGatePassed") is not True:
            issues.append(f"{example_dir.name}/build/asset-ledger.json: {key}.releaseGatePassed must be true")
        if not entry.get("evidence"):
            issues.append(f"{example_dir.name}/build/asset-ledger.json: {key}.evidence must not be empty")
    classified_assets = set(focal_assets) | set(degradable_assets)
    for key, entry in ledger_entries.items():
        if entry.get("tier") == "release-gate" and key not in classified_assets:
            issues.append(f"{prefix}: unclassified release-gate asset {key}")
    for key in degradable_assets:
        entry = ledger_entries.get(key)
        if entry is None:
            issues.append(
                f"{prefix}: degradable release asset {key} is missing from asset ledger"
            )
        elif entry.get("tier") != "release-gate":
            issues.append(
                f"{prefix}: degradable release asset {key} must use tier release-gate"
            )
        else:
            fallback = entry.get("fallback")
            ledger_label = f"{example_dir.name}/build/asset-ledger.json: {key}.fallback"
            if not isinstance(fallback, dict):
                issues.append(f"{ledger_label} must be an object")
                continue
            if not isinstance(fallback.get("behavior"), str) or not fallback[
                "behavior"
            ].strip():
                issues.append(f"{ledger_label}.behavior must be a non-empty string")
            dimensions = {
                "coreAction",
                "state",
                "result",
                "readableFeedback",
                "restart",
            }
            preserved = fallback.get("preserved")
            if not isinstance(preserved, dict) or set(preserved) != dimensions:
                issues.append(
                    f"{ledger_label}.preserved must contain exactly {sorted(dimensions)}"
                )
            elif any(preserved[dimension] is not True for dimension in dimensions):
                issues.append(f"{ledger_label}.preserved must set every dimension true")
            fallback_evidence = fallback.get("evidence")
            if not isinstance(fallback_evidence, list) or not fallback_evidence:
                issues.append(f"{ledger_label}.evidence must be a non-empty array")
            else:
                for index, raw in enumerate(fallback_evidence):
                    if not isinstance(raw, str) or not raw.strip():
                        issues.append(f"{ledger_label}.evidence[{index}] must be a path")
                        continue
                    candidate = Path(raw)
                    resolved = (
                        example_dir / "build" / candidate
                    ).resolve()
                    try:
                        resolved.relative_to(example_dir.resolve())
                    except ValueError:
                        issues.append(
                            f"{ledger_label}.evidence[{index}] leaves workspace: {raw}"
                        )
                        continue
                    if candidate.is_absolute() or "://" in raw:
                        issues.append(
                            f"{ledger_label}.evidence[{index}] must be workspace-local: {raw}"
                        )
                    elif not resolved.is_file():
                        issues.append(
                            f"{ledger_label}.evidence[{index}] does not exist: {raw}"
                        )
    if evidence_tier in {"polished-vertical-slice", "showcase"}:
        release_entries = [
            entry for entry in ledger_entries.values() if entry.get("tier") == "release-gate"
        ]
        if not release_entries:
            issues.append(f"{example_dir.name}/build/asset-ledger.json: no release-gate entries")
        for entry in release_entries:
            if entry.get("releaseGatePassed") is not True:
                issues.append(
                    f"{example_dir.name}/build/asset-ledger.json: "
                    f"{entry.get('key', '<unknown>')}.releaseGatePassed must be true"
                )
    return issues

def validate_readme_publication_claims(root: Path) -> list[str]:
    """Keep public Featured/精选 claims aligned with example publication tiers."""
    issues: list[str] = []
    readme_slugs: dict[str, list[str]] = {}
    labels = {
        "README.md": {
            "graybox": ("graybox",),
            "playable-prototype": ("playable prototype",),
            "polished-vertical-slice": ("polished vertical slice",),
            "showcase": ("showcase", "featured"),
        },
        "README_ZH.md": {
            "graybox": ("灰盒",),
            "playable-prototype": ("可玩原型",),
            "polished-vertical-slice": ("精修垂直切片",),
            "showcase": ("精选", "展示"),
        },
    }
    for filename, marker in (("README.md", "featured"), ("README_ZH.md", "精选")):
        path = root / filename
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        readme_slugs[filename] = list(
            dict.fromkeys(re.findall(r"examples/([^/)]+)/?", text))
        )
        listing_match = re.search(
            r"^## (?:Play Online|在线试玩)\s*$\n(.*?)(?=^##\s|\Z)",
            text,
            flags=re.MULTILINE | re.DOTALL,
        )
        listing = listing_match.group(1) if listing_match else ""
        sections = re.split(r"(?=^###\s)", listing, flags=re.MULTILINE)
        for section in sections:
            heading = section.splitlines()[0] if section.splitlines() else ""
            section_slugs = list(dict.fromkeys(re.findall(r"examples/([^/)]+)/?", section)))
            if listing:
                for slug in section_slugs:
                    manifest, manifest_issues = _read_json_object(
                        root / "examples" / slug / EXAMPLE_MANIFEST,
                        f"examples/{slug}/{EXAMPLE_MANIFEST}",
                    )
                    issues.extend(manifest_issues)
                    if manifest is None:
                        continue
                    tier = manifest.get("publicationTier")
                    expected = labels[filename].get(str(tier), ())
                    if expected and not any(token in section.lower() for token in expected):
                        issues.append(
                            f"{filename}: public example {slug} must be labelled {tier}"
                        )
                    release_path = root / "examples" / slug / "qa/release-gates.json"
                    if release_path.is_file():
                        release, release_issues = _read_json_object(
                            release_path, f"examples/{slug}/qa/release-gates.json"
                        )
                        issues.extend(release_issues)
                        public_host = (
                            release.get("publicHost")
                            if isinstance(release, dict)
                            else None
                        )
                        if isinstance(public_host, dict) and public_host.get(
                            "status"
                        ) in {"HISTORICAL", "NOT_CURRENT"}:
                            historical_tokens = (
                                ("historical", "not current")
                                if filename == "README.md"
                                else ("历史", "非当前")
                            )
                            if not all(
                                token in section.lower()
                                for token in historical_tokens
                            ):
                                issues.append(
                                    f"{filename}: public example {slug} host link must be "
                                    "labelled HISTORICAL/NOT_CURRENT"
                                )
            if marker not in heading.lower():
                continue
            match = re.search(r"examples/([^/)]+)/?", section)
            if not match:
                issues.append(f"{filename}: Featured/精选 section has no example link")
                continue
            slug = match.group(1)
            manifest_path = root / "examples" / slug / EXAMPLE_MANIFEST
            manifest, manifest_issues = _read_json_object(
                manifest_path, f"examples/{slug}/{EXAMPLE_MANIFEST}"
            )
            issues.extend(manifest_issues)
            if manifest is not None and manifest.get("publicationTier") != "showcase":
                issues.append(
                    f"{filename}: Featured/精选 example {slug} must have publicationTier showcase"
                )
    if (
        "README.md" in readme_slugs
        and "README_ZH.md" in readme_slugs
        and readme_slugs["README.md"] != readme_slugs["README_ZH.md"]
    ):
        issues.append(
            "README.md and README_ZH.md: example link order must match; "
            f"english={readme_slugs['README.md']} chinese={readme_slugs['README_ZH.md']}"
        )
    return issues


def validate_example(example_dir: Path) -> list[str]:
    manifest, issues = read_manifest(example_dir)
    if manifest is None:
        return issues
    issues.extend(validate_publication(example_dir, str(manifest["publicationTier"])))
    actual_planning_files = {
        path.relative_to(example_dir).as_posix()
        for directory in ("analysis", "concepts", "design", "build")
        if (example_dir / directory).is_dir()
        for path in (example_dir / directory).iterdir()
        if path.is_file()
    }
    # Coverage state and an asset ledger are valid supporting artifacts, but neither is
    # universal across the legacy examples. Ignore them when grading the five compact
    # planning handoffs instead of rejecting a richer, otherwise compliant example.
    graded_planning_files = actual_planning_files - OPTIONAL_PLANNING_FILES
    if graded_planning_files != EXAMPLE_PLANNING_FILES:
        issues.append(
            f"{example_dir.name}: planning artifact mismatch; "
            f"missing={sorted(EXAMPLE_PLANNING_FILES - graded_planning_files)} "
            f"extra={sorted(graded_planning_files - EXAMPLE_PLANNING_FILES)}"
        )

    source_dir = example_dir / "source"
    if not (source_dir / "SOURCE.md").is_file():
        issues.append(f"{example_dir.name}: missing source/SOURCE.md")
    source_texts = sorted(source_dir.glob("*.txt")) if source_dir.is_dir() else []
    if len(source_texts) != 1:
        issues.append(f"{example_dir.name}: expected exactly one source text")
        return issues

    source_spec = manifest["source"]
    expected_chapters = int(source_spec["chapters"])
    heading = re.compile(str(source_spec["headingPattern"]))
    numeral = str(source_spec["numeral"])
    chapters = extract_chapters(source_texts[0], heading, numeral)
    chapter_numbers = [chapter[0] for chapter in chapters]
    if chapter_numbers != list(range(1, expected_chapters + 1)):
        issues.append(
            f"{example_dir.name}: source must contain consecutive chapters "
            f"1-{expected_chapters}, found {len(chapter_numbers)}"
        )
        return issues

    known_chapters = set(chapter_numbers)
    source_bible = example_dir / "analysis/SOURCE_BIBLE.md"
    if source_bible.is_file():
        coverage_section = markdown_section(
            source_bible.read_text(encoding="utf-8"), str(manifest["coverageHeading"])
        )
        if coverage_section is None:
            issues.append(f"{example_dir.name}: source bible missing full-book coverage")
        else:
            citation = re.compile(str(manifest["citationPattern"]))
            coverage = chapter_citation_coverage(coverage_section, citation)
            missing = known_chapters - coverage
            extra = coverage - known_chapters
            if missing or extra:
                issues.append(
                    f"{example_dir.name}: source bible chapter coverage mismatch; "
                    f"missing={sorted(missing)} extra={sorted(extra)}"
                )

    citation = re.compile(str(manifest["citationPattern"]))
    # 引用格式随语言变。若 citationPattern 在整个示例的策划产物里一次都不匹配,
    # 下面的逐条校验就会「真空通过」——保证悄悄消失而不是变红。这里只要求全例
    # 至少命中一次(不要求每份文档都引章节:美术方向讲视觉，本来就不引)。
    citation_hits = 0
    for relative_path in sorted(EXAMPLE_PLANNING_FILES & actual_planning_files):
        markdown = example_dir / relative_path
        body = markdown.read_text(encoding="utf-8")
        citation_hits += len(citation.findall(body))
        for match in citation.finditer(body):
            first = int(match.group(1))
            last = int(match.group(2) or first)
            if first > last or any(
                chapter not in known_chapters for chapter in range(first, last + 1)
            ):
                issues.append(
                    f"{example_dir.name}: invalid chapter citation "
                    f"{match.group(0)} in {relative_path}"
                )
    if citation_hits == 0:
        issues.append(
            f"{example_dir.name}: citationPattern matches nothing in any planning "
            f"artifact; the chapter-citation check would pass vacuously"
        )
    return issues


def manifest_skill_root(manifest: dict[str, object]) -> str | None:
    skills = manifest.get("skills")
    if isinstance(skills, str):
        return skills.rstrip("/")
    if isinstance(skills, list) and len(skills) == 1 and isinstance(skills[0], str):
        return skills[0].rstrip("/")
    return None


def validate_agent_adapters(root: Path, version: str) -> list[str]:
    issues: list[str] = []

    agents_link = root / ".agents/skills"
    if not agents_link.is_symlink() or agents_link.readlink().as_posix() != "../skills":
        issues.append(
            "repository: .agents/skills must be a relative symlink to ../skills"
        )

    claude_skills = root / ".claude/skills"
    actual_claude_entries = (
        {path.name for path in claude_skills.iterdir()}
        if claude_skills.is_dir()
        else set()
    )
    if actual_claude_entries != EXPECTED_SKILLS:
        issues.append(
            "repository: Claude project skill set mismatch; "
            f"missing={sorted(EXPECTED_SKILLS - actual_claude_entries)} "
            f"extra={sorted(actual_claude_entries - EXPECTED_SKILLS)}"
        )
    for name in sorted(EXPECTED_SKILLS & actual_claude_entries):
        link = claude_skills / name
        expected_target = f"../../skills/{name}"
        if not link.is_symlink() or link.readlink().as_posix() != expected_target:
            issues.append(
                f"repository: .claude/skills/{name} must link to {expected_target}"
            )

    for relative_path in sorted(PLUGIN_MANIFESTS):
        path = root / relative_path
        if not path.is_file():
            issues.append(f"repository: missing {relative_path}")
            continue
        manifest = json.loads(path.read_text(encoding="utf-8"))
        if manifest.get("name") != "novel-to-game":
            issues.append(f"{relative_path}: plugin name must be novel-to-game")
        if manifest.get("version") != version:
            issues.append(f"{relative_path}: version does not match VERSION")
        if manifest_skill_root(manifest) != "./skills":
            issues.append(
                f"{relative_path}: plugin must expose the complete ./skills bundle"
            )

    marketplace_path = root / ".claude-plugin/marketplace.json"
    if not marketplace_path.is_file():
        issues.append("repository: missing .claude-plugin/marketplace.json")
    else:
        marketplace = json.loads(marketplace_path.read_text(encoding="utf-8"))
        plugins = marketplace.get("plugins")
        if not isinstance(plugins, list) or len(plugins) != 1:
            issues.append(
                "repository: marketplace must expose exactly one bundle plugin"
            )
        else:
            plugin = plugins[0]
            if not isinstance(plugin, dict):
                issues.append("repository: marketplace plugin entry must be an object")
            else:
                expected = {
                    "name": "novel-to-game",
                    "source": "./",
                    "version": version,
                }
                if any(plugin.get(key) != value for key, value in expected.items()):
                    issues.append(
                        "repository: marketplace bundle name, source, or version is invalid"
                    )
        metadata = marketplace.get("metadata")
        if not isinstance(metadata, dict) or metadata.get("version") != version:
            issues.append(
                "repository: marketplace metadata version does not match VERSION"
            )

    if (root / "reasonix-plugin.json").exists():
        issues.append("repository: Reasonix adapter is outside the supported CLI set")
    return issues


def validate_minimal_evidence_contract(root: Path) -> list[str]:
    """Guard the build/QA evidence handoff without parsing generated projects."""
    issues: list[str] = []
    for relative_path, markers in MINIMAL_EVIDENCE_REQUIREMENTS.items():
        path = root / relative_path
        if not path.is_file():
            issues.append(f"repository: missing evidence contract file {relative_path}")
            continue
        text = path.read_text(encoding="utf-8")
        for marker in markers:
            if marker not in text:
                issues.append(
                    f"{relative_path}: missing minimal evidence marker {marker!r}"
                )
    return issues


def validate_repository(root: Path) -> list[str]:
    issues: list[str] = []
    for required in ("README.md", "README_ZH.md", "LICENSE", "AGENTS.md", "VERSION"):
        if not (root / required).is_file():
            issues.append(f"repository: missing {required}")

    skills_root = root / "skills"
    actual = visible_directories(skills_root)
    if actual != EXPECTED_SKILLS:
        issues.append(
            "repository: skill set mismatch; "
            f"missing={sorted(EXPECTED_SKILLS - actual)} extra={sorted(actual - EXPECTED_SKILLS)}"
        )
    for name in sorted(EXPECTED_SKILLS & actual):
        issues.extend(validate_skill(skills_root / name))

    examples_root = root / "examples"
    actual_examples = visible_directories(examples_root)
    if not actual_examples:
        issues.append("repository: no examples found")
    for name in sorted(actual_examples):
        issues.extend(validate_example(examples_root / name))
    issues.extend(validate_readme_publication_claims(root))

    for json_file in validation_json_files(root):
        try:
            json.loads(json_file.read_text(encoding="utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            issues.append(f"{json_file.relative_to(root)}: invalid JSON: {error}")

    version = (root / "VERSION").read_text(encoding="utf-8").strip()
    issues.extend(validate_agent_adapters(root, version))
    issues.extend(validate_minimal_evidence_contract(root))
    return issues


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    issues = validate_repository(root)
    if issues:
        for issue in issues:
            print(f"FAIL: {issue}")
        print(f"Validation failed with {len(issues)} issue(s).")
        return 1
    print(f"Validation passed: {len(EXPECTED_SKILLS)} skills checked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
