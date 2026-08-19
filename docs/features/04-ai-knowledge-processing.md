# 04 — AI Knowledge Processing

## Purpose

Demonstrate the core SkillSync transformation from raw trusted sources into structured, source-grounded learning intelligence.

## User goal

Understand what the AI is doing, inspect extracted topics and concepts, verify source grounding, review learning dependencies, and continue toward course generation.

## Routes

- `/creator/courses/[courseId]/analysis`
- `/creator/courses/[courseId]/generate` (connected generator entry)

## Main screens

- Multi-step AI processing experience with real-looking progress
- Missing-source dependency state and recoverable AI failure/retry state
- Knowledge analysis summary with source, topic, concept, and reference counts
- Topic selector and concept detail workspace
- Source-reference drawer
- Topic relationship flow
- Recommended learning sequence
- Completed state and generation handoff

## Components

- `AnalysisWorkspace` transitions between processing and results
- `ConceptDetail`, `RelationshipCard`, `SequenceCard`, and `SourcesDrawer`
- Structured analysis data in `src/data/mock/product.ts`
- Shared `Card`, `Badge`, `Progress`, and button primitives

## Interactions

- Processing advances through seven understandable stages: reading, extraction, summarization, relationships, sequencing, grounded retrieval, and reference linking
- Selecting a topic updates the available concepts
- Selecting a concept updates its summary and grounding count
- View sources opens a responsive side drawer with file/section references and excerpts
- Review sources returns to source management
- Generate course opens the real frontend AI Course Generator entry

## States

- Reading, extraction, summarization, relationships, sequencing, and reference-linking progress
- Initial/running, partial progress, failure/retry, missing-source, and completed states
- Completed and source-grounded result
- Selected topic and selected concept
- Open/closed reference drawer
- Final success handoff

## API integration

For a numeric Creator course in API mode, Source Management loads `GET /api/courses/{course_id}/knowledge-sources` and processes uploaded sources with `POST /api/knowledge-sources/{source_id}/process`. The UI updates each source to `Ready` with its returned chunk count, or to `Failed` with the safe backend error. Processing supports TXT, Markdown, and selectable-text PDF files; DOC/DOCX/PPT/PPTX remain uploadable but can safely fail during local text extraction.

The separate analysis screen's topic graph, relationships, summaries, and source-reference drawer remain structured frontend mock data. It is not presented as an API result yet.

## Known limitations

- Analysis restarts on route reload; add `?state=failed` to the analysis route to inspect the simulated failure/retry state
- Topic edits, exclusions, relationship editing, and sequence reordering are not yet implemented
- References demonstrate intended RAG UX but are not generated citations
- Analysis completion is stored locally so direct generation cannot skip the required knowledge-analysis dependency
