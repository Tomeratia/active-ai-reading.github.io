---
title: "Can we make machine to think more like humans"
description: "Adaptive Reasoning: Teaching Language Models When to Think and When to Write"
paper: recurrent-depth-latent-reasoning
role: research
task: followups
by: [matan2001]
---

## Motivation

When we solve a problem, we don't always approach it in the same way. Some questions are simple enough that we can answer them almost immediately. Others require us to stop and think for a while.

What's interesting is that we can often estimate how much effort a question will require before we even start solving it. But that estimate isn't always right. Sometimes a problem looks easy at first, and only after working on it do we realize that we need to think more deeply.

There is another aspect of human reasoning that I find particularly interesting: **when a problem becomes too complicated to solve entirely in our heads, we take out a pen and paper.**

Writing down intermediate calculations allows us to break a difficult problem into smaller parts, keep track of what we have already discovered, and use those results later. We don't necessarily write down every thought. We usually start writing when we feel that doing everything mentally is becoming difficult.

I think there is a natural connection between this behavior and reasoning in language models.

The [Huginn paper](https://arxiv.org/abs/2502.05171) introduces a recurrent Transformer that can perform additional computation in its hidden states before predicting the next token. This resembles the internal part of human reasoning: thinking without necessarily saying or writing anything.

On the other hand, **Chain-of-Thought (CoT) can be viewed as the model's pen and paper**. By generating intermediate reasoning steps, the model creates information that it can refer to when making subsequent predictions.

This raises a question:

**Instead of forcing a language model to always think for a fixed amount of time or always generate Chain-of-Thought, can we teach it to decide when each approach is useful?**

## Proposed Idea: A Reasoning Controller

I propose extending Huginn with a single lightweight controller that dynamically decides how the model should allocate its reasoning computation.

The controller would operate both before and during the reasoning process.

Initially, it would examine the question's representation, produced by Huginn's prelude, and estimate how much internal computation is needed. Rather than committing to a fixed budget, it would choose an action and then reevaluate the situation after that action has been completed.

As Huginn continues reasoning, the same controller would examine its updated hidden state and decide what to do next.

The controller would have four possible actions:

- **THINK(4):** Perform four additional recurrent iterations without generating text.
- **THINK(8):** Perform eight additional recurrent iterations without generating text.
- **WRITE:** Generate an intermediate reasoning step, similar to writing something down on paper.
- **ANSWER:** Stop reasoning and generate the final answer.

We define the action space as:

$$
\mathcal{A}=
\{\operatorname{THINK}(4),\operatorname{THINK}(8),
\operatorname{WRITE},\operatorname{ANSWER}\}.
$$

At the beginning, the controller primarily uses the question's representation to make an initial decision. After recurrent iterations have been performed, it can also use the information accumulated in Huginn's hidden state.

For example, the model could choose:

$$
\operatorname{THINK}(8)
\rightarrow \operatorname{THINK}(4)
\rightarrow \operatorname{WRITE}
\rightarrow \operatorname{THINK}(8)
\rightarrow \operatorname{ANSWER}.
$$

For a simpler question, it might choose:

$$
\operatorname{THINK}(4)\rightarrow\operatorname{ANSWER}.
$$

The important point is that **we don't need separate predictors for estimating the initial difficulty and deciding what to do later**. The same controller makes both decisions, using the information available at each stage.

This is also closer to how people approach difficult problems. We initially estimate how much thinking is necessary, but we keep reconsidering that estimate as we work.

## Model Architecture

The proposed architecture consists of Huginn and one small reasoning controller.

Given an input sequence $x$, Huginn's prelude produces:

$$
e=P(x).
$$

At recurrent iteration $k$, the model maintains a hidden state $s_k$. The recurrent computation can be written as:

$$
s_{k+1}=R(A(s_k,e)),
$$

where $R$ is the recurrent Transformer core and $A$ is the input adapter.

The controller receives a representation of the prelude output, the current recurrent state, and information about the computation already performed.

Its policy is:

$$
\boxed{
\pi_\phi(a\mid e,h_k,k)
}
$$

where:

- $e$ represents the question's prelude output.
- $h_k$ is a summary of the current recurrent hidden state.
- $k$ is the number of recurrent iterations already performed.
- $a\in\mathcal A$ is the selected action.
- $\phi$ denotes the controller's trainable parameters.

The controller could be implemented as a small feedforward neural network (FFN), followed by a softmax over the four actions.

When it chooses THINK(4) or THINK(8), Huginn performs the requested number of recurrent iterations, and the updated hidden state is passed back to the same controller.

When it chooses WRITE, Huginn enters a special generation mode, indicated by a token such as `<STEP>`. Huginn then generates an intermediate reasoning step until it produces `<END_STEP>`.

The generated reasoning text is added to the context so that subsequent computations can use it. After processing the updated context, the system returns to the same controller.

When the controller chooses ANSWER, Huginn generates the final response.

We wouldn't need another language model for generating Chain-of-Thought. Instead, we could fine-tune Huginn to recognize the different generation modes while keeping its existing recurrent architecture and language-model head.

In the initial implementation, we could require the controller to perform a minimum number of recurrent iterations before WRITE or ANSWER becomes available.

## Training with Reinforcement Learning

I propose training the unified controller using **reinforcement learning (RL)**.

The motivation is that we don't necessarily know which action is best at each intermediate step. Writing down an intermediate result may appear unnecessary at first but could become useful later in the solution.

Rather than providing predefined labels for the correct action at every state, we can let the controller explore different reasoning strategies and learn from their outcomes.

For each training question, the controller repeatedly selects actions until Huginn produces a final answer. We then reward the complete reasoning process based on whether the answer was correct and how much computation was required.

### Reward Function

A possible reward function is:

$$
\boxed{
R=
\mathbb{1}[\text{correct answer}]
-\lambda C_{\mathrm{normalized}}
}
$$

where:

- $\mathbb{1}[\text{correct answer}]$ equals $1$ if the final answer is correct and $0$ otherwise.
- $C_{\mathrm{normalized}}$ is the total computational cost normalized to the interval $[0,1]$.
- $\lambda\geq0$ controls how strongly we penalize computational cost.

To normalize the cost, we first establish a maximum permitted inference budget $C_{\max}>0$ and define:

$$
\boxed{
C_{\mathrm{normalized}}
=
\frac{C_{\mathrm{total}}}{C_{\max}},
\qquad
0\leq C_{\mathrm{normalized}}\leq1.
}
$$

We would enforce the maximum computational budget during inference, ensuring that:

$$
0\leq C_{\mathrm{total}}\leq C_{\max}.
$$

Importantly, $C_{\mathrm{total}}$ should account for both recurrent computation and the cost of generating additional reasoning tokens. We could initially measure this using approximate FLOPs and later evaluate actual inference latency as well.

Normalizing the cost makes its scale comparable to the binary correctness reward. The parameter $\lambda$ then determines the balance between solving problems correctly and using computation efficiently.

For example, we could begin with $\lambda=0.1$ and tune it experimentally.

### Reinforcement Learning Objective

The goal is to maximize the expected reward across training problems:

$$
\boxed{
\max_{\phi}
\mathbb{E}_{\tau\sim\pi_\phi}
\left[
\mathbb{1}[\text{correct answer}]
-
\lambda\frac{C_{\mathrm{total}}(\tau)}{C_{\max}}
\right]
}
$$

Here, $\tau$ represents a complete reasoning trajectory, including the controller's actions and Huginn's generated outputs.

This encourages the controller to discover reasoning strategies that produce correct answers without performing unnecessary computations.

For example, if a question can be answered correctly after four recurrent iterations, the controller should learn that additional thinking or writing would waste computation.

For a more challenging problem, the controller might discover that writing an intermediate calculation improves its chances of solving the problem enough to justify the additional cost.

### Training Procedure

I would approach training in stages.

First, we would fine-tune Huginn on examples containing explicit reasoning steps, using markers such as `<STEP>`, `<END_STEP>`, and `<ANSWER>`. This would teach Huginn how to generate intermediate calculations when the controller requests them.

Next, we would freeze Huginn and train only the unified controller using reinforcement learning, possibly with a policy-gradient algorithm such as PPO-Clip (Proximal Policy Optimization).

During training, the controller would explore different sequences of actions, receive rewards based on final-answer correctness and normalized computation cost, and gradually learn which strategies are most effective.

We would also impose limits on the number of recurrent iterations, reasoning tokens, and controller decisions to prevent excessively long or unfinished reasoning processes.

Later, we could investigate jointly fine-tuning Huginn and the controller.

## Proposed Experiments

I would begin with a pretrained Huginn model and compare several approaches:

1. **Original Huginn:** Fixed recurrence budgets and the paper's KL-divergence-based adaptive stopping.
2. **Always WRITE:** Huginn generates Chain-of-Thought regardless of the question.
3. **Adaptive latent reasoning:** A controller chooses additional recurrent iterations but cannot generate intermediate reasoning steps.
4. **Unified controller:** The proposed approach, choosing dynamically between latent computation, writing intermediate steps, and answering.

The main goal would be to evaluate whether the unified controller achieves better reasoning accuracy for a given computational budget.

We would measure final-answer accuracy, recurrent iterations, generated reasoning tokens, total inference FLOPs, and inference latency.

An additional experiment could investigate whether the controller learns meaningful differences between easy and difficult problems, such as using WRITE more frequently for tasks requiring several intermediate calculations.

We could also evaluate the effect of different values of $\lambda$ to understand the tradeoff between accuracy and computational efficiency.

## Why This Is Interesting

What I find most interesting about this idea is the possibility of combining two different forms of reasoning.

Latent reasoning allows the model to perform additional computation without generating text. Chain-of-Thought provides a way to externalize intermediate results, making them available for later steps.

Humans use both approaches naturally. We think internally when we can, and we turn to pen and paper when we need additional support.

The goal is to explore whether a language model can learn a similar behavior: **knowing when to think a little longer, when to write something down, and when it has done enough to answer.**

Using a unified controller makes the approach simpler and allows the same decision-making mechanism to operate throughout the entire reasoning process.

Reinforcement learning fits this setting because the value of an action often becomes clear only after the problem has been solved.

If successful, this approach could improve how language models use inference-time computation, allowing them to adapt not only how much they reason but also how they reason.

