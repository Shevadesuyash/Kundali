---
name: project-status-sync
description: >-
  Enforces automatic status synchronization and history tracking for the Kundali project.
  Whenever any architectural plan, feature implementation, bugfix, or decision is made,
  this skill instructs the AI to read docs/PROJECT_STATUS.md first for instant context,
  and APPEND (never delete/overwrite) comprehensive updates with timestamp, context, and summary.
---

# Kundali Project Status Sync Skill

This skill ensures that docs/PROJECT_STATUS.md is always the single source of truth for project state, past implementations, decisions, active architecture, and upcoming phase roadmaps.

## Core Directives

1. **Instant Context Loading (Fast Start)**:
   - When starting work or resuming in this codebase, view docs/PROJECT_STATUS.md first.
   - It contains the complete ground-truth architecture, file maps, database schemas, active endpoints, bugfix ledgers, and phased roadmaps.

2. **Strict Append-Only Rule (Never Erase History)**:
   - **NEVER remove, truncate, or overwrite existing historical logs or detailed specifications in docs/PROJECT_STATUS.md**.
   - Always **APPEND** new updates chronologically under the structured sections or the ## 📜 Chronological Session & Phase Append Log.

3. **Mandatory Entry Metadata**:
   Every new append entry MUST include:
   - **Date & Timestamp**: (e.g. 2026-08-25 12:15 IST)
   - **Context / Chat Reference**: (e.g. Session bb79b74f... / Phase 5 Planning)
   - **Short Summary**: (One-line executive summary)
   - **Status & Milestones**: (What was completed, verified, or decided)
   - **Files Modified / Added**: (Explicit list of touched files)
   - **Next Planned Actions**: (Concrete next steps)

4. **Synchronize with Every Commit / Phase Shift**:
   - Whenever code changes are committed, push the corresponding append update to docs/PROJECT_STATUS.md as part of the commit or immediately alongside it.
