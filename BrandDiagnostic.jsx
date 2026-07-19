import { useState } from "react";

const ASSESSOR_SYSTEM = `Ты — ассессор зрелости бренда для инди-разработчиков и соло-фаундеров.

Оси оценки (каждую оцени числом 1–5):
1. positioning — Позиционирование и оффер: ясно ли, кому и зачем нужен продукт.
2. visual — Визуальная идентичность: есть ли система (лого, палитра, типографика), а не случайный визуал.
3. consistency — Консистентность: единство бренда на всех точках контакта.
4. differentiation — Дифференциация: отстройка от конкурентов.
5. conversion — Конверсионность: работает ли бренд на установки и продажи (иконка, скриншоты стора, оффер).

Уровни (overallLevel 1–5):
1 Хаос — есть продукт, нет бренда; случайный визуал, оффер не сформулирован.
2 Ремесленник — есть название/лого, но нет системы; визуал несогласован, оффер размыт.
3 Согласованность — есть визуальная система и понятный оффер, но нет дифференциации.
4 Позиционирование — чёткая ЦА, tone of voice, отстройка; бренд работает на конверсию.
5 Магнит — узнаваемый бренд как актив привлечения, консистентность везде.

overallLevel определяй по слабейшим осям, а не по среднему — бренд не сильнее своего слабого звена.

Правила:
- Оценивай строго по вводу пользователя. Будь конкретен к ЕГО продукту, не выдавай генерик.
- Заметки (note) короткие, по делу, на русском.
- gaps — 2–3 конкретных разрыва именно у этого бренда.
- nextStep — один конкретный следующий шаг.
- Верни ТОЛЬКО валидный JSON, без markdown и пояснений. Схема:
{"overallLevel":число,"levelName":"строка","summary":"1–2 предложения","axes":[{"key":"positioning","name":"Позиционирование и оффер","score":число,"note":"строка"},{"key":"visual","name":"Визуальная идентичность","score":число,"note":"строка"},{"key":"consistency","name":"Консистентность","score":число,"note":"строка"},{"key":"differentiation","name":"Дифференциация","score":число,"note":"строка"},{"key":"conversion","name":"Конверсионность","score":число,"note":"строка"}],"gaps":["строка","строка"],"nextStep":"строка"}`;

const LEVELS = [
  { n: 1, name: "Хаос" },
  { n: 2, name: "Ремесленник" },
  { n: 3, name: "Согласованность" },
  { n: 4, name: "Позиционирование" },
  { n: 5, name: "Магнит" },
];

const STEPS = [
  { id: "building", type: "choice", q: "Что ты строишь?",
    options: ["Приложение", "Игра", "SaaS", "Сервис", "Личный бренд", "Другое"],
    extra: { id: "name", placeholder: "Название (необязательно)" } },
  { id: "offer", type: "text", q: "Оффер в одну строку",
    hint: "Кому и зачем нужен твой продукт?",
    placeholder: "Помогаю инди-разработчикам… / Игра про…" },
  { id: "selfBrand", type: "textarea", q: "Как ты сам описываешь свой бренд сейчас?",
    hint: "Пиши как есть — это главный сигнал для оценки.",
    placeholder: "Что это, для кого, чем отличается, какой тон, что уже сделано из визуала…" },
  { id: "assets", type: "multi", q: "Что уже есть из визуала?",
    options: ["Логотип", "Палитра", "Шрифты", "Гайдлайн", "Иконка приложения", "Скриншоты для стора", "Ничего из этого"] },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');
.bd{--paper:#EEF0F3;--ink:#16172B;--ink2:#20223B;--bone:#E9E7DF;--amber:#E8A13A;--violet:#5A54C9;--muted:#6A6D7C;--muted-d:#8E91A6;--line:#D6D9E0;--line-d:#343657;
  --disp:'Space Grotesk',system-ui,sans-serif;--body:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace;
  font-family:var(--body);color:var(--ink);background:var(--paper);min-height:100%;width:100%;box-sizing:border-box;padding:clamp(20px,5vw,56px)}
.bd *{box-sizing:border-box}
.bd .wrap{max-width:720px;margin:0 auto}
.bd .eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--violet)}
.bd h1{font-family:var(--disp);font-weight:700;font-size:clamp(30px,6vw,46px);line-height:1.04;letter-spacing:-.02em;margin:16px 0 14px}
.bd .lede{font-size:17px;line-height:1.6;color:var(--muted);max-width:52ch}
.bd .btn{font-family:var(--body);font-weight:500;font-size:15px;padding:13px 22px;border-radius:10px;border:none;cursor:pointer;background:var(--ink);color:var(--bone);transition:transform .15s ease,opacity .15s ease}
.bd .btn:hover{transform:translateY(-1px)}
.bd .btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
.bd .btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
.bd .btn.amber{background:var(--amber);color:#3a2607}
.bd .chip{font-family:var(--body);font-size:14px;padding:10px 16px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;transition:all .12s ease}
.bd .chip:hover{border-color:var(--ink)}
.bd .chip.on{background:var(--ink);color:var(--bone);border-color:var(--ink)}
.bd .row{display:flex;flex-wrap:wrap;gap:10px}
.bd .field{width:100%;font-family:var(--body);font-size:16px;padding:14px 16px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);outline:none}
.bd .field:focus{border-color:var(--violet)}
.bd textarea.field{min-height:150px;resize:vertical;line-height:1.5}
.bd .qwrap{margin-top:30px}
.bd .qnum{font-family:var(--mono);font-size:12px;color:var(--muted);letter-spacing:.1em}
.bd .q{font-family:var(--disp);font-weight:500;font-size:24px;letter-spacing:-.01em;margin:8px 0 6px}
.bd .hint{font-size:14px;color:var(--muted);margin-bottom:16px}
.bd .ticks{display:flex;gap:6px;margin-bottom:28px}
.bd .tick{height:3px;flex:1;border-radius:2px;background:var(--line);transition:background .2s}
.bd .tick.done{background:var(--violet)}
.bd .nav{display:flex;justify-content:space-between;align-items:center;margin-top:26px;gap:12px}
.bd .ladder{display:flex;flex-direction:column-reverse;gap:8px;margin:22px 0}
.bd .rung{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:#fff;transition:all .3s}
.bd .rung .rn{font-family:var(--mono);font-size:13px;color:var(--muted);width:18px}
.bd .rung .rname{font-family:var(--disp);font-weight:500;font-size:15px}
.bd .rung.dim{opacity:.5}
.bd .card{background:var(--ink);color:var(--bone);border-radius:18px;padding:clamp(22px,4vw,34px)}
.bd .card .eyebrow{color:var(--amber)}
.bd .ladder.dark .rung{background:var(--ink2);border-color:var(--line-d);color:var(--bone)}
.bd .ladder.dark .rung .rn{color:var(--muted-d)}
.bd .ladder.dark .rung.active{background:var(--amber);border-color:var(--amber);color:#3a2607;transform:translateX(6px)}
.bd .ladder.dark .rung.active .rn{color:#7a5410}
.bd .ladder.dark .rung.passed{opacity:.85}
.bd .ladder.dark .rung.future{opacity:.34}
.bd .big{font-family:var(--disp);font-weight:700;font-size:clamp(28px,5vw,40px);letter-spacing:-.02em;line-height:1.05;margin:4px 0 10px}
.bd .summary{font-size:16px;line-height:1.6;color:var(--bone);opacity:.92;max-width:56ch}
.bd .axes{margin:26px 0 6px;border-top:1px solid var(--line-d)}
.bd .axis{padding:15px 0;border-bottom:1px solid var(--line-d)}
.bd .axis .top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.bd .axis .aname{font-family:var(--mono);font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted-d)}
.bd .dots{display:flex;gap:5px}
.bd .dot{width:9px;height:9px;border-radius:2px;background:var(--line-d)}
.bd .dot.f{background:var(--amber)}
.bd .anote{font-size:14.5px;line-height:1.5;color:var(--bone);opacity:.8;margin-top:7px;max-width:60ch}
.bd .block{margin-top:26px}
.bd .block h3{font-family:var(--mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--amber);margin:0 0 12px}
.bd .gap{display:flex;gap:12px;font-size:15.5px;line-height:1.55;color:var(--bone);opacity:.92;margin-bottom:10px}
.bd .gap .mk{color:var(--amber);font-family:var(--mono)}
.bd .next{font-size:16px;line-height:1.6;color:var(--bone);background:var(--ink2);border-left:2px solid var(--amber);padding:14px 16px;border-radius:0 10px 10px 0}
.bd .share{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.bd .pill{font-family:var(--mono);font-size:12px;color:var(--muted);padding:6px 12px;border:1px solid var(--line);border-radius:999px}
.bd .spin{width:34px;height:34px;border:3px solid var(--line);border-top-color:var(--violet);border-radius:50%;animation:bdspin 1s linear infinite}
@keyframes bdspin{to{transform:rotate(360deg)}}
.bd .center{display:flex;flex-direction:column;align-items:center;gap:18px;padding:60px 0;text-align:center}
.bd .err{background:#fff;border:1px solid var(--line);border-left:3px solid #C0483C;border-radius:0 10px 10px 0;padding:16px;font-size:14.5px;color:var(--ink);line-height:1.5}
.bd .foot{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.06em;margin-top:26px}
@media(prefers-reduced-motion:reduce){.bd *{transition:none!important;animation:none!important}}
`;

function extractJSON(text) {
  let t = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a !== -1 && b !== -1) t = t.slice(a, b + 1);
  return JSON.parse(t);
}

export default function BrandDiagnostic() {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ building: "", name: "", offer: "", selfBrand: "", assets: [] });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);

  const s = STEPS[step];
  const set = (id, v) => setAnswers((a) => ({ ...a, [id]: v }));
  const toggleMulti = (v) =>
    setAnswers((a) => ({ ...a, assets: a.assets.includes(v) ? a.assets.filter((x) => x !== v) : [...a.assets, v] }));

  const canNext = () => {
    if (s.id === "building") return !!answers.building;
    if (s.id === "offer") return answers.offer.trim().length > 3;
    if (s.id === "selfBrand") return answers.selfBrand.trim().length > 15;
    return true;
  };

  async function assess() {
    setPhase("analyzing");
    setError("");
    const userMsg =
      `Тип продукта: ${answers.building}${answers.name ? ` («${answers.name}»)` : ""}\n` +
      `Оффер: ${answers.offer}\n` +
      `Как описывает бренд: ${answers.selfBrand}\n` +
      `Есть из визуала: ${answers.assets.length ? answers.assets.join(", ") : "не указано"}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: ASSESSOR_SYSTEM,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const text = (data.content || []).map((c) => c.text || "").join("");
      const parsed = extractJSON(text);
      setResult(parsed);
      setPhase("result");
    } catch (e) {
      setError(String(e && e.message ? e.message : e));
      setPhase("error");
    }
  }

  const reset = () => { setPhase("intro"); setStep(0); setResult(null); setJoined(false);
    setAnswers({ building: "", name: "", offer: "", selfBrand: "", assets: [] }); };

  return (
    <div className="bd">
      <style>{CSS}</style>
      <div className="wrap">

        {phase === "intro" && (
          <div>
            <div className="eyebrow">Диагностика бренда · v0</div>
            <h1>Узнай, на каком уровне твой бренд — за две минуты</h1>
            <p className="lede">Для инди-разработчиков и фаундеров. Опиши продукт как есть — оценю зрелость бренда по пяти осям и покажу, где разрыв.</p>
            <div className="ladder">
              {LEVELS.map((l) => (
                <div key={l.n} className="rung dim">
                  <span className="rn">L{l.n}</span><span className="rname">{l.name}</span>
                </div>
              ))}
            </div>
            <button className="btn" onClick={() => setPhase("quiz")}>Начать диагностику</button>
            <div className="foot">Прототип для теста · рубрика v0 · оценка через Claude</div>
          </div>
        )}

        {phase === "quiz" && (
          <div>
            <div className="ticks">
              {STEPS.map((_, i) => <div key={i} className={"tick" + (i <= step ? " done" : "")} />)}
            </div>
            <div className="qwrap">
              <div className="qnum">{String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</div>
              <div className="q">{s.q}</div>
              {s.hint && <div className="hint">{s.hint}</div>}

              {s.type === "choice" && (
                <div>
                  <div className="row">
                    {s.options.map((o) => (
                      <button key={o} className={"chip" + (answers.building === o ? " on" : "")} onClick={() => set("building", o)}>{o}</button>
                    ))}
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <input className="field" placeholder={s.extra.placeholder} value={answers.name} onChange={(e) => set("name", e.target.value)} />
                  </div>
                </div>
              )}
              {s.type === "text" && (
                <input className="field" placeholder={s.placeholder} value={answers.offer} onChange={(e) => set("offer", e.target.value)} />
              )}
              {s.type === "textarea" && (
                <textarea className="field" placeholder={s.placeholder} value={answers.selfBrand} onChange={(e) => set("selfBrand", e.target.value)} />
              )}
              {s.type === "multi" && (
                <div className="row">
                  {s.options.map((o) => (
                    <button key={o} className={"chip" + (answers.assets.includes(o) ? " on" : "")} onClick={() => toggleMulti(o)}>{o}</button>
                  ))}
                </div>
              )}

              <div className="nav">
                <button className="btn ghost" onClick={() => (step === 0 ? setPhase("intro") : setStep(step - 1))}>Назад</button>
                {step < STEPS.length - 1 ? (
                  <button className="btn" disabled={!canNext()} onClick={() => setStep(step + 1)}>Дальше</button>
                ) : (
                  <button className="btn amber" disabled={!canNext()} onClick={assess}>Оценить бренд</button>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === "analyzing" && (
          <div className="center">
            <div className="spin" />
            <div>
              <div className="eyebrow" style={{ color: "var(--violet)" }}>Анализирую</div>
              <div style={{ fontFamily: "var(--disp)", fontSize: 22, marginTop: 8 }}>Сверяю твой бренд с рубрикой…</div>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div>
            <div className="q" style={{ marginTop: 0 }}>Не удалось получить оценку</div>
            <div className="err">{error || "Неизвестная ошибка."}<br />Проверь, что окружение поддерживает вызовы Claude из артефакта.</div>
            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("quiz")}>К вводу</button>
              <button className="btn" onClick={assess}>Повторить</button>
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <div>
            <div className="card">
              <div className="eyebrow">Твой уровень зрелости бренда</div>
              <div className="big">L{result.overallLevel} · {result.levelName || (LEVELS[result.overallLevel - 1] || {}).name}</div>
              <div className="summary">{result.summary}</div>

              <div className="ladder dark">
                {LEVELS.map((l) => {
                  const cls = l.n === result.overallLevel ? "active" : l.n < result.overallLevel ? "passed" : "future";
                  return (
                    <div key={l.n} className={"rung " + cls}>
                      <span className="rn">L{l.n}</span><span className="rname">{l.name}</span>
                    </div>
                  );
                })}
              </div>

              <div className="axes">
                {(result.axes || []).map((ax, i) => (
                  <div className="axis" key={i}>
                    <div className="top">
                      <span className="aname">{ax.name}</span>
                      <span className="dots">
                        {[1, 2, 3, 4, 5].map((d) => <span key={d} className={"dot" + (d <= ax.score ? " f" : "")} />)}
                      </span>
                    </div>
                    {ax.note && <div className="anote">{ax.note}</div>}
                  </div>
                ))}
              </div>

              {result.gaps && result.gaps.length > 0 && (
                <div className="block">
                  <h3>Где разрыв</h3>
                  {result.gaps.map((g, i) => (
                    <div className="gap" key={i}><span className="mk">→</span><span>{g}</span></div>
                  ))}
                </div>
              )}

              {result.nextStep && (
                <div className="block">
                  <h3>Следующий шаг</h3>
                  <div className="next">{result.nextStep}</div>
                </div>
              )}
            </div>

            <div className="share">
              <span className="pill">L{result.overallLevel} · {(LEVELS[result.overallLevel - 1] || {}).name}</span>
              {joined ? (
                <span className="pill" style={{ color: "var(--violet)", borderColor: "var(--violet)" }}>Ты в списке — напишем, когда откроем полный разбор</span>
              ) : (
                <>
                  <input className="field" style={{ maxWidth: 240 }} placeholder="email для полного разбора" id="bd-email" />
                  <button className="btn" onClick={() => setJoined(true)}>В список</button>
                </>
              )}
            </div>
            <div className="nav">
              <button className="btn ghost" onClick={reset}>Пройти заново</button>
            </div>
            <div className="foot">Прототип · оценка сгенерирована Claude по рубрике v0 · перед продом рубрику финализирует эксперт</div>
          </div>
        )}

      </div>
    </div>
  );
}
