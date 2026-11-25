# Polariod Studio

Astro 5 + Tailwind CSS 4 + TypeScript + MDX + PhotoSwipe. Static website, no account system or backend.

## Develop

```sh
npm ci
npm run dev
npm run build
```

Publish only `dist/` to the existing Vercel project `polariod` under `suiyue77-team`. Verify the target before deploy. No credentials belong here.

## Content

- Guides: `src/content/guides/*.md` or MDX, validated metadata.
- Creators: `src/content/creators.json`; add id, name, url, description and approved=true only after owner review.
- Gallery: `src/content/photos.json`; add approved optimized images to public/photos/ and records with id, title, image, alt, width, height, category, credit and permission (owned/licensed/sample). Sample entries disappear when actual entries exist. Preserve originals offline, strip sensitive EXIF metadata, and obtain permission before publishing other people's work.
- Layout samples are original SVG illustrations, not actual photos.

## Design & governance

Wish: a small editorial studio for learning, discovery and collecting instant photographs. Design: paper, ink, restrained accent, editorial serif headlines; global CSS is the semantic token owner. Dev: static build and local rendered checks, deploy-only until a private repo/CI is explicitly configured. No paid service or analytics enabled. Public editorial site; never publish unapproved personal photos. Accessibility: semantic navigation, skip link, visible focus, reduced-motion preference, responsive layout. Agent index: /llms.txt.


## Render checks

`npm run build && npx playwright install chromium && npm run test:render`.
Alternatively, set CHROME_PATH to an existing Chromium-compatible browser.
The suite checks eight routes at desktop and mobile widths, image loading,
page overflow, gallery filtering and the lightbox open/close interaction.
