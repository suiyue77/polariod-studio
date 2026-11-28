# 小红书资料检索与笔记保存 SOP

Status: current · 2026-11-28
Scope: authorized research for Polariod Studio; reusable reference for Sports.
Evidence: the 2026-11-26 Studio delivery, not a claim that every future note or platform version works.

## 1. 目标与输出

目标是找到原始资料、保存可追溯的笔记索引和获准素材，最后确认读者确实能打开原帖。不是批量复制整个社交账号，也不是自动执行小红书「收藏」动作。按本次用户授权选择公开研究、私人快照或站点发布；三者独立。

一条笔记的验收链：**发现 → 身份匹配 → 正文阅读/证据分级 → 原生分享链接 → 可选原始封面 → 内容权限 → 去重落盘 → 发布/实际访问验收**。

## 2. 技术选型与启动

| 路线 | 何时使用 | 本次经验 |
|---|---|---|
| 普通搜索 / 官方来源 | 查公开信息、找候选和交叉验证 | 普通搜索能发现线索，但部分小红书原文无法直接打开 |
| 已授权 Chrome + Kimi WebBridge | 需要原帖图文、评论、相关收藏或公开主页 | 首选已验证路径；用户亲自登录，不导出 Cookie |
| Agent Reach / OpenCLI / xiaohongshu-cli | 未来确有规模化检索需求，再独立评估 | 本案例仅比较过，没有安装或完成其小红书端实测；不能声称已可用 |

先读已安装 Kimi WebBridge Skill 的当前版本和操作合同（官网：[Kimi WebBridge](https://www.kimi.com/products/kimi-webbridge)），再检查本机服务状态。2026-11-26 的实测版本为 v2.0.39；版本、连接能力和页面结构会变，以当次状态为准。可用已授权本机终端或既有 RDC 连接执行，不改变代理、Chrome 配置或认证。示例（本机默认端口，仅当实际服务相符时）：

```bash
curl -fsS --max-time 5 http://127.0.0.1:10086/status
```

检查 extension 已连接、tab_id_arg、tab_lifecycle；未安装或未连接则按 Skill 正规恢复，需要用户登录或人机验证时交由用户。不能把真实拒绝当作更换后端的理由。

新建任务自己的标签组，一任务一 session；后续命令明确定位本任务 tabId。只读取该任务所需页面，结束后按 Skill 生命周期关闭自己创建的临时页面，保留用户已有页面。示例，勿将实际 session/tabId 写入公共仓库：

```bash
curl -fsS --max-time 15 -X POST http://127.0.0.1:10086/command \
  -H 'Content-Type: application/json' \
  -d '{"action":"navigate","args":{"url":"https://www.xiaohongshu.com/explore","newTab":true,"group_title":"摄影资料研究"},"session":"photo-research-example"}'
```

先 snapshot(format: "aria")，再用 find/read_page 或 evaluate 读取可见 DOM；根据实时页面验证选择器、文本、唯一性和目标，不能凭历史 CSS 直接点击。每次导航后等待真实页面条件。所有关系操作（关注、取关、回关、移除粉丝）、收藏、点赞、评论、私信、对外分享发送默认禁止。只允许为读取而导航，以及原生「复制链接」这种明确的本地操作。不要点击分享面板联系人；不读取无关好友、私信或账号数据。登录状态不是授权；不得模拟人机验证、重放私有 API、构造签名、提取或迁移凭据。真实 401/403、429、挑战、拒绝或身份不明时停止对应操作。

## 3. 怎么查：从关键词到原始证据

1. 用明确主题检索（如「宝丽来 测光」「Flip 闪光 曝光」「Lightme 测光」），先广后窄，随后用原题和作者复查。可在网页搜索框用 fill + 正常搜索操作，或平台正常搜索入口。例如：
   `https://www.xiaohongshu.com/search_result?keyword=<URL-encoded-keywords>`。
2. 从结果卡片记录公开标题、作者、笔记 ID、主题以及原始封面候选。用实际可见卡片中的标题链接打开；不要自己拼接裸 ID URL 并将其视为可读正文。
3. 核对真实详情标题、ID、作者；阅读正文与相关评论，明确「正文读取」「仅核实主题」「仅标题」三种证据等级。图片/视频未读则如实标记，不根据标题生成全文结论。保留作者个人经验与官方事实、可复现实验之间的区别。
4. 如果用户明确允许利用收藏/关注作筛选，只打开相关收藏入口，通过正常滚动增量加载。虚拟列表可能移除离屏节点：每个视口累积 Map<noteId, record>，滚动约一屏并等待新卡片，再按 ID 去重；稳定到底部后核对已见数和漏项，不将 DOM 当前数量当总数。简介、昵称仅用于候选筛选，公开主页和实际作品才确认相关性。仅把相关公开资料发布；不公开收藏归属或用户关系。
5. 若用户明确要求保存关注/粉丝快照，在本地私有目录（权限 0700/0600）仅保留授权字段，注明显示昵称非稳定身份；操作前后核对平台计数和关系按钮未被调用，保存读回。计数不一致保留原始观察，不擅自修正，也不上传 GitHub。

2026-11-26 实测页面线索（不是永久 API）：列表常见 `section.note-item` / `.note-item`，标题 `a.title`、作者 `a.author`、封面 `a.cover img`；详情标题 `#detail-title`、正文 `#detail-desc`；用新 snapshot/DOM 确认每次实际状态。采集时只输出当前范围所需字段，不能抓取登录令牌、完整页面内部状态、私人关系记录或全站数据。

## 4. 怎么保存：身份与访问地址分开

裸 `https://www.xiaohongshu.com/explore/<note-id>` 是身份定位值，不是保证可用的读者入口。实测登录 Chrome 打开裸链接跳转 404，普通站内搜索点同一笔记却能读到正文。

**正确直达流程**：

- 通过真实收藏卡片或搜索卡片正常打开目标笔记；核对 ID 和标题。
- 打开原帖自身分享面板，确认唯一可见操作准确叫「复制链接」，仅复制链接，不向联系人发送。历史实测 synthetic click 有时没有成功提示；检查没有挑战/拒绝后，可在同一明确目标上使用 mouse_click（focus_emulation），观察「复制成功」提示。缺少确认或剪贴板身份不匹配时停止这一条，不使用旧剪贴板值；明确操作成功才读取刚复制的匹配链接，不输出剪贴板其他内容。
- 区分平台**主动生成用于外部公开分享**的地址和登录/内部导航参数。Studio 当次原生 webshare 形态为 `source=webshare`、`xhsshare=pc_web`、`xsec_source=pc_share` 加平台生成的笔记级分享参数（仅保留原生公开分享产生的原值，不打印真实值、不构造、不从站内搜索复制）。只按当前项目 [note-links.mjs](../../src/lib/note-links.mjs) 的同源、同 ID、参数白名单验证；发现账号标识、凭据、不明参数或格式变化就隔离并重查，不擅自改 URL。
- 用另一个正常已登录的工作标签页打开分享链接，核对实际详情 ID/标题；必要时核对作者。HTTP 200 不够，错误页也可能返回 200。记录 verification、source、verifiedOn；匿名验证另外记账。直达不通过时用原题+作者搜索入口，另保留准确原题搜索；页面明确标记「查找原帖」，不能假称直达。链接会失效，更新时复核。
- 保护公共仓库：禁止公开私有收藏夹 URL、内部搜索签名、Cookie、登录 token、账号 ID、私信与分享面板联系人。不要把真实链接参数抄到 SOP、日志或 PR 描述。仅符合当前公开分享策略且目标实测通过的 URL 才允许进入站点数据。

## 5. 保存封面和正文（严格区分权利）

使用 [内容许可](../../CONTENT_PERMISSIONS.md)；非商业用途声明不自动产生权利人的转载许可。许可可以覆盖多个创作者、多篇笔记和头像/封面/图片/原文，记录真实已确认的范围，不把一份授权推到不相关内容。未明确获准只保留公开来源索引与合规原创摘要；不得将完整第三方正文、其他照片或视频作为默认输出。

- 封面从对应可见原始笔记卡片读取，不另画主题图。校验同卡片的 ID、原标题、作者、实际 img 已加载、naturalWidth/Height；保留真实作品的构图和水印。通过明确公开的 HTTPS 图片 URL 获取可匿名访问的原图缩略图字节（不得使用账号 Cookie、私有签名、绕过防护或移除水印）。核验域名、MIME、大小、实际像素与源一致；HTTP 拒绝、403/429 或其他访问限制即停止，不换方式绕过。仅获准文件保存到 `public/images/notes/<note-id>.<ext>`，记录尺寸、字节 SHA-256、来源类型、署名、核验日期、实际许可依据。无法确认的封面明确缺失。
- 正文已读才生成原创摘要，引用范围按权利与适用法律；纯图文/视频需要实际查看，不能从标题猜。只有许可确实覆盖全文/其他图片且本次明确要求时，才按当前内容 schema 设计新增字段，完整保留来源与授权证据。现有 Studio 47 篇仅发布封面和索引，没有复制全部正文。
- 私人研究资料与站点公开资料分离。临时观察、候选、失败原因在隔离本地目录，完成后按授权与必要性清理；不把整个浏览器数据或原始私有账号记录提交。公开源记录按笔记 ID 幂等去重，检查同标题异 ID 不被误合并。

## 6. 本项目实际落盘契约

以当前 [schema](../../src/content.config.ts) 和 [reading-notes.json](../../src/content/reading-notes.json) 为准。字段不是新增的第二套数据库：

| 字段 | 作用 |
|---|---|
| id / title / author / category / url | 公开身份及主题；url 保存裸身份 URL |
| evidence / summary | title-only、topic-verified、body-reviewed；仅后者允许原创 summary |
| share | url、verifiedOn、verification=logged-in-browser、source=platform-share-copy（直达实测才填） |
| cover | src、permission、permissionBasis、credit、source、width、height、sha256、verifiedOn（有真实许可与源图证据才填） |

保存前检查新增/重复/排除/失败清单、证据等级与权利范围，不导入私有候选数据。实际显示 [NoteCover](../../src/components/NoteCover.astro)、[笔记页](../../src/pages/notes/index.astro)、[Reader](../../src/lib/agent-reader.ts) 使用同一条目；主入口与封面/标题/按钮一致，搜索备用入口明确。遵循现有 Design 与 Dev；不为收录重新发明站点框架。

## 7. 验收与提交

- 内容验收：数量、唯一 ID、作者/标题、已读和未读分类、权限、缺失项、资源文件 SHA-256、真实封面与原帖一致，所有私人字段均排除。
- 原帖验收：逐条验证本轮新增/变化的分享入口，记录 exact ID/title、日期、登录/匿名条件和失败理由；不凭上次成功保证长期有效。只查新增/变化项，已核对且无变化的证据可复用。现有的 [Reader 校验](../../scripts/check-agent-reader.mjs) 防裸链、错误 ID、内部来源、未许可/错配资源，不能代替真实外链行为。
- 发布验收（有内容改动时）：按 [Dev](LATEST.md) 的 build / check:reader / test:render 合同，测试桌面、手机的图像解码、构图、跳转和筛选；核对 exact-head Preview、合并后真实 main 和生产内容，至少从正式页面实际点击关键路径；新图片逐个读回与保存的哈希比较。所有外部阻碍保持可见，不把构建或 HTTP 200 直接等同读者成功。
- 文档-only SOP 变更验证 Markdown 路径、diff 和现有 required CI，不为 SOP 强制增加付费服务或重新抓取数据。遵循仓库 AGENTS、合法 GitHub 写入、正常 PR/CI 和 main 读回。

## 8. 2026-11-26 成功与失败经验（真实历史）

| 现象/尝试 | 结果与下次做法 |
|---|---|
| 普通匿名搜索无法稳定读原始笔记 | 复用已登录 Chrome 与现有 WebBridge；实际读取正文、部分评论。无需安装新爬虫。 |
| 裸 ID 直达报 404 | 用真实卡片/搜索正常打开，再原生复制公开分享链接，独立登录标签页实测。[PR #11](https://github.com/suiyue77/polariod-studio/pull/11)：47/47 正确打开，正式站实际点击一篇成功；匿名测试遇登录/错误页。 |
| 复制动作返回 success 却无成功提示 | 不信工具 ack；核对同一可见「复制链接」目标和提示，合法 real pointer retry 后读回，逐条停边界。 |
| 虚拟滚动只看到 30 项 | 按 ID 跨视口累积，最终读到相关集合 51 个不同笔记；47 条收录，3 条相关性未确认，1 条无关。不是全平台完整性。 |
| 自制封面通过 UI 测试，却不符合真实封面目标 | [PR #10](https://github.com/suiyue77/polariod-studio/pull/10) 是被纠正的中间方案；[PR #13](https://github.com/suiyue77/polariod-studio/pull/13) 替换 47 个原始 WebP 卡片封面（约 2.73 MB），逐文件 SHA-256、HTTP 200 与实际渲染验证，0 自制封面，桌面/手机 32/32。 |
| 仅更新许可文件，未改变实际显示内容 | [PR #12](https://github.com/suiyue77/polariod-studio/pull/12) 扩展可授权范围；#13 才交付真实图像。规则资格、权利确认和实际产物是三个证据层。 |
| 简介不足以分类创作者 | 结合相关笔记和公开主页复核，收录 5 位、5 张真实许可头像（[#6](https://github.com/suiyue77/polariod-studio/pull/6)、[#8](https://github.com/suiyue77/polariod-studio/pull/8)）；关系快照仅私下保存，未修改关注/粉丝，不能保证找齐所有相关博主。 |
| 社区摄影经验被误当官方结论的风险 | [PR #4](https://github.com/suiyue77/polariod-studio/pull/4)、[#5](https://github.com/suiyue77/polariod-studio/pull/5) 共扩展至 9 篇教程；用官方相机资料及专业测光原理核验，明确个人经验与教学假设，不冒充实拍实验。 |

证据范围：这些是历史实测结果；本 SOP 编写时复核当前项目代码，不重新登录、抓取或测试旧链接。平台访问、长期分享链接有效性、权利人独立授权证明、未来 Agent 是否遵守以及新体育资料的实测均不由本记录保证。
