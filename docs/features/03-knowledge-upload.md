# 03 — Knowledge Upload

## Purpose

Let creators assemble the trusted source-of-truth material SkillSync will use for course generation.

## User goal

Combine files and web sources; understand processing state; recover from errors; and start AI analysis when usable material is ready.

## Routes

- `/creator/courses/[courseId]/sources`

## Main screens

- Add material workspace with Upload files and Add URL modes
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
- A batch is validated before upload: no more than 10 uploaded files per course and no file larger than 25 MB
- Unsupported and oversized files, and batches over the file limit, show specific recoverable errors without partial upload
- Backend uploads move through Uploading → Uploaded; Knowledge Processing then moves supported files through Processing → Ready or Failed
- URL fetch shows a safe mock preview before addition; multiple URLs are supported
- URLs receive basic format validation and exact normalized duplicates are rejected
- Invalid or simulated-unavailable URLs show an error and alternate next action
- Failed backend sources retry through the Knowledge Processing endpoint
- Delete requires confirmation
- Analyze knowledge with AI is enabled when at least one source is Ready

## States

- Empty, uploading with progress, processing, ready, and failed
- URL fetching and preview
- File and URL validation errors, including file-count, file-size, and duplicate-URL errors
- Retry feedback
- Disabled AI CTA with explanatory guidance
- Responsive source cards instead of a rigid desktop-only table

## Mock behavior

Seeded slug-based demo courses retain local ready/failed sources and browser timers. Frontend Demo Mode routes newly configured courses to this slug-based flow, so it makes no document API calls. Numeric backend course routes use documented file APIs and Knowledge Processing in API mode. File limits and URL validation are enforced in the frontend in both modes; URL metadata/content remains mocked where no documented endpoint exists.

## Known limitations

- Processing is user-triggered; no automatic polling interval is assumed, so users can refresh source status manually
- Existing manually-entered sources may remain visible for backward compatibility, but new manual-text entry is no longer exposed
- API-mode files still depend on the documented backend upload contract; frontend validation is an additional guard
- URL metadata and content preview are static mock values
- The topic-graph analysis workspace remains frontend mock data; it is separate from source extraction and chunking
