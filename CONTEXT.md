# TeachAI Domain Glossary

This document defines the product's canonical domain language. It intentionally excludes implementation details.

## Workspace

The tenant boundary for one independent teacher, teaching business, or future educational organization. All private teaching data belongs to exactly one Workspace.

## Member

An authenticated person who can operate inside a Workspace. A Member has a Workspace Role.

## Workspace Role

The Member's authority inside a Workspace: Owner, Admin, or Teacher.

## Learner

A person receiving instruction. A Learner is not assumed to have an authenticated account.

## Guardian

A person authorized to receive information or communications concerning one or more Learners.

## Group

A set of Learners taught together, such as a class, cohort, or tutoring group.

## Enrollment

The relationship that places a Learner in a Group for a defined period.

## Subject

The field being taught, such as mathematics, English, music, science, or programming.

## Curriculum Framework

An optional structured collection of Learning Objectives for a Subject.

## Learning Objective

A teachable and assessable outcome that a Learner is expected to develop.

## Rubric

A configurable scale used by a teacher to describe evidence against Learning Objectives.

## Lesson

A scheduled or completed teaching session for one Learner or Group.

## Lesson Plan

A versioned plan for a Lesson, including objectives, activities, materials, timing, and optional assignment.

## Lesson Outcome

The teacher-confirmed record of what occurred in a Lesson: attendance, content covered, observations, evidence, notes, and follow-up.

## Progress Observation

A dated item of teacher-confirmed evidence concerning a Learner and one or more Learning Objectives. It is not a permanent global score.

## Progress Snapshot

A derived summary of Progress Observations for a Learner, Subject, and time range.

## Assignment

Work assigned to a Learner or Group, including instructions, due information, completion state, and feedback.

## Communication Draft

A message or report prepared for a Learner or Guardian. A draft is not a delivery authorization.

## Approval

An explicit teacher action that authorizes a proposed record or communication. AI output is never equivalent to Approval.

## Automation Run

The durable record of an automated process, including its trigger, inputs, proposed output, approval state, delivery state, and failure details.

## Audit Event

A durable security or business record of a sensitive action, including actor, Workspace, target, action, and time.

## Teaching Cycle

The product's core loop:

`Plan → Teach → Capture Outcome → Observe Progress → Approve Follow-up → Share → Prepare Next Lesson`
