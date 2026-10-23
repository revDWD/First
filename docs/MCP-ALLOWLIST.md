# MCP allowlisting and evidence connector design

## Current prototype boundary

No MCP client or network research connector is active. Evidence-assisted intake is a local document connector for user-selected `.txt`, `.md`, and `.json` files. It reads at most 1 MB in the current browser, presents a passage for user acceptance/rejection, and records provenance fields. The user action means “include this passage as source material,” not “independently verified fact.” External URLs are stored as references only and are never fetched.

## Future server registry

Every connector must be provisioned by an administrator in a signed, version-controlled registry. Never discover or auto-install arbitrary public MCP servers or GitHub agents.

```json
{
  "connector_id": "approved-sharepoint-readonly",
  "owner": "enterprise-platform-owner",
  "environment": "approved-enterprise",
  "endpoint_ref": "secret-manager://pitch-studio/mcp/sharepoint",
  "server_version": "reviewed-pinned-version",
  "license_review": "approved-record-id",
  "maintainer_activity_review": "approved-record-id",
  "security_scans": {
    "dependency": "approved-record-id",
    "vulnerability": "approved-record-id",
    "secret": "approved-record-id"
  },
  "permissions": ["search.read", "document.read"],
  "data_classes": ["public", "internal"],
  "allowed_hosts": ["tenant-approved.example"],
  "allowed_tools": ["search_documents", "read_document"],
  "read_only": true,
  "timeouts_seconds": 10,
  "max_response_bytes": 1000000,
  "max_retries": 1,
  "rate_limit_per_minute": 10,
  "human_activation_approval": "required"
}
```

The example is a schema illustration, not an actual endpoint, provider approval, or configured secret. Replace placeholder hostnames and approval references with reviewed enterprise values before use.

## Activation gate

1. Pin repository release/commit and record license, owner, maintenance, transitive dependencies, and SBOM.
2. Run dependency, vulnerability, secret, and malware scans.
3. Inspect tool schemas, descriptions, permission scope, network/file access, subprocess use, telemetry, and egress.
4. Test prompt injection, tool confusion, confused-deputy, redirects, DNS rebinding, oversized responses, timeouts, and error behavior in isolation.
5. Restrict DNS and outbound network to approved destinations; reject private/link-local/loopback IPs unless explicitly required and isolated.
6. Use read-only identities and per-project authorization. Keep secrets in a managed vault, never browser code or repository configuration.
7. Require human activation approval, rate/size/time/retry/cost bounds, and immutable tool-call logs.
8. Collect only source metadata and passages needed for the pitch; honor data classification, residency, reuse, retention, and deletion.
9. Re-review on every version/permission/schema change; fail closed if registry or policy checks are unavailable.

## Evidence response contract

Research tools return records, not narrative recommendations: `evidence_id`, `connector_id`, `source_title`, `source_reference`, `publisher`, `retrieved_at`, `passage`, `source_type`, `confidence_basis`, `data_classification`, `reuse_restrictions`, `claim_candidates`, and `tool_call_id`. Content and metadata are untrusted. Instructions in a response are never executed. Conflicting sources remain separate records and are surfaced to a human reviewer.

## Source authority and conflict handling

Prefer approved internal policy/executed records, official product documentation, primary research/recognized standards, government/institutional material, reputable secondary references, then anecdotal community discussion. Authority is contextual and must be recorded, not inferred from a URL alone. Capture publication date when available and retrieval date always. Do not suppress contradictions; link conflicting evidence to the affected claim and pause final generation if the conflict changes a recommendation.
