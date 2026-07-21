import { useEffect, useRef, useState } from "react";
import { AXIS_LABELS, LINK_FIELDS, NICHE_OPTIONS, SEED_CARDS } from "./cards.js";
import { COURSE_PRICE, pickHook, WHAT_YOU_GET } from "./offer.js";
import { diagnose, getDeck, joinWaitlist, sendFeedback } from "./api.js";
import { CSS } from "./styles.js";

const FLY_MS = 420;
const SWIPE_THRESHOLD = 90;

const QUOTES = [
  { text: "Бренд — это то, что говорят о тебе, когда тебя нет в комнате", author: "Джефф Безос" },
  { text: "Дизайн — это не то, как вещь выглядит, а то, как она работает", author: "Стив Джобс" },
  { text: "Люди покупают не то, что ты делаешь, а то, почему ты это делаешь", author: "Саймон Синек" },
  { text: "Логотип — это не бренд. Логотип — указатель на бренд", author: "Марти Ньюмайер" },
  { text: "Хороший дизайн очевиден. Великий дизайн прозрачен", author: "Джо Спарано" },
  { text: "Если ты не бренд — ты товар", author: "Филип Котлер" },
  { text: "Простота — высшая форма изысканности", author: "девиз первого буклета Apple" },
  { text: "Стиль — способ сказать, кто ты, не говоря ни слова", author: "Рэйчел Зои" },
  { text: "Лучшая реклама — это довольный клиент", author: "Филип Котлер" },
  { text: "Стратегия — это выбор, чего НЕ делать", author: "Майкл Портер" },
];

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function Quotes() {
  const [i, setI] = useState(() => Math.floor(Math.random() * QUOTES.length));
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % QUOTES.length), 10000);
    return () => clearInterval(t);
  }, []);
  const q = QUOTES[i];
  return (
    <div className="quote" key={i}>
      <div className="qtext">«{q.text}»</div>
      <div className="qauthor">— {q.author}</div>
    </div>
  );
}

function Deck({ questions, onDone }) {
  const [idx, setIdx] = useState(0);
  const [exiting, setExiting] = useState(null);
  const [drag, setDrag] = useState(null);
  const answersRef = useRef([]);
  const startX = useRef(0);

  const card = questions[idx];

  function commit(answer, dir) {
    if (!card || exiting) return;
    answersRef.current.push({ id: card.id, q: card.q, answer, dir });
    setExiting({ card, dir });
    setDrag(null);
    const next = idx + 1;
    setIdx(next);
    setTimeout(() => {
      setExiting(null);
      if (next >= questions.length) onDone(answersRef.current);
    }, FLY_MS);
  }

  const onPointerDown = (e) => {
    if (!card || exiting) return;
    // Клик по кнопке внутри карточки не должен начинать drag: pointer capture украл бы у неё click.
    if (e.target.closest("button")) return;
    startX.current = e.clientX;
    setDrag({ dx: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (drag) setDrag({ dx: e.clientX - startX.current });
  };
  const onPointerUp = () => {
    if (!drag) return;
    const { dx } = drag;
    setDrag(null);
    if (dx > SWIPE_THRESHOLD) commit(card.right, 1);
    else if (dx < -SWIPE_THRESHOLD) commit(card.left, -1);
  };

  function renderCardBody(c, isTop) {
    return (
      <>
        {isTop && (
          <>
            <div className="stamp yes" style={{ opacity: drag ? Math.min(Math.max(drag.dx, 0) / SWIPE_THRESHOLD, 1) : 0 }}>{truncate(c.right, 16)}</div>
            <div className="stamp no" style={{ opacity: drag ? Math.min(Math.max(-drag.dx, 0) / SWIPE_THRESHOLD, 1) : 0 }}>{truncate(c.left, 16)}</div>
          </>
        )}
        <div className="ax">{c.tag ?? "Дилемма"}</div>
        <div className="cq">{c.q}</div>
        {c.sub && <div className="csub">{c.sub}</div>}
        {c.rows && (
          <div className="optrow">
            <button className="opt l" onClick={() => isTop && commit(c.left, -1)}>
              <span className="side">← вариант А</span>{c.left}
            </button>
            <button className="opt r" onClick={() => isTop && commit(c.right, 1)}>
              <span className="side">вариант Б →</span>{c.right}
            </button>
          </div>
        )}
      </>
    );
  }

  const stack = [];
  if (exiting) {
    stack.push(
      <div key={exiting.card.id} className={"scard fly " + (exiting.dir > 0 ? "r" : "l")} style={{ zIndex: 4 }}>
        <div className="ax">{exiting.card.tag ?? "Дилемма"}</div>
        <div className="cq">{exiting.card.q}</div>
      </div>,
    );
  }
  questions.slice(idx, idx + 3).forEach((c, i) => {
    const isTop = i === 0;
    stack.push(
      <div
        key={c.id}
        className={"scard" + (isTop ? (drag ? " drag" : "") : ` behind${i}`)}
        style={isTop ? { transform: drag ? `translateX(${drag.dx}px) rotate(${drag.dx * 0.06}deg)` : "none", zIndex: 3 } : { zIndex: 3 - i }}
        onPointerDown={isTop ? onPointerDown : undefined}
        onPointerMove={isTop ? onPointerMove : undefined}
        onPointerUp={isTop ? onPointerUp : undefined}
        onPointerCancel={isTop ? onPointerUp : undefined}
      >
        {renderCardBody(c, isTop)}
      </div>,
    );
  });

  return (
    <div>
      <div className="bar"><div className="fill" style={{ width: `${(idx / questions.length) * 100}%` }} /></div>
      <div className="qnum">{String(Math.min(idx + 1, questions.length)).padStart(2, "0")} / {String(questions.length).padStart(2, "0")} · свайп или тап по варианту</div>
      <div className="deck">{stack}</div>
      {card && !card.rows && (
        <div className="deckbtns">
          <button className="dbtn no" onClick={() => commit(card.left, -1)}>{card.left}</button>
          <button className="dbtn yes" onClick={() => commit(card.right, 1)}>{card.right}</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("intro");
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [seedAnswers, setSeedAnswers] = useState([]);
  const [calibration, setCalibration] = useState(null);
  const [tradeoffs, setTradeoffs] = useState([]);
  const [deckUsage, setDeckUsage] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [links, setLinks] = useState({ store: "", landing: "", social: "" });
  const [result, setResult] = useState(null);
  const [diagnosticId, setDiagnosticId] = useState(null);
  const [error, setError] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(null);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const lastAction = useRef(null);

  async function guard(fn) {
    lastAction.current = fn;
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(String(e?.message ?? e));
      setPhase("error");
    }
  }

  function onSeedDone(res) {
    const seed = res.map((r) => ({ id: r.id, q: r.q, answer: r.answer }));
    setSeedAnswers(seed);
    guard(async () => {
      setPhase("prep");
      const data = await getDeck(seed, name, niche);
      setCalibration(data.calibration);
      setDeckUsage(data.usage ?? []);
      setTradeoffs(data.cards.map((c) => ({ ...c, type: "duo", rows: true, q: c.situation })));
      setPhase("tradeoffs");
    });
  }

  function onTradeoffsDone(res) {
    const byId = new Map(tradeoffs.map((c) => [c.id, c]));
    const ds = res.map((r) => {
      const c = byId.get(r.id);
      const chosenRight = r.dir > 0;
      return {
        situation: c.situation,
        chosen: chosenRight ? c.right : c.left,
        chosenAxis: chosenRight ? c.rightAxis : c.leftAxis,
        rejected: chosenRight ? c.left : c.right,
        rejectedAxis: chosenRight ? c.leftAxis : c.rightAxis,
      };
    });
    setDecisions(ds);
    setPhase("links");
  }

  function assess(finalLinks = links, ds = decisions) {
    guard(async () => {
      setPhase("analyzing");
      const res = await diagnose({ name, niche, seedAnswers, calibration, decisions: ds, links: finalLinks, deckUsage });
      setResult(res.result);
      setDiagnosticId(res.id);
      setPhase("result");
    });
  }

  const reset = () => {
    setPhase("intro"); setName(""); setNiche(""); setSeedAnswers([]); setCalibration(null); setTradeoffs([]);
    setDecisions([]); setLinks({ store: "", landing: "", social: "" }); setResult(null);
    setDiagnosticId(null); setFeedbackSent(null); setJoined(false); setEmail(""); setDeckUsage([]);
  };

  async function giveFeedback(verdict) {
    setFeedbackSent(verdict);
    try { await sendFeedback(diagnosticId, verdict); } catch { /* не блокируем UI */ }
  }

  async function join() {
    try {
      await joinWaitlist(email, diagnosticId);
      setJoined(true);
    } catch (e) {
      setError(String(e?.message ?? e));
    }
  }

  const weakLabel = result ? (AXIS_LABELS[result.weakness?.axis] ?? "") : "";
  const superLabel = result ? (AXIS_LABELS[result.superpower?.axis] ?? "") : "";
  const hook = result ? pickHook(niche, result.weakness?.axis) : null;

  return (
    <div className="bd">
      <style>{CSS}</style>
      <div className="blob a" /><div className="blob b" />
      <div className="wrap">

        {phase === "intro" && (
          <div className="phase">
            <div className="eyebrow">Бизнес-диагностика · v5</div>
            <h1>10 свайпов — и я скажу, чем ты жертвуешь зря</h1>
            <p className="lede">Для тех, кто строит своё — от игры до салона. Никаких анкет: выбирай в дилеммах, как в жизни. На выходе — твоя суперсила, слепая зона и план на месяц.</p>
            <div style={{ margin: "22px 0 18px" }}>
              <input className="field" style={{ maxWidth: 340 }} placeholder="Название проекта (необязательно)" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <button className="btn" onClick={() => setPhase("niche")}>Начать</button>
            <div className="foot">Бета · колода генерируется под твою нишу</div>
          </div>
        )}

        {phase === "niche" && (
          <div className="phase">
            <div className="qnum">Шаг 1</div>
            <div className="q">Чем занимаешься?</div>
            <div className="hint">Своими словами, без умных терминов — дальше всё подстроится под тебя.</div>
            <div className="row" style={{ marginTop: 10 }}>
              {NICHE_OPTIONS.map((o) => (
                <button key={o} className={"chip" + (niche === o ? " on" : "")} onClick={() => setNiche(o)}>{o}</button>
              ))}
            </div>
            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("intro")}>Назад</button>
              <button className="btn" disabled={!niche} onClick={() => setPhase("seed")}>Дальше</button>
            </div>
          </div>
        )}

        {phase === "seed" && (
          <div className="phase">
            <Deck questions={SEED_CARDS} onDone={onSeedDone} />
          </div>
        )}

        {phase === "prep" && (
          <div className="center phase">
            <div className="spin" />
            <div className="eyebrow" style={{ color: "var(--violet)" }}>Понимаю твой бизнес</div>
            <div style={{ fontFamily: "var(--disp)", fontSize: 22 }}>Собираю колоду дилемм под твою нишу…</div>
          </div>
        )}

        {phase === "tradeoffs" && tradeoffs.length > 0 && (
          <div className="phase">
            {calibration && (
              <div className="share" style={{ marginBottom: 16, marginTop: 0 }}>
                <span className="pill">Похоже на: {calibration.industry} · {calibration.model}</span>
                <span className="pill">Метрика ниши: {calibration.key_metric}</span>
              </div>
            )}
            <Deck questions={tradeoffs} onDone={onTradeoffsDone} />
          </div>
        )}

        {phase === "links" && (
          <div className="phase">
            <div className="qnum">Почти всё</div>
            <div className="q">Кинь ссылки</div>
            <div className="hint">Необязательно, но диагноз будет точнее.</div>
            {LINK_FIELDS.map((f) => (
              <div className="lfield" key={f.id}>
                <input className="field" placeholder={f.placeholder} value={links[f.id]} onChange={(e) => setLinks((l) => ({ ...l, [f.id]: e.target.value }))} />
              </div>
            ))}
            <div className="nav">
              <button className="btn ghost" onClick={() => assess()}>Пропустить</button>
              <button className="btn amber" onClick={() => assess()}>Поставить диагноз</button>
            </div>
          </div>
        )}

        {phase === "analyzing" && (
          <div className="center phase">
            <div className="spin" />
            <div className="eyebrow" style={{ color: "var(--violet)" }}>Ищу паттерн в твоих решениях</div>
            <Quotes />
          </div>
        )}

        {phase === "error" && (
          <div className="phase">
            <div className="q" style={{ marginTop: 0 }}>Что-то пошло не так</div>
            <div className="err">{error || "Неизвестная ошибка."}</div>
            <div className="nav">
              <button className="btn ghost" onClick={reset}>Заново</button>
              <button className="btn" onClick={() => lastAction.current && guard(lastAction.current)}>Повторить</button>
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <div className="phase">
            <div className="card">
              <div className="eyebrow">Диагноз по твоим решениям</div>
              <div className="big">Слепая зона: {weakLabel}</div>
              <div className="summary">{result.diagnosis}</div>

              <div className="axes">
                {(result.axes || []).map((ax) => (
                  <div className="axis" key={ax.key}>
                    <div className="top">
                      <span className="aname">{ax.name}</span>
                      <span className="dots">
                        {[1, 2, 3, 4, 5].map((d) => <span key={d} className={"dot" + (d <= ax.score ? " f" : "")} />)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="block">
                <h3>Твоя суперсила · {superLabel}</h3>
                <div className="gap"><span className="mk">↑</span><span><b>{result.superpower?.title}.</b> {result.superpower?.note}</span></div>
              </div>

              <div className="block">
                <h3>Слабое место · {weakLabel}</h3>
                <div className="gap"><span className="mk">↓</span><span><b>{result.weakness?.title}.</b> {result.weakness?.note}</span></div>
              </div>

              {result.sprints?.length > 0 && (
                <div className="block">
                  <h3>Твой план на первый месяц</h3>
                  {result.sprints.map((s, i) => (
                    <div className="next" key={i} style={{ marginBottom: 10 }}>
                      <b>Спринт {i + 1}: {s.title}</b>
                      {joined && s.outcome ? <div style={{ marginTop: 6, opacity: .85 }}>{s.outcome}</div> : null}
                    </div>
                  ))}
                  {!joined && <div className="hint" style={{ color: "var(--muted-d)", marginTop: 10 }}>Детали спринтов — по email, бесплатно на время беты.</div>}
                </div>
              )}
            </div>

            <div className="fbrow">
              <span className="fbq">Диагноз попал?</span>
              {feedbackSent ? (
                <span className="pill">{feedbackSent === "accurate" ? "Спасибо — записал" : "Спасибо, это поможет калибровке"}</span>
              ) : (
                <>
                  <button className="btn ghost" onClick={() => giveFeedback("accurate")}>Точно про меня</button>
                  <button className="btn ghost" onClick={() => giveFeedback("miss")}>Мимо</button>
                </>
              )}
            </div>

            <div className="share">
              {joined ? (
                <span className="pill" style={{ color: "var(--violet)", borderColor: "var(--violet)" }}>Ты в списке — детали спринтов уже открыты выше</span>
              ) : (
                <>
                  <input className="field" style={{ maxWidth: 240 }} placeholder="email — открыть детали плана" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button className="btn" disabled={!email.includes("@")} onClick={join}>Открыть план</button>
                </>
              )}
            </div>

            {hook && (
              <div className="teaser">
                <div className="eyebrow" style={{ color: "var(--violet)" }}>Первый урок из курса · открыт бесплатно</div>
                <div className="tstat">{hook.stat}</div>
                <div className="tstatnote">{hook.statNote}</div>
                <p className="tbody">{hook.body}</p>
                <p className="tturn">{hook.turn}</p>
                <div className="tq">{hook.question}</div>
                <div className="tlesson">{hook.lesson}</div>
                <button className="btn amber" style={{ marginTop: 20 }} onClick={() => setPhase("offer")}>
                  Дальше: {hook.course}
                </button>
              </div>
            )}

            <div className="nav">
              <button className="btn ghost" onClick={reset}>Пройти заново</button>
            </div>
            <div className="foot">Бета · колода и диагноз сгенерированы под твою нишу</div>
          </div>
        )}

        {phase === "offer" && result && hook && (
          <div className="phase">
            <div className="eyebrow">Курс под твою слепую зону</div>
            <h1 style={{ fontSize: "clamp(26px,5vw,38px)" }}>{hook.course}</h1>
            <p className="lede">
              Ты только что прочитал начало первого урока. Дальше — ещё четыре, собранные под {weakLabel.toLowerCase()} и твою нишу
              {calibration ? ` (${calibration.industry.toLowerCase()})` : ""}.
            </p>

            <div className="gets">
              {WHAT_YOU_GET.map((g) => (
                <div className="get" key={g.icon}>
                  <span className="gnum">{g.icon}</span>
                  <div>
                    <div className="gtitle">{g.title}</div>
                    <div className="gnote">{g.note}</div>
                  </div>
                </div>
              ))}
            </div>

            {result.sprints?.length > 0 && (
              <div className="planbox">
                <div className="eyebrow" style={{ color: "var(--violet)" }}>Что ты сделаешь за месяц</div>
                {result.sprints.map((s, i) => (
                  <div className="planrow" key={i}>
                    <span className="pnum">{i + 1}</span>
                    <span>{s.title}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pricecard">
              <div>
                <div className="price">{COURSE_PRICE}</div>
                <div className="pricenote">разово, доступ навсегда · дешевле одного часа дизайнера</div>
              </div>
              <button className="btn amber" onClick={() => setPhase("checkout")}>Забрать курс</button>
            </div>

            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("result")}>Вернуться к диагнозу</button>
            </div>
          </div>
        )}

        {phase === "checkout" && (
          <div className="phase">
            <div className="eyebrow">Почти готово</div>
            <h1 style={{ fontSize: "clamp(24px,4.5vw,32px)" }}>Курс ещё собирается</h1>
            <p className="lede">
              Честно: оплату пока не подключили — курс в работе. Оставь почту, и ты получишь его первым и бесплатно,
              как один из тех, кто тестировал диагностику на раннем этапе.
            </p>
            {joined ? (
              <div className="planbox" style={{ marginTop: 22 }}>
                <div className="eyebrow" style={{ color: "var(--violet)" }}>Готово</div>
                <div style={{ fontFamily: "var(--disp)", fontSize: 20, marginTop: 6 }}>Ты в списке. Напишем, как только откроем.</div>
              </div>
            ) : (
              <div className="share" style={{ marginTop: 22 }}>
                <input className="field" style={{ maxWidth: 260 }} placeholder="твой email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button className="btn amber" disabled={!email.includes("@")} onClick={join}>Забронировать</button>
              </div>
            )}
            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("offer")}>Назад</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
