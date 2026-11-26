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

Use the already-authorized browser session for sources that need login. On Xiaohongshu, opening a collection card’s empty bare-ID link returned 404, while searching for the same title and opening its normal visible search-result link successfully revealed the public note. Prefer ordinary site navigation; do not reconstruct access tokens or bypass a denial. Cite public titles and authors. Keep the bare note URL as identity, not as a guaranteed destination. Public share-copy links are permitted only through the scoped procedure below; never export internal navigation parameters, authentication credentials or private collection/following records. Treat title-only or unread image-based notes as leads, not evidence.

### Creator directory and account safety

Review a candidate’s actual public profile and relevant work before adding an owner-approved creator. Public entries contain the public display name, clean profile URL, editorial description and optional permission-verified avatar, never private relationship lists, counts, account identity or session parameters. For authenticated research, relationship lists are read-only: use exact verified navigation targets and normal scrolling; do not interact with follow, unfollow, follow-back, or remove-follower controls. Compare visible counts before and after if checking relationship lists. Store any explicitly requested personal snapshot privately, outside this public repository. A nickname match or truncated bio alone is not proof of identity or topic coverage. Keep homepage and Reader consistent with the approved collection.

Creator avatars are optional approved local assets: use the collection’s avatar object (src under /images/creators/, permission owned or licensed, credit). Do not add login-derived, token-bearing, unlicensed or third-party hotlinked images. No avatar object means an honest monogram fallback. Platform labels are derived from the public profile host; keep the existing clean profile URLs and Reader records unchanged.

The owner confirmed republication permission for the five current creator avatars on 2026-11-26. Match each avatar to the verified public profile, retrieve only anonymous public image bytes (no account credentials or access tokens), resize to a local 168px asset for 3x displays, and keep the attribution in the avatar record. A confirmed grant may cover multiple creators, notes and content types, including original note covers, photographs and text; follow the scope recorded by the owner rather than requiring redundant per-image permission. Do not mark material outside the confirmed scope as licensed.

### Reading list and content permissions

The root [CONTENT_PERMISSIONS.md](../../CONTENT_PERMISSIONS.md) is the canonical content policy, rendered at /permissions/ and linked in the footer. The current readingNotes collection publishes curated public note titles, author names, categories, review status, source links and optional licensed covers; summaries require a reviewed body. Original post images and text are eligible for non-commercial republication under the confirmed permission scope in CONTENT_PERMISSIONS.md. Preserve author and source; if adding post bodies or additional images, record permission and provenance in the content schema and keep third-party rights intact. Do not export collection IDs, private membership, session-derived navigation URLs or unapproved content. A clean original link may fail even when logged in; keep the identity and public access route distinct. A title-only reference is not evidence of a technical claim. Permission may cover avatars, covers, post images and text together; record the scope confirmed by the owner without inventing additional rights.

Reading-note cover metadata (coverTopic and coverMotif) describes an editorial topic, not a claim about a source photograph. The shared NoteCover component renders original vector artwork without third-party requests. An optional cover object requires a local /images/notes/ asset, owned/licensed permission and credit, checked before publication. Original note media may be collected and displayed within the confirmed permission scope; preserve source identity, attribution and asset provenance.

### Verified external note links

The bare /explore/<id> link was observed to redirect to a 404 even in a logged-in Chrome session. Opening the actual visible title in the platform collection/search view works. Use the platform's native “复制链接” action to obtain an intended public share URL, not an internal search/collection navigation URL. The public share URL is note-scoped and generated for external sharing; keep only the exact permitted webshare/pc_web/pc_share parameter shape, with its note-specific sharing parameter unchanged, no user/account identifiers or credentials. Verify the exact note title and identity by a separate normal logged-in browser navigation before recording share provenance. Never synthesize tokens, copy private session parameters, or bypass a login, denial, or challenge. Anonymous navigation may still require login. The website and Reader resolve direct links only from verified share records; otherwise clearly label a normal title-and-author search, with an exact-title search fallback. External access is a separate acceptance item from local href/HTTP checks; links can expire.
