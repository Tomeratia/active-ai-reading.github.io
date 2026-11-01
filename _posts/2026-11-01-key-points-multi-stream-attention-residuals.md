

---
title: "Multi-Head Depth Attention Is Not Just Multiple Queries"
description: "What MSAR really adds to AttnRes, and how the paper could make it clearer."
paper: multi-stream-attention-residuals
role: writing
task: key-points
by: [Reuvenspitz]
---


I think the main challenge in reading this paper is understanding what exactly MSAR adds to previous residual methods. The paper has several design choices, and I think it would be easier to follow if the motivation for each one was explained separately.

## 1. From residual connections to multi-head depth attention

In standard residual connections, each layer adds its output to the accumulated hidden state, with a fixed weight of 1.

AttnRes changes this by using softmax attention to decide how much information to retrieve from previous layers, instead of simply adding their outputs.

MSAR extends this idea to multiple depth-attention heads, inspired by multi-head attention in regular Transformers.

But this brings us to an important question: what exactly does it mean to have multiple heads over depth?

## 2. Multi-head depth attention is not just multiple queries

This is the point I think deserves more attention in the paper.

The most straightforward idea would be to use different queries for different heads. Each head could then focus on different previous layers.

But if all heads use the same source vectors, and we combine their outputs with scalar weights, the final result is still a weighted sum of the original sources. The weights may be computed in a more complicated way, but we are still combining the same vectors.

MSAR goes one step further by giving each head a different representation of the sources themselves.

The authors do this using causal depthwise convolutions. One stream keeps the original source, while the others combine information from the current and previous tokens using different window sizes.

So there are two operations on different axes: convolution across tokens creates different source representations, and attention across layers decides which historical sources to retrieve.

The retrieved streams are then combined using learned, input-dependent weights.

I think this separation between different attention distributions and different source representations is important for understanding the contribution.

## 3. The efficiency and experimental results are also part of the contribution

A natural concern is that multiple streams could require much more memory. MSAR addresses this by storing only single-stream sources. The additional streams are computed from these sources when depth attention needs them, rather than being stored permanently.

Like AttnRes, it also supports block summaries instead of storing every layer output separately. This allows Block MSAR to match Block AttnRes in persistent source storage and pipeline communication costs.

The experimental results support the design. MSAR outperforms Vanilla residual connections, mHC, and AttnRes on all 12 benchmarks at both the 18B and 28B model scales. The scaling-law experiments also report a 1.58× iso-loss compute speedup over Vanilla, compared to 1.35× for AttnRes.

I think one particularly important result is the ablation without convolution. On a 10B model, using four queries over identical sources gives a loss of 1.862, compared to 1.867 for AttnRes. With convolution, MSAR reaches 1.847.

This helps show that the improvement is not simply from adding more queries. The convolutional source expansion is an important part of the method.

## What I would change in the presentation

I would make the steps from AttnRes to MSAR clearer before introducing the equations in Section 3.2:

1. First, explain what we gain from having multiple depth-attention heads.
2. Then explain why using different queries over the same sources is limited, and why the authors also want different source representations.
3. Finally, explain why convolution is used to create these representations efficiently.

I would also make the two axes more visible in Figure 2. The figure shows the causal convolutions, but not how they combine information from different token positions. I think showing this would help readers understand the connection between the two axes.

I would also mention the result without convolution (1.862 vs. 1.847) right after the method, not only in Table 2, because it is the clearest evidence that the source expansion matters.

For me, this would make it easier to understand not only how MSAR works, but also why the authors chose this architecture.
