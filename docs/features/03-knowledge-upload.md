# 03 — Knowledge Upload

## Purpose

Let creators assemble the trusted source-of-truth material SkillSync will use for course generation.

## User goal

Combine files, notes, and web sources; understand processing state; recover from errors; and start AI analysis when usable material is ready.

## Routes

- `/creator/courses/[courseId]/sources`

## Main screens

- Add material workspace with Upload files, Paste text, and Add URL modes
- Source list with name, type, size/domain, last updated, and explicit status
- Empty state when all sources have been deleted
- Analysis readiness card and CTA
- Delete confirmation dialog

## Components

- `SourceManager` owns source method selection and source state
- `SourceRow`, `EmptySources`, and `DeleteDialog` provide focused UI states
- Shared `Card`, `Badge`, `Progress`, fields, and buttons

## Interactions

- For numeric backend course IDs, drag/drop or file picker sends multipart field `file` to `POST /api/courses/{course_id}/documents`
- Backend sources load from `GET /api/courses/{course_id}/knowledge-sources`; confirmed deletion calls `DELETE /api/documents/{document_id}`
- Unsupported and oversized files show specific, recoverable errors
- Backend uploads move through Uploading → Uploaded; Knowledge Processing then moves supported files through Processing → Ready or Failed
- Pasted text is added as a ready source with a computed word count
- URL fetch shows a safe mock preview before addition
- Invalid or simulated-unavailable URLs show an error and alternate next action
- Failed backend sources retry through the Knowledge Processing endpoint
- Delete requires confirmation
- Analyze knowledge with AI is enabled when at least one source is Ready

## States

- Empty, uploading with progress, processing, ready, and failed
- URL fetching and preview
- File, manual-text, and URL validation errors
- Retry feedback
- Disabled AI CTA with explanatory guidance
- Responsive source cards instead of a rigid desktop-only table

## Mock behavior

Seeded slug-based demo courses retain local ready/failed sources and browser timers. Frontend Demo Mode routes newly configured courses to this slug-based flow, so it makes no document API calls. Numeric backend course routes use documented file APIs and Knowledge Processing in API mode. Manual text and the current URL-preview UI remain frontend-only.

## Known limitations

- Processing is user-triggered; no automatic polling interval is assumed, so users can refresh source status manually
- Manual-text is not persisted to the backend; the URL endpoint exists but is not wired to the current URL-preview UI yet
- API-mode files use the backend's 25 MB upload limit and supported-type validation
- URL metadata and content preview are static mock values
- The topic-graph analysis workspace remains frontend mock data; it is separate from source extraction and chunking
