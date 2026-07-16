#!/usr/bin/env node
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dataDir, rawStore } from "../server/store.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const port = Number(process.env.SHARED_MARGIN_PORT || 8794);
const host = process.env.SHARED_MARGIN_HOST || "127.0.0.1";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.url === "/api/trail") {
      response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      response.end(JSON.stringify(await rawStore()));
      return;
    }
    const pathname = request.url === "/" ? "/index.html" : new URL(request.url, `http://${host}:${port}`).pathname;
    const target = path.resolve(publicDir, `.${pathname}`);
    if (!target.startsWith(`${publicDir}${path.sep}`)) throw new Error("invalid path");
    const body = await fs.readFile(target);
    response.writeHead(200, { "content-type": contentTypes[path.extname(target)] || "application/octet-stream" });
    response.end(body);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error.code === "ENOENT" ? "Not found" : error.message);
  }
});

server.listen(port, host, () => {
  console.log(`Shared Margin viewer: http://${host}:${port}`);
  console.log(`Data: ${dataDir}`);
});

