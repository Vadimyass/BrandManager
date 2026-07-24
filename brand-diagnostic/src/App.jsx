import { useEffect, useRef, useState } from "react";
import { AXIS_LABELS, LINK_FIELDS, NICHE_OPTIONS, SEED_CARDS } from "./cards.js";
import { COURSE_PRICE, pickHook, WHAT_YOU_GET } from "./offer.js";
import { clearSession, loadSession, PENDING_PHASES, saveSession } from "./session.js";
import { diagnose, getCourse, getDeck, joinWaitlist, sendFeedback } from "./api.js";
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

const BUILD_STEPS = [
  "Разбираю твои решения",
  "Смотрю, что ты выбираешь чаще всего",
  "Подбираю истории под твою нишу",
  "Собираю задания на твоём продукте",
  "Готовлю проверку",
];

const STEP_MS = 1800;

// Прогресс считается по реальному времени, а не по тикам: в фоновой вкладке браузер душит таймеры.
function BuildProgress() {
  const startedAt = useRef(Date.now());
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 400);
    const onShow = () => force((n) => n + 1);
    document.addEventListener("visibilitychange", onShow);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);
  const step = Math.min(Math.floor((Date.now() - startedAt.current) / STEP_MS), BUILD_STEPS.length - 1);
  return (
    <div className="buildlist">
      {BUILD_STEPS.map((s, i) => (
        <div key={s} className={"bstep" + (i < step ? " done" : i === step ? " now" : "")}>
          <span className="bmark">{i < step ? "✓" : i === step ? "•" : ""}</span>
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}

function Quiz({ items, onDone }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const item = items[i];
  if (!item) return null;

  const isRight = picked && picked === item.correct;
  const next = () => {
    setPicked(null);
    if (i + 1 >= items.length) onDone();
    else setI(i + 1);
  };

  return (
    <div className="quizbox">
      <div className="eyebrow" style={{ color: "var(--violet)" }}>Проверь себя · {i + 1} из {items.length}</div>
      <div className="quizq">{item.q}</div>
      <div className="optrow" style={{ marginTop: 14 }}>
        <button className={"opt l" + (picked ? (item.correct === "left" ? " good" : " meh") : "")} disabled={!!picked} onClick={() => setPicked("left")}>
          {item.left}
        </button>
        <button className={"opt r" + (picked ? (item.correct === "right" ? " good" : " meh") : "")} disabled={!!picked} onClick={() => setPicked("right")}>
          {item.right}
        </button>
      </div>
      {picked && (
        <div className="quizfb">
          <div className="qverdict">{isRight ? "Верно" : "Смотри глубже"}</div>
          <div className="qexplain">{item.explain}</div>
          <button className="btn" style={{ marginTop: 14 }} onClick={next}>
            {i + 1 >= items.length ? "Закончить урок" : "Следующий вопрос"}
          </button>
        </div>
      )}
    </div>
  );
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
  const saved = useRef(loadSession()).current;
  const s = saved ?? {};

  const [phase, setPhase] = useState(s.phase ?? "intro");
  const [name, setName] = useState(s.name ?? "");
  const [niche, setNiche] = useState(s.niche ?? "");
  const [seedAnswers, setSeedAnswers] = useState(s.seedAnswers ?? []);
  const [calibration, setCalibration] = useState(s.calibration ?? null);
  const [tradeoffs, setTradeoffs] = useState(s.tradeoffs ?? []);
  const [deckUsage, setDeckUsage] = useState(s.deckUsage ?? []);
  const [decisions, setDecisions] = useState(s.decisions ?? []);
  const [links, setLinks] = useState(s.links ?? { store: "", landing: "", social: "" });
  const [result, setResult] = useState(s.result ?? null);
  const [diagnosticId, setDiagnosticId] = useState(s.diagnosticId ?? null);
  const [error, setError] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(s.feedbackSent ?? null);
  const [email, setEmail] = useState(s.email ?? "");
  const [joined, setJoined] = useState(s.joined ?? false);
  const [intent, setIntent] = useState(s.intent ?? null);
  const [lessons, setLessons] = useState(s.lessons ?? {});
  const [courseTotal, setCourseTotal] = useState(s.courseTotal ?? 10);
  const [lessonStage, setLessonStage] = useState(s.lessonStage ?? "read");
  const [lessonIndex, setLessonIndex] = useState(s.lessonIndex ?? 0);
  const lesson = lessons?.[lessonIndex] ?? null;
  const lastAction = useRef(null);
  const resumed = useRef(false);

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

  // Весь курс собирается одним запросом; дальше уроки листаются мгновенно, без загрузки.
  function openCourse() {
    if (lessons?.[0]) {
      setLessonIndex(0);
      setLessonStage("read");
      setPhase("lesson");
      return;
    }
    guard(async () => {
      setPhase("building");
      const res = await getCourse(calibration, niche, result);
      const byIndex = {};
      for (const l of res.lessons) byIndex[l.index] = l;
      setLessons(byIndex);
      if (res.total) setCourseTotal(res.total);
      setLessonIndex(0);
      setLessonStage("read");
      setPhase("lesson");
    });
  }

  function goToLesson(index) {
    if (!lessons?.[index]) return;
    setLessonIndex(index);
    setLessonStage("read");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Снимок сессии: вкладку могут выгрузить в фоне, особенно на телефоне.
  useEffect(() => {
    if (phase === "intro") return;
    saveSession({
      phase, name, niche, seedAnswers, calibration, tradeoffs, deckUsage, decisions, links,
      result, diagnosticId, feedbackSent, email, joined, intent, lessons, courseTotal, lessonStage, lessonIndex,
    });
  }, [phase, name, niche, seedAnswers, calibration, tradeoffs, deckUsage, decisions, links,
    result, diagnosticId, feedbackSent, email, joined, intent, lessons, courseTotal, lessonStage, lessonIndex]);

  // Если вкладку выгрузили во время генерации — повторяем запрос сами, человек ничего не теряет.
  useEffect(() => {
    if (resumed.current) return;
    resumed.current = true;
    if (!saved || !PENDING_PHASES.includes(saved.phase)) return;

    if (saved.phase === "prep" && saved.seedAnswers?.length) {
      guard(async () => {
        const data = await getDeck(saved.seedAnswers, saved.name, saved.niche);
        setCalibration(data.calibration);
        setDeckUsage(data.usage ?? []);
        setTradeoffs(data.cards.map((c) => ({ ...c, type: "duo", rows: true, q: c.situation })));
        setPhase("tradeoffs");
      });
    } else if (saved.phase === "analyzing" && saved.decisions?.length) {
      assess(saved.links, saved.decisions);
    } else if (saved.phase === "building" && saved.result) {
      openCourse();
    }
  }, []);

  const reset = () => {
    clearSession();
    setPhase("intro"); setName(""); setNiche(""); setSeedAnswers([]); setCalibration(null); setTradeoffs([]);
    setLessons({}); setCourseTotal(10); setLessonStage("read"); setLessonIndex(0);
    setDecisions([]); setLinks({ store: "", landing: "", social: "" }); setResult(null);
    setDiagnosticId(null); setFeedbackSent(null); setJoined(false); setEmail(""); setDeckUsage([]); setIntent(null);
  };

  async function giveFeedback(verdict) {
    setFeedbackSent(verdict);
    try { await sendFeedback(diagnosticId, verdict); } catch { /* не блокируем UI */ }
  }

  async function join(intent = "plan") {
    try {
      await joinWaitlist(email, diagnosticId, intent);
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
                      {s.outcome ? <div style={{ marginTop: 6, opacity: .85 }}>{s.outcome}</div> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hook && (
              <div className="coursecta">
                <div>
                  <div className="eyebrow" style={{ color: "var(--violet)" }}>Есть курс под твою слепую зону</div>
                  <div className="cctatitle">{hook.course}</div>
                  <div className="cctasub">Уроки от основ к глубине, по одной идее за раз, с примерами и заданиями. Первый — бесплатно, прямо сейчас.</div>
                </div>
                <button className="btn amber cctabtn" onClick={openCourse}>Открыть курс →</button>
              </div>
            )}

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

            <div className="nav">
              <button className="btn ghost" onClick={reset}>Пройти заново</button>
              <button className="btn" onClick={() => setPhase("offer")}>Что в курсе</button>
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

            <button className="btn amber" style={{ width: "100%", marginTop: 24, padding: "16px 24px", fontSize: 16 }} onClick={openCourse}>
              Начать курс — бесплатно
            </button>

            <div className="pricecard" style={{ marginTop: 14 }}>
              <div>
                <div className="price">{COURSE_PRICE}</div>
                <div className="pricenote">весь курс навсегда · без почты и регистрации</div>
              </div>
              <button className="btn ghost" onClick={() => setPhase("checkout")}>Забрать весь курс</button>
            </div>

            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("result")}>Вернуться к диагнозу</button>
            </div>
          </div>
        )}

        {phase === "checkout" && (
          <div className="phase">
            <div className="eyebrow">Последний шаг</div>
            <h1 style={{ fontSize: "clamp(24px,4.5vw,32px)" }}>Как забрать курс</h1>
            <p className="lede">Два способа — выбирай любой.</p>

            {joined ? (
              <div className="planbox" style={{ marginTop: 24 }}>
                <div className="eyebrow" style={{ color: "var(--violet)" }}>Готово</div>
                <div style={{ fontFamily: "var(--disp)", fontSize: 20, marginTop: 6 }}>
                  {intent === "purchase"
                    ? "Записал: ты готов купить. Пришлём ссылку на оплату, как только откроем — по цене беты."
                    : "Ты в списке. Напишем, как только откроем."}
                </div>
              </div>
            ) : (
              <div className="paths">
                <div className={"path" + (intent === "purchase" ? " on" : "")}>
                  <div className="ptag">Купить сейчас</div>
                  <div className="pprice">{COURSE_PRICE}</div>
                  <div className="pnote">Доступ навсегда, все пять уроков и личный план.</div>
                  <button className="btn amber" style={{ width: "100%" }} onClick={() => setIntent("purchase")}>Оплатить</button>
                </div>
                <div className={"path" + (intent === "plan" ? " on" : "")}>
                  <div className="ptag">Пока подождать</div>
                  <div className="pprice">Бесплатно</div>
                  <div className="pnote">Оставь почту — получишь курс первым на бете, без оплаты.</div>
                  <button className="btn ghost" style={{ width: "100%" }} onClick={() => setIntent("plan")}>Оставить почту</button>
                </div>
              </div>
            )}

            {!joined && intent && (
              <div className="planbox" style={{ marginTop: 22 }}>
                <div className="eyebrow" style={{ color: "var(--amber)" }}>
                  {intent === "purchase" ? "Оплата подключается" : "Почти всё"}
                </div>
                <div style={{ fontSize: 15.5, lineHeight: 1.6, margin: "8px 0 16px", opacity: .9 }}>
                  {intent === "purchase"
                    ? "Приём платежей ещё не запущен — курс в финальной сборке. Оставь почту: пришлём ссылку на оплату первым и по цене беты."
                    : "Оставь почту — напишем, как только курс откроется."}
                </div>
                <div className="share" style={{ marginTop: 0 }}>
                  <input className="field" style={{ maxWidth: 260 }} placeholder="твой email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button className="btn amber" disabled={!email.includes("@")} onClick={() => join(intent)}>
                    {intent === "purchase" ? "Забронировать место" : "Готово"}
                  </button>
                </div>
              </div>
            )}

            {joined && (
              <div style={{ marginTop: 20 }}>
                <button className="btn amber" onClick={openCourse}>Открыть курс</button>
                <div className="hint" style={{ marginTop: 10 }}>Доступ на время беты открыт — курс собирается под тебя прямо сейчас.</div>
              </div>
            )}

            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("offer")}>Назад</button>
            </div>
          </div>
        )}

        {phase === "building" && (
          <div className="center phase">
            <div className="spin" />
            <div className="eyebrow" style={{ color: "var(--violet)" }}>Собираю курс под тебя</div>
            <BuildProgress />
          </div>
        )}

        {phase === "lesson" && lesson && (
          <div className="phase">
            <div className="bar"><div className="fill" style={{ width: `${((lesson.index + 1) / (courseTotal || lesson.total)) * 100}%` }} /></div>
            <div className="qnum">Урок {lesson.index + 1} из {courseTotal || lesson.total}</div>
            <h1 style={{ fontSize: "clamp(24px,4.6vw,34px)", margin: "10px 0 20px" }}>{lesson.title}</h1>

            {lessonStage === "read" && (
              <div>
                {lesson.stat && (
                  <>
                    <div className="tstat">{lesson.stat}</div>
                    <div className="tstatnote">{lesson.statNote}</div>
                  </>
                )}
                <p className="tbody">{lesson.body}</p>
                {lesson.turn && <p className="tturn">{lesson.turn}</p>}

                {lesson.scheme?.length > 1 && (
                  <div className="scheme">
                    {lesson.scheme.map((sc, i) => (
                      <span className="schemepart" key={i}>
                        <span className="schemenode">{sc}</span>
                        {i < lesson.scheme.length - 1 && <span className="schemearrow">→</span>}
                      </span>
                    ))}
                  </div>
                )}

                {lesson.examples?.length > 0 && (
                  <div className="examples">
                    <div className="eyebrow" style={{ color: "var(--violet)" }}>Разбор: почему так вышло</div>
                    {lesson.examples.map((ex, i) => (
                      <div className="example" key={i}>
                        <div className="excase">{ex.case}</div>
                        <div className="exwhy"><span className="exmk">почему:</span> {ex.why}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="termbox">
                  <div className="eyebrow" style={{ color: "var(--amber)" }}>Термин: {lesson.term}</div>
                  <div className="termnote">{lesson.termNote}</div>
                </div>

                {lesson.task && (
                  <div className="taskbox">
                    <div className="eyebrow" style={{ color: "var(--violet)" }}>Твой ход</div>
                    <div className="tasktext">{lesson.task}</div>
                  </div>
                )}

                <div className="nav">
                  <button className="btn ghost" onClick={() => setPhase("result")}>К диагнозу</button>
                  <button className="btn amber" onClick={() => setLessonStage(lesson.quiz?.length ? "quiz" : "done")}>
                    {lesson.quiz?.length ? "Проверить себя" : "Дальше"}
                  </button>
                </div>
              </div>
            )}

            {lessonStage === "quiz" && (
              <Quiz items={lesson.quiz} onDone={() => setLessonStage("done")} />
            )}

            {lessonStage === "done" && (() => {
              const nextIdx = lesson.index + 1;
              const total = courseTotal || lesson.total;
              return (
                <div>
                  <div className="card">
                    <div className="eyebrow">Вывод урока</div>
                    <div className="big" style={{ fontSize: "clamp(22px,4vw,30px)" }}>{lesson.takeaway}</div>
                  </div>
                  <div className="nav">
                    <button className="btn ghost" onClick={() => setPhase("result")}>К диагнозу</button>
                    {nextIdx < total ? (
                      <button className="btn amber" onClick={() => goToLesson(nextIdx)}>Урок {nextIdx + 1}</button>
                    ) : (
                      <button className="btn amber" onClick={reset}>Пройти диагностику заново</button>
                    )}
                  </div>
                  {nextIdx >= total && (
                    <div className="hint" style={{ marginTop: 12 }}>Курс пройден. Через месяц вернись и посмотри, сдвинулась ли слепая зона.</div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
