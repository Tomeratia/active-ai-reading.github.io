---
title: The visualization guide
role: visualization
---

Yours to write. Some questions to start from:

- How do you decide which figure to redo?
- What didn't work?

## Additional resources

- [Writing tips](https://docs.google.com/document/d/14Wax8M5w8F_8miDlYJ9-I6wqpelxlXjCEUbkNzNMqqE/edit?usp=sharing): see *Graphics*, *Caption*, *Floating aids*
- [SciSketch](https://chatgpt.com/g/g-68a174e566f481918a83751d1ae06bd5-scisketch): a scientific-figure assistant from the Weizmann design team (needs a Weizmann EDU ChatGPT account first)

<!-- Add sections with ## and ### headings; the contents sidebar builds itself from them.
     Mid-semester we reread this guide as a newcomer would and cut it back to what helps. -->

## How to spot a good/bad visualization?

### Bad Figure tell: Requires effort from the reader

Figures that require the reader to perform calculations and/or mental effort to understand data points across the figure are not helpful.
The goal of visualization it to easy the reading and understanding process on the reader's side.

#### Example: Multi-Stream Attention Residuals

In Fig2 of the article, in order to understand the numner of layers per chosen point on the triangle;
one must draw parallel lines from the point to each side of the triangle, take the intersection points in percentages and multiply it with the total number of layers (39).
This requires much effort and makes user skip it all together, which misses the important quality gradient created there (FLOPs and KV cache size).

## How to improve an existing graph/diagram?
