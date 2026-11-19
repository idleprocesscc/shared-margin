import { test, expect } from "@playwright/test";

const urls = () => JSON.parse(process.env.E2E_URLS);

test("co-watching playback advances, pauses, seeks and synchronizes subtitles", async ({ page, request }) => {
  const { pages, stream } = urls();
  await page.goto(`${pages}/harness/playback.html?stream=${encodeURIComponent(`${stream}/film-matinee`)}`);
  await page.getByRole("button", { name: "Play fixture" }).click();
  const video = page.locator("video");
  await expect(video).toBeVisible();
  await expect.poll(() => video.evaluate((el) => el.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => video.evaluate((el) => el.duration)).toBeCloseTo(8, 0);
  await expect.poll(() => video.evaluate((el) => el.currentTime)).toBeGreaterThan(0.5);
  await video.evaluate((el) => el.pause());
  await expect(page.getByRole("status")).toContainText("Paused");
  const movement = await video.evaluate((el) => new Promise((resolve) => {
    const time = el.currentTime;
    const start = performance.now();
    function sample(now) {
      if (now - start >= 500) resolve(Math.abs(el.currentTime - time));
      else requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  }));
  expect(movement).toBeLessThan(0.05);
  await video.evaluate((el) => { el.currentTime = 5; });
  await expect.poll(() => video.evaluate((el) => el.seeking)).toBe(false);
  await expect.poll(() => video.evaluate((el) => el.currentTime)).toBeCloseTo(5, 1);
  await expect(page.getByRole("status")).toHaveText("Paused at 5.00s");
  await page.screenshot({ path: test.info().outputPath("playback-seek.png") });
  const current = await video.evaluate((el) => el.currentTime);
  const sync = await request.get(`${stream}/film-matinee/sync/Fixture?from=${current - 0.2}&to=${current + 0.2}`);
  expect(sync.ok()).toBeTruthy();
  expect((await sync.json()).subtitles.map((cue) => cue.text)).toEqual(["Second fixture cue."]);
  const range = await request.get(`${stream}/film-matinee/stream/Fixture`, { headers: { Range: "bytes=0-31" } });
  expect(range.status()).toBe(206);
  expect(range.headers()["content-range"]).toMatch(/^bytes 0-31\//);
  expect((await range.body()).length).toBe(32);
  expect((await request.get(`${stream}/film-matinee/Missing/meta`)).status()).toBe(404);
});

test("co-watching sheet viewer navigates chunks and shares notes and replies", async ({ page }) => {
  const { pages, notes } = urls();
  await page.goto(`${pages}/film/film-matinee-viewer.html?notes=${encodeURIComponent(notes)}`);
  await expect(page.locator("#title")).toHaveText("Fixture");
  await expect(page.locator("#sheet")).toBeVisible();
  await expect.poll(() => page.locator("#sheet").evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator("#sidecar")).toContainText("First fixture cue.");
  const chunks = page.locator("#chunks button");
  await expect(chunks).toHaveCount(2);
  await chunks.nth(1).click();
  await expect(chunks.nth(1)).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#sidecar")).toContainText("Second fixture cue.");
  await chunks.nth(0).click();
  await expect(page.locator("#notes")).toHaveText("No notes");
  await page.locator("#note-timecode").fill("00:00:01");
  await page.locator("#note-text").fill("The colors keep us company.");
  await page.getByRole("button", { name: "Add note", exact: true }).click();
  const note = page.locator(".note").filter({ hasText: "The colors keep us company." });
  await expect(note).toBeVisible();
  await note.getByPlaceholder("reply", { exact: true }).fill("I noticed that rhythm too.");
  await note.getByRole("button", { name: "Reply", exact: true }).click();
  await expect(note.locator(".reply-text")).toHaveText("I noticed that rhythm too.");
  await page.getByRole("button", { name: "All Notes" }).click();
  await expect(page.locator(".note-text")).toHaveText("The colors keep us company.");
});

test("co-reading reader opens text and annotations and advances reading progress", async ({ page }) => {
  await page.goto(urls().reader);
  await page.locator("#books").getByText("The Anthropic Guidelines", { exact: true }).click();
  const chapters = page.locator("#chunks button");
  await chapters.first().click();
  await expect(page.locator("#text")).toContainText("Claude is trained by Anthropic");
  await expect(page.locator("#margins")).not.toBeEmpty();
  await expect(page.locator("#margins .note-card").first()).toBeVisible();
  await expect(page.locator("#margins")).toContainText("This demo margin note is anchored to the opening section.");
  await page.screenshot({ path: test.info().outputPath("reader-with-notes.png") });
  await chapters.nth(1).click();
  await expect(page.locator("#chunk-file")).toHaveText("ch01");
  await page.getByRole("button", { name: "Mark read", exact: true }).click();
  await expect(chapters.nth(1).locator(".chunk-meta")).toContainText("ch01 · read ·");
  await expect(page.locator("#books .book-meta")).toContainText("2/48");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("#chunk-file")).toHaveText("ch02");
  await expect(page.locator("#text")).not.toBeEmpty();
});

test("shared trail displays seeded book and film moments with distinct voices", async ({ page }) => {
  await page.goto(urls().trail);
  await expect(page.getByRole("heading", { name: "The evening we shared two kinds of silence" })).toBeVisible();
  await expect(page.locator(".session-meta")).toHaveText("active · 2 moments");
  const book = page.locator('.moment[data-kind="book"]');
  const film = page.locator('.moment[data-kind="film"]');
  await expect(book).toContainText("The House That Kept the Light");
  await expect(film).toContainText("Before the Train Forgets Us");
  for (const card of [book, film]) {
    await expect(card.locator(".voice")).toHaveCount(2);
    await expect(card.locator(".voice").nth(0)).toContainText("Human");
    await expect(card.locator(".voice").nth(1)).toContainText("GPT-5.6");
    await expect(card.locator(".question")).toBeVisible();
  }
  await expect(book).toContainText("I thought the light was comforting");
  await expect(film).toContainText("The edit performs the abandonment");
});
