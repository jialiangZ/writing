---
title: "北极海冰的逐日预测，难点不在模型"
description: "做了一段时间的逐日海冰浓度预测后，我越来越确信：真正的瓶颈是数据对齐，而不是网络结构。"
pubDatetime: 2026-09-02
lang: zh
kind: note
tags: ["sea-ice", "ai-for-climate"]
translationKey: sea-ice-daily-forecast
---

做 Arctic sea ice 逐日浓度预测的这段时间，有一点感受越来越强：**模型不是瓶颈，数据才是。**

具体来说：

- 被动微波卫星的观测有**时间漂移**，不同传感器过境时间不一样，直接对齐会引入系统性偏差；
- 融化期（melt season）缺测严重，训练标签本身就有噪声；
- 冰密集度和浓度的定义在不同数据集里并不完全一致，混用会掉点。

一个很朴素但有效的做法：**先用物理模型（热力学海冰模型）生成物理量作为额外输入通道**，网络只负责学残差。结构上没什么花哨的，但比换 backbone 带来的提升更实在。

$$
\hat{C}_{t+1} = C_t^{\text{phys}} + \Delta C_{\text{learned}}
$$

这也让我重新想了想"AI for Science"里"for"的含义——很多时候不是让 AI 去替代物理模型，而是让物理模型把问题简化到 AI 擅长的部分。

相关论文：[Frequency-Compensated Network for Daily Arctic Sea Ice Concentration Prediction](https://arxiv.org/abs/2504.16745)
