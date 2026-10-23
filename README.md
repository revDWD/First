# Digital Project Pitch Studio

A local-first, dependency-free prototype for turning an early digital project idea into a governed, reviewable pitch package. The prototype uses deterministic templates; it does not call an AI model, external search, MCP server, image generator, or video service.

**Live demo:** [Open Digital Project Pitch Studio on GitHub Pages](https://gitddyck.github.io/First/)

The repository is configured to publish the static app with GitHub Actions. If the link is not live yet, enable **Settings → Pages → Build and deployment → Source: GitHub Actions** and run the **Deploy GitHub Pages** workflow from the `main` branch. The expected URL is `https://gitddyck.github.io/First/`.

## Run locally (Windows)

1. Open `index.html` in a current browser, or use a local static file server if your browser restricts local-file storage:

   ```powershell
   # From the repository root; Python is optional and is not a project dependency.
   py -m http.server 8080
   ```

   Then open `http://localhost:8080`. If Python is not installed, use the browser's **Open File** command to open `index.html`.

2. Select **Load QC1 demo**, or enter a title and idea.
3. Review source passages in **Evidence** if needed. Only `.txt`, `.md`, and `.json` files up to 1 MB are accepted; they are read in the browser and are not uploaded.
4. Edit and approve the canonical pitch model in **Review**.
5. Generate, inspect, and export the package. The ZIP contains the dossier, one-pager, slide outline, infographic, light/dark logo SVGs, rationale, video script/storyboard/captions, canonical JSON, and a provenance manifest.

Data is saved in this browser profile's local storage. Avoid entering confidential or restricted information. Use **Clear this device's project data** to remove the prototype's local storage entry; this does not erase browser backups or exported files.

## Browser smoke tests

With the static server running, open `http://localhost:8080/tests/browser-smoke.html` and select **Run smoke tests**. The dependency-free harness exercises approval gating, canonical record output, consistency checks, ZIP contents/checksum manifest, exact 60-second timing, and invalidation after edits. It clears its test project from local storage at the end.

## Deliverables and design

- [Product requirements](docs/PRD.md)
- [Architecture, workflow diagram, state model, agent contracts, and system structure](docs/ARCHITECTURE.md)
- [Threat model](docs/THREAT-MODEL.md)
- [MCP allowlisting design](docs/MCP-ALLOWLIST.md)
- [UX wireframes](docs/UX-WIREFRAMES.md)
- [MVP / next release / experiments backlog and evaluation cases](docs/ROADMAP.md)
- [Canonical JSON Schema](schema/pitch-source-of-truth.schema.json)
- [Seeded QC1 demonstration](examples/qc1-demo.json)
- [Environment-variable placeholders](.env.example)

## Important prototype boundaries

- The QC1 demo makes no claim that an integration exists, a product is approved, savings are known, licensing is available, requirements are met, or a project is funded.
- Evidence passages are user-reviewed source material, not independently verified facts. Imported instructions are never executed.
- Pitch-model approval is not authorization to execute, fund, validate, or publish a project.
- The current ZIP includes a deterministic 60-second storyboard/script/caption package, not a rendered MP4 or recorded narration. No image provider is configured.
- The local document intake is the only evidence connector. MCP, enterprise repositories, authentication, shared storage, encryption policy, retention/deletion service, and audit backend are design requirements for a reviewed deployment, not implemented capabilities.
- The consistency audit checks exact shared fields and approved-version provenance. It does not independently prove semantic fact consistency.

## Deployment and governance

Do not deploy this static prototype as an enterprise service or use it with sensitive data. Before production, implement authenticated project-scoped access, managed secrets, encrypted storage, approved MCP allowlisting and egress controls, full runtime schema validation, immutable approvals and tool logs, retention/deletion, dependency/SCA/secret scanning, accessibility evaluation, and independent security review. See the threat model and connector activation gate.

## Validation

The repository has no build dependencies or package-based test runner. Run the prototype in a modern browser and exercise the QC1 end-to-end path. Confirm approval gating, re-approval on edits, evidence provenance, asset previews, consistency audit, and ZIP extraction before use. The browser smoke-test harness automates the key local workflow and should pass before merging.
