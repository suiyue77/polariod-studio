# Design · Polariod Studio

米白纸面、深色墨迹、编辑式衬线标题与克制的彩虹点缀；照片白边、自然留白、适量阴影。复用共享 Base 布局、CSS 与 PhotoSwipe，保持触控和键盘可操作。

**Executable owner:** [global.css](../../src/styles/global.css) and [shared layout](../../src/layouts/Base.astro). Change shared semantic roles there rather than creating a duplicate global token table. Preserve existing ordinary-page hierarchy, readable line length, native links, visible focus, contrast, and responsive behavior. Test desktop 1440×900 and mobile 440×956 CSS pixels (DPR3/touch), including the actual primary controls; a simulator is not a physical-phone test. The current light design is intentional; dark mode has not been independently qualified and is not a release claim.

Read [Wish interpretation](../wish/DESIGN.md) before navigation/product changes. No approved aesthetic redesign is implied by this document.

## Creator directory

使用紧凑的响应式名录：宽屏三列、中等屏幕两列、手机单列，利用桌面可用内容宽度。56px 圆形真实头像（有转载许可时）、创作者名称、简短介绍，平台名称紧邻“访问主页”外链。平台从公开主页域名识别；无获许可的头像时使用姓名首字符，不将其描述为真实头像。保留窄屏换行、可见焦点和至少 44px 的链接点击高度。

## Reading list

精选笔记用紧凑三列桌面、两列中屏与单列手机布局。使用实际原题、作者、阅读状态、主题筛选及搜索，不用未授权封面图充当卡片装饰。内容许可页沿用文章版式，页脚提供入口。
