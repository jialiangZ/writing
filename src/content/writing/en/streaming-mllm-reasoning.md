---
title: "Chain-of-Thought in Streaming Reasoning: Think While You Look"
description: "In streaming video understanding, a model that must wait for the full input before reasoning loses real-timeness. Here are a few observations from our work on Streaming CoT."
pubDate: 2026-10-18
locale: en
kind: longform
tags: [mllm, streaming]
translationKey: streaming-mllm-reasoning
---

Streaming multimodal models consume video **as it arrives**, not as a finished clip. That creates a direct tension: chain-of-thought reasoning wants to "think first, then speak", while streaming requires "speak while thinking".

## A naive baseline

The simplest approach repeats the whole reasoning pass at every step:

$$
p(y_t \mid x_{\le t}) = \sum_{i < t} p(y_i \mid x_{\le i}) \cdot p(y_t \mid x_{\le t}, y_{<t})
$$

which looks like this in practice:

```python
for frame in video_stream:
    chunks = model.infer(frame)          # re-reasons on every frame
    for chunk in chunks:
        emit(chunk)
```

The cost is obvious: step $t$ redoes work already done at step $t-1$, so compute grows linearly — or worse — with time, and repeated output makes the transcript jitter.

## Three observations

### 1. Reasoning can be cached incrementally

Reusing the KV cache is not only an engineering trick; it is what makes "reason once" possible at all. Once cached, step $t$ only has to compute the delta:

$$
\Delta z_t = f(x_t, z_{t-1}) - f(x_{t-1}, z_{t-1})
$$

where $z_t$ is the reasoning state at time $t$. In practice the update is **much smaller than the state itself**, which leaves room to approximate away older parts.

### 2. Redundant reasoning hurts more than late reasoning

A counter-intuitive observation: if a piece of reasoning was already computed at $t_1$ but the model only speaks it at $t_2 > t_1$, users perceive that as *worse* than thinking late. In a streaming interaction **the rhythm of the output carries information**.

| Strategy | First-token latency | Repetition | Feel |
| --- | --- | --- | --- |
| Full recompute | high | 100% | jittery |
| Incremental cache | low | low | smooth |
| Cache + delayed emit | low | low | sluggish |

### 3. When to "think again"

Not every step deserves an incremental update. When the input undergoes a **semantic jump** — a shot change, say — the cached state no longer holds, and recomputing from scratch is the better move:

$$
\mathbb{1}[\text{resample}] = \mathbb{1}\big[d(z_t, z_{t-1}) > \tau\big]
$$

A simple criterion that worked for us: resample once the distance between consecutive reasoning states exceeds a threshold.

## Open problems

- **Choosing $\tau$**. It depends on the task, video length and frame rate; today we can only tune it on a validation set.
- **State drift**. Over long streams, accumulated error pulls the state away from the "true" reasoning, and late corrections get harder.
- **Evaluation**. Static metrics such as BLEU or CIDEr mostly fail here. We need metrics that score timeliness and content consistency together.

## Takeaway

The hard part of streaming CoT is not making inference faster — it is making the **reasoning process itself incremental, discardable and reusable**. That is harder than throughput engineering, and more interesting.

More notes live in the [tag index](/writing/en/tags/).
