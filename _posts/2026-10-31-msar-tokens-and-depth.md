---
title: "MSAR: across tokens, then across depth"
description: Explore how causal convolutions and per-stream depth attention combine historical Transformer representations.
paper: multi-stream-attention-residuals
role: visualization
task: key-visual
by: [roey-magen]
---

MSAR combines two different axes of computation. A causal convolution gathers nearby **token positions within one source layer**. A stream-specific query then attends over **source layers**, using the convolved vectors as keys and values. A wider token window does not impose a preference for older layers.

This interactive figure illustrates the source expansion and retrieval in [Multi-Stream Attention Residuals, §3.2, Eqs. (10)–(12)](https://arxiv.org/html/2610.13630v1#S3.SS2). All activations, convolution coefficients, and queries here are **synthetic**, not measurements of learned MSAR behavior.

{% include msar-explorer.liquid %}

## Try these experiments

1. **Switch from Identity to Conv-4, Conv-8, and Conv-12.** The horizontal window grows. Every available source row uses the same window; no convolution crosses between rows.
2. **Select depth-attention mode.** Only the right-hand column encodes attention weights. Their sum down the available rows is one for each stream and target. The outlined token windows do not represent a token-attention distribution.
3. **Hold the target fixed and compare streams.** Each stream has its own query and contextual source vectors, so its depth weights may differ. Kernel width controls token reach, not the age of retrieved layers.
4. **Move the target token to 0.** Every stream sees only token 0; earlier kernel positions are zero-padded. Identity is still different from a convolution because the latter applies channel-wise coefficients.
5. **Move the target layer to 1.** Only the embedding source is available, so its attention weight is exactly one in every stream. Different cells can still have different contribution magnitudes.
6. **Inspect two active cells in one row.** They share the same depth weight, but their vector norms can differ. The sum of cell magnitudes generally differs from the norm of the retrieved vector because signed terms can cancel.

## The computation behind each cell

We use the paper's layer-level formulation: source $$v_0$$ is the embedding; $$v_i$$ for $$i\geq1$$ is a residual branch output. A self-attention branch and an MLP branch each count as one layer here, rather than a whole Transformer block. Target layer $$\ell$$ can retrieve sources $$0\leq i<\ell$$.

For convolution stream $$r$$, source expansion at token $$t$$ is

$$
E_{i,r}(v_i)_t = \sum_{\delta=0}^{\kappa_r-1}
c_{i,r,\delta}\odot v_{i,t-\delta},
\qquad v_{i,s}=0\text{ for }s<0.
$$

The Identity stream uses $$E_{i,0}(v_i)_t=v_{i,t}$$. For the other streams, $$\kappa_r\in\{4,8,12\}$$. Each coefficient $$c_{i,r,\delta}$$ is a vector: the convolution acts independently on each hidden channel and is shared over token positions.

Each stream has a target-layer-specific query $$w_\ell^{(r)}$$. It scores the expanded source vectors and normalizes **over sources**, at a fixed target token:

$$
s_i=(w_\ell^{(r)})^\top\operatorname{RMSNorm}(E_{i,r}(v_i)_t),
\qquad
\alpha_{i\to\ell,t}^{(r)}=
\frac{\exp(s_i)}{\sum_{j=0}^{\ell-1}\exp(s_j)}.
$$

The retrieved stream is

$$
z_{\ell,t}^{(r)}=\sum_{i=0}^{\ell-1}
\alpha_{i\to\ell,t}^{(r)}E_{i,r}(v_i)_t.
$$

RMSNorm is used to construct the **keys**, not to replace the value vectors in this sum. The query is fixed for a given target layer and stream; token dependence enters through the expanded sources.

In contribution mode, the cell at source layer $$i$$ and source token $$t-\delta$$ displays

$$
M_{i,t-\delta}=\left\|
\alpha_{i\to\ell,t}^{(r)}
\big(c_{i,r,\delta}\odot v_{i,t-\delta}\big)
\right\|_2.
$$

For Identity, take $$c_{i,0,0}=\mathbf{1}$$. These are norms of summands in the retrieval at the current attention weights. They are **not probabilities, causal attributions, or effects of removing a token**: changing a source can also change the attention weights. Nor are these raw input-token contributions; each historical activation may already encode context from earlier Transformer computation.

## What this toy includes and omits

The demonstration uses 16 token positions, eight possible source rows, and six hidden channels. Fixed sine/cosine formulas generate signed activations, source-specific depthwise coefficients, and independent stream queries. The same source activations are reused across streams. RMSNorm uses unit gain and $$\epsilon=10^{-6}$$. The magnitude color limit is computed once over all selectable settings, so colors remain comparable as you explore. Contribution colors use a square-root scale to make small values visible; the legend and inspector report the original norms. See the [numerical implementation]({{ '/assets/js/msar-model.js' | relative_url }}) for the exact formulas.

These arbitrary source vectors illustrate one retrieval operation; they are not produced by running a trained Transformer. The paper subsequently fuses the retrieved streams into a layer input using adaptive scalar mixing; that step is outside this figure.

**Layer-level MSAR versus Block MSAR.** This figure follows §3.2, rather than pretending that layers and blocks are interchangeable. In [Block MSAR (§3.3)](https://arxiv.org/html/2610.13630v1#S3.SS3), the source bank instead contains the embedding, completed block summaries, and the current block's partial sum when nonempty. Source expansion still runs across tokens within each summary, and attention still normalizes over available sources. At the first layer of a block, the empty partial source is omitted from the softmax. Block accumulation and its evolving source bank are not simulated here.

## Design choices

The token-by-layer grid separates horizontal convolution from vertical retrieval. Depth-attention mode gives each source one weight, displayed beside its token window; copying that weight into every token cell could suggest a nonexistent token softmax. Contribution mode uses the full heatmap because its values really do belong to individual source-token terms. Hatching distinguishes masked cells from small magnitudes, and selectors make exact values available to keyboard and touch users without relying on hover.

Source: Xiaohan Qin et al., [*Multi-Stream Attention Residuals*](https://arxiv.org/abs/2610.13630), 2026. The figure and synthetic example are original educational material, not a reproduction of the paper's learned attention plots.
