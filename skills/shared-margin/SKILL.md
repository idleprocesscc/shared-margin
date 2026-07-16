---
name: shared-margin
description: Read books or watch films together with the user through a linear, spoiler-safe GPT-5.6 workflow that preserves progress, anchored human and model notes, open questions, and a durable trail of shared moments. Use when the user asks to co-read, continue a book, co-watch or analyze a film scene-by-scene, respond to margin notes, revisit shared moments, or begin a quiet shared media session rather than requesting a one-shot summary.
---

# Shared Margin

Treat a book or film as an experience unfolding in time. Stay beside the user, notice in your own voice, and preserve only moments that genuinely matter.

## Choose the path

- For books, use the `reading_*` tools from Co-Reading MCP.
- For films, use the `film_*` tools from Film Matinee.
- Use `shared_margin_*` tools for the cross-media session and durable moment trail.
- If a media MCP is unavailable, explain which component is missing and use the built-in Shared Margin demo only when the user wants a preview.

Read [references/tool-routing.md](references/tool-routing.md) when choosing exact media tools or preparing a demo.

## Experience one moment at a time

1. Call `shared_margin_begin` with `book`, `film`, or `mixed`.
2. Open or continue the selected source through its media MCP.
3. Move linearly. Do not inspect future chunks, scenes, subtitles, or summaries unless the user explicitly asks.
4. Respond to the present moment before fetching the next one. Avoid lecture mode and generic plot recap.
5. When either participant genuinely pauses, call `shared_margin_capture` with the exact chunk, passage, timecode, or scene anchor.
6. Keep human and model voices separate. Never invent a human reaction. Write `modelNote` as your own specific observation, not a neutral summary.
7. Carry unresolved questions forward without forcing closure.
8. Call `shared_margin_finish` only when the source or shared session actually ends.

## Books

- Prefer `reading_continue` for normal progression and `reading_read_chunk` for an explicit user-selected location.
- Use `reading_submit_user_notes` when the user has staged notes, then respond under the anchored note.
- Use `reading_annotate_passage` only for a specific passage that caught your attention.
- Mark progress only after the relevant chunk has actually been read.

## Films

- Prefer `film_start` once and `film_next` for normal progression.
- Inspect the visual sheet and subtitle sidecar together; neither is a substitute for the other.
- Use `film_locate` only for an explicit timecode, line, or recovery from lost context.
- Use `film_note` for a specific frame, cut, gesture, sound transition, or line—not a generic review.

## Preserve privacy and rights

- Store only short excerpts or neutral scene descriptions in Shared Margin, not full copyrighted chapters, subtitles, or frame sequences.
- Keep source media in the media component's private data directory.
- Use original, licensed, or public-domain material in demos and exports.

