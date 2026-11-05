---
layout: post
title: "Reproducing Figure 3: How often is each recurrence depth sampled?"
description: "Reproducing the distribution of training depths from Section 3.3."
paper: recurrent-depth-latent-reasoning
role: coding
task: reimplement
by: [yakovafgin]
---

## What I reimplemented

During training, the authors sample how many times to run the recurrent block. I reproduced Figure 3 by implementing the sampling rule from Section 3.3 and drawing one million recurrence counts with $\bar r = 32$ and $\sigma = 0.5$. [Paper, Section 3.3](https://arxiv.org/pdf/2502.05171v2#page=4)

## The code

Each draw starts with a normal random variable `tau`. Its exponential gives the rate for a Poisson draw. Adding one ensures that the recurrent block runs at least once.

```python
mu = np.log(r_bar) - sigma**2 / 2
tau = rng.normal(loc=mu, scale=sigma, size=n)
rate = np.exp(tau)
r = rng.poisson(lam=rate) + 1
```

[Full code and results (Jupyter notebook)](https://github.com/active-ai-reading/active-ai-reading.github.io/blob/main/assets/notebooks/reproducing-figure-3-recurrence-depth/recurrent_depth_sampling.ipynb)

## Results

{% include figure.liquid path="assets/img/posts/reproducing-figure-3-recurrence-depth/figure-3.png" class="img-fluid rounded" caption="Reproduced distribution of recurrence counts. Vertical lines mark the mode at 24, the median at 29, and the mean at 33." %}

| Statistic | Figure 3 | Reproduction |
|---|---:|---:|
| Mean | 33.0 | 33.002 |
| Median | 29 | 29 |
| Mode | 24 | 24 |

All three statistics match Figure 3 at the precision reported in the paper.

## What I learned

The most common training depth was 24, even though the average was 33. The histogram shows why: occasional draws with many recurrences pull the mean above both the mode and the median. Seeing all three on the same plot made the training schedule easier to interpret.
