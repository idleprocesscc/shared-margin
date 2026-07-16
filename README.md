# Shared Margin

> Books have margins. Films have pauses. This is where human and GPT-5.6 attention meet.

Shared Margin is a Codex-native room for reading books and watching films together one moment at a time. Instead of turning a novel or movie into a one-shot summary, a human and GPT-5.6 move through it linearly, pause at exact passages or scenes, exchange distinct observations, and keep a durable trail of the moments that changed the experience.

## What it does

- routes book sessions through [Co-Reading MCP](https://github.com/idleprocesscc/co-reading-mcp)
- routes film sessions through [Film Matinee](https://github.com/idleprocesscc/film-matinee)
- gives Codex a spoiler-safe shared-attention workflow through `$shared-margin`
- records anchored human notes, GPT-5.6 observations, and unresolved questions without blending their voices
- joins book and film moments into one quiet, visual trail
- exports a session as readable Markdown

## Quick start

Requirements:

- Codex with GPT-5.6 selected
- Node.js 18+
- Python 3.10+ and `ffmpeg` for Film Matinee generation

```bash
git clone --recurse-submodules https://github.com/idleprocesscc/shared-margin.git
cd shared-margin
./scripts/setup.sh
npm run smoke
```

Install the repository as a local Codex plugin, then start with:

```text
Use $shared-margin to open a book or film and experience it with me one moment at a time.
```

To preview the combined trail without importing media:

```bash
npm run demo
# open http://127.0.0.1:8794
```

Runtime data defaults to `~/.shared-margin`. Override it with `SHARED_MARGIN_DATA_DIR`.

## Architecture

```text
                       ┌─ Co-Reading MCP ── book chunks + margins
Human ↔ GPT-5.6/Codex ─┤
                       └─ Film Matinee ──── visual sheets + subtitles
                                  │
                          Shared Margin MCP
                                  │
                    anchored cross-media moment trail
                                  │
                         local viewer + export
```

The media components retain their own progress and annotations. Shared Margin adds the common session vocabulary—source, anchor, two distinct voices, an open question—and a place where moments from different media can sit beside each other.

## Early user signal

The two original Xiaohongshu project posts reached 8,273 combined views, 1,081 likes, 1,184 saves, and 133 comments. More importantly, one commenter described watching through Film Matinee with her own Claude, said the shared experience moved her deeply, and reported using it intensely enough to exhaust two sessions in about 40 minutes. Shared Margin turns that accidental proof—people want to experience media *with* an AI, not merely ask it for a summary—into one deliberate Codex workflow.

## MCP tools

- `shared_margin_begin`
- `shared_margin_capture`
- `shared_margin_trail`
- `shared_margin_finish`
- `shared_margin_export`

The plugin also exposes the tools from Co-Reading MCP and Film Matinee when the included components are installed.

## OpenAI Build Week 2026

Shared Margin was created during the July 13–21, 2026 submission period with Codex and GPT-5.6.

### Pre-existing, disclosed components

- `co-reading-mcp`: book import, chunk reading, durable progress, passage annotations, and shared-margin cards
- `film-matinee`: visual film sheets, subtitle sidecars, linear film reading, and time-anchored notes

### New during Build Week

- the unified Shared Margin concept and Codex plugin
- the `$shared-margin` spoiler-safe cross-media workflow
- the zero-dependency Shared Margin MCP server and data model
- durable mixed-media session trails and Markdown export
- the combined local viewer and original judge demo
- integration, validation, and submission documentation

The repository history and primary Codex `/feedback` Session ID provide timestamped evidence for the new work. Judges can run the original demo without copyrighted books, subtitles, music, or film frames.

## Privacy and rights

Shared Margin is local-first. Source books and films remain in their component data directories; the unified trail keeps only short excerpts or neutral scene descriptions. The bundled demo is original. Do not publish copyrighted chapters, subtitles, frame sequences, or music in a submission video without permission.

## License

Shared Margin is MIT licensed. The two included components remain under their own MIT licenses and histories.
