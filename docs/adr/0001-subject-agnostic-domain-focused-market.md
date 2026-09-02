# ADR 0001: Subject-Agnostic Domain with a Focused Initial Market

- **Status:** Accepted
- **Date:** 2026-08-30
- **Accepted by user:** 2026-08-30

## Context

The current TeachAI codebase models English teaching directly: fixed English proficiency levels, six language-skill scores, English-specific prompts, reports, and marketing. The intended product is now a teaching operations platform for teachers across subjects.

Trying to serve every educational institution in the first release would add incompatible requirements: individual tutoring, group teaching, school administration, formal grading, procurement, student portals, parent portals, district integrations, and regulated institutional workflows.

Two decisions must therefore coexist:

1. The domain must not hard-code English or any other subject.
2. The first release must remain small enough to validate with real teachers.

## Decision

TeachAI v2 will use a subject-agnostic domain based on Subjects, Learning Objectives, Rubrics, Lessons, Lesson Outcomes, and Progress Observations.

The initial market will be independent teachers and small teaching businesses. The first release may include built-in templates for several subjects, including English, but no subject receives a separate data model or privileged code path.

“Supports all teachers” means that any teacher can define and operate a Subject within the common model. It does not mean that the first release replaces a school SIS, LMS, grading system, or district platform.

## Consequences

### Positive

- Existing English functionality can become a reusable template instead of being discarded.
- New subjects do not require schema forks or new progress tables.
- The product can validate one operational workflow across several subjects.
- The initial scope remains suitable for a small team and direct teacher feedback.

### Negative

- The current schema and AI prompts require migration.
- Flexible objectives and rubrics are more complex than six fixed scores.
- School-specific requirements must be rejected or deferred during the first release.
- Product messaging must distinguish broad subject support from institutional breadth.

## Rejected alternatives

### Keep TeachAI English-only

Rejected because it conflicts with the approved product direction and unnecessarily limits the reusable teaching workflow.

### Build separate modules per subject

Rejected because it would duplicate data models, analytics, prompts, and UI while making cross-subject maintenance expensive.

### Target schools in the first release

Rejected because tenancy, permissions, procurement, rostering, formal grading, integrations, and privacy obligations would expand the first release before the core teaching cycle is validated.
