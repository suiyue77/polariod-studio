# Design · Framing viewfinder

Source: [Issue #15](https://github.com/suiyue77/polariod-studio/issues/15), 2026-11-28. Parent [Wish](../../wish/LATEST.md), [Design](../README.md).

Intent: use a familiar digital camera to preview instant film composition at the same station, without confusing focus distance, field of view, lens focal length and equivalent focal length. Preserve the original three camera models, theoretical/official/measured distinction, practical square default, and actual device comparison.

Realization: embedded in the Learn guide; reuse paper, ink, restrained accent and existing static guide / Reader contract. Camera selector, device/format/distance, horizontal and vertical matching, contextual focus warning, and same-center overlay are primary. A labelled original diagram rather than unlicensed photographs; native form controls and static table for non-JS visitors. No backend, camera access or uploads. Cadrage's frame-line approach is a useful reference, not a claim of its specific Polaroid support.

Source of optical truth: src/lib/framing.mjs; guide and interactive output consume it. Tests: tests/framing.test.mjs and tests/render-check.cjs. Use existing site tokens and do not introduce a second design system. A physical calibration experiment remains unperformed; source checks and browser tests cannot substitute for it. Future real-time camera overlay is optional, not accepted or part of this release.

See the plan for A01–A09; deployment requires separate authorization.
