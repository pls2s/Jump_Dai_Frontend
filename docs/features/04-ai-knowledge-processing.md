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

## Mock behavior

All separate knowledge analysis, relationships, counts, summaries, and references are structured mock data. `API_doc.md` documents AI course generation, not this pre-generation analysis endpoint, so numeric backend courses show an explicit unavailable state instead of issuing a guessed request.

## Known limitations

- Analysis restarts on route reload; add `?state=failed` to the analysis route to inspect the simulated failure/retry state
- Topic edits, exclusions, relationship editing, and sequence reordering are not yet implemented
- References demonstrate intended RAG UX but are not generated citations
- Analysis completion is stored locally so direct generation cannot skip the required knowledge-analysis dependency
