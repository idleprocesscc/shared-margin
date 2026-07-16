import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const dataDir = process.env.SHARED_MARGIN_DATA_DIR
  ? path.resolve(process.env.SHARED_MARGIN_DATA_DIR)
  : path.join(os.homedir(), ".shared-margin");

const storePath = path.join(dataDir, "trail.json");
let writeChain = Promise.resolve();

function cleanText(value, max = 8000) {
  if (value == null) return "";
  return String(value).trim().slice(0, max);
}

function cleanTags(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => cleanText(item, 64)).filter(Boolean))].slice(0, 12);
}

function emptyStore() {
  return { version: 1, sessions: [] };
}

async function readStore() {
  try {
    return JSON.parse(await fs.readFile(storePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return emptyStore();
    throw error;
  }
}

async function writeStore(value) {
  await fs.mkdir(dataDir, { recursive: true });
  const temporary = `${storePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(temporary, storePath);
}

function mutate(mutator) {
  const operation = writeChain.then(async () => {
    const store = await readStore();
    const result = await mutator(store);
    await writeStore(store);
    return result;
  });
  writeChain = operation.catch(() => {});
  return operation;
}

function requireSession(store, sessionId) {
  const session = store.sessions.find((item) => item.id === sessionId);
  if (!session) throw new Error(`Unknown shared-margin session: ${sessionId}`);
  return session;
}

export async function beginSession({ title, mediaType = "mixed", sourceRef = "" } = {}) {
  const normalizedType = cleanText(mediaType, 16).toLowerCase();
  if (!['book', 'film', 'mixed'].includes(normalizedType)) {
    throw new Error("mediaType must be book, film, or mixed");
  }
  const normalizedTitle = cleanText(title, 240);
  if (!normalizedTitle) throw new Error("title is required");

  return mutate((store) => {
    const now = new Date().toISOString();
    const session = {
      id: crypto.randomUUID(),
      title: normalizedTitle,
      mediaType: normalizedType,
      sourceRef: cleanText(sourceRef, 2000),
      status: "active",
      startedAt: now,
      updatedAt: now,
      closedAt: null,
      closingNote: "",
      moments: [],
    };
    store.sessions.unshift(session);
    return session;
  });
}

export async function captureMoment({
  sessionId,
  mediaType,
  sourceTitle,
  anchor,
  excerpt = "",
  humanNote = "",
  modelNote = "",
  question = "",
  tags = [],
} = {}) {
  if (!cleanText(sessionId, 128)) throw new Error("sessionId is required");
  const normalizedType = cleanText(mediaType, 16).toLowerCase();
  if (!['book', 'film'].includes(normalizedType)) throw new Error("mediaType must be book or film");
  const normalizedAnchor = cleanText(anchor, 240);
  if (!normalizedAnchor) throw new Error("anchor is required");
  if (![humanNote, modelNote, question].some((value) => cleanText(value))) {
    throw new Error("At least one of humanNote, modelNote, or question is required");
  }

  return mutate((store) => {
    const session = requireSession(store, cleanText(sessionId, 128));
    if (session.status !== "active") throw new Error("Cannot add a moment to a closed session");
    const now = new Date().toISOString();
    const moment = {
      id: crypto.randomUUID(),
      mediaType: normalizedType,
      sourceTitle: cleanText(sourceTitle, 240) || session.title,
      anchor: normalizedAnchor,
      excerpt: cleanText(excerpt, 4000),
      humanNote: cleanText(humanNote, 8000),
      modelNote: cleanText(modelNote, 8000),
      question: cleanText(question, 2000),
      tags: cleanTags(tags),
      createdAt: now,
    };
    session.moments.push(moment);
    session.updatedAt = now;
    return moment;
  });
}

export async function listTrail({ sessionId = "", limit = 50 } = {}) {
  const store = await readStore();
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || 50, 200));
  if (sessionId) {
    const session = requireSession(store, cleanText(sessionId, 128));
    return { ...session, moments: session.moments.slice(-normalizedLimit) };
  }
  return store.sessions.slice(0, normalizedLimit).map((session) => ({
    id: session.id,
    title: session.title,
    mediaType: session.mediaType,
    status: session.status,
    momentCount: session.moments.length,
    startedAt: session.startedAt,
    updatedAt: session.updatedAt,
  }));
}

export async function finishSession({ sessionId, closingNote = "" } = {}) {
  if (!cleanText(sessionId, 128)) throw new Error("sessionId is required");
  return mutate((store) => {
    const session = requireSession(store, cleanText(sessionId, 128));
    const now = new Date().toISOString();
    session.status = "closed";
    session.closingNote = cleanText(closingNote, 12000);
    session.closedAt = now;
    session.updatedAt = now;
    return session;
  });
}

function markdownForSession(session) {
  const lines = [
    `# ${session.title}`,
    "",
    `- Mode: ${session.mediaType}`,
    `- Started: ${session.startedAt}`,
    `- Status: ${session.status}`,
    "",
  ];
  for (const [index, moment] of session.moments.entries()) {
    lines.push(`## ${index + 1}. ${moment.sourceTitle} — ${moment.anchor}`, "");
    if (moment.excerpt) lines.push(`> ${moment.excerpt.replaceAll("\n", "\n> ")}`, "");
    if (moment.humanNote) lines.push(`**Human:** ${moment.humanNote}`, "");
    if (moment.modelNote) lines.push(`**GPT-5.6:** ${moment.modelNote}`, "");
    if (moment.question) lines.push(`**Still wondering:** ${moment.question}`, "");
    if (moment.tags.length) lines.push(`Tags: ${moment.tags.map((tag) => `\`${tag}\``).join(" ")}`, "");
  }
  if (session.closingNote) lines.push("## Closing note", "", session.closingNote, "");
  return `${lines.join("\n").trim()}\n`;
}

export async function exportSession({ sessionId, outputDir = "" } = {}) {
  const store = await readStore();
  const session = requireSession(store, cleanText(sessionId, 128));
  const targetDir = outputDir ? path.resolve(outputDir) : path.join(dataDir, "exports");
  await fs.mkdir(targetDir, { recursive: true });
  const safeTitle = session.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shared-margin";
  const outputPath = path.join(targetDir, `${safeTitle}-${session.id.slice(0, 8)}.md`);
  await fs.writeFile(outputPath, markdownForSession(session), "utf8");
  return { sessionId: session.id, outputPath, momentCount: session.moments.length };
}

export async function rawStore() {
  return readStore();
}

