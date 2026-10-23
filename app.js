"use strict";

(() => {
  const STORAGE_KEY = "pitch-studio-project-v1";
  const MAX_FILE_BYTES = 1_000_000;
  const GUIDED_QUESTIONS = [
    ["problem-statement", "What is difficult, slow, risky, or uncertain in the current workflow?"],
    ["target-users", "Who encounters this problem or would use the proposed change?"],
    ["systems", "Which systems, instruments, or data sources might be involved?"],
    ["constraints", "What must the team confirm before a small pilot can proceed?"]
  ];
  const state = {
    project: null,
    stage: "intake",
    intakeMode: "quick",
    pendingFileName: "",
    assets: null,
    activeAsset: "",
    toastTimer: 0
  };
  const byId = (id) => document.getElementById(id);
  const getFormValue = (id) => byId(id).value.trim();
  const setFormValue = (id, value) => { byId(id).value = value || ""; };
  const splitList = (value) => value.split(/\r?\n|,|;/).map((item) => item.trim()).filter(Boolean);
  const isoNow = () => new Date().toISOString();

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const escapeMarkdown = (value) => String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/([\\`*_{}\[\]()#+!|~])/g, "\\$1")
    .replace(/\r\n?|\n/g, "<br>");
  const safeFileName = (value) => String(value || "pitch-project")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "pitch-project";
  const uid = () => `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  function createEmptyProject() {
    return {
      project_id: `pitch-${Date.now().toString(36)}`,
      version: "0.1",
      created_at: isoNow(),
      updated_at: isoNow(),
      intake: {
        working_title: "",
        idea_summary: "",
        problem_statement: "",
        current_state: "",
        target_users: "",
        systems: "",
        sponsor: "",
        audience: "",
        constraints: "",
        sensitivity: "unspecified",
        tone: ""
      },
      pitch: null,
      evidence: [],
      approval: { status: "pending", approved_at: null, approved_version: null },
      change_log: [{ at: isoNow(), event: "project_created" }]
    };
  }

  const demoProject = () => {
    const project = createEmptyProject();
    project.project_id = "qc1-connected-instrument-pilot";
    project.intake = {
      working_title: "QC1 Connected Instrument Pilot",
      idea_summary: "Explore connecting one laboratory instrument to the electronic recording environment to test an end-to-end data path for a QC1 characterization workflow.",
      problem_statement: "Instrument results may require manual saving, moving, scanning, transcription, or review. Which steps occur in the target workflow and what controls apply still need confirmation.",
      current_state: "A characterization workflow may involve instrument output and manual handling before electronic recording or QC1 review; the specific steps have not yet been confirmed.",
      target_users: "Laboratory scientists and quality-control reviewers",
      systems: "One balance or pH meter; electronic recording environment (specific products and interfaces unknown)",
      sponsor: "",
      audience: "Laboratory operations and digital project sponsors",
      constraints: "Confirm instrument interface, data path, quality requirements, access, and validation expectations before pilot selection.",
      sensitivity: "unspecified",
      tone: "Clear, measured, evidence-led"
    };
    project.pitch = {
      working_title: project.intake.working_title,
      sponsor: project.intake.sponsor,
      audience: "Laboratory operations and digital project sponsors",
      data_classification: project.intake.sensitivity,
      constraints: splitList(project.intake.constraints),
      tagline: "Test one instrument. Trace one data path.",
      idea_summary: project.intake.idea_summary,
      problem_statement: project.intake.problem_statement,
      current_state: {
        actors: ["Laboratory scientist", "QC1 reviewer"],
        steps: ["Instrument result is produced", "Manual handling may occur before electronic recording or review"],
        systems: ["One laboratory instrument (specific model unknown)", "Electronic recording environment (unspecified)"],
        pain_points: ["Manual handling may occur; the target workflow and extent require confirmation"],
        evidence_ids: []
      },
      future_state: {
        actors: ["Laboratory scientist", "QC1 reviewer"],
        steps: ["Capture one instrument result", "Trace the result through one controlled end-to-end data path", "Review the resulting workflow with relevant stakeholders"],
        systems: ["One selected instrument", "Electronic recording environment (integration not established)"],
        changes: ["Evaluate a bounded connection rather than assume an integration exists"],
        evidence_ids: []
      },
      target_users: ["Laboratory scientists", "QC1 reviewers"],
      sponsor: project.intake.sponsor,
      audience: "Laboratory operations and digital project sponsors",
      stakeholders: ["Laboratory operations", "Quality", "IT and data governance", "Potential project sponsor"],
      value_proposition: "A small, instrument-specific pilot could help stakeholders assess a proposed electronic data path before making a broader commitment.",
      benefits: [{
        statement: "The pilot could provide evidence about workflow fit, data traceability, and review needs.",
        classification: "hypothesis",
        evidence_ids: [],
        confidence: "To be tested"
      }],
      success_measures: [
        { measure: "End-to-end data path can be demonstrated for the selected workflow", unit: "observed outcome", basis: "Proposed pilot criterion; threshold to be agreed", classification: "recommendation" },
        { measure: "Relevant quality, security, and data-governance questions are documented", unit: "review record", basis: "Proposed pilot criterion; owners to be agreed", classification: "recommendation" }
      ],
      scope: {
        in_scope: ["Select one instrument", "Select one QC1 characterization workflow", "Test one end-to-end data path"],
        out_of_scope: ["Assuming an existing integration", "Selecting a product or vendor", "Claiming validated or production-ready status", "Estimating savings or committing funding"]
      },
      dependencies: ["Instrument interface and access need assessment", "Electronic-recording environment capabilities need confirmation", "Quality, security, privacy, and data-governance review needs identification"],
      risks: [
        { statement: "The required instrument interface or data path may not be available", classification: "unknown", mitigation: "Confirm interface and access with system owners before pilot commitment" },
        { statement: "Quality, validation, security, or data-integrity expectations may change pilot scope", classification: "unknown", mitigation: "Identify appropriate reviewers and applicable requirements before testing" }
      ],
      assumptions: ["A candidate instrument and workflow can be selected for discovery; availability is not confirmed."],
      unknowns: [
        "Which instrument, model, and workflow should be selected?",
        "Which electronic recording environment and interface are in scope?",
        "What quality, validation, security, and data-integrity requirements apply?",
        "Who is the sponsor and who can authorize a pilot?",
        "What baseline and thresholds would make the pilot useful?"
      ],
      options: [
        { name: "Continue discovery", description: "Confirm workflow, owners, interfaces, requirements, and a measurable pilot boundary.", classification: "recommendation" },
        { name: "Defer the concept", description: "Pause until a sponsor, workflow, and technical path can be confirmed.", classification: "option" }
      ],
      recommended_option: "Continue discovery before any pilot commitment.",
      recommended_next_step: "Run a short discovery with laboratory, quality, IT, and data-governance stakeholders to select one instrument and workflow, verify interface options, and agree pilot acceptance criteria.",
      pilot_definition: "If discovery supports it, propose a bounded pilot using one instrument, one QC1 characterization workflow, and one end-to-end data path. Confirm authorization, quality requirements, access, and success criteria before execution.",
      evidence_ledger: [],
      brand_brief: {
        project_name: project.intake.working_title,
        tagline: "Test one instrument. Trace one data path.",
        tone: "Clear, measured, evidence-led",
        palette: { primary: "#176B54", ink: "#1E2A27", paper: "#FFFEFA", accent: "#C9A766" },
        typography: "System sans-serif; strong readable headings; no corporate marks",
        logo_rationale: "A simple, independent path-and-point motif suggests a traceable data journey without implying an approved product or corporate affiliation.",
        accessibility: "Use high-contrast text, labels in addition to color, and a recognizable silhouette at small sizes."
      },
      approval_status: { status: "pending", approved_at: null, approved_version: null },
      change_log: []
    };
    project.change_log.push({ at: isoNow(), event: "qc1_demo_loaded" });
    return project;
  };

  function persist() {
    if (!state.project) return;
    state.project.updated_at = isoNow();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
    } catch (error) {
      showToast(`Could not save locally: ${error.message}`);
    }
  }

  function loadProject() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return createEmptyProject();
      const parsed = JSON.parse(stored);
      if (!validateProject(parsed)) throw new Error("Stored project does not match the expected schema.");
      return parsed;
    } catch (error) {
      showToast(`Saved project could not be loaded: ${error.message}`);
      return createEmptyProject();
    }
  }

  function validateProject(project) {
    return Boolean(project && typeof project === "object"
      && typeof project.project_id === "string"
      && typeof project.version === "string"
      && project.intake && typeof project.intake.working_title === "string"
      && Array.isArray(project.evidence)
      && project.approval && typeof project.approval.status === "string"
      && (project.pitch === null || (project.pitch && Array.isArray(project.pitch.benefits)
        && Array.isArray(project.pitch.unknowns) && project.pitch.brand_brief)));
  }

  function canonicalRecord() {
    const pitch = state.project.pitch;
    return {
      project_id: state.project.project_id,
      version: state.project.version,
      working_title: pitch.working_title,
      sponsor: pitch.sponsor || "",
      audience: pitch.audience || "",
      data_classification: state.project.intake.sensitivity || "unspecified",
      constraints: splitList(state.project.intake.constraints || ""),
      tagline: pitch.brand_brief.tagline,
      idea_summary: pitch.idea_summary,
      problem_statement: pitch.problem_statement,
      current_state: pitch.current_state,
      future_state: pitch.future_state,
      target_users: pitch.target_users,
      stakeholders: pitch.stakeholders,
      value_proposition: pitch.value_proposition,
      benefits: pitch.benefits,
      success_measures: pitch.success_measures,
      scope: pitch.scope,
      dependencies: pitch.dependencies,
      risks: pitch.risks,
      assumptions: pitch.assumptions,
      unknowns: pitch.unknowns,
      options: pitch.options,
      recommended_option: pitch.recommended_option,
      recommended_next_step: pitch.recommended_next_step,
      pilot_definition: pitch.pilot_definition,
      evidence_ledger: pitch.evidence_ledger,
      brand_brief: pitch.brand_brief,
      approval_status: state.project.approval,
      change_log: pitch.change_log.slice()
    };
  }

  function validateCanonicalRecord(record) {
    const required = [
      "project_id", "version", "working_title", "sponsor", "audience", "data_classification", "constraints",
      "tagline", "idea_summary", "problem_statement",
      "current_state", "future_state", "target_users", "stakeholders", "value_proposition",
      "benefits", "success_measures", "scope", "dependencies", "risks", "assumptions", "unknowns",
      "options", "recommended_option", "recommended_next_step", "pilot_definition", "evidence_ledger",
      "brand_brief", "approval_status", "change_log"
    ];
    const object = (value, label) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
    };
    const text = (value, label) => {
      if (typeof value !== "string") throw new Error(`${label} must be a string.`);
    };
    const strings = (value, label) => {
      if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
      value.forEach((item, index) => text(item, `${label}[${index}]`));
    };
    const enumValue = (value, allowed, label) => {
      if (!allowed.includes(value)) throw new Error(`${label} has an unsupported classification.`);
    };
    object(record, "Canonical pitch");
    for (const key of required) if (!Object.hasOwn(record, key)) throw new Error(`Canonical pitch is missing ${key}.`);
    for (const key of Object.keys(record)) if (!required.includes(key)) throw new Error(`Canonical pitch has unexpected field ${key}.`);
    for (const key of ["project_id", "version", "working_title", "sponsor", "audience", "tagline", "idea_summary", "problem_statement", "value_proposition", "recommended_option", "recommended_next_step", "pilot_definition"]) {
      text(record[key], key);
    }
    enumValue(record.data_classification, ["unspecified", "public", "internal", "confidential", "restricted"], "data_classification");
    strings(record.constraints, "constraints");
    if (!record.working_title.trim() || !record.idea_summary.trim() || !/^\d+\.\d+$/.test(record.version)) throw new Error("Canonical pitch requires a title, idea, and numeric major.minor version.");
    object(record.current_state, "current_state");
    for (const key of ["actors", "steps", "systems", "pain_points", "evidence_ids"]) strings(record.current_state[key], `current_state.${key}`);
    object(record.future_state, "future_state");
    for (const key of ["actors", "steps", "systems", "changes", "evidence_ids"]) strings(record.future_state[key], `future_state.${key}`);
    for (const key of ["target_users", "stakeholders", "dependencies", "assumptions", "unknowns"]) strings(record[key], key);
    if (!Array.isArray(record.benefits) || !Array.isArray(record.success_measures) || !Array.isArray(record.risks) || !Array.isArray(record.options) || !Array.isArray(record.evidence_ledger) || !Array.isArray(record.change_log)) {
      throw new Error("Benefits, measures, risks, options, evidence, and change log must be arrays.");
    }
    record.benefits.forEach((item, index) => {
      object(item, `benefits[${index}]`);
      text(item.statement, `benefits[${index}].statement`);
      text(item.confidence, `benefits[${index}].confidence`);
      strings(item.evidence_ids, `benefits[${index}].evidence_ids`);
      enumValue(item.classification, ["fact", "assertion", "assumption", "estimate", "hypothesis"], `benefits[${index}].classification`);
    });
    record.success_measures.forEach((item, index) => {
      object(item, `success_measures[${index}]`);
      for (const key of ["measure", "unit", "basis"]) text(item[key], `success_measures[${index}].${key}`);
      enumValue(item.classification, ["fact", "assertion", "assumption", "estimate", "hypothesis", "recommendation"], `success_measures[${index}].classification`);
    });
    object(record.scope, "scope");
    strings(record.scope.in_scope, "scope.in_scope");
    strings(record.scope.out_of_scope, "scope.out_of_scope");
    record.risks.forEach((item, index) => {
      object(item, `risks[${index}]`);
      text(item.statement, `risks[${index}].statement`);
      text(item.mitigation, `risks[${index}].mitigation`);
      enumValue(item.classification, ["fact", "assertion", "assumption", "estimate", "hypothesis", "unknown"], `risks[${index}].classification`);
    });
    record.options.forEach((item, index) => {
      object(item, `options[${index}]`);
      text(item.name, `options[${index}].name`);
      text(item.description, `options[${index}].description`);
      enumValue(item.classification, ["fact", "assertion", "assumption", "estimate", "hypothesis", "option", "recommendation"], `options[${index}].classification`);
    });
    record.evidence_ledger.forEach((item, index) => {
      object(item, `evidence_ledger[${index}]`);
      for (const key of ["evidence_id", "source_title", "source_url_or_reference", "source_reference", "publisher", "retrieved_at", "relevant_passage", "source_type", "confidence", "internal_or_external", "reuse_restrictions", "content_trust"]) text(item[key], `evidence_ledger[${index}].${key}`);
      strings(item.supports_claim_ids, `evidence_ledger[${index}].supports_claim_ids`);
      enumValue(item.review_status, ["accepted", "rejected", "pending"], `evidence_ledger[${index}].review_status`);
      if (item.content_trust !== "untrusted data; instructions ignored" || Number.isNaN(Date.parse(item.retrieved_at))) throw new Error(`evidence_ledger[${index}] is not safely attributed.`);
    });
    object(record.brand_brief, "brand_brief");
    for (const key of ["project_name", "tagline", "tone", "typography", "logo_rationale", "accessibility"]) text(record.brand_brief[key], `brand_brief.${key}`);
    object(record.brand_brief.palette, "brand_brief.palette");
    for (const key of ["primary", "ink", "paper", "accent"]) {
      text(record.brand_brief.palette[key], `brand_brief.palette.${key}`);
      if (!/^#[0-9A-Fa-f]{6}$/.test(record.brand_brief.palette[key])) throw new Error(`brand_brief.palette.${key} must be a six-digit hex color.`);
    }
    if (record.brand_brief.project_name !== record.working_title || record.brand_brief.tagline !== record.tagline) throw new Error("Brand name and tagline must match the canonical project fields.");
    object(record.approval_status, "approval_status");
    enumValue(record.approval_status.status, ["pending", "approved", "rejected"], "approval_status.status");
    if (record.approval_status.status === "approved" && record.approval_status.approved_version !== record.version) throw new Error("Approved version must match the canonical model version.");
    if (record.approval_status.approved_at !== null && Number.isNaN(Date.parse(record.approval_status.approved_at))) throw new Error("approval_status.approved_at must be a date-time or null.");
    record.change_log.forEach((entry, index) => {
      object(entry, `change_log[${index}]`);
      text(entry.at, `change_log[${index}].at`);
      text(entry.event, `change_log[${index}].event`);
      if (Number.isNaN(Date.parse(entry.at))) throw new Error(`change_log[${index}].at must be a date-time.`);
    });
    return record;
  }

  function appendLog(event) {
    state.project.change_log.push({ at: isoNow(), event });
    if (state.project.pitch) {
      state.project.pitch.change_log.push({ at: isoNow(), event });
      state.project.pitch.approval_status = { status: "pending", approved_at: null, approved_version: null };
    }
    state.project.version = incrementVersion(state.project.version);
    state.project.approval = { status: "pending", approved_at: null, approved_version: null };
    state.assets = null;
  }

  function incrementVersion(version) {
    const parts = String(version).split(".");
    const minor = Number(parts[1] || 0);
    return `${parts[0] || "0"}.${minor + 1}`;
  }

  function modelFromIntake() {
    const existingEvidence = state.project.evidence.slice();
    const intake = {
      working_title: getFormValue("working-title"),
      idea_summary: getFormValue("idea-summary"),
      problem_statement: getFormValue("problem-statement"),
      current_state: getFormValue("current-state"),
      target_users: getFormValue("target-users"),
      systems: getFormValue("systems"),
      sponsor: getFormValue("sponsor"),
      audience: getFormValue("audience"),
      constraints: getFormValue("constraints"),
      sensitivity: byId("sensitivity").value,
      tone: getFormValue("tone")
    };
    if (!intake.working_title || !intake.idea_summary) {
      showToast("Add a working title and one-sentence idea to continue.");
      return null;
    }
    state.project = createEmptyProject();
    state.project.intake = intake;
    state.project.evidence = existingEvidence;
    const users = splitList(intake.target_users);
    const systems = splitList(intake.systems);
    const inputEvidenceIds = state.project.evidence.filter((item) => item.review_status === "accepted").map((item) => item.evidence_id);
    state.project.pitch = {
      working_title: intake.working_title,
      sponsor: intake.sponsor,
      audience: intake.audience,
      data_classification: intake.sensitivity,
      constraints: splitList(intake.constraints),
      tagline: "A clear idea. A testable next step.",
      idea_summary: intake.idea_summary,
      problem_statement: intake.problem_statement || "The problem and current workflow have not yet been described; confirm them with intended users.",
      current_state: {
        actors: users,
        steps: intake.current_state ? [intake.current_state] : [],
        systems,
        pain_points: intake.problem_statement ? [intake.problem_statement] : [],
        evidence_ids: []
      },
      future_state: {
        actors: users,
        steps: [intake.idea_summary],
        systems,
        changes: [],
        evidence_ids: []
      },
      target_users: users,
      stakeholders: [...users, ...(intake.sponsor ? [intake.sponsor] : [])],
      value_proposition: "Potential value has not been established. Validate the intended outcome with users and a sponsor.",
      benefits: [{
        statement: "The proposed change may address the stated opportunity; benefits and impact require validation.",
        classification: "hypothesis",
        evidence_ids: inputEvidenceIds,
        confidence: "Unvalidated"
      }],
      success_measures: [{ measure: "Outcome that would indicate the idea is useful", unit: "to define", basis: "User and sponsor input required", classification: "recommendation" }],
      scope: { in_scope: [intake.idea_summary], out_of_scope: ["Unverified implementation, cost, savings, compliance, or approval claims"] },
      dependencies: intake.constraints ? [intake.constraints] : ["Dependencies are unknown and need discovery."],
      risks: [{ statement: "Technical, operational, and governance feasibility are not established.", classification: "unknown", mitigation: "Identify reviewers and test assumptions during discovery." }],
      assumptions: [],
      unknowns: ["Which workflow and users are in scope?", "What evidence supports the current-state problem?", "What constraints and governance reviews apply?", "What measurable outcome would support a decision?"],
      options: [{ name: "Bounded discovery", description: "Confirm users, evidence, constraints, and a measurable pilot boundary.", classification: "recommendation" }],
      recommended_option: "Complete discovery before committing to implementation.",
      recommended_next_step: "Discuss the problem, evidence, constraints, and a measurable next step with the intended users and a potential sponsor.",
      pilot_definition: "Pilot scope is not established. First confirm a candidate user, workflow, authorized data path, and measurable acceptance criteria.",
      evidence_ledger: state.project.evidence.slice(),
      brand_brief: {
        project_name: intake.working_title,
        tagline: "A clear idea. A testable next step.",
        tone: intake.tone || "Clear, measured, evidence-led",
        palette: { primary: "#176B54", ink: "#1E2A27", paper: "#FFFEFA", accent: "#C9A766" },
        typography: "System sans-serif; readable headings; no corporate marks",
        logo_rationale: "An independent geometric mark signals a project in development, not an endorsed product.",
        accessibility: "Maintain high contrast and pair color with text labels and simple forms."
      },
      approval_status: { status: "pending", approved_at: null, approved_version: null },
      change_log: []
    };
    state.project.change_log.push({ at: isoNow(), event: "pitch_model_structured_from_user_intake" });
    persist();
    showStage("review");
    render();
    return state.project;
  }

  function currentProjectData() {
    const pitch = state.project.pitch;
    return {
      working_title: getFormValue("model-title"),
      problem_statement: getFormValue("model-problem"),
      current_state: getFormValue("model-current"),
      future_state: getFormValue("model-future"),
      value_proposition: getFormValue("model-value"),
      recommended_next_step: getFormValue("model-next-step"),
      pilot_definition: getFormValue("model-pilot"),
      success_measures: splitList(getFormValue("model-measures")).map((measure) => ({
        measure, unit: "to define", basis: "User and sponsor input required", classification: "recommendation"
      })),
      unknowns: splitList(getFormValue("model-unknowns")),
      audience: getFormValue("model-audience"),
      tagline: getFormValue("model-tagline"),
      current_state_original: pitch.current_state,
      future_state_original: pitch.future_state
    };
  }

  function applyReviewForm() {
    const pitch = state.project.pitch;
    const edits = currentProjectData();
    pitch.working_title = edits.working_title;
    pitch.problem_statement = edits.problem_statement;
    pitch.current_state.steps = edits.current_state ? [edits.current_state] : [];
    pitch.current_state.pain_points = edits.problem_statement ? [edits.problem_statement] : [];
    pitch.future_state.steps = edits.future_state ? [edits.future_state] : [];
    pitch.value_proposition = edits.value_proposition || "Value proposition is unknown and requires validation.";
    pitch.recommended_next_step = edits.recommended_next_step;
    pitch.pilot_definition = edits.pilot_definition;
    pitch.success_measures = edits.success_measures;
    pitch.unknowns = edits.unknowns;
    pitch.brand_brief.project_name = edits.working_title;
    pitch.brand_brief.tagline = edits.tagline;
    pitch.brand_brief.tone = state.project.intake.tone || "Clear, measured, evidence-led";
    pitch.audience = edits.audience;
  }

  function setStageStatus(stage, status) {
    const button = document.querySelector(`.step[data-stage="${stage}"]`);
    if (button) button.classList.toggle("complete", status);
  }

  function showStage(stage) {
    if (!["intake", "evidence", "review", "assets"].includes(stage)) return;
    if (stage === "assets" && state.project?.approval.status !== "approved") {
      showToast("Approve the canonical pitch model before generating assets.");
      stage = "review";
    }
    state.stage = stage;
    document.querySelectorAll(".stage-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `stage-${stage}`));
    document.querySelectorAll(".step").forEach((button) => button.classList.toggle("active", button.dataset.stage === stage));
    render();
  }

  function renderInspector() {
    const project = state.project;
    byId("inspector-title").textContent = project.pitch?.working_title || project.intake.working_title || "Untitled project";
    byId("inspector-summary").textContent = project.pitch?.idea_summary || project.intake.idea_summary || "Your approved facts and decisions will anchor every deliverable.";
    byId("inspector-version").textContent = `v${project.version}`;
    byId("inspector-evidence").textContent = String(project.evidence.length);
    byId("inspector-approval").textContent = project.approval.status === "approved" ? "Approved draft" : "Pending";
    byId("inspector-sensitivity").textContent = (project.intake.sensitivity || "unspecified").replace(/^\w/, (letter) => letter.toUpperCase());
    byId("version-label").textContent = `${project.approval.status === "approved" ? "Approved draft" : "Draft"} · v${project.version}`;
    byId("workflow-status").textContent = project.approval.status === "approved" ? "Pitch model approved" : (project.pitch ? "Review in progress" : "Idea not started");
    const approvalBadge = byId("approval-badge");
    approvalBadge.textContent = project.approval.status === "approved" ? `Approved · v${project.approval.approved_version}` : "Not approved";
    approvalBadge.classList.toggle("approved", project.approval.status === "approved");
    byId("approval-required").hidden = project.approval.status === "approved";
    byId("generate-assets").disabled = project.approval.status !== "approved";
    byId("generate-assets").title = project.approval.status === "approved" ? "" : "Approve the source model first";
    byId("export-bar").hidden = !state.assets;
    byId("asset-grid").innerHTML = state.assets ? renderAssetCards() : "";
    if (!state.assets) {
      byId("audit-result").hidden = true;
      byId("audit-result").textContent = "";
    }
    const evidenceCount = project.evidence.length;
    byId("evidence-count").textContent = `${evidenceCount} ${evidenceCount === 1 ? "item" : "items"}`;
    byId("inspector-title").title = project.intake.sensitivity === "confidential" || project.intake.sensitivity === "restricted"
      ? "Sensitive project data: local prototype only; avoid sharing or exporting."
      : "";
    setStageStatus("intake", Boolean(project.pitch));
    setStageStatus("evidence", evidenceCount > 0);
    setStageStatus("review", project.approval.status === "approved");
    setStageStatus("assets", Boolean(state.assets));
    renderEvidence();
    if (project.pitch) {
      document.title = `${project.pitch.working_title} · Pitch Studio`;
    } else {
      document.title = "Digital Project Pitch Studio";
    }
  }

  function renderEvidence() {
    const container = byId("evidence-list");
    container.replaceChildren();
    for (const item of state.project.evidence) {
      const card = document.createElement("article");
      card.className = "evidence-card";
      const heading = document.createElement("div");
      heading.className = "evidence-card-head";
      const title = document.createElement("h3");
      title.textContent = item.source_title;
      const tag = document.createElement("span");
      tag.className = "tag tag-evidence";
      tag.textContent = item.review_status === "accepted" ? "USER-ACCEPTED SOURCE" : "REJECTED";
      heading.append(title, tag);
      const passage = document.createElement("blockquote");
      passage.textContent = item.relevant_passage;
      const meta = document.createElement("div");
      meta.className = "evidence-meta";
      meta.textContent = `${item.publisher || "Owner unspecified"} · ${item.source_type} · Retrieved ${new Date(item.retrieved_at).toLocaleDateString()} · ${item.source_reference || "Reference not supplied"}`;
      card.append(heading, passage, meta);
      container.append(card);
    }
  }

  function renderClaimReview() {
    const pitch = state.project.pitch;
    if (!pitch) return;
    const claims = [
      ["USER ASSERTION", pitch.idea_summary, "tag-assertion"],
      ["USER ASSERTION", pitch.problem_statement, "tag-assertion"],
      ["HYPOTHESIS", pitch.benefits[0]?.statement || "No benefits provided.", "tag-unknown"],
      ["RECOMMENDATION", pitch.recommended_next_step, "tag-recommendation"],
      ["UNKNOWN", pitch.unknowns.join(" · ") || "No unknowns recorded.", "tag-unknown"],
      ["SOURCE-REVIEWED", pitch.evidence_ledger.length ? `${pitch.evidence_ledger.filter((item) => item.review_status === "accepted").length} user-accepted source(s); not independently verified.` : "No source evidence has been added.", "tag-evidence"]
    ];
    const container = byId("claim-review");
    container.replaceChildren();
    for (const [label, text, className] of claims) {
      const row = document.createElement("div");
      row.className = "claim-row";
      const tag = document.createElement("span");
      tag.className = `tag ${className}`;
      tag.textContent = label;
      const description = document.createElement("p");
      description.textContent = text;
      row.append(tag, description);
      container.append(row);
    }
  }

  function loadIntakeForm() {
    const intake = state.project.intake;
    setFormValue("working-title", intake.working_title);
    setFormValue("idea-summary", intake.idea_summary);
    setFormValue("problem-statement", intake.problem_statement);
    setFormValue("current-state", intake.current_state);
    setFormValue("target-users", intake.target_users);
    setFormValue("systems", intake.systems);
    setFormValue("sponsor", intake.sponsor);
    setFormValue("audience", intake.audience);
    setFormValue("constraints", intake.constraints);
    byId("sensitivity").value = intake.sensitivity || "unspecified";
    setFormValue("tone", intake.tone);
  }

  function loadReviewForm() {
    const pitch = state.project.pitch;
    if (!pitch) return;
    setFormValue("model-title", pitch.working_title);
    setFormValue("model-problem", pitch.problem_statement);
    setFormValue("model-current", pitch.current_state.steps.join("\n"));
    setFormValue("model-future", pitch.future_state.steps.join("\n"));
    setFormValue("model-value", pitch.value_proposition);
    setFormValue("model-next-step", pitch.recommended_next_step);
    setFormValue("model-pilot", pitch.pilot_definition);
    setFormValue("model-measures", pitch.success_measures.map((measure) => measure.measure).join("\n"));
    setFormValue("model-unknowns", pitch.unknowns.join("\n"));
    setFormValue("model-tagline", pitch.brand_brief.tagline);
    setFormValue("model-audience", pitch.audience || state.project.intake.audience);
    renderClaimReview();
  }

  function render() {
    renderInspector();
    if (state.project.pitch) {
      loadReviewForm();
    }
    const promptElement = byId("guided-prompt");
    const guidedIndex = Number(state.project.guided_index || 0);
    if (state.intakeMode === "guided" && state.stage === "intake") {
      promptElement.hidden = false;
      const [fieldId, question] = GUIDED_QUESTIONS[guidedIndex % GUIDED_QUESTIONS.length];
      promptElement.replaceChildren(document.createTextNode(`Question ${guidedIndex + 1}: ${question} `));
      const next = document.createElement("button");
      next.type = "button";
      next.className = "text-button";
      next.textContent = "Next question →";
      next.addEventListener("click", () => {
        if (!getFormValue(fieldId)) showToast("You can leave this question blank and continue.");
        state.project.guided_index = Number(state.project.guided_index || 0) + 1;
        persist();
        render();
        byId(GUIDED_QUESTIONS[state.project.guided_index % GUIDED_QUESTIONS.length][0]).focus();
      });
      promptElement.append(next);
    } else {
      promptElement.hidden = true;
    }
  }

  function showToast(message) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove("visible"), 3200);
  }

  function paragraphs(value) {
    return String(value || "Not supplied.").split(/\n+/).filter(Boolean)
      .map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  }

  function listItems(values) {
    return (values.length ? values : ["Not specified."])
      .map((value) => `<li>${escapeHtml(value)}</li>`).join("");
  }

  function dossierMarkdown(pitch) {
    const evidence = pitch.evidence_ledger.filter((item) => item.review_status === "accepted");
    const m = escapeMarkdown;
    return `# ${m(pitch.working_title)}\n\n> ${m(pitch.brand_brief.tagline)}\n\n## Executive summary\n${m(pitch.idea_summary)}\n\nThis is a proposal for discussion. It does not establish project approval, funding, feasibility, compliance, validation, or production readiness.\n\n## Problem\n${m(pitch.problem_statement)}\n\n## Current state\n${m(pitch.current_state.steps.join(" ") || "Current workflow is unknown and requires discovery.")}\n\n## Proposed future state\n${m(pitch.future_state.steps.join(" ") || "Future state is not yet defined.")}\n\n## Users and stakeholders\n${listMarkdown(pitch.target_users)}\n\nStakeholders: ${m(pitch.stakeholders.join("; ") || "To be identified.")}\n\n## Evidence and claims\n- **User assertion:** ${m(pitch.idea_summary)}\n- **Hypothesis:** ${m(pitch.benefits.map((benefit) => benefit.statement).join(" "))}\n- **Source ledger:** ${evidence.length ? evidence.map((item) => `${m(item.source_title)} — ${m(item.source_reference || "reference not supplied")} (retrieved ${m(item.retrieved_at.slice(0, 10))}). User-accepted, not independently verified.`).join("\n") : "No supporting source evidence has been added."}\n\n## Options considered\n${pitch.options.map((option) => `- **${m(option.name)}:** ${m(option.description)}`).join("\n")}\n\n## Recommended approach\n${m(pitch.recommended_option)}\n\n## Pilot\n${m(pitch.pilot_definition)}\n\n## Expected benefits\n${pitch.benefits.map((benefit) => `- **${m(benefit.classification.toUpperCase())}** ${m(benefit.statement)} (${m(benefit.confidence)})`).join("\n")}\n\n## Success measures\n${pitch.success_measures.map((measure) => `- ${m(measure.measure)} — ${m(measure.unit)}; ${m(measure.basis)}`).join("\n")}\n\n## Risks\n${pitch.risks.map((risk) => `- ${m(risk.statement)} Mitigation: ${m(risk.mitigation)}`).join("\n")}\n\n## Assumptions\n${listMarkdown(pitch.assumptions)}\n\n## Dependencies\n${listMarkdown(pitch.dependencies)}\n\n## Open questions\n${listMarkdown(pitch.unknowns)}\n\n## Decision requested\n${m(pitch.recommended_next_step)}\n\n## Sources\n${evidence.length ? evidence.map((item, index) => `${index + 1}. ${m(item.source_title)}. ${m(item.publisher || "Publisher not supplied")}. ${m(item.source_reference || "Reference not supplied")}. Retrieved ${m(item.retrieved_at.slice(0, 10))}. Reuse restrictions: ${m(item.reuse_restrictions || "Not reviewed.")}`).join("\n") : "No sources supplied."}\n`;
  }

  function listMarkdown(values) {
    return (values.length ? values : ["Not identified."]).map((value) => `- ${escapeMarkdown(value)}`).join("\n");
  }

  function onePagerMarkdown(pitch) {
    const m = escapeMarkdown;
    return `# ${m(pitch.working_title)}\n### ${m(pitch.brand_brief.tagline)}\n\n**WHAT**  ${m(pitch.idea_summary)}\n\n**WHY**  ${m(pitch.problem_statement)}\n\n**WHO**  ${m(pitch.target_users.join(", ") || "To be identified")}\n\n**CURRENT PROBLEM**  ${m(pitch.current_state.steps.join(" ") || "Requires discovery.")}\n\n**PROPOSED CHANGE**  ${m(pitch.future_state.steps.join(" ") || "To be defined.")}\n\n**EXPECTED VALUE**  ${m(pitch.value_proposition)}\n\n**PILOT**  ${m(pitch.pilot_definition)}\n\n**SUCCESS MEASURES**\n${listMarkdown(pitch.success_measures.map((measure) => `${measure.measure} (${measure.basis})`))}\n\n**RISKS**  ${m(pitch.risks.map((risk) => risk.statement).join(" "))}\n\n**ASK**  ${m(pitch.recommended_next_step)}\n\n*Proposal for discussion only. Benefits are hypotheses; feasibility, approval, funding, compliance, validation, and production readiness are not established.*\n`;
  }

  function slideDeck(pitch) {
    const evidenceLine = pitch.evidence_ledger.some((item) => item.review_status === "accepted")
      ? "User-accepted source(s) are listed in the evidence ledger; claims remain subject to review."
      : "No external supporting evidence supplied; validate the current-state claims.";
    return [
      { title: pitch.working_title, point: pitch.brand_brief.tagline, note: "A proposal for discussion; not an approval or funding decision." },
      { title: "Current-state friction", point: pitch.problem_statement, note: pitch.current_state.steps.join(" ") || "Current workflow requires discovery." },
      { title: "Why it matters", point: pitch.value_proposition, note: "Potential value is not a measured or verified benefit." },
      { title: "Proposed future state", point: pitch.future_state.steps.join(" ") || "Future state requires definition.", note: "The integration is a proposal, not an established capability." },
      { title: "How the concept works", point: pitch.pilot_definition, note: "Bounded discovery precedes any authorized pilot." },
      { title: "Evidence and expected value", point: evidenceLine, note: pitch.benefits.map((benefit) => `${benefit.classification.toUpperCase()}: ${benefit.statement}`).join(" ") },
      { title: "Pilot and measurement", point: pitch.success_measures.map((measure) => measure.measure).join("; "), note: "Measures and thresholds require agreement." },
      { title: "Risks and dependencies", point: pitch.risks.map((risk) => risk.statement).join(" "), note: pitch.dependencies.join(" ") },
      { title: "Decision requested", point: pitch.recommended_next_step, note: "Discussion request only; no implementation or funding authorization is implied." }
    ];
  }

  function infographicSvg(pitch) {
    const title = escapeHtml(pitch.working_title);
    const color = pitch.brand_brief.palette.primary;
    const blocks = [
      ["01 · TODAY", pitch.current_state.steps.join(" ") || "Current workflow: unknown"],
      ["02 · TEST", pitch.pilot_definition],
      ["03 · LEARN", pitch.benefits.map((benefit) => `${benefit.classification}: ${benefit.statement}`).join(" ")],
      ["04 · ASK", pitch.recommended_next_step]
    ];
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760" role="img" aria-labelledby="title desc"><title id="title">${title} — project infographic</title><desc id="desc">A four-step proposal from current state through bounded pilot, potential learning, and decision request. Draft information, not a project approval.</desc><rect width="1200" height="760" rx="28" fill="#FFFEFA"/><rect x="0" y="0" width="1200" height="15" fill="${color}"/><text x="66" y="75" fill="${color}" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="3">PROJECT PITCH · PROPOSAL</text><text x="66" y="132" fill="#1E2A27" font-family="Arial,sans-serif" font-size="37" font-weight="700">${title}</text><text x="66" y="174" fill="#57635D" font-family="Arial,sans-serif" font-size="19">${escapeHtml(pitch.brand_brief.tagline)}</text>${blocks.map((block, index) => { const x = 66 + index * 280; return `<rect x="${x}" y="235" width="250" height="315" rx="16" fill="${index % 2 ? "#F4F6EF" : "#F5F8F4"}" stroke="#E2E6DE"/><circle cx="${x + 30}" cy="276" r="11" fill="${color}"/><text x="${x + 20}" y="324" fill="${color}" font-family="Arial,sans-serif" font-size="15" font-weight="700">${escapeHtml(block[0])}</text><foreignObject x="${x + 20}" y="350" width="210" height="175"><div xmlns="http://www.w3.org/1999/xhtml" style="font:16px/1.5 Arial,sans-serif;color:#27322d;overflow-wrap:anywhere">${escapeHtml(block[1])}</div></foreignObject>${index < 3 ? `<path d="M${x + 257} 390h18m-7 -7 7 7-7 7" fill="none" stroke="${color}" stroke-width="3"/>` : ""}`; }).join("")}<text x="66" y="620" fill="#59635e" font-family="Arial,sans-serif" font-size="16">Risks: ${escapeHtml(pitch.risks.map((risk) => risk.statement).join(" · "))}</text><text x="66" y="682" fill="#69736E" font-family="Arial,sans-serif" font-size="13">Proposal for discussion. Benefits and feasibility are not established. Review source ledger and open questions before sharing.</text></svg>`;
  }

  function logoSvg(pitch, dark) {
    const name = escapeHtml(pitch.working_title);
    const color = dark ? "#FFFEFA" : pitch.brand_brief.palette.ink;
    const background = dark ? pitch.brand_brief.palette.ink : "#FFFEFA";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="260" viewBox="0 0 840 260" role="img" aria-labelledby="title desc"><title id="title">${name} logo concept${dark ? " dark" : " light"}</title><desc id="desc">Independent draft identity: connected points suggesting a measured, traceable data path. Not a corporate mark.</desc><rect width="840" height="260" rx="18" fill="${background}"/><path d="M81 137h53l27-46 34 91 27-45h47" fill="none" stroke="${pitch.brand_brief.palette.primary}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="81" cy="137" r="11" fill="${pitch.brand_brief.palette.primary}"/><circle cx="269" cy="137" r="11" fill="${pitch.brand_brief.palette.accent}"/><text x="318" y="132" fill="${color}" font-family="Arial,sans-serif" font-size="28" font-weight="700">${name}</text><text x="318" y="168" fill="${dark ? "#D7DED8" : "#69736E"}" font-family="Arial,sans-serif" font-size="16">${escapeHtml(pitch.brand_brief.tagline)}</text><text x="318" y="203" fill="${dark ? "#B7C0B9" : "#7A847E"}" font-family="Arial,sans-serif" font-size="11">INDEPENDENT DRAFT CONCEPT · NOT A CORPORATE TRADEMARK</text></svg>`;
  }

  function videoHtml(pitch, scenes) {
    let seconds = 0;
    const sceneRows = scenes.map((scene, index) => {
      const duration = sceneDuration(index);
      const start = seconds;
      seconds += duration;
      return `<section class="scene"><p class="label">${String(index + 1).padStart(2, "0")} · ${escapeHtml(scene.title)}</p><h1>${escapeHtml(scene.point)}</h1><p>${escapeHtml(scene.note)}</p><footer>${formatTime(start)} — ${formatTime(seconds)}</footer></section>`;
    }).join("");
    return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(pitch.working_title)} · storyboard</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f4ef;color:#1e2a27;font:16px/1.55 Arial,sans-serif}.scene{min-height:370px;padding:55px 8%;margin:20px auto;max-width:920px;background:#fffefa;border-top:6px solid ${pitch.brand_brief.palette.primary};border-radius:12px}.label{color:${pitch.brand_brief.palette.primary};font-size:13px;font-weight:bold;letter-spacing:.1em}.scene h1{font-size:30px}.scene footer{margin-top:40px;color:#69736e;font-size:13px}.notice{max-width:920px;margin:30px auto;padding:20px;background:#fff7e8}</style><div class="notice">60-second deterministic storyboard preview. Timings are scene targets; no MP4, narration recording, or generated imagery is included.</div>${sceneRows}</html>`;
  }

  function formatTime(seconds) {
    return `00:${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}.000`;
  }

  function sceneDuration(index) {
    return index < 7 ? 7 : (index === 7 ? 6 : 5);
  }

  function videoCaptions(scenes) {
    let clock = 0;
    return scenes.map((scene, index) => {
      const start = clock;
      clock += sceneDuration(index);
      return `${index + 1}\n${formatTime(start).replace(".", ",")} --> ${formatTime(clock).replace(".", ",")}\n${escapeHtml(scene.title)}: ${escapeHtml(scene.point)}\n`;
    }).join("\n");
  }

  function generatedAssets() {
    const pitch = state.project.pitch;
    const scenes = slideDeck(pitch);
    const deckMarkdown = `# ${escapeMarkdown(pitch.working_title)} — 9-slide outline\n\n${scenes.map((slide, index) => `## ${index + 1}. ${escapeMarkdown(slide.title)}\n\n${escapeMarkdown(slide.point)}\n\n*${escapeMarkdown(slide.note)}*`).join("\n\n")}\n`;
    const record = validateCanonicalRecord(canonicalRecord());
    const claims = {
      working_title: pitch.working_title,
      recommended_next_step: pitch.recommended_next_step,
      pilot_definition: pitch.pilot_definition,
      brand_name: pitch.brand_brief.project_name,
      tagline: pitch.brand_brief.tagline
    };
    return {
      "dossier.md": { mime: "text/markdown", content: dossierMarkdown(pitch), claims },
      "one-pager.md": { mime: "text/markdown", content: onePagerMarkdown(pitch), claims },
      "slide-deck.md": { mime: "text/markdown", content: deckMarkdown, claims },
      "infographic.svg": { mime: "image/svg+xml", content: infographicSvg(pitch), claims },
      "logo-light.svg": { mime: "image/svg+xml", content: logoSvg(pitch, false), claims },
      "logo-dark.svg": { mime: "image/svg+xml", content: logoSvg(pitch, true), claims },
      "logo-rationale.md": { mime: "text/markdown", content: `# ${escapeMarkdown(pitch.working_title)} — visual identity concept\n\n**Tagline:** ${escapeMarkdown(pitch.brand_brief.tagline)}\n\n${escapeMarkdown(pitch.brand_brief.logo_rationale)}\n\n**Palette:** primary ${pitch.brand_brief.palette.primary}; ink ${pitch.brand_brief.palette.ink}; paper ${pitch.brand_brief.palette.paper}; accent ${pitch.brand_brief.palette.accent}.\n\n**Typography:** ${escapeMarkdown(pitch.brand_brief.typography)}\n\n**Accessibility:** ${escapeMarkdown(pitch.brand_brief.accessibility)}\n\n**Trademark:** Independent concept only; no corporate marks or generated-image provider used.\n\n**Small-icon test:** The two-node path is designed to remain recognizable at small sizes; confirm in the intended context before adoption.\n`, claims },
      "logo-metadata.json": { mime: "application/json", content: JSON.stringify({ project_name: pitch.working_title, tagline: pitch.brand_brief.tagline, concept_type: "deterministic SVG template", provider: null, generated_image: false, generated_at: isoNow(), light_variant: "logo-light.svg", dark_variant: "logo-dark.svg", png_rendered: false, trademark_status: "independent draft concept; no corporate marks" }, null, 2), claims },
      "video/storyboard.html": { mime: "text/html", content: videoHtml(pitch, scenes), claims },
      "video/captions.vtt": { mime: "text/vtt", content: `WEBVTT\n\n${videoCaptions(scenes).replace(/(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2 --> $3.$4")}`, claims },
      "video/script.md": { mime: "text/markdown", content: `# 60-second pitch script · ${escapeMarkdown(pitch.working_title)}\n\n**Objective:** Tell the same proposal story and reach the same discovery decision as the approved pitch model.\n\n${scenes.map((scene, index) => `### ${formatTime(scenes.slice(0, index).reduce((sum, _item, priorIndex) => sum + sceneDuration(priorIndex), 0))} · ${escapeMarkdown(scene.title)}\n\n**Narration:** ${escapeMarkdown(scene.point)}\n\n**On-screen text:** ${escapeMarkdown(scene.note)}\n\n**Visual prompt:** Use a restrained typographic scene with a simple connected path motif and no product, instrument, or corporate marks. No generated image is included.\n`).join("\n")}\n**Production note:** Deterministic storyboard and captions only. No audio, MP4, or generated still imagery is included in this prototype.\n`, claims },
      "video/thumbnail.svg": { mime: "image/svg+xml", content: `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-labelledby="t d"><title id="t">${escapeHtml(pitch.working_title)} pitch video thumbnail</title><desc id="d">Draft proposal cover. Not an approved project.</desc><rect width="1280" height="720" fill="#FFFEFA"/><rect x="0" y="0" width="1280" height="16" fill="${pitch.brand_brief.palette.primary}"/><path d="M100 480h150l70-110 85 220 75-110h150" fill="none" stroke="${pitch.brand_brief.palette.primary}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><text x="100" y="175" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="${pitch.brand_brief.palette.primary}">PROJECT PITCH · PROPOSAL</text><text x="100" y="260" font-family="Arial,sans-serif" font-size="48" font-weight="700" fill="#1E2A27">${escapeHtml(pitch.working_title)}</text><text x="100" y="330" font-family="Arial,sans-serif" font-size="26" fill="#53605A">${escapeHtml(pitch.brand_brief.tagline)}</text><text x="100" y="630" font-family="Arial,sans-serif" font-size="18" fill="#69736E">Draft concept · not a project approval</text></svg>`, claims },
      "video/render-manifest.json": { mime: "application/json", content: JSON.stringify({ project_name: pitch.working_title, tagline: pitch.brand_brief.tagline, recommended_next_step: pitch.recommended_next_step, pilot_definition: pitch.pilot_definition, objective: "Tell the same proposal story and decision request as the approved model", duration_seconds: 60, scene_count: scenes.length, renderer: "deterministic-html-storyboard", mp4_generated: false, audio_generated: false, image_generation_provider: null, thumbnail: "thumbnail.svg", captions: "captions.vtt", scene_durations_seconds: scenes.map((_scene, index) => sceneDuration(index)) }, null, 2), claims },
      "pitch-source-of-truth.json": { mime: "application/json", content: JSON.stringify(record, null, 2), claims }
    };
  }

  function renderAssetCards() {
    const cards = [
      ["dossier.md", "Executive dossier", "Evidence-aware narrative with scope, risks, unknowns, and decision request.", "▤"],
      ["one-pager.md", "One-page brief", "A concise sponsor-facing overview of the same proposal.", "▱"],
      ["slide-deck.md", "9-slide presentation", "A visual-first slide outline with a consistent narrative arc.", "▦"],
      ["infographic.svg", "Pitch infographic", "Current state → pilot → learning → decision request.", "◫"],
      ["logo-light.svg", "Logo concepts", "Light and dark identity concepts, rationale, and accessibility notes.", "✳"],
      ["video/storyboard.html", "60-second video package", "Timed scenes, script, storyboard preview, captions, and render manifest.", "▷"],
      ["pitch-source-of-truth.json", "Machine-readable record", "Versioned canonical project model and evidence ledger.", "{ }"]
    ];
    return cards.map(([key, title, description, icon]) => `<article class="asset-card"><span class="asset-icon" aria-hidden="true">${icon}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><button type="button" data-preview="${escapeHtml(key)}">Preview ${key.startsWith("logo-") ? "concept" : "asset"} →</button></article>`).join("");
  }

  function auditAssets(assets) {
    const pitch = state.project.pitch;
    const expected = {
      working_title: pitch.working_title,
      recommended_next_step: pitch.recommended_next_step,
      pilot_definition: pitch.pilot_definition,
      brand_name: pitch.brand_brief.project_name,
      tagline: pitch.brand_brief.tagline
    };
    const issues = [];
    for (const [name, asset] of Object.entries(assets)) {
      for (const [key, value] of Object.entries(expected)) {
        if (asset.claims[key] !== value) issues.push(`${name}: ${key} does not match the approved model.`);
      }
      if (asset.claims.working_title !== asset.claims.brand_name) issues.push(`${name}: project title and brand name differ.`);
      const brandingOnly = name.startsWith("logo-") || name === "video/thumbnail.svg";
      const requiredText = [
        ["project name", pitch.working_title],
        ["tagline", pitch.brand_brief.tagline]
      ];
      if (!brandingOnly) {
        requiredText.push(["recommended next step", pitch.recommended_next_step], ["pilot definition", pitch.pilot_definition]);
      }
      if (name === "pitch-source-of-truth.json") {
        try {
          const record = JSON.parse(asset.content);
          if (record.version !== state.project.version
            || record.approval_status.approved_version !== state.project.approval.approved_version
            || record.working_title !== pitch.working_title
            || record.recommended_next_step !== pitch.recommended_next_step
            || record.pilot_definition !== pitch.pilot_definition
            || record.brand_brief.tagline !== pitch.brand_brief.tagline) {
            issues.push(`${name}: structured fields do not match the approved model.`);
          }
        } catch (error) {
          issues.push(`${name}: canonical JSON is invalid (${error.message}).`);
        }
      } else {
        for (const [label, value] of requiredText) {
          if (!asset.content.includes(value) && !asset.content.includes(escapeHtml(value)) && !asset.content.includes(escapeMarkdown(value))) {
            issues.push(`${name}: rendered ${label} is missing or differs from the approved model.`);
          }
        }
      }
    }
    if (pitch.approval_status.status !== "approved" || pitch.approval_status.approved_version !== state.project.version) {
      issues.push("Asset source model does not match the approved version.");
    }
    const result = byId("audit-result");
    result.hidden = false;
    result.classList.toggle("fail", issues.length > 0);
    result.textContent = issues.length
      ? `Consistency audit failed. Export is blocked. ${issues.join(" ")}`
      : `Consistency audit passed: ${Object.keys(assets).length} outputs use the approved project name, next step, pilot, and identity (model v${state.project.version}). This checks template provenance and exact fields; it is not a semantic claim verifier.`;
    return issues.length === 0;
  }

  function generatePackage() {
    if (state.project.approval.status !== "approved") {
      showToast("Approval is required before asset generation.");
      return;
    }
    const assets = generatedAssets();
    state.assets = auditAssets(assets) ? assets : null;
    state.project.change_log.push({ at: isoNow(), event: state.assets ? "assets_generated_from_approved_model" : "consistency_audit_failed" });
    persist();
    render();
    if (state.assets) showToast("Coordinated package generated. Review before sharing.");
  }

  function previewAsset(key) {
    if (!state.assets?.[key]) return;
    const asset = state.assets[key];
    const overlay = document.createElement("div");
    overlay.className = "preview-overlay";
    overlay.setAttribute("role", "presentation");
    const dialog = document.createElement("section");
    dialog.className = "preview-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "preview-title");
    const close = document.createElement("button");
    close.className = "preview-close";
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Close preview");
    close.addEventListener("click", () => overlay.remove());
    const title = document.createElement("h2");
    title.id = "preview-title";
    title.textContent = key;
    const body = document.createElement("div");
    body.className = "preview-body";
    if (key.endsWith(".svg")) {
      body.innerHTML = asset.content;
    } else if (key.endsWith(".html")) {
      const iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", "");
      iframe.title = `${key} preview`;
      iframe.srcdoc = asset.content;
      body.append(iframe);
    } else {
      const pre = document.createElement("pre");
      pre.className = "asset-preview";
      pre.textContent = asset.content;
      body.append(pre);
    }
    dialog.append(close, title, body);
    overlay.append(dialog);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) overlay.remove(); });
    document.addEventListener("keydown", function onEscape(event) {
      if (event.key === "Escape") {
        overlay.remove();
        document.removeEventListener("keydown", onEscape);
      }
    });
    document.body.append(overlay);
    close.focus();
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let index = 0; index < 8; index += 1) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function zipStore(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let localOffset = 0;
    const date = new Date();
    const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const dosDate = ((Math.max(1980, date.getFullYear()) - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    for (const [name, content] of Object.entries(files)) {
      const nameBytes = encoder.encode(name);
      const data = typeof content === "string" ? encoder.encode(content) : content;
      const checksum = crc32(data);
      const local = new Uint8Array(30 + nameBytes.length + data.length);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, dosTime, true);
      lv.setUint16(12, dosDate, true);
      lv.setUint32(14, checksum, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      local.set(data, 30 + nameBytes.length);
      localParts.push(local);
      const central = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, dosTime, true);
      cv.setUint16(14, dosDate, true);
      cv.setUint32(16, checksum, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, localOffset, true);
      central.set(nameBytes, 46);
      centralParts.push(central);
      localOffset += local.length;
    }
    const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, centralParts.length, true);
    ev.setUint16(10, centralParts.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, localOffset, true);
    ev.setUint16(20, 0, true);
    return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
  }

  async function sha256(text) {
    if (!globalThis.crypto?.subtle) throw new Error("This browser does not expose Web Crypto SHA-256. Open the app in a modern browser or use a local static web server.");
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function exportZip() {
    if (!state.assets || !auditAssets(state.assets)) {
      showToast("Export is blocked until assets pass the consistency audit.");
      return;
    }
    try {
      const files = {};
      for (const [path, asset] of Object.entries(state.assets)) files[path] = asset.content;
      const checksums = {};
      for (const [path, content] of Object.entries(files)) checksums[path] = await sha256(content);
      const manifest = {
        project_id: state.project.project_id,
        project_version: state.project.version,
        generated_at: isoNow(),
        source_model_version: state.project.approval.approved_version,
        model_provider: "none — deterministic templates",
        prompt_version: "not applicable — no generative model used",
        approval_states: { pitch_model: state.project.approval.status, asset_consistency: "passed", project_authorization: "not granted by this prototype" },
        citations: state.project.pitch.evidence_ledger.map((item) => ({ evidence_id: item.evidence_id, source_title: item.source_title, source_reference: item.source_reference, retrieved_at: item.retrieved_at, review_status: item.review_status })),
        asset_checksums_sha256: checksums,
        known_limitations: [
          "Local prototype; no authentication, project-level authorization, server-side storage, or enterprise MCP connection.",
          "User-accepted source passages are not independently verified; retrieved content must not be treated as instructions.",
          "No generated imagery, recorded narration, or MP4 renderer is configured.",
          "Proposal review does not imply project approval, funding, feasibility, compliance, validation, or production readiness."
        ]
      };
      files["manifest.json"] = JSON.stringify(manifest, null, 2);
      const blob = zipStore(files);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${safeFileName(state.project.pitch.working_title)}-pitch-package-v${state.project.version}.zip`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      state.project.change_log.push({ at: isoNow(), event: "pitch_package_exported" });
      persist();
      showToast("ZIP package downloaded with a SHA-256 provenance manifest.");
    } catch (error) {
      showToast(`Export failed: ${error.message}`);
    }
  }

  function intakeValuesFromForm() {
    state.project.intake = {
      working_title: getFormValue("working-title"),
      idea_summary: getFormValue("idea-summary"),
      problem_statement: getFormValue("problem-statement"),
      current_state: getFormValue("current-state"),
      target_users: getFormValue("target-users"),
      systems: getFormValue("systems"),
      sponsor: getFormValue("sponsor"),
      audience: getFormValue("audience"),
      constraints: getFormValue("constraints"),
      sensitivity: byId("sensitivity").value,
      tone: getFormValue("tone")
    };
  }

  function resetProject() {
    if (state.project.pitch && !window.confirm("Start a new project? The current browser-saved project will be replaced.")) return;
    state.project = createEmptyProject();
    state.assets = null;
    state.intakeMode = "quick";
    document.querySelectorAll(".mode-card").forEach((card) => card.classList.toggle("selected", card.dataset.mode === "quick"));
    loadIntakeForm();
    persist();
    showStage("intake");
  }

  async function readEvidenceFile(file) {
    if (!file) return;
    const allowed = /\.(txt|md|json)$/i.test(file.name);
    if (!allowed || !["text/plain", "text/markdown", "application/x-markdown", "application/json", ""].includes(file.type)) {
      showToast("Unsupported file type. Select a .txt, .md, or .json document.");
      byId("evidence-file").value = "";
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      showToast("Document exceeds the 1 MB local prototype limit.");
      byId("evidence-file").value = "";
      return;
    }
    try {
      const text = await file.text();
      if (!text.trim()) throw new Error("The selected document is empty.");
      state.pendingFileName = file.name;
      setFormValue("source-title", file.name);
      setFormValue("source-reference", file.name);
      setFormValue("source-passage", text.slice(0, 4000));
      byId("file-status").textContent = `${file.name} · ${file.size.toLocaleString()} bytes · loaded locally`;
      byId("evidence-form").hidden = false;
      showToast("Document loaded locally. Review its passage before accepting.");
    } catch (error) {
      showToast(`Could not read document: ${error.message}`);
    }
  }

  byId("intake-form").addEventListener("submit", (event) => {
    event.preventDefault();
    intakeValuesFromForm();
    modelFromIntake();
  });
  byId("intake-form").addEventListener("input", () => {
    intakeValuesFromForm();
    persist();
  });

  byId("load-demo").addEventListener("click", () => {
    state.project = demoProject();
    state.assets = null;
    loadIntakeForm();
    showStage("review");
    showToast("QC1 demo loaded as a draft. Review its claims and unknowns before approval.");
  });

  byId("model-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.project.pitch) {
      showToast("Build a pitch model from the idea intake first.");
      return;
    }
    applyReviewForm();
    if (!state.project.pitch.working_title || !state.project.pitch.recommended_next_step) {
      showToast("Project name and recommended next step are required.");
      return;
    }
    state.project.version = incrementVersion(state.project.version);
    const approvedAt = isoNow();
    state.project.approval = { status: "approved", approved_at: approvedAt, approved_version: state.project.version };
    state.project.pitch.approval_status = { ...state.project.approval };
    state.project.pitch.change_log.push({ at: approvedAt, event: "human_approved_pitch_model" });
    state.project.change_log.push({ at: approvedAt, event: "human_approved_pitch_model" });
    try {
      validateCanonicalRecord(canonicalRecord());
    } catch (error) {
      state.project.approval = { status: "pending", approved_at: null, approved_version: null };
      state.project.pitch.approval_status = { ...state.project.approval };
      showToast(`Canonical schema validation failed: ${error.message}`);
      render();
      return;
    }
    persist();
    render();
    showToast(`Pitch model v${state.project.version} approved for draft asset generation.`);
  });

  byId("model-form").addEventListener("input", () => {
    if (!state.project.pitch) return;
    applyReviewForm();
    const approvalReset = state.project.approval.status === "approved";
    if (approvalReset) {
      state.project.approval = { status: "pending", approved_at: null, approved_version: null };
      state.project.pitch.approval_status = { ...state.project.approval };
      state.project.pitch.change_log.push({ at: isoNow(), event: "approved_model_edit_requires_reapproval" });
      state.project.change_log.push({ at: isoNow(), event: "approved_model_edit_requires_reapproval" });
      state.assets = null;
    }
    persist();
    renderInspector();
    renderClaimReview();
    if (approvalReset) showToast("Model edit detected. Approval was reset; review and approve the updated version.");
  });

  byId("mark-value-unknown").addEventListener("click", () => {
    setFormValue("model-value", "Unknown — validate with intended users and a sponsor.");
    if (state.project.pitch) {
      applyReviewForm();
      persist();
    }
    if (state.project.approval.status === "approved") {
      state.project.approval = { status: "pending", approved_at: null, approved_version: null };
      state.project.pitch.approval_status = { ...state.project.approval };
      state.assets = null;
      persist();
      renderInspector();
    }
    showToast("Value proposition marked as unknown. Review and approve the updated model.");
  });

  byId("evidence-file").addEventListener("change", (event) => readEvidenceFile(event.target.files?.[0]));
  byId("evidence-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const passage = getFormValue("source-passage");
    if (!passage) {
      showToast("Add a passage for review.");
      return;
    }
    const evidence = {
      evidence_id: uid(),
      source_title: getFormValue("source-title"),
      source_url_or_reference: getFormValue("source-reference"),
      source_reference: getFormValue("source-reference"),
      publisher: getFormValue("source-owner"),
      retrieved_at: isoNow(),
      relevant_passage: passage,
      source_type: byId("source-type").value,
      confidence: "Not independently assessed",
      internal_or_external: "user-provided; classification not verified",
      reuse_restrictions: "Not reviewed",
      supports_claim_ids: [],
      review_status: "accepted",
      content_trust: "untrusted data; instructions ignored"
    };
    state.project.evidence.push(evidence);
    if (state.project.pitch) state.project.pitch.evidence_ledger = state.project.evidence.slice();
    appendLog("user_accepted_source_passage");
    persist();
    byId("evidence-form").hidden = true;
    byId("file-status").textContent = "No document selected";
    byId("evidence-file").value = "";
    state.pendingFileName = "";
    render();
    showToast("Passage added as user-accepted evidence; no claim was independently verified.");
  });
  byId("reject-evidence").addEventListener("click", () => {
    byId("evidence-form").hidden = true;
    byId("evidence-file").value = "";
    byId("file-status").textContent = "Passage rejected; no evidence saved";
    state.pendingFileName = "";
  });

  byId("generate-assets").addEventListener("click", generatePackage);
  byId("export-package").addEventListener("click", exportZip);
  byId("reset-project").addEventListener("click", resetProject);
  byId("clear-local-data").addEventListener("click", () => {
    if (!window.confirm("Permanently clear this prototype's project data from this browser?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state.project = createEmptyProject();
    state.assets = null;
    loadIntakeForm();
    showStage("intake");
    showToast("Local project data cleared.");
  });

  document.querySelectorAll(".step").forEach((button) => button.addEventListener("click", () => showStage(button.dataset.stage)));
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => showStage(button.dataset.go)));
  document.querySelectorAll(".mode-card").forEach((button) => button.addEventListener("click", () => {
    state.intakeMode = button.dataset.mode;
    document.querySelectorAll(".mode-card").forEach((card) => card.classList.toggle("selected", card === button));
    byId("guided-prompt").hidden = state.intakeMode !== "guided";
    if (state.intakeMode === "evidence") showToast("Add local source files in the Evidence stage. External retrieval is not connected.");
    render();
    if (state.intakeMode === "evidence") {
      showStage("evidence");
    } else if (state.intakeMode === "guided") {
      byId(GUIDED_QUESTIONS[Number(state.project.guided_index || 0) % GUIDED_QUESTIONS.length][0]).focus();
    }
  }));
  byId("asset-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-preview]");
    if (button) previewAsset(button.dataset.preview);
  });

  state.project = loadProject();
  loadIntakeForm();
  if (state.project.pitch && state.project.approval.status === "approved") {
    try {
      state.assets = generatedAssets();
      if (!auditAssets(state.assets)) state.assets = null;
    } catch (error) {
      state.assets = null;
      showToast(`Saved approved model could not be rendered: ${error.message}`);
    }
  }
  render();
})();
