"use strict";

(() => {
  const EMU = 914400;
  const WIDTH = 12192000;
  const HEIGHT = 6858000;
  const COLORS = {
    navy: "10384F",
    cyan: "00BCFF",
    green: "004422",
    lime: "89D329",
    purple: "443247",
    magenta: "D30F4B",
    pink: "FF3162",
    orange: "FBAE40",
    white: "FFFFFF",
    ink: "1F2933",
    muted: "62727C",
    surface: "F4F7F8",
    rule: "D9E2E7"
  };
  const PROFILE = {
    profile_id: "bayer-reference-narrative-v1",
    reference_decks: [
      "bayer_master_templates.pptx",
      "A_Document_Automation_Odyssey 4.pptx",
      "Digital Byte Streamdeck 10.5.pptx",
      "IBT Tablet Enabled Template Slides.pptx"
    ],
    page: { width_inches: 13.333333, height_inches: 7.5, aspect_ratio: "16:9" },
    font: "Arial",
    colors: COLORS,
    layouts: ["title-metaphor", "friction-statement", "current-future-workflow", "evidence-value", "pilot-measurement", "risks-and-unknowns", "decision-ink"],
    organization_mark: "Editable BAYER word label; no embedded corporate logo artwork",
    classification_footer: "Canonical intake sensitivity + project version + draft status + slide number",
    editability: "Native PowerPoint text and vector shapes; no slide screenshots."
  };

  const xml = (value) => String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  const inches = (value) => String(Math.round(value * EMU));
  const esc = xml;

  function wrapText(value, limit) {
    const words = String(value || "").split(/\s+/).filter(Boolean);
    if (!words.length) return [""];
    const lines = [];
    let line = "";
    for (const word of words) {
      if (word.length > limit) {
        if (line) lines.push(line);
        line = "";
        for (let index = 0; index < word.length; index += limit) {
          const segment = word.slice(index, index + limit);
          if (segment.length === limit) lines.push(segment);
          else line = segment;
        }
      } else if (!line) {
        line = word;
      } else if (`${line} ${word}`.length <= limit) {
        line += ` ${word}`;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function paragraphs(text, options = {}) {
    const size = options.size || 1800;
    const color = options.color || COLORS.ink;
    const bold = options.bold ? "<a:b/>" : "";
    const align = options.align || "l";
    const margin = options.margin || 0;
    const lines = String(text ?? "").split(/\r?\n/).flatMap((paragraph) => wrapText(paragraph, options.wrap || 66));
    return lines.map((line) =>
      `<a:p><a:pPr algn="${align}" marL="${margin}"/><a:r><a:rPr lang="en-US" sz="${size}" dirty="0">${bold}<a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="Arial"/></a:rPr><a:t xml:space="preserve">${esc(line)}</a:t></a:r><a:endParaRPr lang="en-US" sz="${size}"/></a:p>`
    ).join("");
  }

  function shape(id, name, x, y, width, height, text, options = {}) {
    const body = text === null ? "" : `<p:txBody><a:bodyPr wrap="square" lIns="0" rIns="0" tIns="0" bIns="0" anchor="${options.anchor || "t"}"><a:normAutofit/></a:bodyPr><a:lstStyle/>${paragraphs(text, options)}</p:txBody>`;
    const geometry = options.geometry || "rect";
    const fill = options.fill ? `<a:solidFill><a:srgbClr val="${options.fill}"/></a:solidFill>` : "<a:noFill/>";
    const line = options.line ? `<a:ln w="${options.lineWidth || 12700}"><a:solidFill><a:srgbClr val="${options.line}"/></a:solidFill></a:ln>` : "<a:ln><a:noFill/></a:ln>";
    const preset = `<a:prstGeom prst="${geometry}"><a:avLst/></a:prstGeom>`;
    return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${esc(name)}"/><p:cNvSpPr${text === null ? "" : ' txBox="1"'}/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${inches(x)}" y="${inches(y)}"/><a:ext cx="${inches(width)}" cy="${inches(height)}"/></a:xfrm>${preset}${fill}${line}</p:spPr>${body}</p:sp>`;
  }

  function groupStart() {
    return '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
  }

  function slideXml(shapes, background = COLORS.white) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="${background}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>${groupStart()}${shapes.join("")}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
  }

  function notesXml(text) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>${groupStart()}<p:sp><p:nvSpPr><p:cNvPr id="2" name="Notes Placeholder 1"/><p:cNvSpPr/><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${paragraphs(text, { size: 1400, wrap: 100 })}</p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>`;
  }

  function relationship(id, type, target) {
    return `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}" Target="${target}"/>`;
  }

  function presentationScenarios(pitch, project) {
    const evidence = pitch.evidence_ledger.filter((item) => item.review_status === "accepted");
    const sensitivity = String(project.intake?.sensitivity || "unspecified").toUpperCase();
    const sourceNote = evidence.length
      ? evidence.map((item) => `${item.source_title}${item.source_reference ? ` — ${item.source_reference}` : ""} (user-accepted; not independently verified)`).join("; ")
      : "No source evidence supplied. Claims remain user assertions or hypotheses.";
    const nextQuestions = (pitch.unknowns || []).slice(0, 3);
    const risks = (pitch.risks || []).slice(0, 3);
    const measures = (pitch.success_measures || []).slice(0, 3);
    const currentSteps = pitch.current_state.steps.filter(Boolean);
    const futureSteps = pitch.future_state.steps.filter(Boolean);
    return [
      {
        layout: "title-metaphor",
        section: "PROJECT PITCH",
        title: pitch.working_title,
        subtitle: pitch.brand_brief.tagline,
        detail: pitch.audience || "Sponsor discussion",
        note: `Purpose: introduce the proposal and its bounded ask. Classification: ${sensitivity}. Project model version ${project.version}.`
      },
      {
        layout: "friction-statement",
        section: "THE OPPORTUNITY",
        title: "What is difficult today?",
        message: pitch.problem_statement,
        support: currentSteps.join(" ") || "Current workflow details still need discovery.",
        classification: pitch.problem_statement ? "USER ASSERTION · CONFIRM WITH USERS" : "UNKNOWN · NEEDS DISCOVERY",
        note: `Problem statement: ${pitch.problem_statement}\nCurrent state: ${currentSteps.join("; ") || "Not specified."}\nSource context: ${sourceNote}`
      },
      {
        layout: "current-future-workflow",
        section: "THE PROPOSED CHANGE",
        title: "Test a clearer path",
        current: currentSteps.join(" ") || "Current workflow to confirm.",
        future: futureSteps.join(" ") || "Future state to define.",
        users: (pitch.target_users || []).join(", ") || "Users to identify.",
        note: `Target users: ${(pitch.target_users || []).join(", ") || "To be identified."}\nFuture state is proposed, not an established capability.`
      },
      {
        layout: "evidence-value",
        section: evidence.length ? "VALUE TO TEST · EVIDENCE REVIEWED" : "VALUE TO TEST · EVIDENCE GAP",
        title: "What could improve?",
        message: pitch.value_proposition,
        benefit: (pitch.benefits || []).map((item) => `${item.classification.toUpperCase()}: ${item.statement}`).join(" ") || "Potential benefits are not established.",
        evidence: sourceNote,
        note: `Value proposition: ${pitch.value_proposition}\nBenefits: ${(pitch.benefits || []).map((item) => `${item.classification}: ${item.statement}`).join("; ")}\nEvidence: ${sourceNote}`
      },
      {
        layout: "pilot-measurement",
        section: "A BOUNDED NEXT STEP",
        title: "Start small. Learn deliberately.",
        pilot: pitch.pilot_definition,
        measures: measures.map((item) => `${item.measure} — ${item.basis}`).join("\n") || "Agree a measurable outcome with the sponsor.",
        note: `Pilot boundary: ${pitch.pilot_definition}\nMeasures: ${measures.map((item) => `${item.measure}; ${item.unit}; ${item.basis}`).join(" | ") || "To define."}`
      },
      {
        layout: "risks-and-unknowns",
        section: "WHAT MUST BE CONFIRMED",
        title: "Keep uncertainty visible",
        risks: risks.map((item) => item.statement),
        unknowns: nextQuestions,
        note: `Risks: ${risks.map((item) => `${item.statement} Mitigation: ${item.mitigation}`).join(" | ") || "No risks recorded."}\nOpen questions: ${(pitch.unknowns || []).join(" | ") || "None recorded."}`
      },
      {
        layout: "decision-ink",
        section: "THE DISCUSSION",
        title: "The decision to explore",
        ask: pitch.recommended_next_step,
        recommendation: pitch.recommended_option,
        note: `Recommended next step: ${pitch.recommended_next_step}\nRecommended option: ${pitch.recommended_option}\nLeave space for sponsor comments or live annotation. This is not approval to execute or fund the project.`
      }
    ];
  }

  function addHeaderFooter(shapes, slideNumber, total, project, classification) {
    shapes.push(shape(2, "Bayer brand label", 0.78, 0.38, 1.25, 0.26, "BAYER", { size: 1100, color: COLORS.navy, bold: true, wrap: 10 }));
    shapes.push(shape(3, "Brand accent", 0.78, 0.72, 0.48, 0.035, null, { fill: COLORS.cyan }));
    shapes.push(shape(4, "Top hairline", 1.3, 0.72, 11.25, 0.012, null, { fill: COLORS.rule }));
    shapes.push(shape(5, "Footer separator", 0.78, 6.98, 11.78, 0.012, null, { fill: COLORS.rule }));
    shapes.push(shape(6, "Classification footer", 0.78, 7.05, 4.3, 0.22, `${classification} · PROJECT PITCH DRAFT`, { size: 800, color: COLORS.muted, wrap: 62 }));
    shapes.push(shape(7, "Project version footer", 5.2, 7.05, 5.5, 0.22, `${project.pitch.working_title} · v${project.version} · NOT AN APPROVAL`, { size: 800, color: COLORS.muted, wrap: 75, align: "ctr" }));
    shapes.push(shape(8, "Slide number footer", 11.8, 7.05, 0.76, 0.22, `${slideNumber} / ${total}`, { size: 800, color: COLORS.muted, wrap: 14, align: "r" }));
  }

  function buildSlide(scene, slideNumber, total, project) {
    const classification = String(project.intake?.sensitivity || "unspecified").toUpperCase();
    const shapes = [];
    addHeaderFooter(shapes, slideNumber, total, project, classification);
    shapes.push(shape(9, "Section label", 0.78, 1.02, 11.7, 0.28, scene.section, { size: 1000, color: COLORS.cyan, bold: true, wrap: 80 }));
    const titleSize = scene.layout === "title-metaphor" ? 3400 : 2800;
    shapes.push(shape(10, "Slide title", 0.78, 1.35, 11.7, 0.78, scene.title, { size: titleSize, color: COLORS.navy, bold: true, wrap: 52 }));

    if (scene.layout === "title-metaphor") {
      shapes.push(shape(11, "Project promise", 0.84, 2.38, 6.25, 1.5, scene.subtitle, { size: 2500, color: COLORS.ink, bold: true, wrap: 39 }));
      shapes.push(shape(12, "Audience", 0.84, 4.18, 5.8, 0.65, scene.detail, { size: 1500, color: COLORS.muted, wrap: 52 }));
      shapes.push(shape(13, "Proposed path connector", 8.0, 3.47, 3.55, 0.08, null, { fill: COLORS.cyan }));
      shapes.push(shape(14, "Path start", 7.78, 3.21, 0.58, 0.58, null, { fill: COLORS.navy, geometry: "ellipse" }));
      shapes.push(shape(15, "Path checkpoint", 9.35, 3.21, 0.58, 0.58, null, { fill: COLORS.lime, geometry: "ellipse" }));
      shapes.push(shape(16, "Path destination", 11.2, 3.21, 0.58, 0.58, null, { fill: COLORS.magenta, geometry: "ellipse" }));
      shapes.push(shape(17, "Draft boundary", 0.84, 5.45, 6.8, 0.62, "A proposal for discussion — no project authorization implied.", { size: 1300, color: COLORS.muted, wrap: 65 }));
    } else if (scene.layout === "friction-statement") {
      shapes.push(shape(11, "Problem statement frame", 0.78, 2.36, 0.12, 3.48, null, { fill: COLORS.cyan }));
      shapes.push(shape(12, "Problem statement", 1.12, 2.36, 10.95, 2.55, scene.message, { size: 2300, color: COLORS.ink, bold: true, wrap: 72 }));
      shapes.push(shape(13, "Current friction context", 1.12, 5.12, 10.6, 0.75, `${scene.classification}  ·  ${scene.support}`, { size: 1300, color: COLORS.muted, wrap: 126 }));
    } else if (scene.layout === "current-future-workflow") {
      shapes.push(shape(11, "Current state card", 0.9, 2.52, 5.15, 2.6, null, { fill: COLORS.surface, line: COLORS.rule }));
      shapes.push(shape(12, "Current state label", 1.18, 2.8, 4.6, 0.32, "TODAY · TO CONFIRM", { size: 1100, color: COLORS.muted, bold: true, wrap: 44 }));
      shapes.push(shape(13, "Current state text", 1.18, 3.32, 4.55, 1.45, scene.current, { size: 1700, color: COLORS.ink, wrap: 57 }));
      shapes.push(shape(14, "Future state card", 7.2, 2.52, 5.15, 2.6, null, { fill: "E8F7FC", line: "C5E8F3" }));
      shapes.push(shape(15, "Future state label", 7.48, 2.8, 4.6, 0.32, "PROPOSED · TO TEST", { size: 1100, color: COLORS.navy, bold: true, wrap: 44 }));
      shapes.push(shape(16, "Future state text", 7.48, 3.32, 4.55, 1.45, scene.future, { size: 1700, color: COLORS.ink, wrap: 57 }));
      shapes.push(shape(17, "Transition arrow shaft", 6.16, 3.76, 0.74, 0.055, null, { fill: COLORS.cyan }));
      shapes.push(shape(18, "Transition arrow head", 6.76, 3.63, 0.25, 0.3, null, { fill: COLORS.cyan, geometry: "rtTriangle" }));
      shapes.push(shape(19, "Target users", 0.92, 5.55, 11.1, 0.65, `PEOPLE IN THE FLOW  ·  ${scene.users}`, { size: 1250, color: COLORS.muted, wrap: 108 }));
    } else if (scene.layout === "evidence-value") {
      shapes.push(shape(11, "Value proposition", 0.9, 2.38, 7.1, 2.15, scene.message, { size: 2300, color: COLORS.ink, bold: true, wrap: 73 }));
      shapes.push(shape(12, "Value classification", 0.92, 4.78, 6.95, 0.8, scene.benefit, { size: 1400, color: COLORS.navy, wrap: 92 }));
      shapes.push(shape(13, "Evidence card", 8.35, 2.54, 3.7, 3.0, null, { fill: COLORS.surface, line: COLORS.rule }));
      shapes.push(shape(14, "Evidence label", 8.65, 2.85, 3.0, 0.34, "SOURCE STATUS", { size: 1100, color: COLORS.cyan, bold: true, wrap: 32 }));
      shapes.push(shape(15, "Evidence sources", 8.65, 3.35, 3.0, 1.84, scene.evidence, { size: 1200, color: COLORS.ink, wrap: 37 }));
      shapes.push(shape(16, "Value caveat", 0.92, 5.88, 11.0, 0.62, "Potential value is a hypothesis unless directly supported and reviewed.", { size: 1200, color: COLORS.muted, wrap: 100 }));
    } else if (scene.layout === "pilot-measurement") {
      shapes.push(shape(11, "Pilot boundary card", 0.9, 2.48, 5.15, 3.5, null, { fill: COLORS.surface, line: COLORS.rule }));
      shapes.push(shape(12, "Pilot label", 1.2, 2.79, 4.4, 0.34, "BOUNDED PILOT", { size: 1100, color: COLORS.cyan, bold: true, wrap: 44 }));
      shapes.push(shape(13, "Pilot definition", 1.2, 3.3, 4.45, 2.2, scene.pilot, { size: 1700, color: COLORS.ink, wrap: 56 }));
      shapes.push(shape(14, "Measure accent", 6.72, 2.65, 0.09, 3.14, null, { fill: COLORS.lime }));
      shapes.push(shape(15, "Measures label", 7.08, 2.79, 4.7, 0.34, "WHAT TO LEARN", { size: 1100, color: COLORS.navy, bold: true, wrap: 48 }));
      shapes.push(shape(16, "Success measures", 7.08, 3.3, 4.65, 2.3, scene.measures, { size: 1550, color: COLORS.ink, wrap: 57 }));
      shapes.push(shape(17, "No commitment notice", 0.92, 6.15, 11.1, 0.4, "Confirm access, controls, reviewers, and acceptance criteria before execution.", { size: 1150, color: COLORS.muted, wrap: 106 }));
    } else if (scene.layout === "risks-and-unknowns") {
      shapes.push(shape(11, "Risk column", 0.9, 2.5, 5.15, 3.62, null, { fill: COLORS.surface, line: COLORS.rule }));
      shapes.push(shape(12, "Risks label", 1.18, 2.8, 4.6, 0.34, "RISKS TO REVIEW", { size: 1050, color: COLORS.magenta, bold: true, wrap: 46 }));
      shapes.push(shape(13, "Risk statements", 1.18, 3.3, 4.45, 2.45, scene.risks.join("\n") || "No risks recorded.", { size: 1400, color: COLORS.ink, wrap: 55 }));
      shapes.push(shape(14, "Unknowns column", 7.2, 2.5, 5.15, 3.62, null, { fill: "E8F7FC", line: "C5E8F3" }));
      shapes.push(shape(15, "Unknowns label", 7.5, 2.8, 4.6, 0.34, "QUESTIONS TO ANSWER", { size: 1050, color: COLORS.navy, bold: true, wrap: 48 }));
      shapes.push(shape(16, "Unknown questions", 7.5, 3.3, 4.45, 2.45, scene.unknowns.join("\n") || "No open questions recorded.", { size: 1400, color: COLORS.ink, wrap: 55 }));
      shapes.push(shape(17, "Governance note", 0.92, 6.3, 11.1, 0.4, "Identify quality, security, privacy, and data-governance reviewers; no compliance determination is made.", { size: 1050, color: COLORS.muted, wrap: 115 }));
    } else {
      shapes.push(shape(11, "Decision statement", 0.92, 2.5, 7.1, 2.65, scene.ask, { size: 2300, color: COLORS.ink, bold: true, wrap: 73 }));
      shapes.push(shape(12, "Recommended option label", 0.94, 5.32, 1.72, 0.32, "RECOMMENDATION", { size: 950, color: COLORS.cyan, bold: true, wrap: 18 }));
      shapes.push(shape(13, "Recommended option", 2.72, 5.27, 5.25, 0.75, scene.recommendation, { size: 1300, color: COLORS.muted, wrap: 66 }));
      shapes.push(shape(14, "Discussion panel", 8.58, 2.55, 3.48, 3.38, null, { fill: COLORS.surface, line: COLORS.rule }));
      shapes.push(shape(15, "Discussion heading", 8.85, 2.87, 2.95, 0.35, "DISCUSS / ANNOTATE", { size: 1000, color: COLORS.navy, bold: true, wrap: 30 }));
      for (let index = 0; index < 4; index += 1) {
        shapes.push(shape(16 + index, `Annotation line ${index + 1}`, 8.88, 3.53 + index * 0.48, 2.8, 0.012, null, { fill: COLORS.rule }));
      }
    }
    return { xml: slideXml(shapes), notes: scene.note, layout: scene.layout, title: scene.title };
  }

  function contentTypes(slideCount) {
    const slides = Array.from({ length: slideCount }, (_item, index) =>
      `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/notesSlides/notesSlide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`
    ).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>${slides}</Types>`;
  }

  function themeXml() {
    const scheme = `<a:clrScheme name="Bayer Reference"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="${COLORS.pink}"/></a:dk2><a:lt2><a:srgbClr val="${COLORS.purple}"/></a:lt2><a:accent1><a:srgbClr val="${COLORS.navy}"/></a:accent1><a:accent2><a:srgbClr val="${COLORS.cyan}"/></a:accent2><a:accent3><a:srgbClr val="${COLORS.green}"/></a:accent3><a:accent4><a:srgbClr val="${COLORS.lime}"/></a:accent4><a:accent5><a:srgbClr val="${COLORS.purple}"/></a:accent5><a:accent6><a:srgbClr val="${COLORS.magenta}"/></a:accent6><a:hlink><a:srgbClr val="${COLORS.cyan}"/></a:hlink><a:folHlink><a:srgbClr val="${COLORS.lime}"/></a:folHlink></a:clrScheme>`;
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Bayer Reference"><a:themeElements>${scheme}<a:fontScheme name="Arial"><a:majorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Pitch Studio"><a:fillStyleLst><a:solidFill><a:schemeClr val="accent1"/></a:solidFill><a:solidFill><a:schemeClr val="accent2"/></a:solidFill><a:solidFill><a:schemeClr val="accent3"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="accent2"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="accent3"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="lt1"/></a:solidFill><a:solidFill><a:schemeClr val="lt2"/></a:solidFill><a:solidFill><a:schemeClr val="dk1"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;
  }

  function buildPackage(pitch, project) {
    const stories = presentationScenarios(pitch, project);
    const slides = stories.map((story, index) => buildSlide(story, index + 1, stories.length, project));
    const bodyTextLevels = Array.from({ length: 9 }, (_item, index) =>
      `<a:lvl${index + 1}pPr><a:defRPr lang="en-US" sz="${Math.max(1000, 1800 - index * 100)}"/></a:lvl${index + 1}pPr>`
    ).join("");
    const masterTextStyles = `<p:txStyles><p:titleStyle><a:lvl1pPr><a:defRPr lang="en-US" sz="3400"/></a:lvl1pPr></p:titleStyle><p:bodyStyle>${bodyTextLevels}</p:bodyStyle><p:otherStyle><a:defPPr><a:defRPr lang="en-US" sz="1800"/></a:defPPr>${bodyTextLevels}</p:otherStyle></p:txStyles>`;
    const files = {
      "[Content_Types].xml": contentTypes(slides.length),
      "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationship("rId1", "officeDocument", "ppt/presentation.xml")}${relationship("rId2", "core-properties", "docProps/core.xml")}${relationship("rId3", "extended-properties", "docProps/app.xml")}</Relationships>`,
      "docProps/core.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(pitch.working_title)}</dc:title><dc:subject>Approved project pitch draft v${esc(project.version)}</dc:subject><dc:creator>Digital Project Pitch Studio</dc:creator><cp:keywords>Proposal, draft, ${esc(project.intake?.sensitivity || "unspecified")}</cp:keywords><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created></cp:coreProperties>`,
      "docProps/app.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Digital Project Pitch Studio</Application><PresentationFormat>On-screen Show (16:9)</PresentationFormat><Slides>${slides.length}</Slides><Notes>${slides.length}</Notes></Properties>`,
      "ppt/presentation.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:notesMasterIdLst><p:notesMasterId r:id="rId2"/></p:notesMasterIdLst><p:sldIdLst>${slides.map((_slide, index) => `<p:sldId id="${256 + index}" r:id="rId${index + 3}"/>`).join("")}</p:sldIdLst><p:sldSz cx="${WIDTH}" cy="${HEIGHT}" type="screen16x9"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle><a:defPPr><a:defRPr lang="en-US"/></a:defPPr><a:lvl1pPr><a:defRPr lang="en-US"/></a:lvl1pPr><a:lvl2pPr><a:defRPr lang="en-US"/></a:lvl2pPr><a:lvl3pPr><a:defRPr lang="en-US"/></a:lvl3pPr><a:lvl4pPr><a:defRPr lang="en-US"/></a:lvl4pPr><a:lvl5pPr><a:defRPr lang="en-US"/></a:lvl5pPr><a:lvl6pPr><a:defRPr lang="en-US"/></a:lvl6pPr><a:lvl7pPr><a:defRPr lang="en-US"/></a:lvl7pPr><a:lvl8pPr><a:defRPr lang="en-US"/></a:lvl8pPr><a:lvl9pPr><a:defRPr lang="en-US"/></a:lvl9pPr></p:defaultTextStyle></p:presentation>`,
      "ppt/_rels/presentation.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationship("rId1", "slideMaster", "slideMasters/slideMaster1.xml")}${relationship("rId2", "notesMaster", "notesMasters/notesMaster1.xml")}${slides.map((_slide, index) => relationship(`rId${index + 3}`, "slide", `slides/slide${index + 1}.xml`)).join("")}</Relationships>`,
      "ppt/slideMasters/slideMaster1.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>${groupStart()}</p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>${masterTextStyles}</p:sldMaster>`,
      "ppt/slideMasters/_rels/slideMaster1.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationship("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml")}${relationship("rId2", "theme", "../theme/theme1.xml")}</Relationships>`,
      "ppt/slideLayouts/slideLayout1.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Pitch Studio layout"><p:spTree>${groupStart()}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`,
      "ppt/slideLayouts/_rels/slideLayout1.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationship("rId1", "slideMaster", "../slideMasters/slideMaster1.xml")}</Relationships>`,
      "ppt/notesMasters/notesMaster1.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:notesMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>${groupStart()}</p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:notesStyle><a:lvl1pPr marL="0" indent="0"><a:defRPr sz="1200"/></a:lvl1pPr></p:notesStyle></p:notesMaster>`,
      "ppt/notesMasters/_rels/notesMaster1.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationship("rId1", "theme", "../theme/theme1.xml")}</Relationships>`,
      "ppt/theme/theme1.xml": themeXml()
    };
    slides.forEach((slide, index) => {
      const number = index + 1;
      files[`ppt/slides/slide${number}.xml`] = slide.xml;
      files[`ppt/slides/_rels/slide${number}.xml.rels`] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationship("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml")}${relationship("rId2", "notesSlide", `../notesSlides/notesSlide${number}.xml`)}</Relationships>`;
      files[`ppt/notesSlides/notesSlide${number}.xml`] = notesXml(`Speaker notes\n${slide.title}\n${slide.notes}\nSources: ${pitch.evidence_ledger.filter((item) => item.review_status === "accepted").map((item) => `${item.source_title} (${item.source_reference || "reference not supplied"}; retrieved ${item.retrieved_at})`).join("; ") || "No user-accepted sources supplied."}\nClassification: ${project.intake?.sensitivity || "unspecified"}\nModel version: ${project.version}\nDraft only. This proposal is not project approval, funding, compliance, validation, or production authorization.`);
      files[`ppt/notesSlides/_rels/notesSlide${number}.xml.rels`] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationship("rId1", "slide", `../slides/slide${number}.xml`)}${relationship("rId2", "notesMaster", "../notesMasters/notesMaster1.xml")}</Relationships>`;
    });
    const text = stories.map((scene) => [
      scene.title,
      scene.subtitle,
      scene.message,
      scene.current,
      scene.future,
      scene.benefit,
      scene.evidence,
      scene.pilot,
      scene.measures,
      ...(scene.risks || []),
      ...(scene.unknowns || []),
      scene.ask,
      scene.recommendation
    ].filter(Boolean).join("\n")).join("\n");
    return { files, slides, text, version: project.version, title: pitch.working_title };
  }

  window.PitchPresentation = {
    profile: PROFILE,
    generate(pitch, project, zipStore) {
      if (project.approval?.status !== "approved" || project.approval.approved_version !== project.version) {
        throw new Error("PowerPoint generation requires approval of the current canonical model version.");
      }
      const pkg = buildPackage(pitch, project);
      return zipStore(pkg.files, true).arrayBuffer().then((buffer) => ({
        content: new Uint8Array(buffer),
        mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        title: pkg.title,
        version: pkg.version,
        slideTitles: pkg.slides.map((slide) => slide.title),
        slideCount: pkg.slides.length,
        editableShapeCount: pkg.slides.reduce((total, slide) => total + (slide.xml.match(/<p:sp>/g) || []).length, 0),
        auditText: pkg.text,
        hasSpeakerNotes: pkg.slides.length === Object.keys(pkg.files).filter((name) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name)).length,
        profile: PROFILE
      }));
    }
  };
})();
