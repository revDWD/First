# Presentation design system and PowerPoint output

## Reference analysis

The four user-provided decks are local design references only. They are not copied into the repository, published, or bundled with generated presentations.

| Reference | Observed design contribution |
|---|---|
| `bayer_master_templates.pptx` | Formal foundation: widescreen 16:9 (13.33 × 7.50 in), Arial, reusable master/layouts, title/body/footer/slide-number zones, corporate logo artwork, chapter/content/image/final-slide variants. Main theme colors include navy `#10384F`, cyan `#00BCFF`, green `#004422`, lime `#89D329`, purple `#443247`, magenta/pink, and orange. |
| `A_Document_Automation_Odyssey 4.pptx` | Narrative-led odyssey framing, large visual metaphors, restrained slide text, presenter notes, and explicit live-inking moments. Slides combine editable text/shapes with images. |
| `Digital Byte Streamdeck 10.5.pptx` | Clear progression through a workflow, strong product/process metaphors, large visuals, and presenter notes. |
| `IBT Tablet Enabled Template Slides.pptx` | Tablet and Stream Deck interaction patterns, linked demonstrations, and space for presenter-led interaction. |

## Derived profile

The maintainable token profile lives at [`presentation/theme-profile.json`](../presentation/theme-profile.json); deterministic rendering and layout selection live in `presentation.js`. It uses the reference widescreen dimensions and Arial hierarchy, with navy and cyan as the base and limited accent colors. The generator uses editable vector shapes and native text, not slide screenshots. An editable typographic “BAYER” label is used as a small wordmark treatment; no corporate logo artwork or reference media is redistributed. Classification and project-version information are drawn from the approved project record.

The small layout library is narrative-oriented: title/metaphor, friction statement, current-to-future workflow, evidence/value, bounded pilot, risks/unknowns, and a decision/discussion slide with annotation space. Short messages, paired comparisons, and cards replace dense bullet-only pages. Notes preserve source context, uncertainty, the project version, and the proposal-only boundary.

## Governance and rendering contract

- Rendering receives the approved canonical pitch and project envelope. It does not call a model, retrieve sources, alter the project, or invent metrics.
- Generation fails unless the approval status is `approved` and `approved_version` equals the current model version.
- Each slide states the proposal status. Current-state user assertions, proposed future state, hypotheses, measures, risks, and unknowns remain labeled as such.
- Source references and review status are included in speaker notes. Notes do not promote user-accepted material to independently verified fact.
- The generated `.pptx` is a real Office Open XML package with native text and shapes, a 16:9 slide size, a theme, and notes. The ZIP manifest hashes the binary presentation bytes as well as text and image outputs.
- Content remains deterministically positioned. Text boxes use PowerPoint autofit as a secondary safeguard; the browser regression suite checks package structure, editability, footer/claim text, and geometry bounds.

## Output format choices

| Deliverable | Current choice | Rationale / follow-up |
|---|---|---|
| Presentation | Editable `.pptx` plus accessible Markdown outline | Natural sponsor-review format; notes and vector shapes remain editable. |
| Dossier / one-pager | Markdown | Existing deterministic outputs remain easy to diff and preview. `.docx` generation is a later enhancement when a reviewed template and Word-opening tests are available. |
| Evidence / assumptions | Canonical JSON and ZIP manifest | Preserves structured provenance without making an incomplete spreadsheet. `.xlsx` belongs in a later phase with explicit columns and reviewer workflows. |
| Video | Script, storyboard, captions, thumbnail, render manifest | No MP4 is claimed without an approved renderer, narration, and media-rights process. |
| Final package | ZIP with per-file SHA-256 checksums | One versioned package; export verifies that it still matches current approval. |

## Known limitations

This is a static, local-first demonstration. It does not provide shared project storage, authenticated access, confidential-data handling, enterprise connectors, model access, image sourcing, Word/Excel generation, or video rendering. Microsoft PowerPoint desktop validation is an additional release check; the browser test verifies the OOXML container and key editable elements, but cannot replace visual review in PowerPoint.
