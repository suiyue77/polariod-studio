# Design · Polariod Studio

米白纸面、深色墨迹、编辑式衬线标题与克制的彩虹点缀；照片白边、自然留白、适量阴影。复用共享 Base 布局、CSS 与 PhotoSwipe，保持触控和键盘可操作。

**Executable owner:** [global.css](../../src/styles/global.css) and [shared layout](../../src/layouts/Base.astro). Change shared semantic roles there rather than creating a duplicate global token table. Preserve existing ordinary-page hierarchy, readable line length, native links, visible focus, contrast, and responsive behavior. Test desktop 1440×900 and mobile 440×956 CSS pixels (DPR3/touch), including the actual primary controls; a simulator is not a physical-phone test. The current light design is intentional; dark mode has not been independently qualified and is not a release claim.

Read [Wish interpretation](../wish/DESIGN.md) before navigation/product changes. No approved aesthetic redesign is implied by this document.
