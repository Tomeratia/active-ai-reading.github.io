---
title: A new way of speculative decoding and on policy distillation
description: 2 papers that expand on ideas used in the matryoshka suits paper.
paper: matryoshka-lm-suites
role: scouting
task: hidden-gems
by: [matan2001]
---

<!-- At least two papers, one sentence each, with a link. How you organize the rest is up to you. -->
[The Teacher Is a Direction, Not a Destination: Extrapolating RL-Induced Representation Residuals in On-Policy Distillation]([url](https://arxiv.org/abs/2609.36484?utm_source=chatgpt.com)
(Hao Li, MeiJia Chen, Weijie Ren, Donghan Li, Zijun Tian, Jingchun Huang, Naibo Wang) this paper introduce a new method to on policy distillation called RIDE,
that try to make the student model surpass the teacher rather to simply imitate it. 

[WaveFront Decoding: Parallelized Self-Speculative Decoding for Looped Language Models]([url](https://arxiv.org/abs/2609.23033?utm_source=chatgpt.com)
(Hyeongju Ha, Jae-Joon Kim) this paper introduce a new way for speculative decoding for looped language models, that parallelizes token drafting and verification
across different recurrence depths, significantly accelerating inference without requiring an additional draft model.


