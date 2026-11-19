import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout } from "node:timers/promises";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const python = path.join(root, ".venv/bin/python3");

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => server.once("error", reject).listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

export default async function globalSetup() {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "shared-margin-e2e-"));
  const children = [];
  const env = {
    ...process.env,
    PYTHONDONTWRITEBYTECODE: "1",
    SHARED_MARGIN_DATA_DIR: path.join(temporary, "trail"),
    READING_MCP_DATA_DIR: path.join(temporary, "reading"),
    READING_HTTP_STDIO: "0",
  };
  const run = (command, args) => execFileSync(command, args, {
    cwd: root, env, encoding: "utf8", timeout: 120_000,
  });
  async function stop() {
    await Promise.all(children.map(async (child) => {
      if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill("SIGTERM");
      const timer = setTimeout(3000).then(() => {
        if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
      });
      await Promise.race([exited, timer]);
      await exited;
    }));
    await fs.rm(temporary, { recursive: true, force: true });
  }
  async function start(command, args, port, route, extraEnv = {}) {
    let output = "";
    let failure;
    const child = spawn(command, args, { cwd: root, env: { ...env, ...extraEnv }, stdio: ["ignore", "pipe", "pipe"] });
    children.push(child);
    child.on("error", (error) => { failure = error; });
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    const base = `http://127.0.0.1:${port}`;
    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline) {
      if (failure || child.exitCode !== null) break;
      try {
        const response = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(1000) });
        if (response.ok) return base;
      } catch {}
      await setTimeout(100);
    }
    throw new Error(`Could not start ${command} ${args.join(" ")}: ${failure || ""}\n${output}`);
  }
  try {
    await fs.access(python);
    const media = path.join(temporary, "media");
    const film = path.join(media, "Fixture");
    const generated = path.join(temporary, "generated");
    await fs.mkdir(film, { recursive: true });
    const video = path.join(film, "fixture.mp4");
    const subtitle = path.join(film, "fixture.srt");
    run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "testsrc2=size=320x180:rate=24", "-f", "lavfi", "-i", "sine=frequency=440", "-t", "8", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", video]);
    await fs.writeFile(subtitle, "1\n00:00:00,000 --> 00:00:03,000\nFirst fixture cue.\n\n2\n00:00:03,000 --> 00:00:07,500\nSecond fixture cue.\n");
    run(python, ["components/film-matinee/tools/generate_film_matinee_sheets.py", "--video", video, "--subtitle", subtitle, "--title", "Fixture", "--out-dir", generated, "--max-sheets", "0", "--min-sheet-sec", "4", "--max-sheet-sec", "4", "--allow-small-video"]);
    await fs.cp(path.join(root, "components/co-reading-mcp/data.example"), env.READING_MCP_DATA_DIR, { recursive: true });
    run(process.execPath, ["scripts/seed-demo.mjs"]);
    const staticPort = await freePort();
    const pages = await start(process.execPath, ["tests/e2e/static-server.js", String(staticPort)], staticPort, "/harness/playback.html");
    const streamPort = await freePort();
    const stream = await start(python, ["components/film-matinee/server.py", "--port", String(streamPort), "--root", media, "--allow-origin", pages], streamPort, "/film-matinee/list");
    const notesPort = await freePort();
    const notes = await start(python, ["components/film-matinee/tools/film_matinee_notes_server.py", "--port", String(notesPort), "--manifest", path.join(generated, "manifest.json")], notesPort, "/manifest");
    const readerPort = await freePort();
    const reader = await start(process.execPath, ["components/co-reading-mcp/src/http.js"], readerPort, "/api/books", { READING_HTTP_PORT: String(readerPort) });
    const trailPort = await freePort();
    const trail = await start(process.execPath, ["scripts/viewer.mjs"], trailPort, "/api/trail", { SHARED_MARGIN_PORT: String(trailPort) });
    process.env.E2E_URLS = JSON.stringify({ pages, stream, notes, reader, trail });
    return stop;
  } catch (error) {
    await stop();
    throw error;
  }
}
