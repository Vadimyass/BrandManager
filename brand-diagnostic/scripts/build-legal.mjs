// Собирает юр.документы (legal/*.md) в отдельные статические страницы public/*.html
// в светлой айдентике Melyo. Перегенерировать: node scripts/build-legal.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { marked } from "marked";

const DOCS = [
  { src: "legal/oferta.md", out: "public/oferta.html", title: "Публічна оферта" },
  { src: "legal/privacy.md", out: "public/privacy.html", title: "Політика конфіденційності" },
  { src: "legal/cookies.md", out: "public/cookies.html", title: "Політика cookie" },
];

function page(title, bodyHtml) {
  return `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="index, follow" />
<title>${title} · Melyo</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
  :root{--bg:#F4F3FA;--surface:#FFFFFF;--ink:#1A1B33;--muted:#6A7A82;--line:#E7E4F3;--green:#01D27F;--teal:#014753}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:Montserrat,system-ui,sans-serif;line-height:1.6}
  .top{max-width:860px;margin:0 auto;padding:22px 20px 0;display:flex;align-items:center;gap:12px}
  .top a.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--teal);font-weight:900;font-size:22px;text-transform:uppercase;letter-spacing:-.01em}
  .top img{width:34px;height:34px}
  .top .back{margin-left:auto;font-size:14px;color:var(--teal);text-decoration:none;font-weight:600}
  .wrap{max-width:860px;margin:18px auto 60px;padding:clamp(20px,4vw,40px);background:var(--surface);border:1.5px solid var(--line);border-radius:20px}
  h1{font-weight:900;font-size:clamp(24px,4vw,34px);text-transform:uppercase;letter-spacing:-.01em;margin:0 0 6px}
  h2{font-weight:800;font-size:clamp(18px,2.6vw,22px);margin:28px 0 8px}
  h3{font-weight:700;font-size:16px;margin:18px 0 6px}
  p,li{font-size:15.5px;color:var(--ink)}
  a{color:var(--green)}
  ul{padding-left:20px}
  li{margin-bottom:6px}
  hr{border:none;border-top:1px solid var(--line);margin:26px 0}
  code{background:#EFECFB;padding:1px 6px;border-radius:6px;font-size:14px}
  blockquote{margin:16px 0;padding:12px 16px;background:#F4F3FA;border-left:3px solid var(--green);border-radius:0 12px 12px 0;color:var(--muted)}
  .foot{max-width:860px;margin:0 auto 40px;padding:0 20px;font-size:13px;color:var(--muted)}
  .foot a{color:var(--teal);margin-right:14px}
</style>
</head>
<body>
  <div class="top">
    <a class="brand" href="/"><img src="/mascot-cool.png" alt="" />melyo</a>
    <a class="back" href="/">← На сайт</a>
  </div>
  <main class="wrap">
${bodyHtml}
  </main>
  <div class="foot">
    <a href="/oferta.html">Оферта</a><a href="/privacy.html">Політика конфіденційності</a><a href="/cookies.html">Cookie</a>
  </div>
</body>
</html>`;
}

for (const d of DOCS) {
  let md = readFileSync(d.src, "utf8");
  // Убираем внутреннюю пометку-предупреждение «⚠️ шаблон…» — она для нас, не для юзера.
  md = md.split("\n").filter((l) => !l.trim().startsWith("> ⚠️")).join("\n");
  const html = marked.parse(md);
  writeFileSync(d.out, page(d.title, html));
  console.log("built", d.out);
}
