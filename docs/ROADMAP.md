# Backlog and evaluation

## MVP — prototype in this repository

- [x] Quick, guided, and evidence-assisted intake modes.
- [x] Sparse idea and seeded QC1 demo.
- [x] Canonical JSON Schema and editable review model.
- [x] Local text/Markdown/JSON evidence connector with human accept/reject.
- [x] Current-version human approval gate; edit revokes approval.
- [x] Dossier, one-pager, nine-slide outline, infographic, logo concepts, video story/script/captions, canonical JSON.
- [x] Seven-slide editable PowerPoint with an approved, reference-derived theme profile, speaker/source notes, draft/classification footer, and annotation-ready decision layout.
- [x] Exact-field consistency audit and local ZIP with SHA-256 manifest.
- [x] Post-deployment Pages smoke test for the application shell, runtime assets, QC1 fixture, and browser harness.
- [x] Local-first disclosure, no remote services, no dependency installation.
- [x] Dependency-free browser smoke-test harness for approval, output consistency, ZIP contents, timing, checksums, and edit invalidation.
- [ ] Enable the repository's Pages site at **Settings → Pages → Build and deployment → Source: GitHub Actions**, then rerun the workflow from `main`. Recent runs receive `HttpError: Not Found` from `configure-pages` because no Pages site exists; `GITHUB_TOKEN` cannot create it. The workflow now smoke-tests the assembled static site before this step and checks the live URL after deployment.
- [ ] Open the QC1 `.pptx` in desktop PowerPoint and visually inspect representative slides, notes, typography, and long-content autofit.
- [ ] Validate in the target enterprise browser before demonstration.
- [ ] Optional file download checksums / package extraction verification in target browsers.
- [ ] Accessibility review with keyboard, screen reader, contrast, and zoom evaluation.

## Next release — enterprise-ready governed workflow

- Authentication, project-level authorization, managed persistence, audit service, encrypted object storage, retention and deletion.
- Administrator-reviewed MCP registry; one enterprise read-only document connector, scoped identity, egress allowlist, bounded tools, and human activation.
- Full schema validation at API boundary; immutable version snapshots and append-only approval records.
- Source critic for authority, freshness, claim mapping, contradiction, reuse restrictions, and confidence basis.
- Human-readable unsupported-claim and contradiction screens; evidence citations in each asset.
- DOCX dossier and one-pager, then XLSX evidence/assumptions register, with reviewed Office templates and automated open/validation tests.
- Approved image/logo provider adapter, data-class routing, generated-image metadata, rights review, and image safety.
- Remotion rendering service for deterministic scenes, licensed still assets, approved narration, captions, MP4, and output checksums.
- Background queue, retry/cost limits, tracing, secret management, security and dependency scans.
- Evaluation harness for sparse/rich/conflicting/sensitive/malicious input, tool failure, missing provider, contradictory outputs, and unauthorized publication.

## Later experiments — gated, not assumed

- Selectable model providers and bounded specialist workers after schema/output evaluation.
- Scenario-based financial estimates only when source values and assumptions are adequate.
- Additional reviewed internal repositories or official documentation connectors.
- Optional approved speech/image generation; never default to public processing of internal content.
- Sponsor collaboration, comments, and version comparison under project authorization.
- Automated publication only after separate explicit human authorization and policy approval.

## Acceptance and safety test matrix

| Case | Expected behavior |
|---|---|
| Sparse idea | Allow blanks; preserve user assertion; keep value, feasibility, and success criteria unknown |
| Rich evidence | Record provenance and human-reviewed passages; maintain source links and restrictions |
| Conflicting sources | Keep each source and conflict visible; do not silently select or harmonize |
| Unsupported financial claims | No savings, costs, or ROI appear without attributed inputs, units, formula, and assumptions |
| Sensitive input | Warn and route only through an approved data-handling path; current prototype discloses it is local only |
| Failed MCP tool | Production workflow fails closed, logs bounded error, preserves existing canonical data, and does not report success |
| Missing image/video provider | Retain textual/SVG template deliverable; clearly report renderer/provider unavailability |
| Malicious source instructions | Treat as quoted untrusted data; never change system policy or call tools |
| Contradictory generated assets | Consistency audit fails the affected package and blocks export; do not mutate source model |
| Publication without approval | Reject deterministically; no publication capability is wired in MVP |

## Metrics to collect only with an approved telemetry/data policy

Fact consistency across assets; citation coverage; unsupported-claim rate; human correction rate; successful completion; connector/tool failure rate; generation cost by deliverable; WCAG/accessibility conformance; and user-rated pitch usefulness. Define baselines, denominators, retention, and data classification before collecting telemetry.
