# Wish interpretation

首页引导 Learn、Creators、Reading list、Gallery；教程可独立阅读，创作者只有 approved=true 才公开，图库以明确许可的作品替换样例；无真实内容时如实显示状态。

- `/` → editorial entry; `/learn/` → guides; `/creators/` → approved creators; `/notes/` → categorized public source notes; `/permissions/` → content permissions; `/gallery/` → approved photos or explicitly labelled samples.
- Learn 按入门与相纸、拍摄与用光、诊断与练习分组；首页展示精选三篇，完整集合和主题入口位于 /learn/。技术长文由实际二级标题生成目录，正文用原理示意、场景对照和来源链接区分事实、经验与待验证练习。
- [Content schema](../../src/content.config.ts) and the existing PhotoSwipe viewer own those rules.

Visual rules and their executable owner are in [Design](../design/README.md); implementation and release rules are in [Dev](../dev/README.md).
