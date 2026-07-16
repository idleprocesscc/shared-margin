# Tool routing

## Shared session

| Intent | Tool |
|---|---|
| Start a book, film, or mixed session | `shared_margin_begin` |
| Save one anchored pause | `shared_margin_capture` |
| Revisit sessions or moments | `shared_margin_trail` |
| Close the experience | `shared_margin_finish` |
| Export a readable trail | `shared_margin_export` |

## Book component

Repository: `components/co-reading-mcp`

- Discover: `reading_list_books`, `reading_list_chunks`
- Progress linearly: `reading_continue`, `reading_read_chunk`
- Human margin: `reading_submit_user_notes`, `reading_reply_to_annotation`
- Model margin: `reading_annotate_passage`
- Finish/progress: `reading_mark_read`, `reading_get_progress`

## Film component

Repository: `components/film-matinee`

- Prepare: `film_generate`, `film_generate_status`
- Discover: `film_overview`
- Progress linearly: `film_start`, `film_next`
- Recover explicit context: `film_chunk`, `film_locate`
- Share a margin: `film_note`, `film_reply`, `film_notes`

## Judge demo

1. Run `npm run smoke`.
2. Run `npm run demo` and open `http://127.0.0.1:8794`.
3. In Codex with GPT-5.6 selected, invoke `$shared-margin` and open the bundled original sample.
4. Show one book moment, one film moment, and the combined trail.
5. Explain that the media adapters predate Build Week while the unified Codex plugin, durable trail, and viewer were created during the submission period.

