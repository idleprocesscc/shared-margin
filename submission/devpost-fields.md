# Devpost field notes

- Project name: `Shared Margin`
- Elevator pitch: `A Codex-native shared-attention trail for reading books and watching films together, one anchored moment at a time.`
- Category: `Apps for Your Life`
- Submitter type: `Individual`
- Country: `United States`
- Repository: `https://github.com/idleprocesscc/shared-margin`
- Primary Codex session ID: `019f69d0-7f0d-7b12-87c8-dc765cc2316c`

## Built with

- Codex
- GPT-5.6
- Model Context Protocol
- Node.js
- Python
- JavaScript
- HTML
- CSS
- ffmpeg

## Try it out

`https://github.com/idleprocesscc/shared-margin`

## Judge testing instructions

No credentials are required. Clone with submodules, run `./scripts/setup.sh`, then `npm run smoke` and `npm run check:components`. Run `npm run demo` and open `http://127.0.0.1:8794` to view the original mixed book-and-film trail. The demo uses no copyrighted source media.

## Plugin installation instructions

Supported on macOS and Linux with Node.js 18+; Python 3.10+ and ffmpeg are needed for Film Matinee generation. Clone with `--recurse-submodules`, run `./scripts/setup.sh`, and install the repository as a local Codex plugin. Start a session with: `Use $shared-margin to open a book or film and experience it with me one moment at a time.`
