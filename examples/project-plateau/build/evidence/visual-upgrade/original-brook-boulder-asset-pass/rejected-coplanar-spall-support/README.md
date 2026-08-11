# Rejected coplanar-spall support trial

The first browser integration merged all five spall fragments into one coplanar mesh and settled the
whole asset as a single body. Runtime terrain sampling rejected it: only **30 / 51** authored support
vertices were within the 5.5 cm contact envelope and the worst fragment clearance was **11.79 cm**.

The accepted asset retains one load-bearing main mass but exports each spall as a separate closed
body. Runtime placement settles every fragment independently against the same rendered terrain
heightfield. The final evidence records **47 / 47** supported vertices with clearances from **-4.0 cm**
to **-2.07 cm**.
