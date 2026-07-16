const root = document.querySelector("#sessions");
const emptyTemplate = document.querySelector("#empty-template");

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  }[character]));
}

function momentCard(moment) {
  return `
    <article class="moment" data-kind="${escapeHtml(moment.mediaType)}">
      <div class="kind">${escapeHtml(moment.mediaType)}</div>
      <h3 class="anchor">${escapeHtml(moment.sourceTitle)}<br>${escapeHtml(moment.anchor)}</h3>
      ${moment.excerpt ? `<blockquote>“${escapeHtml(moment.excerpt)}”</blockquote>` : ""}
      ${moment.humanNote ? `<div class="voice"><b>Human</b>${escapeHtml(moment.humanNote)}</div>` : ""}
      ${moment.modelNote ? `<div class="voice"><b>GPT-5.6</b>${escapeHtml(moment.modelNote)}</div>` : ""}
      ${moment.question ? `<div class="question">${escapeHtml(moment.question)}</div>` : ""}
    </article>`;
}

function render(store) {
  if (!store.sessions?.length) {
    root.replaceChildren(emptyTemplate.content.cloneNode(true));
    return;
  }
  root.innerHTML = store.sessions.map((session) => `
    <section class="session">
      <div class="session-head">
        <h2>${escapeHtml(session.title)}</h2>
        <div class="session-meta">${escapeHtml(session.status)} · ${session.moments.length} moments</div>
      </div>
      <div class="moments">${session.moments.map(momentCard).join("")}</div>
    </section>`).join("");
}

async function refresh() {
  const response = await fetch("/api/trail", { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load trail (${response.status})`);
  render(await response.json());
}

refresh().catch((error) => {
  root.innerHTML = `<article class="empty"><h2>Could not open the margin</h2><p>${escapeHtml(error.message)}</p></article>`;
});
setInterval(() => refresh().catch(() => {}), 3000);

