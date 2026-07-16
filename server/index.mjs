#!/usr/bin/env node
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import {
  beginSession,
  captureMoment,
  dataDir,
  exportSession,
  finishSession,
  listTrail,
} from "./store.mjs";

const protocolVersion = "2025-03-26";

export const tools = [
  {
    name: "shared_margin_begin",
    description: "Start a durable co-reading, co-viewing, or mixed shared-attention session.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string", description: "Human-readable session title." },
        mediaType: { type: "string", enum: ["book", "film", "mixed"], default: "mixed" },
        sourceRef: { type: "string", description: "Optional book ID, manifest path, or source URL." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "shared_margin_capture",
    description: "Save one anchored moment where the human or GPT-5.6 paused, noticed, responded, or kept wondering.",
    inputSchema: {
      type: "object",
      required: ["sessionId", "mediaType", "anchor"],
      properties: {
        sessionId: { type: "string" },
        mediaType: { type: "string", enum: ["book", "film"] },
        sourceTitle: { type: "string" },
        anchor: { type: "string", description: "Chunk ID, page/section label, timecode, or scene label." },
        excerpt: { type: "string", description: "Short quoted text or neutral scene description." },
        humanNote: { type: "string" },
        modelNote: { type: "string", description: "GPT-5.6's own observation, not a generic summary." },
        question: { type: "string", description: "An unresolved question worth carrying forward." },
        tags: { type: "array", items: { type: "string" } },
      },
      additionalProperties: false,
    },
  },
  {
    name: "shared_margin_trail",
    description: "List shared-attention sessions or read the recent moments from one session.",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 200, default: 50 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "shared_margin_finish",
    description: "Close a shared-attention session while preserving its moments and an optional final reflection.",
    inputSchema: {
      type: "object",
      required: ["sessionId"],
      properties: {
        sessionId: { type: "string" },
        closingNote: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "shared_margin_export",
    description: "Export one session as readable Markdown for sharing or archiving.",
    inputSchema: {
      type: "object",
      required: ["sessionId"],
      properties: {
        sessionId: { type: "string" },
        outputDir: { type: "string" },
      },
      additionalProperties: false,
    },
  },
];

function rpcResult(id, value) {
  return { jsonrpc: "2.0", id, result: value };
}

function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function textContent(value) {
  return {
    content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
  };
}

export async function callTool(name, args = {}) {
  switch (name) {
    case "shared_margin_begin":
      return textContent(await beginSession(args));
    case "shared_margin_capture":
      return textContent(await captureMoment(args));
    case "shared_margin_trail":
      return textContent(await listTrail(args));
    case "shared_margin_finish":
      return textContent(await finishSession(args));
    case "shared_margin_export":
      return textContent(await exportSession(args));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export async function handle(message) {
  if (!message || message.jsonrpc !== "2.0") return null;
  if (message.method === "initialize") {
    return rpcResult(message.id, {
      protocolVersion,
      serverInfo: { name: "shared-margin", version: "0.1.0" },
      capabilities: { tools: {} },
      instructions:
        "Keep a durable trail of moments from books and films. Move through the source linearly, preserve anchors, and capture only moments where the human or model actually noticed something. Do not replace the experience with a one-shot summary. " +
        `Data directory: ${dataDir}`,
    });
  }
  if (message.method === "notifications/initialized") return null;
  if (message.method === "tools/list") return rpcResult(message.id, { tools });
  if (message.method === "tools/call") {
    const { name, arguments: args } = message.params || {};
    return rpcResult(message.id, await callTool(name, args || {}));
  }
  return rpcError(message.id, -32601, `Method not found: ${message.method}`);
}

export function startStdioServer({ input = process.stdin, output = process.stdout } = {}) {
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  lines.on("line", async (line) => {
    if (!line.trim()) return;
    let id = null;
    try {
      const message = JSON.parse(line);
      id = message.id ?? null;
      const response = await handle(message);
      if (response) output.write(`${JSON.stringify(response)}\n`);
    } catch (error) {
      output.write(`${JSON.stringify(rpcError(id, -32000, error.message || String(error)))}\n`);
    }
  });
  return lines;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) startStdioServer();

