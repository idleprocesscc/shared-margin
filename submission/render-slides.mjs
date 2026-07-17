#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, "assets");
const output = path.join(here, "output");

await fs.mkdir(assets, { recursive: true });
await fs.mkdir(output, { recursive: true });

const palette = {
  paper: "#f3eee5",
  ink: "#1f211d",
  muted: "#67675f",
  line: "#cfc7ba",
  book: "#9f4f3f",
  film: "#315f68",
  white: "#fffdf8",
};

function base(content, eyebrow = "HUMAN × GPT-5.6") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <radialGradient id="glow" cx="14%" cy="8%" r="80%">
      <stop offset="0" stop-color="#fff" stop-opacity=".92"/>
      <stop offset="1" stop-color="${palette.paper}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="rule" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M80 0V80" stroke="#4a4030" stroke-opacity=".035"/>
    </pattern>
  </defs>
  <rect width="1280" height="720" fill="${palette.paper}"/>
  <rect width="1280" height="720" fill="url(#glow)"/>
  <rect width="1280" height="720" fill="url(#rule)"/>
  <text x="70" y="66" fill="${palette.muted}" font-family="SFMono-Regular,Menlo,monospace" font-size="17" font-weight="700" letter-spacing="4">${eyebrow}</text>
  ${content}
  <text x="1210" y="676" text-anchor="end" fill="${palette.muted}" font-family="SFMono-Regular,Menlo,monospace" font-size="14">OPENAI BUILD WEEK 2026</text>
</svg>`;
}

const slides = [
  {
    file: "slide-01-cover.svg",
    svg: base(`
      <text x="66" y="258" fill="${palette.ink}" font-family="Georgia,serif" font-size="132" letter-spacing="-7">Shared Margin</text>
      <text x="72" y="334" fill="${palette.muted}" font-family="Georgia,serif" font-size="33">Books have margins. Films have pauses.</text>
      <text x="72" y="382" fill="${palette.muted}" font-family="Georgia,serif" font-size="33">This is where two kinds of attention meet.</text>
      <rect x="72" y="492" width="190" height="8" fill="${palette.book}"/>
      <text x="72" y="542" fill="${palette.book}" font-family="SFMono-Regular,Menlo,monospace" font-size="19" font-weight="700" letter-spacing="3">BOOK</text>
      <rect x="302" y="492" width="190" height="8" fill="${palette.film}"/>
      <text x="302" y="542" fill="${palette.film}" font-family="SFMono-Regular,Menlo,monospace" font-size="19" font-weight="700" letter-spacing="3">FILM</text>
    `),
  },
  {
    file: "slide-02-problem.svg",
    svg: base(`
      <text x="70" y="190" fill="${palette.ink}" font-family="Georgia,serif" font-size="66" letter-spacing="-2">A summary is the least</text>
      <text x="70" y="266" fill="${palette.ink}" font-family="Georgia,serif" font-size="66" letter-spacing="-2">interesting part.</text>
      <rect x="70" y="346" width="540" height="230" rx="2" fill="${palette.white}" stroke="${palette.line}"/>
      <rect x="70" y="346" width="7" height="230" fill="${palette.book}"/>
      <text x="105" y="396" fill="${palette.book}" font-family="SFMono-Regular,Menlo,monospace" font-size="16" font-weight="700" letter-spacing="3">PASSAGE</text>
      <text x="105" y="448" fill="${palette.ink}" font-family="Georgia,serif" font-size="29">What caught your attention?</text>
      <text x="105" y="500" fill="${palette.muted}" font-family="Georgia,serif" font-size="23">Keep the exact line, both voices,</text>
      <text x="105" y="535" fill="${palette.muted}" font-family="Georgia,serif" font-size="23">and the question that stayed open.</text>
      <rect x="650" y="346" width="560" height="230" rx="2" fill="${palette.white}" stroke="${palette.line}"/>
      <rect x="650" y="346" width="7" height="230" fill="${palette.film}"/>
      <text x="685" y="396" fill="${palette.film}" font-family="SFMono-Regular,Menlo,monospace" font-size="16" font-weight="700" letter-spacing="3">TIMESTAMP</text>
      <text x="685" y="448" fill="${palette.ink}" font-family="Georgia,serif" font-size="29">What did the cut make you feel?</text>
      <text x="685" y="500" fill="${palette.muted}" font-family="Georgia,serif" font-size="23">Keep the scene, human response,</text>
      <text x="685" y="535" fill="${palette.muted}" font-family="Georgia,serif" font-size="23">and GPT-5.6's distinct observation.</text>
    `, "THE PROBLEM"),
  },
  {
    file: "slide-03-foundations.svg",
    svg: base(`
      <text x="70" y="170" fill="${palette.ink}" font-family="Georgia,serif" font-size="58">Two working foundations</text>
      <rect x="70" y="230" width="540" height="330" fill="${palette.white}" stroke="${palette.line}"/>
      <rect x="70" y="230" width="8" height="330" fill="${palette.book}"/>
      <text x="112" y="294" fill="${palette.book}" font-family="SFMono-Regular,Menlo,monospace" font-size="17" font-weight="700" letter-spacing="3">PRE-EXISTING</text>
      <text x="112" y="360" fill="${palette.ink}" font-family="Georgia,serif" font-size="46">Co-Reading MCP</text>
      <text x="112" y="418" fill="${palette.muted}" font-family="Georgia,serif" font-size="25">Durable book chunks</text>
      <text x="112" y="458" fill="${palette.muted}" font-family="Georgia,serif" font-size="25">Progress and passage annotations</text>
      <text x="112" y="498" fill="${palette.muted}" font-family="Georgia,serif" font-size="25">Human + model margins</text>
      <rect x="650" y="230" width="560" height="330" fill="${palette.white}" stroke="${palette.line}"/>
      <rect x="650" y="230" width="8" height="330" fill="${palette.film}"/>
      <text x="692" y="294" fill="${palette.film}" font-family="SFMono-Regular,Menlo,monospace" font-size="17" font-weight="700" letter-spacing="3">PRE-EXISTING</text>
      <text x="692" y="360" fill="${palette.ink}" font-family="Georgia,serif" font-size="46">Film Matinee</text>
      <text x="692" y="418" fill="${palette.muted}" font-family="Georgia,serif" font-size="25">Visual film sheets</text>
      <text x="692" y="458" fill="${palette.muted}" font-family="Georgia,serif" font-size="25">Subtitle sidecars</text>
      <text x="692" y="498" fill="${palette.muted}" font-family="Georgia,serif" font-size="25">Time-anchored scene notes</text>
      <text x="70" y="626" fill="${palette.muted}" font-family="SFMono-Regular,Menlo,monospace" font-size="17">DISCLOSED AND PINNED AS SUBMODULES</text>
    `, "BEFORE BUILD WEEK"),
  },
  {
    file: "slide-04-extension.svg",
    svg: base(`
      <text x="70" y="152" fill="${palette.ink}" font-family="Georgia,serif" font-size="58">One shared-attention trail</text>
      <rect x="70" y="225" width="280" height="115" rx="4" fill="${palette.white}" stroke="${palette.book}" stroke-width="3"/>
      <text x="210" y="276" text-anchor="middle" fill="${palette.book}" font-family="Georgia,serif" font-size="30">Co-Reading MCP</text>
      <text x="210" y="312" text-anchor="middle" fill="${palette.muted}" font-family="SFMono-Regular,Menlo,monospace" font-size="14">BOOK ANCHORS</text>
      <rect x="70" y="405" width="280" height="115" rx="4" fill="${palette.white}" stroke="${palette.film}" stroke-width="3"/>
      <text x="210" y="456" text-anchor="middle" fill="${palette.film}" font-family="Georgia,serif" font-size="30">Film Matinee</text>
      <text x="210" y="492" text-anchor="middle" fill="${palette.muted}" font-family="SFMono-Regular,Menlo,monospace" font-size="14">SCENE ANCHORS</text>
      <path d="M350 282H470M350 462H470" stroke="${palette.line}" stroke-width="4"/>
      <rect x="470" y="224" width="365" height="296" rx="4" fill="${palette.ink}"/>
      <text x="652" y="280" text-anchor="middle" fill="${palette.white}" font-family="SFMono-Regular,Menlo,monospace" font-size="15" letter-spacing="3">NEW DURING BUILD WEEK</text>
      <text x="652" y="350" text-anchor="middle" fill="${palette.white}" font-family="Georgia,serif" font-size="45">Shared Margin</text>
      <text x="652" y="402" text-anchor="middle" fill="#d9d4cb" font-family="Georgia,serif" font-size="24">Codex skill + MCP server</text>
      <text x="652" y="444" text-anchor="middle" fill="#d9d4cb" font-family="Georgia,serif" font-size="24">common schema + durable trail</text>
      <text x="652" y="486" text-anchor="middle" fill="#d9d4cb" font-family="Georgia,serif" font-size="24">viewer + Markdown export</text>
      <path d="M835 372H930" stroke="${palette.line}" stroke-width="4"/>
      <rect x="930" y="270" width="280" height="205" rx="4" fill="${palette.white}" stroke="${palette.line}"/>
      <text x="1070" y="332" text-anchor="middle" fill="${palette.ink}" font-family="Georgia,serif" font-size="32">Human</text>
      <text x="1070" y="374" text-anchor="middle" fill="${palette.muted}" font-family="Georgia,serif" font-size="24">×</text>
      <text x="1070" y="420" text-anchor="middle" fill="${palette.ink}" font-family="Georgia,serif" font-size="32">GPT-5.6</text>
      <text x="70" y="618" fill="${palette.muted}" font-family="SFMono-Regular,Menlo,monospace" font-size="17">LOCAL-FIRST · SPOILER-SAFE · DISTINCT VOICES</text>
    `, "THE BUILD WEEK EXTENSION"),
  },
  {
    file: "slide-05-tools.svg",
    svg: base(`
      <text x="70" y="164" fill="${palette.ink}" font-family="Georgia,serif" font-size="58">A deliberately small workflow</text>
      <g font-family="SFMono-Regular,Menlo,monospace" font-size="23">
        <text x="90" y="260" fill="${palette.book}">01</text><text x="155" y="260" fill="${palette.ink}">shared_margin_begin</text>
        <text x="90" y="325" fill="${palette.book}">02</text><text x="155" y="325" fill="${palette.ink}">shared_margin_capture</text>
        <text x="90" y="390" fill="${palette.book}">03</text><text x="155" y="390" fill="${palette.ink}">shared_margin_trail</text>
        <text x="90" y="455" fill="${palette.book}">04</text><text x="155" y="455" fill="${palette.ink}">shared_margin_finish</text>
        <text x="90" y="520" fill="${palette.book}">05</text><text x="155" y="520" fill="${palette.ink}">shared_margin_export</text>
      </g>
      <rect x="650" y="214" width="560" height="360" fill="${palette.white}" stroke="${palette.line}"/>
      <text x="690" y="270" fill="${palette.muted}" font-family="SFMono-Regular,Menlo,monospace" font-size="15" letter-spacing="3">ONE MOMENT</text>
      <text x="690" y="322" fill="${palette.ink}" font-family="Georgia,serif" font-size="29">source + exact anchor</text>
      <text x="690" y="368" fill="${palette.ink}" font-family="Georgia,serif" font-size="29">human note</text>
      <text x="690" y="414" fill="${palette.ink}" font-family="Georgia,serif" font-size="29">GPT-5.6 observation</text>
      <text x="690" y="460" fill="${palette.ink}" font-family="Georgia,serif" font-size="29">open question</text>
      <text x="690" y="520" fill="${palette.muted}" font-family="Georgia,serif" font-size="23" font-style="italic">Never flatten the two voices.</text>
    `, "MCP + CODEX SKILL"),
  },
  {
    file: "slide-06-signal.svg",
    svg: base(`
      <text x="70" y="170" fill="${palette.ink}" font-family="Georgia,serif" font-size="58">People already wanted this</text>
      <g font-family="Georgia,serif" fill="${palette.ink}">
        <text x="70" y="320" font-size="78">8,273</text><text x="70" y="360" fill="${palette.muted}" font-size="22">combined views</text>
        <text x="370" y="320" font-size="78">1,081</text><text x="370" y="360" fill="${palette.muted}" font-size="22">likes</text>
        <text x="650" y="320" font-size="78">1,184</text><text x="650" y="360" fill="${palette.muted}" font-size="22">saves</text>
        <text x="950" y="320" font-size="78">133</text><text x="950" y="360" fill="${palette.muted}" font-size="22">comments</text>
      </g>
      <line x1="70" y1="418" x2="1210" y2="418" stroke="${palette.line}"/>
      <text x="70" y="485" fill="${palette.ink}" font-family="Georgia,serif" font-size="31" font-style="italic">“We watched with our own Claude and kept going through two sessions.”</text>
      <text x="70" y="540" fill="${palette.muted}" font-family="Georgia,serif" font-size="23">An anonymized public comment on Film Matinee</text>
      <text x="70" y="606" fill="${palette.muted}" font-family="SFMono-Regular,Menlo,monospace" font-size="16">THE DESIRE WAS REAL BEFORE THE UNIFIED PRODUCT EXISTED</text>
    `, "EARLY USER SIGNAL"),
  },
  {
    file: "slide-07-close.svg",
    svg: base(`
      <text x="70" y="220" fill="${palette.ink}" font-family="Georgia,serif" font-size="63">Not an explanation from a distance.</text>
      <text x="70" y="302" fill="${palette.ink}" font-family="Georgia,serif" font-size="63">Company inside the moment.</text>
      <line x1="70" y1="380" x2="1210" y2="380" stroke="${palette.line}"/>
      <text x="70" y="458" fill="${palette.muted}" font-family="Georgia,serif" font-size="31">Books have margins. Films have pauses.</text>
      <text x="70" y="510" fill="${palette.muted}" font-family="Georgia,serif" font-size="31">Now Codex can meet you in both.</text>
      <text x="70" y="605" fill="${palette.ink}" font-family="SFMono-Regular,Menlo,monospace" font-size="20">github.com/idleprocesscc/shared-margin</text>
    `, "SHARED MARGIN"),
  },
];

for (const slide of slides) {
  await fs.writeFile(path.join(assets, slide.file), slide.svg);
}

const thumbnail = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="${palette.paper}"/>
  <circle cx="120" cy="70" r="430" fill="#fff" opacity=".55"/>
  <text x="70" y="82" fill="${palette.muted}" font-family="SFMono-Regular,Menlo,monospace" font-size="18" font-weight="700" letter-spacing="4">HUMAN × GPT-5.6</text>
  <text x="64" y="310" fill="${palette.ink}" font-family="Georgia,serif" font-size="138" letter-spacing="-8">Shared Margin</text>
  <text x="72" y="390" fill="${palette.muted}" font-family="Georgia,serif" font-size="34">Books have margins. Films have pauses.</text>
  <rect x="72" y="500" width="470" height="170" fill="${palette.white}" stroke="${palette.line}"/>
  <rect x="72" y="500" width="8" height="170" fill="${palette.book}"/>
  <text x="112" y="555" fill="${palette.book}" font-family="SFMono-Regular,Menlo,monospace" font-size="16" font-weight="700" letter-spacing="3">BOOK</text>
  <text x="112" y="610" fill="${palette.ink}" font-family="Georgia,serif" font-size="31">an exact passage</text>
  <text x="112" y="648" fill="${palette.muted}" font-family="Georgia,serif" font-size="22">two distinct voices</text>
  <rect x="580" y="500" width="548" height="170" fill="${palette.white}" stroke="${palette.line}"/>
  <rect x="580" y="500" width="8" height="170" fill="${palette.film}"/>
  <text x="620" y="555" fill="${palette.film}" font-family="SFMono-Regular,Menlo,monospace" font-size="16" font-weight="700" letter-spacing="3">FILM</text>
  <text x="620" y="610" fill="${palette.ink}" font-family="Georgia,serif" font-size="31">a time-anchored scene</text>
  <text x="620" y="648" fill="${palette.muted}" font-family="Georgia,serif" font-size="22">one durable trail</text>
  <text x="1130" y="744" text-anchor="end" fill="${palette.muted}" font-family="SFMono-Regular,Menlo,monospace" font-size="15">OPENAI BUILD WEEK 2026</text>
</svg>`;

await fs.writeFile(path.join(assets, "thumbnail.svg"), thumbnail);
console.log(`Rendered ${slides.length} slides and thumbnail to ${assets}`);
