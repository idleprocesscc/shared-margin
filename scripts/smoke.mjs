#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "shared-margin-smoke-"));
process.env.SHARED_MARGIN_DATA_DIR = temporary;

const { beginSession, captureMoment, exportSession, finishSession, listTrail } = await import("../server/store.mjs");
const { handle } = await import("../server/index.mjs");

const session = await beginSession({ title: "The Shared Evening", mediaType: "mixed" });
assert.equal(session.status, "active");

await captureMoment({
  sessionId: session.id,
  mediaType: "book",
  sourceTitle: "An Original Little Story",
  anchor: "chapter 1",
  excerpt: "The lamp stayed on after both readers had gone quiet.",
  humanNote: "This feels lonelier than it first appears.",
  modelNote: "I noticed the lamp acting like a third witness.",
  question: "Who is the light really waiting for?",
  tags: ["light", "waiting"],
});

await captureMoment({
  sessionId: session.id,
  mediaType: "film",
  sourceTitle: "A Tiny Film",
  anchor: "00:01:12",
  modelNote: "The cut arrives before the character is ready to leave.",
});

const trail = await listTrail({ sessionId: session.id });
assert.equal(trail.moments.length, 2);
assert.equal(trail.moments[1].mediaType, "film");

const exported = await exportSession({ sessionId: session.id });
assert.match(await fs.readFile(exported.outputPath, "utf8"), /GPT-5\.6/);

const closed = await finishSession({ sessionId: session.id, closingNote: "We left with one question still open." });
assert.equal(closed.status, "closed");

const initialized = await handle({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
assert.equal(initialized.result.serverInfo.name, "shared-margin");

console.log(`shared-margin smoke passed (${temporary})`);

