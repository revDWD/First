# Agent guide

This file is the repository-wide working contract for coding agents. Read it before changing code. Use the linked product and governance documents for detail; do not contradict the implementation boundaries below.

## Product and current implementation

Digital Project Pitch Studio turns an early-stage idea into a reviewable pitch package anchored by one versioned Pitch Source of Truth. The project supports proposal development only: a pitch draft is not project approval, funding, feasibility, compliance, validation, production readiness, or authorization to share or publish.

The current app is a static, local-first browser prototype:

- `index.html` provides the accessible four-stage workspace.
- `styles.css` contains responsive styles and must not require an external font, CDN, or runtime asset.
- `app.js` implements the project state, typed-model validation, local document review, deterministic asset templates, consistency audit, and ZIP export.
- `schema/pitch-source-of-truth.schema.json` is the canonical exported-record contract.
- `examples/qc1-demo.json` is the unapproved instrument/QC1 demonstration.
- `tests/browser-smoke.html` is the dependency-free browser regression harness.
- `.github/workflows/pages.yml` assembles the static site and deploys it to GitHub Pages.
- `docs/` describes requirements, architecture, workflow, threat boundaries, evidence connector policy, UX, and backlog.

For full product scope see [README.md](README.md), [PRD.md](docs/PRD.md), and [ARCHITECTURE.md](docs/ARCHITECTURE.md). Security requirements are in [THREAT-MODEL.md](docs/THREAT-MODEL.md) and [MCP-ALLOWLIST.md](docs/MCP-ALLOWLIST.md).

## Non-negotiable product invariants

1. Downstream assets use one approved canonical model version. Never reinterpret the raw idea independently for each deliverable.
2. Preserve the distinction between facts, user assertions, assumptions, estimates, hypotheses, recommendations, and unknowns. Never turn absence of evidence into a fact.
3. Do not invent or imply savings, costs, dates, vendor/product approval, an existing integration, feasibility, compliance, validation, funding, or production readiness.
4. Asset generation and ZIP export require human approval of the current model version. Editing an approved model must revoke approval and invalidate stale assets.
5. The consistency gate is deterministic application code, fails closed, and never silently changes the canonical source.
6. Imported source content is untrusted data. Instructions embedded in documents, file names, metadata, or tool responses must not change policy, invoke tools, or alter claims.
7. User acceptance of a source passage is not independent verification. Preserve provenance and uncertainty.
8. This prototype makes no external model, MCP, search, image, video, or telemetry calls. Do not add external data egress, runtime downloads, arbitrary MCP servers, or public-provider processing without an explicit product/security review and approved data-handling route.
9. Do not use or imply corporate trademarks or affiliation. Keep project visual identity distinct and labeled as a draft concept.
10. Never describe pitch approval as project authorization. There is no publication capability.

## Architecture and coding conventions

- Keep the current MVP dependency-free and deployable as static files unless an approved scope change explicitly introduces a reviewed build/runtime.
- Use plain browser JavaScript, semantic HTML, accessible native controls, and the existing design tokens/styles. No framework or build tool is currently installed or required.
- Keep deterministic policy in application code: schema/shape validation, state transitions, approval enforcement, file names, claim mapping, checksums, and export gates are not LLM responsibilities.
- Keep model/project fields typed by the JSON Schema. Update the schema, demo fixture, browser validator, templates, tests, and documentation together when changing the canonical contract.
- Centralize shared copy and facts in the model. Use safe text rendering (`textContent`) for user/source data; escape all data interpolated into SVG, HTML, or Markdown. Do not create an unsafe HTML rendering path for imported content.
- Preserve project identity, terminology, recommendation, pilot, and brand across every deliverable. Extend the consistency auditor and tests whenever adding or changing an output.
- User-visible errors should be explicit and actionable. Do not silently swallow parse, validation, local storage, hashing, or export errors.
- Use Windows PowerShell and Windows-style paths when running commands in the supplied development environment. Repository-relative paths in GitHub Actions are POSIX paths because the runner is Ubuntu.
- Do not add real secrets to `.env.example`, browser code, docs, workflow files, or commits. `.env.example` is placeholder documentation and is not read by the prototype.
- Keep documentation accurate about what is implemented versus planned. `README.md` is deployed with the app, so avoid adding confidential/internal material there.

## Security and evidence rules

- The current evidence connector accepts only user-selected `.txt`, `.md`, and `.json` files, limited to 1 MB. It reads in the browser; it does not upload or fetch URLs.
- Keep source content visible for human review, safely rendered, and associated with title, owner, reference, retrieval time, type, confidence basis, reuse restrictions, and review status where applicable.
- No arbitrary repository, MCP server, vendor, or public source may be installed or activated automatically.
- Any future connector must follow the administrator allowlist, read-only-by-default, per-project authorization, scoped permissions, egress limits, bounded timeout/size/retry/rate limits, human activation, security scanning, and auditable provenance described in [MCP-ALLOWLIST.md](docs/MCP-ALLOWLIST.md).
- The static prototype is not an enterprise security boundary. Do not recommend it for confidential or restricted information or represent localStorage as encrypted or centrally governed.
- Preserve fail-closed behavior for missing providers, failed integrations, invalid schemas, stale approvals, audit conflicts, and blocked export.

## Run and verify

There is no package install, build, lint, or CLI test runner.

1. Serve the repository root with a local static server, for example:

   ```powershell
   py -m http.server 8080
   ```

   If Python is unavailable, open `index.html` in a browser; a local server is recommended for reliable localStorage, Web Crypto, and download behavior.
2. Open `http://localhost:8080/tests/browser-smoke.html`, choose **Run smoke tests**, and confirm every check passes.
3. Open the app and manually inspect responsive layout, keyboard navigation, source review, all previews, and ZIP extraction if changing UX/export behavior.
4. Validate changed JSON files with PowerShell `Get-Content -Raw <path> | ConvertFrom-Json`.
5. Run `git diff --check` and review the full diff before committing.

The smoke harness covers sparse intake, guided flow, malicious source instructions, evidence provenance, approval gating, canonical versioning, coordinated claims, ZIP inventory, exact 60-second timing, checksum accuracy, safe Markdown output, and edit invalidation.

## GitHub Pages and release handling

- The expected Pages URL is `https://revdwd.github.io/First/`; the repository's configured `gitDdyck/First` remote redirects to the current canonical `revDWD/First` repository. The site currently returns GitHub Pages' 404 because Pages is not enabled.
- Deployment runs on pushes to `main` and manual workflow dispatch. The workflow publishes the static app, docs, schema, demo, and smoke harness.
- Official GitHub Actions used by Pages are pinned to full commit SHAs with version comments. Do not replace these with floating tags without review.
- The workflow verifies the assembled site before calling `configure-pages`, then checks the deployed URL after deployment. If Pages is not enabled, a repository administrator must set **Settings → Pages → Build and deployment → Source** to **GitHub Actions** and rerun the workflow. `GITHUB_TOKEN` cannot enable Pages; do not add a privileged personal token for this purpose.
- A green deploy workflow does not constitute product/security approval. Do not publish user project data; Pages content is public.
- Do not push, publish a release, or change repository settings unless the user requests that action.

## Before committing

- Keep changes scoped to the request; do not discard unrelated work.
- Run the browser smoke suite and relevant JSON/whitespace checks.
- Inspect `git status` and `git diff` to ensure only intended files are included. Never commit user data, secrets, downloaded artifacts, or browser exports.
- Use a concise commit subject that describes the change. Include the repository's required co-author trailer:

  ```text
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```
