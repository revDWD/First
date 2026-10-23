# Product requirements — Digital Project Pitch Studio

## Product outcome

Help a scientist, researcher, operations specialist, or digital champion turn an early-stage idea into a coherent, reviewable, source-grounded pitch package. The product supports proposal development; it never confers project approval, funding, feasibility, compliance, validation, or production readiness.

## Users and jobs

- **Idea owner:** explain a problem, retain uncertainty, and prepare a useful sponsor conversation.
- **Sponsor:** understand the proposed change, value hypothesis, risks, pilot boundary, and decision request.
- **Review partners:** inspect evidence, security/privacy/quality questions, dependencies, and open decisions.

## Requirements

1. **Low-friction intake.** Accept a title and short idea, with optional workflow, users, systems, constraints, sponsor, audience, sensitivity, and visual direction. Support quick, guided-question, and local-document evidence-assisted entry. Blank optional fields remain valid.
2. **Explicit claim classes.** Distinguish FACT, USER ASSERTION, ASSUMPTION, ESTIMATE, HYPOTHESIS, RECOMMENDATION, and UNKNOWN. Missing evidence is never silently filled by model prose.
3. **One canonical source.** Persist a versioned, typed Pitch Source of Truth. Every final asset is generated from one approved version; assets cannot change approved facts or recommendations.
4. **Evidence provenance.** Record source title/reference, owner, retrieval time, passage, type, confidence, internal/external status, reuse status, and claim links. Source passages are untrusted data; user acceptance is not independent verification.
5. **Human review gate.** Let the user edit, review, accept or reject source passages, mark value unknown, and approve a canonical draft. Any approved-model edit revokes approval. Final assets require current-version approval.
6. **Coordinated deliverables.** Generate a dossier, one-pager, nine-slide outline, SVG infographic, logo concepts, 60-second deterministic storyboard/script/captions, machine-readable model, and provenance manifest.
7. **Consistency and export.** Fail export if generated assets diverge from exact canonical project name, tagline, pilot, or recommended next step. Package the outputs and SHA-256 checksums in a ZIP.
8. **Least privilege and disclosure.** Never transmit user information from this prototype. Clearly mark local-only operation, unsupported integrations, and known limitations.

## MVP acceptance criteria

- A user can create a sparse idea, or load the seeded QC1 demonstration.
- Intake accepts optional blank fields and never fabricates savings, cost, dates, product approvals, compliance, or integration availability.
- Local `.txt`, `.md`, and `.json` files no larger than 1 MB can be reviewed as passages; user review is required to accept them.
- Canonical pitch fields are editable; unknowns and claim classifications remain visible.
- Final asset generation is blocked until the user approves the current source-model version.
- Editing an approved model revokes its prior approval and clears generated assets.
- One action creates a dossier, one-pager, slide outline, infographic, independent logo concepts, video script/storyboard/captions, and canonical JSON.
- All assets preserve the same project name, tagline, pilot, and recommendation; any audit failure blocks export.
- The ZIP contains a manifest with source version, generation date, approval states, citation references, limitations, and SHA-256 asset checksums.
- No external request, runtime package installation, publication, MP4 rendering, or generative model call occurs.
- The application communicates that a pitch-draft approval is not project authorization.

## Explicit non-goals for this prototype

Enterprise authentication/authorization, shared multi-user workspaces, server persistence, PostgreSQL/object storage/queues, an MCP client, web browsing, image generation, narration synthesis, MP4 encoding, formal compliance/validation assessment, financial forecasts, and automated publication are not implemented.

## Evaluation

The prototype implements deterministic gating and provenance checks, not generative-model quality metrics. A production evaluation plan should measure fact consistency, citation coverage, unsupported-claim rate, correction rate, successful completion, connector failure rate, cost by deliverable, accessibility conformance, and sponsor-rated usefulness. Test cases and rollout priorities are in [ROADMAP.md](./ROADMAP.md).
