---
title: "A Better Figure 1(c): How Residual Architectures Change With Model Scale"
description: "A multiple slope chart reveals how benchmark scores change from 18B to 28B across four residual architectures."
paper: multi-stream-attention-residuals
role: visualization
task: redo-graph
by: [chenshani-droid]
---

## The original

Figure 1(c) of *Multi-Stream Attention Residuals* uses a radar chart to compare Vanilla residuals, mHC, AttnRes, and MSAR on 12 benchmarks at the 18B model. It shows that MSAR leads on every benchmark. However, the chart makes the exact differences hard to compare. In particular, the radar axes use different numerical ranges for different benchmarks, and the overlapping polygons draw attention to shape rather than performance differences.

Moreover, the paper's Table 1 also reports scores at **28B**, but that second scale is absent from Figure 1(c). The tabular results provide an opportunity to compare the performance of the different models on different benchmark tasks while comparing the two different model sizes (18B, 28B).

## The redesign

I replaced Figure 1(c) with **12 multiple slope charts**, one for each benchmark. Each panel compares the same four architectures at **18B** and **28B**, using the additional data from Table 1.

{% include figure.liquid path="assets/img/posts/msar-scaling-redesign-chenshani-droid/msar_small_multiples_slopegraph.png" class="img-fluid rounded" caption="MSAR benchmark scores at 18B and 28B. Each panel has its own y-axis scale; compare values within a panel rather than apparent slope steepness across panels. Data: Qin et al., Multi-Stream Attention Residuals, Table 1." %}

## What the new figure shows

- **MSAR ranks first at both model sizes in all 12 benchmarks.** This is the result emphasized by the original radar chart, now visible at both scales.
- **Scaling gains vary across benchmarks.** For MSAR, GSM8K rises from **49.9% to 65.7%** (+15.8 pp), whereas MATH rises from **24.4% to 28.8%** (+4.4 pp).
- **The gap between architectures changes with model size.** On C-Eval, MSAR leads AttnRes by **7.4 points at 18B** (52.3 vs. 44.9), but by only **0.8 points at 28B** (59.9 vs. 59.1). On GSM8K, the MSAR-AttnRes gap grows from **1.5 points** to **8.5 points**.

These differences motivate a question that is easy to miss in the original figure: **does a residual architecture's advantage depend on the model scale and the evaluation task?** Two model sizes are probably not enough to come up with concrete insights, but they reveal interesting variation.

## Design decisions

- **Small multiples:** Each benchmark has its own panel, avoiding overlapping polygons and allowing a direct comparison of the four methods.
- **18B and 28B as two endpoints:** Connecting the two measured scores makes changes easy to spot without implying that intermediate sizes were evaluated and adds more information than the original chart had.
- **Consistent architecture colors:** Vanilla, mHC, AttnRes, and MSAR use the same colors in every panel (to compensate for the multiple charts).
- **Independent y-axis ranges:** Each panel can show its local differences clearly, but slopes or heights should not be visually compared across benchmarks without the numeric axes.
- **No invented measurements:** Every plotted endpoint comes directly from Table 1; the connecting lines are visual guides, not measured intermediate results.

**Source:** [Qin et al., *Multi-Stream Attention Residuals* (2026)](https://arxiv.org/abs/2610.13630), Figure 1(c) and Table 1.
