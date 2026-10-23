# UX wireframes and interaction notes

The prototype implements these four responsive stages. Controls are native HTML, labels are explicit, stages have headings, dialogs announce status, and the layout collapses on narrow screens.

## 1. Idea intake

```text
┌ Pitch Studio ───────────────────────── Stored on this device ─ New project ┐
│ Turn a promising idea into a pitch you can stand behind.       Draft v0.1 │
│ 01 Idea ───── 02 Evidence ───── 03 Review ───── 04 Pitch package           │
├──────────────────────────────────────────────┬───────────────────────────┤
│ Start with what you know.     [Load QC1 demo]│ PROJECT INSPECTOR         │
│ [Quick idea] [Guided interview] [Evidence]   │ Untitled project          │
│ Working title                                │ Model version · v0.1      │
│ One-sentence idea                            │ Evidence · 0              │
│ Problem / workflow / users / systems ...     │ Review gate · Pending     │
│                         [Build my pitch →]   │ Local-first warning       │
└──────────────────────────────────────────────┴───────────────────────────┘
```

Quick mode requires only a title and idea. Guided mode offers one prompt at a time in the matching optional field. Evidence-assisted mode routes to explicit local file selection. A field never becomes mandatory merely because it is unknown.

## 2. Evidence review

```text
┌ Keep evidence separate from the story.                        2 items     │
│ Source boundary: local text only; imported content is untrusted data.    │
│ [Choose a local document]  report.md · loaded locally                    │
│ Source title | Owner | Reference | Type                                 │
│ Passage to consider                                                     │
│ [Reject passage]                         [Accept as evidence]            │
│ Source cards show owner, type, retrieval date, passage, review status.   │
└──────────────────────────────────────────────────────────────────────────┘
```

An accepted passage carries provenance and the explicit caveat that user acceptance is not verification. Rejected passages are not saved.

## 3. Canonical model review

```text
┌ Review the source of truth.                         [Not approved]       │
│ USER ASSERTION · UNKNOWN · RECOMMENDATION · SOURCE-REVIEWED              │
│ Project name | Problem | Current state | Proposed future state            │
│ Value proposition | Next step | Pilot | Measures | Unknowns | Tagline    │
│ Claim register: assertion / hypothesis / recommendation / evidence       │
│ Proposal, not authorization                                            │
│                        [Approve this version]                            │
└──────────────────────────────────────────────────────────────────────────┘
```

Changing an approved field invalidates approval immediately. “Approve” refers only to the draft model and its generated materials, not to project authorization.

## 4. Package review and export

```text
┌ One approved model. A coordinated package. [Generate package]            │
│ [Dossier] [One-pager] [9-slide outline] [Infographic] [Logo] [Video]     │
│ [Machine-readable record]                                               │
│ Consistency audit: pass/fail with detail                                  │
│ Preview assets. Inspect source and limitations before sharing.            │
│                                      [Download ZIP package]              │
└──────────────────────────────────────────────────────────────────────────┘
```

Previews use text/SVG/HTML templates. The video deliverable is a timed storyboard/script/caption package; the prototype does not imply that an MP4 or recorded narration was rendered.
