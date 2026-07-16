#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const servers = [
  {
    name: "shared-margin",
    command: process.execPath,
    args: [path.join(root, "server/index.mjs")],
  },
  {
    name: "co-reading-mcp",
    command: process.execPath,
    args: [path.join(root, "components/co-reading-mcp/src/server.js")],
  },
  {
    name: "film-matinee",
    command: path.join(root, ".venv/bin/python3"),
    args: [path.join(root, "components/film-matinee/tools/film_matinee_reader_mcp.py")],
  },
];

function initialize(server) {
  return new Promise((resolve, reject) => {
    const child = spawn(server.command, server.args, {
      cwd: root,
      env: {
        ...process.env,
        SHARED_MARGIN_DATA_DIR: path.join(root, ".check-data"),
        READING_MCP_DATA_DIR: path.join(root, ".check-reading"),
      },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let output = "";
    let errors = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`${server.name} did not initialize within 8 seconds\n${errors}`));
    }, 8000);
    child.stderr.on("data", (chunk) => { errors += chunk; });
    child.stdout.on("data", (chunk) => {
      output += chunk;
      const lineEnd = output.indexOf("\n");
      if (lineEnd < 0) return;
      clearTimeout(timer);
      child.kill();
      try {
        const response = JSON.parse(output.slice(0, lineEnd));
        const actual = response.result?.serverInfo?.name;
        if (!actual) throw new Error(`missing serverInfo: ${output.slice(0, lineEnd)}`);
        resolve(actual);
      } catch (error) {
        reject(error);
      }
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.stdin.write(`${JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "shared-margin-check", version: "0.1.0" },
      },
    })}\n`);
  });
}

for (const server of servers) {
  const actual = await initialize(server);
  console.log(`${server.name}: ready (${actual})`);
}

