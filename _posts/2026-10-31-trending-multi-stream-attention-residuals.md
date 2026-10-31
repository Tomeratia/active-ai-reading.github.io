---
title: "Papers worth knowing this week"
description: One sentence on what you found.
paper: multi-stream-attention-residuals
role: scouting
task: trending
by: sprinzak
---

**[Multi-Token Prediction Done Right](https://arxiv.org/abs/2610.38331)** — Soft-MTP removes a noisy gradient component from multi-token-prediction training with a one-line change, improving perplexity and speculative decoding from 167M to 1.2B parameters at no extra cost, which makes it the same kind of cheap pretraining win as MSAR.
**[Recurrent Looped Transformer](https://arxiv.org/abs/2610.07591)** — it uses a recurrent decoder with feedback to grow computation depth per token, so it is a different answer to the depth-scaling question that MSAR addresses through residual retrieval.
