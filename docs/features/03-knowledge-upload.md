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
- Backend documents load from `GET /api/courses/{course_id}/documents`; confirmed deletion calls `DELETE /api/documents/{document_id}`
- Unsupported and oversized files show specific, recoverable errors
- Upload moves through Uploading → Processing → Ready
- Pasted text is added as a ready source with a computed word count
- URL fetch shows a safe mock preview before addition
- Invalid or simulated-unavailable URLs show an error and alternate next action
- Mock failed sources can be retried; backend failures explain that no retry endpoint is documented
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

Seeded slug-based demo courses retain local ready/failed sources and browser timers. Frontend Demo Mode routes newly configured courses to this slug-based flow, so it makes no document API calls. Numeric backend course routes use documented file APIs only in API mode. Manual text and URL modes remain visibly marked frontend-only because no corresponding endpoints are documented.

## Known limitations

- Backend file processing is displayed from returned document status; no automatic polling interval is assumed, so users refresh status manually
- Manual-text and URL sources are not persisted to the backend
- File size/type limits are enforced only in frontend mock behavior
- URL metadata and content preview are static mock values
- Separate knowledge-analysis and document-retry endpoints are not documented
