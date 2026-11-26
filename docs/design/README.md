# Design · Polariod Studio

米白纸面、深色墨迹、编辑式衬线标题与克制的彩虹点缀；照片白边、自然留白、适量阴影。复用共享 Base 布局、CSS 与 PhotoSwipe，保持触控和键盘可操作。

**Executable owner:** [global.css](../../src/styles/global.css) and [shared layout](../../src/layouts/Base.astro). Change shared semantic roles there rather than creating a duplicate global token table. Preserve existing ordinary-page hierarchy, readable line length, native links, visible focus, contrast, and responsive behavior. Test desktop 1440×900 and mobile 440×956 CSS pixels (DPR3/touch), including the actual primary controls; a simulator is not a physical-phone test. The current light design is intentional; dark mode has not been independently qualified and is not a release claim.

Read [Wish interpretation](../wish/DESIGN.md) before navigation/product changes. No approved aesthetic redesign is implied by this document.

## Creator directory

使用安静的单列名录：56px 圆形头像位、创作者名称、简短介绍，平台名称紧邻“访问主页”外链。平台从公开主页域名识别；无获许可的头像时使用姓名首字符，不将其描述为真实头像。保留窄屏换行、可见焦点和至少 44px 的链接点击高度。

Feature-level goals and protected semantics: [Intent](../intent/README.md). This file retains its existing ownership and history.
