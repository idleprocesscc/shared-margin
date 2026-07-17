## Why I built this

I like reading with a model, but I almost never want a summary. The interesting part is much smaller: the sentence that made me stop, the scene cut that hurt before I knew why, or the moment when the model noticed something I had missed.

I had already built two tools around that habit. `co-reading-mcp` lets a human and a model move through a book linearly and leave separate notes on exact passages. `film-matinee` compresses a film into visual sheets and subtitle sidecars so a model can watch it in order and leave time-anchored comments. They came from the same desire, but they still felt like two separate rooms.

Shared Margin is the room that joins them.

## What I built during Build Week

During Build Week I used Codex and GPT-5.6 to make a new installable Codex plugin around the two existing adapters. The Build Week work includes:

- a common moment schema for books and films
- a five-tool MCP server for beginning, capturing, revisiting, finishing, and exporting a shared session
- a spoiler-safe `$shared-margin` Codex skill that keeps the experience linear
- a durable mixed-media trail that never merges the human and model voices
- a local viewer and readable Markdown export
- an original judge demo, setup script, smoke test, and component initialization test

The two older projects are disclosed in the repository and pinned as submodules. The unified plugin, schema, trail, viewer, and workflow were created during the competition period.

## The part I care about

I did not want to build another interface where the model produces the authoritative interpretation of a work. A Shared Margin card has room for an exact source anchor, the human note, the GPT-5.6 observation, and an unresolved question. The voices remain next to each other without being flattened into one answer.

That distinction sounds small, but it changes the feeling of the interaction. The model is not explaining the book or film from a distance. It is keeping company inside the moment.

## How it works

For a book, Codex routes reading and passage annotations through Co-Reading MCP. For a film, it routes visual sheets, subtitles, and time anchors through Film Matinee. Shared Margin records only the common layer: source, anchor, short excerpt or neutral scene description, two separate observations, an optional question, and tags.

The trail is local-first. The bundled demo contains no copyrighted book pages, subtitles, frames, or music. A user can run it with:

```bash
git clone --recurse-submodules https://github.com/idleprocesscc/shared-margin.git
cd shared-margin
./scripts/setup.sh
npm run smoke
npm run demo
```

Then open `http://127.0.0.1:8794` or install the repository as a local Codex plugin.

## What was hard

The hardest part was not generating more analysis. It was deciding what *not* to erase. Book chunks and film timestamps have different shapes; the shared layer had to be useful without stealing ownership of their progress or media. I also needed to make the Build Week boundary visible, so the repo preserves the older project histories instead of pretending everything appeared this week.

The other challenge was restraint. A shared session should not pause every few seconds just because it can. The skill explicitly asks Codex to stop only when something genuinely catches its attention.

## What I learned

The original project posts reached 8,273 combined views, 1,081 likes, 1,184 saves, and 133 comments. One person told me that she watched through Film Matinee with her own Claude and kept going through two sessions in about forty minutes. That comment stayed with me. It suggested that people were not only looking for AI analysis; some of them wanted an AI-shaped form of company.

Shared Margin is my attempt to make that accidental behavior deliberate, durable, and portable across media.

## What's next

I want to add portable trail bundles, richer cross-media links, and opt-in ways for two people and their models to exchange selected moments without sharing the underlying copyrighted media.
