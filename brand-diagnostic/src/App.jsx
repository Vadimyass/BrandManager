import { useEffect, useRef, useState } from "react";
import { AXES, BUILDING_OPTIONS, buildQuestions, LEVELS, LINK_FIELDS } from "./cards.js";
import { diagnose, joinWaitlist, sendFeedback } from "./api.js";
import { CSS } from "./styles.js";

const EMPTY_ANSWERS = {
  building: "", name: "",
  cards: [],
  links: { store: "", landing: "", social: "" },
  selfScores: {},
};

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
  { text: "Твой бренд — это обещание, которое ты держишь каждый день", author: "правило любого сильного бренда" },
];

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
  const [picked, setPicked] = useState(null);
  const answersRef = useRef([]);
  const startX = useRef(0);

  const card = questions[idx];

  function commit(answer, dir) {
    if (!card || exiting) return;
    answersRef.current.push({ id: card.id, axis: card.axis, q: card.q, answer });
    setExiting({ card, dir });
    setDrag(null);
    setPicked(null);
    const next = idx + 1;
    setIdx(next);
    setTimeout(() => {
      setExiting(null);
      if (next >= questions.length) onDone(answersRef.current);
    }, FLY_MS);
  }

  function pickScale(n) {
    if (picked !== null || exiting) return;
    setPicked(n);
    setTimeout(() => commit(`${n}/5`, n >= 3 ? 1 : -1), 300);
  }

  const swipeable = card && card.type !== "scale";

  const onPointerDown = (e) => {
    if (!swipeable || exiting) return;
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
    if (dx > SWIPE_THRESHOLD) commit(card.type === "duo" ? card.right : "yes", 1);
    else if (dx < -SWIPE_THRESHOLD) commit(card.type === "duo" ? card.left : "no", -1);
  };

  const stampRight = (c) => (c.type === "duo" ? c.right : c.right ?? "ДА");
  const stampLeft = (c) => (c.type === "duo" ? c.left : c.left ?? "НЕТ");

  function renderCardBody(c, isTop) {
    return (
      <>
        {isTop && c.type !== "scale" && (
          <>
            <div className="stamp yes" style={{ opacity: drag ? Math.min(Math.max(drag.dx, 0) / SWIPE_THRESHOLD, 1) : 0 }}>{stampRight(c)}</div>
            <div className="stamp no" style={{ opacity: drag ? Math.min(Math.max(-drag.dx, 0) / SWIPE_THRESHOLD, 1) : 0 }}>{stampLeft(c)}</div>
          </>
        )}
        <div className="ax">{AXES.find((a) => a.key === c.axis)?.name ?? "Характер бренда"}</div>
        <div className="cq">{c.q}</div>
        {c.sub && <div className="csub">{c.sub}</div>}
        {c.type === "scale" && (
          <div className="scalerow">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={"scbtn" + (picked === n ? " picked" : picked !== null ? " dimmed" : "")}
                onClick={() => isTop && pickScale(n)}
              >{n}</button>
            ))}
          </div>
        )}
      </>
    );
  }

  const stack = [];
  if (exiting) {
    stack.push(
      <div key={exiting.card.id} className={"scard fly " + (exiting.dir > 0 ? "r" : "l")} style={{ zIndex: 4 }}>
        <div className="ax">{AXES.find((a) => a.key === exiting.card.axis)?.name ?? "Характер бренда"}</div>
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
      <div className="qnum">
        {String(Math.min(idx + 1, questions.length)).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
        {card?.type === "scale" ? " · выбери на шкале" : " · свайпай или жми кнопки"}
      </div>
      <div className="deck">{stack}</div>
      {card && card.type === "bool" && (
        <div className="deckbtns">
          <button className="dbtn no" onClick={() => commit("no", -1)}>{card.left ?? "Нет"}</button>
          <button className="dbtn skip" onClick={() => commit("skip", -1)}>Не знаю</button>
          <button className="dbtn yes" onClick={() => commit("yes", 1)}>{card.right ?? "Да"}</button>
        </div>
      )}
      {card && card.type === "duo" && (
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
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [diagnosticId, setDiagnosticId] = useState(null);
  const [error, setError] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(null);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const set = (id, v) => setAnswers((a) => ({ ...a, [id]: v }));
  const setLink = (id, v) => setAnswers((a) => ({ ...a, links: { ...a.links, [id]: v } }));
  const setScore = (axis, v) => setAnswers((a) => ({ ...a, selfScores: { ...a.selfScores, [axis]: v } }));

  async function assess(finalAnswers = answers) {
    setPhase("analyzing");
    setError("");
    try {
      const res = await diagnose(finalAnswers, true);
      setResult(res.result);
      setDiagnosticId(res.id);
      setPhase("result");
    } catch (e) {
      setError(String(e?.message ?? e));
      setPhase("error");
    }
  }

  const reset = () => {
    setPhase("intro"); setAnswers(EMPTY_ANSWERS); setQuestions([]); setResult(null);
    setDiagnosticId(null); setFeedbackSent(null); setJoined(false); setEmail("");
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

  const scoresReady = AXES.every((ax) => answers.selfScores[ax.key] >= 1);
  const selfLevel = scoresReady ? Math.min(...AXES.map((ax) => answers.selfScores[ax.key])) : null;

  return (
    <div className="bd">
      <style>{CSS}</style>
      <div className="blob a" /><div className="blob b" />
      <div className="wrap">

        {phase === "intro" && (
          <div className="phase">
            <div className="eyebrow">Диагностика бренда · v2</div>
            <h1>Узнай, на каком уровне твой бренд — за две минуты</h1>
            <p className="lede">Для инди-разработчиков и фаундеров. Отвечай свайпами — честно. Покажу уровень зрелости по пяти осям и где именно зона роста.</p>
            <div className="ladder">
              {LEVELS.map((l) => (
                <div key={l.n} className="rung dim">
                  <span className="rn">L{l.n}</span><span className="rname">{l.name}</span>
                </div>
              ))}
            </div>
            <button className="btn" onClick={() => setPhase("building")}>Начать</button>
            <div className="foot">Бета · рубрика v1 · ассессор + валидатор</div>
          </div>
        )}

        {phase === "building" && (
          <div className="phase">
            <div className="qnum">Перед стартом</div>
            <div className="q">Что ты строишь?</div>
            <div className="hint">От этого зависит, какие вопросы ты увидишь.</div>
            <div className="row" style={{ marginTop: 10 }}>
              {BUILDING_OPTIONS.map((o) => (
                <button key={o} className={"chip" + (answers.building === o ? " on" : "")} onClick={() => set("building", o)}>{o}</button>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <input className="field" placeholder="Название (необязательно)" value={answers.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("intro")}>Назад</button>
              <button className="btn" disabled={!answers.building} onClick={() => { setQuestions(buildQuestions(answers.building)); setPhase("cards"); }}>Поехали</button>
            </div>
          </div>
        )}

        {phase === "cards" && questions.length > 0 && (
          <div className="phase">
            <Deck questions={questions} onDone={(cards) => { set("cards", cards); setPhase("links"); }} />
          </div>
        )}

        {phase === "links" && (
          <div className="phase">
            <div className="qnum">Почти всё</div>
            <div className="q">Кинь ссылки</div>
            <div className="hint">Необязательно, но с ними оценка честнее: по факту, а не по самоотчёту.</div>
            {LINK_FIELDS.map((f) => (
              <div className="lfield" key={f.id}>
                <input className="field" placeholder={f.placeholder} value={answers.links[f.id]} onChange={(e) => setLink(f.id, e.target.value)} />
              </div>
            ))}
            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("scores")}>Пропустить</button>
              <button className="btn" onClick={() => setPhase("scores")}>Дальше</button>
            </div>
          </div>
        )}

        {phase === "scores" && (
          <div className="phase">
            <div className="qnum">Последний шаг</div>
            <div className="q">А теперь оцени себя сам</div>
            <div className="hint">По каждой оси, 1–5. Потом сравним с оценкой AI — обычно тут самое интересное.</div>
            {AXES.map((ax) => (
              <div className="srow" key={ax.key}>
                <span className="sname">{ax.name}</span>
                <span className="schips">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} className={"schip" + (answers.selfScores[ax.key] === n ? " on" : "")} onClick={() => setScore(ax.key, n)}>{n}</button>
                  ))}
                </span>
              </div>
            ))}
            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("links")}>Назад</button>
              <button className="btn amber" disabled={!scoresReady} onClick={() => assess()}>Оценить бренд</button>
            </div>
          </div>
        )}

        {phase === "analyzing" && (
          <div className="center phase">
            <div className="spin" />
            <div className="eyebrow" style={{ color: "var(--violet)" }}>Анализирую твой бренд</div>
            <Quotes />
          </div>
        )}

        {phase === "error" && (
          <div className="phase">
            <div className="q" style={{ marginTop: 0 }}>Не удалось получить оценку</div>
            <div className="err">{error || "Неизвестная ошибка."}</div>
            <div className="nav">
              <button className="btn ghost" onClick={reset}>Заново</button>
              <button className="btn" onClick={() => assess()}>Повторить</button>
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <div className="phase">
            <div className="card">
              <div className="eyebrow">Твой уровень зрелости бренда</div>
              <div className="big">L{result.overallLevel} · {result.levelName}</div>
              <div className="summary">{result.summary}</div>
              {selfLevel !== null && selfLevel !== result.overallLevel && (
                <div className="contrast">
                  Ты оценил себя на L{selfLevel} — рубрика говорит L{result.overallLevel}.
                  {selfLevel > result.overallLevel ? " Разрыв — это и есть точка роста." : " Ты строже к себе, чем рубрика."}
                </div>
              )}

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
                {(result.axes || []).map((ax) => (
                  <div className="axis" key={ax.key}>
                    <div className="top">
                      <span className="aname">{ax.name}</span>
                      <span className="dots">
                        {[1, 2, 3, 4, 5].map((d) => <span key={d} className={"dot" + (d <= ax.score ? " f" : "")} />)}
                      </span>
                    </div>
                    {ax.note && <div className="anote">{ax.note}</div>}
                    {answers.selfScores[ax.key] >= 1 && answers.selfScores[ax.key] !== ax.score && (
                      <div className="aself">твоя оценка: {answers.selfScores[ax.key]} / 5</div>
                    )}
                  </div>
                ))}
              </div>

              {result.gaps?.length > 0 && (
                <div className="block">
                  <h3>Зоны роста</h3>
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

            <div className="fbrow">
              <span className="fbq">Оценка попала?</span>
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
              <span className="pill">L{result.overallLevel} · {result.levelName}</span>
              {joined ? (
                <span className="pill" style={{ color: "var(--violet)", borderColor: "var(--violet)" }}>Ты в списке — напишем, когда откроем персональный план роста</span>
              ) : (
                <>
                  <input className="field" style={{ maxWidth: 240 }} placeholder="email для персонального плана" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button className="btn" disabled={!email.includes("@")} onClick={join}>В список</button>
                </>
              )}
            </div>
            <div className="nav">
              <button className="btn ghost" onClick={reset}>Пройти заново</button>
            </div>
            <div className="foot">Бета · оценка по рубрике v1 · перед продом рубрику финализирует эксперт</div>
          </div>
        )}

      </div>
    </div>
  );
}
