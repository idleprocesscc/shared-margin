import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const mounts = {
  "/harness/": path.join(root, "tests/e2e"),
  "/film/": path.join(root, "components/film-matinee/examples/frontend"),
};
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
http.createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const mount = Object.keys(mounts).find((prefix) => pathname.startsWith(prefix));
  if (!mount) { res.writeHead(404).end(); return; }
  const target = path.resolve(mounts[mount], decodeURIComponent(pathname.slice(mount.length)));
  if (!target.startsWith(`${mounts[mount]}${path.sep}`)) { res.writeHead(403).end(); return; }
  try {
    const body = await fs.readFile(target);
    res.writeHead(200, { "content-type": types[path.extname(target)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(Number(process.argv[2]), "127.0.0.1");
