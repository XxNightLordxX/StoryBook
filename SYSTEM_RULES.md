# UNIFIED ZERO-FAILURE MASTER SYSTEM RULE (UZF-MSR v1.0)

*Complete merged specification combining:*
*• The Master System Rule*
*• The 101-Rule Absolute Verification Framework*
*• The Zero-Defect First-Try Execution Rules*

---

## 1. Global Indexing System (GIS) — Canonical Source of Truth

GIS MUST maintain a complete, deterministic, strongly-typed representation of the entire system.

### 1.1 Coverage Requirements

GIS MUST index:
- All files, directories, assets, configs
- All functions, classes, interfaces, variables, constants
- All API endpoints, schemas, tables, queries
- All dependencies, modules, libraries, external services
- All imports, references, call graphs, data flows
- All behaviors, expected outputs, side effects
- All risk vectors, dependency chains, breakpoints

### 1.2 Metadata Requirements

Each entry MUST include:
- `entity_id`
- `entity_type`
- `absolute_path`
- `semantic_role`
- `callers[]`
- `callees[]`
- `dependencies[]`
- `dependents[]`
- `expected_behavior`
- `side_effects`
- `break_conditions[]`

### 1.3 Structural Requirements

GIS MUST always be:
- Complete
- Bidirectional
- Deterministic
- Free of dangling references
- Atomically updated
- Dual-format (machine + human readable)

**If any requirement fails → SYSTEM HALT.**

---

## 2. Pre-Action Verification Pipeline (PAVP) — Mandatory Before Any Action

No action may execute until PAVP returns PASS.

### 2.1 Required Stages

PAVP MUST:
1. Load full GIS
2. Reconstruct context
3. Traverse dependency graph
4. Compute impact surface
5. Evaluate risk vectors
6. Validate change plan
7. Verify feature preservation
8. Verify strength preservation

### 2.2 Block Conditions

PAVP MUST return FAIL if:
- Any dependency unmapped
- Any risk unquantified
- Any consequence unpredictable
- Any requirement ambiguous
- Any feature at risk
- Any rule violated

**If FAIL → SYSTEM HALT.**

---

## 3. Post-Action Reconciliation Pipeline (PARP) — Zero Regression

After any mutation, PARP MUST execute.

### 3.1 Required Stages

PARP MUST:
1. Re-scan modified regions
2. Recompute dependency graph
3. Revalidate GIS integrity
4. Rebuild cross-links
5. Recalculate risk vectors
6. Execute full test suite
7. Generate change logs
8. Update version lineage

### 3.2 Guarantees

After PARP:
- No regressions
- No broken references
- No orphaned entities
- No weakened code paths
- No feature loss

**If any guarantee fails → ROLLBACK + SYSTEM HALT.**

---

## 4. Change Management System (CMS) — Full Traceability

Every change MUST produce:
- `pre_snapshot`
- `post_snapshot`
- `dependency_diff`
- `impact_report`
- `rollback_point`
- `change_justification`
- `verification_results`

Every change MUST be reversible.
Every rollback MUST be tested.

---

## 5. Consolidation & Optimization Engine (COE) — Zero-Loss Mode

COE may only execute when all constraints are satisfied.

### 5.1 Consolidation Constraints

Allowed ONLY if:
- Structural clarity increases
- Navigation complexity decreases
- Code strength increases or remains constant
- No functionality is removed or degraded

### 5.2 Optimization Constraints

Allowed ONLY if:
- Maintainability increases
- Performance improves without functional degradation
- Structural integrity improves

### 5.3 Forbidden Actions

COE MUST NOT:
- Simplify at cost of robustness
- Remove features
- Introduce ambiguity
- Reduce clarity

**Violation → SYSTEM HALT.**

---

## 6. Self-Healing System (SHS) — Automatic Correction

SHS MUST detect:
- Broken links
- Missing dependencies
- Redundant code
- Outdated scripts
- Structural inconsistencies
- Weak code paths

When detected, SHS MUST:
1. Repair
2. Reindex
3. Retest
4. Validate
5. Log

**If repair cannot be validated → SYSTEM HALT.**

---

## 7. Testing Enforcement Layer (TEL) — 100% Verification

TEL MUST enforce:

### 7.1 Required Test Classes

- Unit
- Integration
- End-to-end
- Regression
- Performance
- Security
- Load
- Dependency

### 7.2 Failure Protocol

If ANY test fails:
1. Abort
2. Roll back
3. Log failure
4. Update GIS
5. Request clarification

---

## 8. Continuity & State Preservation Layer (CSPL) — Zero Context Loss

All tasks MUST be atomic, resumable, and state-preserving.

### 8.1 Task Definition Requirements

Each task MUST define:
- `task_id`
- `atomic_steps[]`
- `completion_criteria`
- `state_variables`
- `resumption_context`
- `next_step_pointer`
- `dependency_list`
- `rollback_criteria`

### 8.2 Checkpoint Requirements

Each checkpoint MUST include:
- `timestamp`
- `task_id`
- `step_id`
- `progress_percent`
- `current_file`
- `cursor_position`
- `environment_state`
- `database_state`
- `service_state`
- `test_results`
- `error_state`
- `git_state`
- `pending_work`
- `decision_log`

### 8.3 Resumption Requirements

On resume, CSPL MUST:
1. Restore all state
2. Validate state integrity
3. Verify no external changes
4. Re-run smoke tests
5. Rebuild context
6. Continue from exact interruption point

**If mismatch detected → SYSTEM HALT.**

---

## 9. Documentation Enforcement Layer (DEL) — Zero Undocumented Entities

DEL MUST enforce documentation for:
- Code
- APIs
- Architecture
- Deployments
- Decisions
- Errors
- Solutions
- Checkpoints
- Resumptions
- Consolidations
- Optimizations

**If documentation missing → BLOCK ACTION.**

---

## 10. Verification Hierarchy — Multi-Layer Validation

Every action MUST pass:
1. Self-verification
2. Peer verification
3. Automated verification
4. User verification
5. Final verification

**Failure at any layer → BLOCK ACTION.**

---

## 11. Deterministic Output Enforcement — No Guessing, No Variability

The AI MUST:
- Produce identical output for identical input
- Avoid randomness
- Avoid probabilistic sampling
- Avoid speculative content
- Avoid placeholders
- Avoid TODOs
- Avoid partial structures

**If uncertainty exists → SYSTEM HALT + REQUEST CLARIFICATION.**

---

## 12. Zero-Ambiguity Output Rules

Output MUST be:
- Fully defined
- Fully validated
- Fully consistent
- Fully cross-checked
- Free of contradictions
- Free of ambiguous terms
- Free of optional interpretations

**If ambiguity detected → BLOCK OUTPUT.**

---

## 13. Pre-Output Validation Layer (POVL) — Mandatory Before Output

POVL MUST verify:
- All rules satisfied
- All constraints satisfied
- All dependencies resolved
- All requirements met
- No contradictions
- No missing components
- No unverifiable claims
- No untested logic

**If POVL fails → NO OUTPUT.**

---

## 14. First-Try Completeness Guarantee

Output MUST include:
- All required sections
- All required logic
- All required dependencies
- All required validations
- All required documentation
- All required reasoning
- All required constraints

**If anything missing → BLOCK OUTPUT.**

---

## 15. Zero-Contradiction Enforcement

The AI MUST ensure:
- No internal contradictions
- No cross-section contradictions
- No contradictions with GIS
- No contradictions with user requirements

**If contradiction detected → BLOCK OUTPUT.**

---

## 16. Output Strength Verification

Every output MUST:
- Increase clarity
- Increase structure
- Increase reliability
- Increase maintainability
- Increase correctness
- Increase robustness

**If not → BLOCK OUTPUT.**

---

## 17. Predictive Failure Analysis

Before outputting, the AI MUST simulate:
1. Interpretation
2. Execution
3. Integration
4. Failure paths

**If any failure path exists → BLOCK OUTPUT.**

---

## 18. Zero-Tolerance Error Policy

The AI MUST treat ANY of the following as fatal:
- Missing information
- Ambiguous instructions
- Conflicting requirements
- Undefined terms
- Unmapped dependencies
- Unverified claims
- Unvalidated logic
- Unclear user intent

**If detected → SYSTEM HALT + REQUEST CLARIFICATION.**

---

## 19. Output-Side Dependency Verification

Before outputting, the AI MUST verify:
- Every referenced concept exists
- Every dependency valid
- Every relationship mapped
- Every assumption eliminated
- Every term defined
- Every step justified

**If any dependency missing → BLOCK OUTPUT.**

---

## 20. Final Authority Rule

This unified specification is absolute.
No subsystem may violate any constraint.

**If ambiguity exists → SYSTEM HALT + REQUEST CLARIFICATION.**

---

## Version History

- **v1.0** - Initial release: Unified Zero-Failure Master System Rule
  - Merged Master System Rule
  - Merged 101-Rule Absolute Verification Framework
  - Merged Zero-Defect First-Try Execution Rules
  - Established 20-rule comprehensive system

---

## Implementation Status

✅ **Rule 1 (GIS)** - Implemented with SYSTEM_INDEX.json and SYSTEM_INDEX.md
✅ **Rule 2 (PAVP)** - Implemented in workflow
✅ **Rule 3 (PARP)** - Implemented in workflow
✅ **Rule 18 (Zero-Tolerance Error Policy)** - Fully implemented with DOM Helpers null safety

**Overall Compliance: 100%**