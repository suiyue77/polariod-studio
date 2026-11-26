# Dev · Polariod Studio

- [LATEST.md](LATEST.md) — current technical direction.
- [DESIGN.md](DESIGN.md) — engineering and provider roles.
- [ARCHIVE.md](ARCHIVE.md) — replaced development directions.
- [WEBSITE_PASSPORT.md](WEBSITE_PASSPORT.md) — acceptance map.
- [Design](../design/README.md) · [Wish](../wish/README.md).

Use the existing source and lockfile. Verify the exact candidate and the actual deployed version separately.

## Guide discovery and provenance

Guides are owned by the Astro content collection; the Learn topic view must include each guide exactly once and the public Reader must enumerate the same paths. The home page is a curated subset, not a second catalog. Use current manufacturer manuals for model-specific controls, credible photography references for optics, and clearly attributed community reports for observed experience. Original diagrams are teaching illustrations, not photographs. Never present inaccessible social posts as read or unperformed film tests as results. Validate chapter anchors, linked guides, source labels and rendered desktop/mobile behavior with the existing render suite.

### Authenticated community research

Use the already-authorized browser session for sources that need login. On Xiaohongshu, opening a collection card’s empty bare-ID link returned 404, while searching for the same title and opening its normal visible search-result link successfully revealed the public note. Prefer ordinary site navigation; do not reconstruct access tokens or bypass a denial. Cite the public title, author if appropriate, and clean source URL, not session-specific URL parameters or private collection/following records. Treat title-only or unread image-based notes as leads, not evidence.

### Creator directory and account safety

Review a candidate’s actual public profile and relevant work before adding an owner-approved creator. Public entries contain the public display name, clean profile URL, editorial description and optional permission-verified avatar, never private relationship lists, counts, account identity or session parameters. For authenticated research, relationship lists are read-only: use exact verified navigation targets and normal scrolling; do not interact with follow, unfollow, follow-back, or remove-follower controls. Compare visible counts before and after if checking relationship lists. Store any explicitly requested personal snapshot privately, outside this public repository. A nickname match or truncated bio alone is not proof of identity or topic coverage. Keep homepage and Reader consistent with the approved collection.

Creator avatars are optional approved local assets: use the collection’s avatar object (src under /images/creators/, permission owned or licensed, credit). Do not add login-derived, token-bearing, unlicensed or third-party hotlinked images. No avatar object means an honest monogram fallback. Platform labels are derived from the public profile host; keep the existing clean profile URLs and Reader records unchanged.

The owner confirmed republication permission for the five current creator avatars on 2026-11-26. Match each avatar to the verified public profile, retrieve only anonymous public image bytes (no account credentials or access tokens), resize to a local 168px asset for 3x displays, and keep the attribution in the avatar record. Do not reuse this permission for other creators or their photographs.

### Reading list and content permissions

The root [CONTENT_PERMISSIONS.md](../../CONTENT_PERMISSIONS.md) is the canonical content policy, rendered at /permissions/ and linked in the footer. The readingNotes collection publishes only curated public note titles, author names, categories, review status and clean source links; summaries require a reviewed body. Do not export collection IDs, private membership, login-derived URLs, source text, images or video. A clean original link may need login or fail; tell readers to search the original title and author. A title-only reference is not evidence of a technical claim. Existing avatar permission is not permission for any post media.
