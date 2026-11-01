---
title: "literature review of Multi-Stream Attention Residuals"
description: LImportant previous articles for this paper
paper: paper-id
role: research
task: literature
by: shachar731945
---


<!-- LITERATURE REVIEW -->
## The papers this builds on

### [ATTENTION RESIDUALS](https://arxiv.org/pdf/2603.15031)

Is the predocessor article to this one by the Kimi team.
It introduces the concpet of a residual stream that tries to solve the problem posed by vanilla residual stream which is the fact that residually saved data passed to some layer contains all information from previous layer.
Whereever, the current layer may require only specific data from some specific layer.
This is solved by the attention mechanism inserted in the residual attention in the AttnRes article:
It introduces the depth-axis attention (on the history blocks); thus allowing the residual connection to only retrieve data relevant to it at the current layer.

### [Deep Residual Learning for Image Recognition](https://arxiv.org/pdf/1512.03385)

This is the seminal paper in intorducing residual connection.
The paper was introduced in the era of convolutional networks manily used for image classification via the ImageNet dataset.
Researchers have noticed that increasing the number of convolutional layers improves result due to finding more complex patters in images up to a certain point, even to a point that the performence degrades.
This monumental paper (More than 300K citations) introduces re-introducing the input or earlier networks to the network, allowing the network to learn from data (input or earlier layers) that are not present in later layers of the networks.
The problem solved in MSAR and AttnRes is that having one residual connection usually makes the re-introduction to later networks "messy" and containing many data over many layers even though we might want only data from previous layers.

### [HC: Manifold-Constrained Hyper-Connections](https://arxiv.org/pdf/2512.24880)

Building upon residual connections, this paper introduces the conpcet of having multiple residual streams.
These streams are added (residualy) for later layers of the networks and are updated accordingly.
In order to not make these streams to now just be one single longer stream, creating the next set of residual streams requires projecting via a doubly stochastic matrix into a lower-dimension manifold.

## The fields and concepts it connects to

These papers deal with residual connections throughout deep networks with many layers.
They deal with the ways to retain and use information from previous layers to later layers of the neural network,
These improvements have shown to improve the performence of nerual networks.

