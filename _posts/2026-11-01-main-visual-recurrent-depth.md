---
title: "Visualizing Core ideas"
description: One figure showing how three separate models become one nested model, how the blocks connect, and how the smaller models learn from the largest.
paper: matryoshka-lm-suites
role: visualization
task: key-visual
by: [gilk717]
---

## Core idea

We are aware of two scaling axes that can be used to achieve stronger inteligence from models:
1. Bigger models - Use more data to train more parameters.
2. Chain-of-thought - Use test time compute by training the model to output more tokens.

The paper's core idea is to allow for test time compute, but by using latent space reasoning instead of more output tokens. 
The architecture to allow it is the recurrent depth architecture. 


## The figure

{% include figure.liquid path="assets/img/posts/main-visualization-recurrent-depth
/latent-recurrence-infographic.svg" class="img-fluid rounded" caption="cap" %}

## How to read it

- **A new scaling axis** A test time compute scaling axis that isn't dependant on the number of output tokens, or on training data.  
- **Recurrent depth architecture** An architecture to allow the new test time compute scaling axis. 

**Results (not in the figure).** One nested run uses 36% less training compute than three independent runs, and speculative decoding is 26% faster than with an independently trained pair (greedy, draft length 6). Accuracy is within 0.5 average points of token-matched baselines, which use 57% more compute.

**Caveats.** The 3.2B vs. 5.2B count leaves out the LM heads of the two smaller exits (about 0.16B), and part of the decoding speedup comes from a larger batch fitting in memory (102 vs. 64).
