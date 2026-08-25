# Project Directives — Kundali Milan Suite

1. **Status & Context Single Source of Truth**:
   - Always consult docs/PROJECT_STATUS.md first upon starting or resuming tasks. It contains the exact inventory of completed phases, architecture, active endpoints, known bugs, and confirmed roadmaps.
2. **Append-Only Status Tracking**:
   - Whenever any phase is planned, features implemented, bugs resolved, or commits made, ALWAYS update and append to docs/PROJECT_STATUS.md.
   - Never delete or erase existing history in docs/PROJECT_STATUS.md. Append chronologically using structured metadata (Date/Timestamp, Context/Chat reference, Short summary, Detailed items, Files touched).
3. **Astrological Rules & Standard Decisions**:
   - **Gender**: Strict male / emale values only.
   - **Database**: SQLite profiles.db with safe migrations; never drop tables on restart.
   - **Calculation**: Kundali computed fresh on demand with Swiss Ephemeris (pyswisseph, Lahiri Ayanamsha).
   - **Manglik School**: Standard Parashari (houses 1, 4, 7, 8, 12 from Lagna/Moon/Venus; Mars in house 2 is NOT Manglik).
   - **Security**: .env and GEMINI_API_KEY are gitignored; never hardcode or commit keys.
