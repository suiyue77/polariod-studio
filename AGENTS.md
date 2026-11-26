# Agent entrypoint · Polariod Studio

- Current product intent: [Wish](docs/wish/LATEST.md); information architecture: [Wish Design](docs/wish/DESIGN.md).
- Visual authority: [Design](docs/design/README.md) and `src/styles/global.css`.
- Engineering/CI: [Dev](docs/dev/README.md), [Website Passport](docs/dev/WEBSITE_PASSPORT.md), `package.json` and the real deployment configuration.
- Content rights: [CONTENT_PERMISSIONS.md](CONTENT_PERMISSIONS.md) (non-commercial learning, no sublicensing; individual source permission required).
- Content/source facts: `src/content.config.ts`, `src/content/` and permission fields.
- Public reader: `/agent/`, `/agent/site.json`, `/llms.txt` relative to the site's base.

Before edits, check exact main and overlapping PRs. Preserve the user's project intention, source provenance and existing public/approval boundaries. Never add credentials, private records or unapproved images to public output. Build and test the changed layer; report exact-head CI and production independently. Do not introduce paid services, hosting changes or permission changes without separate approval.

## Verified delivery path — connector permission gaps

Keep the GitHub integration as the preferred route. A GitHub API 403 with `Resource not accessible by integration` can indicate an integration-specific capability gap, not a repository-wide denial.

- Inspect the exact error and re-read remote state before retrying. Use the existing authorized GitHub CLI only when the failure is integration-specific and the same action is permitted for the intended collaborator. Check `gh api user --jq .login`, `gh repo view suiyue77/polariod-studio --json nameWithOwner,viewerPermission,defaultBranchRef`, the remote URL, current main SHA and overlapping PRs. Stop on an actual access denial, protection rule, safety refusal or missing approval; never change accounts, credentials, repository visibility or permissions to defeat a restriction.
- Develop from current main on an isolated topic branch. Preserve concurrent work. Submit the smallest reviewed diff through a PR; do not push directly to main. Use the existing Dev validation contract: clean install when needed, build and reader checks, plus rendered desktop/mobile tests for affected pages. For new guides, verify listing links, article routes and reader catalog entries.
- Check Vercel preview status against the exact PR head and confirm mergeability and any required review. After authorized merge using the expected head SHA, read back main and the production deployment status. Check the canonical live URL and changed routes for HTTP 200 and the actual new content; a green preview or a successful merge alone is not proof of publication.
- Do not add another CI service, change Vercel ownership/configuration, or expose credentials or private environment details. For documentation-only changes, validate the changed document and avoid redundant UI tests unless the rendered site is affected.

**Verified case (2026-11-26):** [PR #2](https://github.com/suiyue77/polariod-studio/pull/2). The integration's branch creation returned 403, while the authorized collaborator's CLI reported WRITE permission and successfully pushed the topic branch. Build, reader checks and 20 desktop/mobile route checks passed; Vercel preview succeeded, the PR merged at `1584c4cd7f937a5e269c82acea2148f04994a734`, and both new guides and the reader catalog returned HTTP 200 on the canonical production domain with the expected content. The integration itself was not repaired; this is evidence for an authorized alternative route, not a blanket permission grant.
