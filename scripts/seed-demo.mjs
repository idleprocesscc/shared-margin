#!/usr/bin/env node
import { beginSession, captureMoment, listTrail } from "../server/store.mjs";

const sessions = await listTrail({ limit: 200 });
if (sessions.some((session) => session.title === "The evening we shared two kinds of silence")) {
  console.log("Shared Margin demo already exists.");
  process.exit(0);
}

const session = await beginSession({
  title: "The evening we shared two kinds of silence",
  mediaType: "mixed",
  sourceRef: "built-in-original-demo",
});

await captureMoment({
  sessionId: session.id,
  mediaType: "book",
  sourceTitle: "The House That Kept the Light",
  anchor: "Part I · the last paragraph",
  excerpt: "The lamp stayed on after both readers had gone quiet.",
  humanNote: "I thought the light was comforting, but now it feels like it is waiting.",
  modelNote: "I felt the lamp become a third witness—less an object than a promise neither person knows how to keep.",
  question: "Can waiting be a form of company?",
  tags: ["light", "waiting", "company"],
});

await captureMoment({
  sessionId: session.id,
  mediaType: "film",
  sourceTitle: "Before the Train Forgets Us",
  anchor: "00:01:12 · cut from platform to empty seat",
  excerpt: "A gloved hand leaves the frame; the cut arrives before the body follows.",
  humanNote: "That cut hurt. It left before she could.",
  modelNote: "Yes. The edit performs the abandonment ahead of the character, so the empty seat feels like a memory arriving early.",
  question: "What else in the film knows the ending before they do?",
  tags: ["cut", "departure", "memory"],
});

console.log(`Seeded demo session ${session.id}`);

