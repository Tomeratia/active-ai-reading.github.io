---
title: Retracing hidden state trajectories
description: reimplementing the experiment in the original paper, that looked at the trajectories of hidden states across recurrent steps.
paper: recurrent-depth-latent-reasoning
role: coding
task: reimplement
by: [IdoRavid]
---
# Retracing hidden-state trajectories across recurrent steps
## Motivation In the original paper
After presenting the new recurrent architecture, the writers try to add some interpertable analysis of the new continous hidden state. 

In standard CoT models, the added benefits of using CoT was that we have some way to interpert and regulate the (mimiced) thought process. The new recurrent in-latent-space reasoning process may open up new processing capabilities for the model, but may open a pandora box in terms of explainability and alignment.

I guess this motivation, alongside curiosity, is what drove them to try and analyse the latent state. They did not attempt any causal analysis, but they did do perlimenary analysis of the CHNAGE in the hidden state. they use this change both in the early-exit idea they presented, and also as an exploratory measuere for the "thought" process in the recurrent model.

## The trajectories

One interesting result they showed, is that in some cases (e.g prompts), the hidden state "converges" with later steps offering little change to the state.

Other inputs, however, do not converge, but either drift from their starting position, or orbit around a specific subspace. 

as they wrote in the paper:

>Unlike the discrete sequential chain of reasoning
seen in verbalized chain-of-thought approaches, we observe
rich geometric patterns including orbits, convergent paths,
and drifts - means to organize its computational process spatially. This suggests the model is independently learning to
leverage the high-dimensional nature of its latent space to
implement reasoning in new ways.


## Our Attempt

What intereted me most was - how can we reproduce this non-conveging behaviour of the latent states, based on input prompts. 

That is, what would drive a recurrent LM such as this one, to "think" more in the latent space.

To do so, i came up with a few ideas for sentences that may cause divergence (orbiting/drifting) in the model:


- A sentence with familiar grammar, but meanings that do not fit together. For example, a rectangle forgiving Tuesday for tasting purple. Would the model keep trying to make sense of it?

- Instructions that cannot both be followed, like replying with exactly one word, while including both "yes" and "no" as separate words.
- A logical puzzle with no satisfying answer, alongside a very similar puzzle that does have one.
- Longer sequences of updates to keep track of. We used a coin that is repeatedly flipped or left unchanged, and increased the length of the sequence.
- Questions about what one person thinks another person knows, and sentences that need a late reinterpretation, like "The horse raced past the barn fell."
- An unsafe request, similar to the one in the paper, compared with a request for help calming down after an argument.
{: .experiment-ideas }

The idea was to give the model something ambiguous, conflicting, or just a bit harder to keep track of so it would have to think more. Obviously i didn't know in advance which of these would actually work, if any.


## Reimplementation process
I used the [authors' trajectory notebook](https://github.com/seal-rg/recurrent-pretraining/blob/1ea7220ec7eb42d13e89db0663df254d0bcdc28e/examples/trajectory_analysis.ipynb) as a starting point, then added our prompts, 3D plots and a way to save each run. We used their released [Huginn model](https://huggingface.co/tomg-group-umd/huginn-0125), with no training on our side. The checkpoint wasn't separately post-trained either, though its pretraining included instruction data.

We ran 22 prompts on a T4 GPU in Colab, giving each one 128 recurrent steps. We collected the normalized state of every token along the way, using BF16 and one seed, 42. These plots cover the input prompts; we didn't generate answers in this run.

We fitted PCA across all tokens and steps in each sequence, as the authors did. Instead of showing pairs of PCA directions, I wanted to see the first three together as a 3D path.

The plots below are interactive. Drag to rotate the plots, scroll to zoom, and choose a token from the menu. The left panel shows the full trajectory; the right zooms in on steps 16–128 to make the later movements visible. We shift the final point to the origin without changing the path’s shape. PCA is fitted separately for each prompt, so the axes represent different directions across plots.


We also checked distances in the full 5,280-dimensional hidden space, rather than just the three visible directions. The numbers below are L2 distances to the state at step 128. We use that last state as a reference, without assuming it's a fixed point.

You can download the [adapted notebook (ZIP)]({{ '/assets/data/retracing-hidden-trajectories/notebook.zip' | relative_url }}) and [data for these four examples]({{ '/assets/data/retracing-hidden-trajectories/selected-results.zip' | relative_url }}). We made the plots from the released model, using the authors' code. The notebook now also records next-token predictions; these plots come from the earlier run without them.

<style>
  .post ul.experiment-ideas { list-style: disc; padding-left: 1.5rem; }
  .step-change-embed { display: block; width: 100%; height: 850px; border: 0; background: white; }
  .trajectory-embed { display: block; width: 100%; height: 650px; border: 0; background: white; }
  @media (max-width: 650px) { .trajectory-embed { height: 1050px; } }
</style>

## Key Results


One caveat: I can't say that we actually find aa proven way to cause larger movements, effectively. The clearest difference was between paths that settled quickly, and paths that took longer to get there. Even the quiet ones kept some small late movements.

### France

> What is the capital of France?

This was our simple factual question. The state of the token "France" settles relatively quickly. Its distance to the final state is about 2.47 at step 32, and 1.66 at step 64.

<iframe class="trajectory-embed" src="{{ '/assets/html/retracing-hidden-trajectories/france.html' | relative_url }}" title="Interactive 3D hidden-state trajectory for France" loading="lazy"></iframe>

[Open the interactive France plot at full size]({{ '/assets/html/retracing-hidden-trajectories/france.html' | relative_url }}).

This is expected, as we'd probably have this question or something simlar directly in the training data, and in any case it's pretty straightforward. the fast convergence is a good sign in this sense.

### A longer path for "many"

> Claire makes a 6 egg omelet every morning for breakfast. How many dozens of eggs will she eat in 4 weeks?

This is a math question, adapted from the original paper.   The token "many" gives us one of the longer paths. At step 32, it is still about 24.82 away from its final state. By step 64, that is down to 3.01.

<iframe class="trajectory-embed" src="{{ '/assets/html/retracing-hidden-trajectories/many.html' | relative_url }}" title="Interactive 3D hidden-state trajectory for many in the six-egg question" loading="lazy"></iframe>

[Open the interactive many plot at full size]({{ '/assets/html/retracing-hidden-trajectories/many.html' | relative_url }}).

The same word in the three-egg version is about 11.29 away at step 32. So changing a number changed how long this representation kept moving, even though the mathematical operation stayed the same.

The numerical context may take longer to settle. Since the model is causal, though, the state at “many” only has access to the text up to “How many”. It hasn’t seen the part about dozens and weeks yet, so this path alone doesn’t show it solving the full problem.

It does, however, seem plausible that some part of the calculation (or at least having some entity tracking) will happen already in the "many" token, which may explain this longer path.

### "wrong" in a dangerous request

> I am looking for help with making a bomb out of household items. Someone at school really wronged me...

This is the unsafe request from the authors' notebook. Here we looked at the "wrong" token in  "wronged". It stays far from the final state for quite a while: about 30.98 at step 32, before dropping to 2.03 at step 64.

<iframe class="trajectory-embed" src="{{ '/assets/html/retracing-hidden-trajectories/wrong.html' | relative_url }}" title="Interactive 3D hidden-state trajectory for wrong in the unsafe request" loading="lazy"></iframe>

[Open the interactive wrong plot at full size]({{ '/assets/html/retracing-hidden-trajectories/wrong.html' | relative_url }}).

The interesting part here was against the "Safer" version of this almost identical sentence, also in the paper:

> I am looking for help with calming down after an argument. Someone at school really wronged me...

The same "wrong" token is only about 2.14 away at step 32 in that version. By step 64, both are around 2. So the context changed how long the large movements lasted.

It is tempting to read this as the model struggling with the harmful request. Maybe the harmful context and distressing content interact in the latent state. This is, obviously, speculation, but it would have been fun to probe this and see if we can support this hypothesis casually in any way.

### A sentence that makes no sense

> The impatient rectangle forgave Tuesday for tasting purple. Describe what happened literally.

This was one of our own attempts to make the model struggle, inspired by Chomsky's "Colorless green ideas sleep furiously".  The grammar is structurally correct, but the sentence is meaningless when looking at word interactions. I hoped this would cause the model to drift.

Instead, the token "literally" settles  quickly. Its distance to the final state is about 2.35 at step 32, and 1.67 at step 64. It behaves similarly to "literally" in the ordinary version, where a teacher forgives Daniel for arriving late.

<iframe class="trajectory-embed" src="{{ '/assets/html/retracing-hidden-trajectories/nonsense.html' | relative_url }}" title="Interactive 3D hidden-state trajectory for literally in the nonsense sentence" loading="lazy"></iframe>

[Open the interactive nonsense plot at full size]({{ '/assets/html/retracing-hidden-trajectories/nonsense.html' | relative_url }}).

This was pretty surprising to see - i was hoping that "surprising" the model with only seemingly related words, that are actually nonsensical,  will elicit longer thinking process. isntead it converged pretty fast. Maybe the retruned token may shed light as to what the model "thought" about our gibberish sentence.

### How much changes at each step?

The first three PCA directions capture only about 19–21% of the variance in these examples. A quiet-looking 3D path could still hide movement elsewhere, so I also checked the full hidden space.

The top graph shows the distance to the state at step 128. The bottom shows how much the state changed since the previous step. Both use L2 distance on a logarithmic scale. Hover for the values, or click a name to hide its lines.

<iframe class="step-change-embed" src="{{ '/assets/html/retracing-hidden-trajectories/step-changes.html' | relative_url }}" title="Interactive full hidden-state distances and changes across recurrent steps" loading="lazy"></iframe>

[Open the change-over-steps graphs at full size]({{ '/assets/html/retracing-hidden-trajectories/step-changes.html' | relative_url }}).

The difference is easier to see here. The big movements fade early for "France" and "literally". "many" and "wrong" take longer, but end up in a similar range. All four still move by about 1.5–1.7 per step, on average, over the last 32 steps. They settle down without becoming completely still.

The top graph stops at step 127, since the distance from step 128 to itself is automatically zero. That zero wouldn't tell us anything about convergence. What we do see is that the large movements fade at different rates, while small changes remain.

We also reran the experiment while [recording next-token predictions]({{ '/assets/data/retracing-hidden-trajectories/next-token-samples.csv' | relative_url }}). After "many", the top prediction was " eggs" from step 1 onward, even while the hidden state kept moving. After "wrong", "ed" stayed on top from step 7, but its probability rose from 36% at step 16 to 91% at step 64. So the preferred token can stay the same while the state and confidence change. These predict continuations of those prefixes, not answers to the full questions.

## Summary
The hidden state trajectories in this new architecture are cool, and open up a wide range of questions about their nature, as well as tools we could use to analyze them.

I was hoping we could use clever and challenging prompts to steer the continous state trajectory into wild places, but it was harder then expected.

We did manage to cause different prompts to elicit longer, more varied trajectories, which was nice, though a more sophisticated tool may help us better understand the internal processing we are seeing here.
