import { useRef, useState } from "react";
import { AXES, BUILDING_OPTIONS, CARDS, LEVELS, LINK_FIELDS } from "./cards.js";
import { diagnose, joinWaitlist, sendFeedback } from "./api.js";
import { CSS } from "./styles.js";

const EMPTY_ANSWERS = {
  building: "", name: "",
  cards: [],
  links: { store: "", landing: "", social: "" },
  selfScores: {},
};

const FLY_MS = 380;
const SWIPE_THRESHOLD = 90;

function Deck({ onDone }) {
  const [idx, setIdx] = useState(0);
  const [drag, setDrag] = useState({ dx: 0, active: false });
  const [fly, setFly] = useState(null);
  const answersRef = useRef([]);
  const startX = useRef(0);

  const card = CARDS[idx];

  function commit(answer, dir) {
    if (fly) return;
    setFly({ dir });
    setDrag({ dx: 0, active: false });
    answersRef.current = [...answersRef.current, { id: card.id, axis: card.axis, q: card.q, answer }];
    setTimeout(() => {
      setFly(null);
      if (idx + 1 >= CARDS.length) onDone(answersRef.current);
      else setIdx(idx + 1);
    }, FLY_MS);
  }

  const onPointerDown = (e) => {
    if (fly) return;
    startX.current = e.clientX;
    setDrag({ dx: 0, active: true });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.active || fly) return;
    setDrag({ dx: e.clientX - startX.current, active: true });
  };
  const onPointerUp = () => {
    if (!drag.active || fly) return;
    if (drag.dx > SWIPE_THRESHOLD) commit("yes", 1);
    else if (drag.dx < -SWIPE_THRESHOLD) commit("no", -1);
    else setDrag({ dx: 0, active: false });
  };

  const transform = fly
    ? `translateX(${fly.dir * 130}%) rotate(${fly.dir * 14}deg)`
    : `translateX(${drag.dx}px) rotate(${drag.dx * 0.06}deg)`;
  const topClass = "scard" + (fly ? " fly" : drag.active ? "" : " snap");
  const axName = AXES.find((a) => a.key === card.axis)?.name ?? "";

  return (
    <div>
      <div className="bar"><div className="fill" style={{ width: `${(idx / CARDS.length) * 100}%` }} /></div>
      <div className="qnum">{String(idx + 1).padStart(2, "0")} / {String(CARDS.length).padStart(2, "0")} · свайпай или жми кнопки</div>
      <div className="deck">
        {CARDS[idx + 2] && <div className="scard behind2" />}
        {CARDS[idx + 1] && (
          <div className="scard behind1">
            <div className="ax">{AXES.find((a) => a.key === CARDS[idx + 1].axis)?.name}</div>
            <div className="cq" style={{ opacity: .35 }}>{CARDS[idx + 1].q}</div>
          </div>
        )}
        <div
          className={topClass}
          style={{ transform, zIndex: 3 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="stamp yes" style={{ opacity: fly?.dir === 1 ? 1 : Math.min(Math.max(drag.dx, 0) / SWIPE_THRESHOLD, 1) }}>{card.right ?? "ДА"}</div>
          <div className="stamp no" style={{ opacity: fly?.dir === -1 ? 1 : Math.min(Math.max(-drag.dx, 0) / SWIPE_THRESHOLD, 1) }}>{card.left ?? "НЕТ"}</div>
          <div className="ax">{axName}</div>
          <div className="cq">{card.q}</div>
          {card.sub && <div className="csub">{card.sub}</div>}
        </div>
      </div>
      <div className="deckbtns">
        <button className="dbtn no" onClick={() => commit("no", -1)}>{card.left ?? "Нет"}</button>
        <button className="dbtn skip" onClick={() => commit("skip", -1)}>Не знаю</button>
        <button className="dbtn yes" onClick={() => commit("yes", 1)}>{card.right ?? "Да"}</button>
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("intro");
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
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
    setPhase("intro"); setAnswers(EMPTY_ANSWERS); setResult(null);
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
            <p className="lede">Для инди-разработчиков и фаундеров. Отвечай свайпами — честно. Покажу уровень зрелости по пяти осям и где именно разрыв.</p>
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
              <button className="btn" disabled={!answers.building} onClick={() => setPhase("cards")}>Поехали</button>
            </div>
          </div>
        )}

        {phase === "cards" && (
          <div className="phase">
            <Deck onDone={(cards) => { set("cards", cards); setPhase("links"); }} />
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
            <div>
              <div className="eyebrow" style={{ color: "var(--violet)" }}>Анализирую</div>
              <div style={{ fontFamily: "var(--disp)", fontSize: 22, marginTop: 8 }}>Ассессор сверяет ответы с рубрикой, валидатор проверяет ассессора…</div>
            </div>
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
                <span className="pill" style={{ color: "var(--violet)", borderColor: "var(--violet)" }}>Ты в списке — напишем, когда откроем полный разбор</span>
              ) : (
                <>
                  <input className="field" style={{ maxWidth: 240 }} placeholder="email для полного разбора" value={email} onChange={(e) => setEmail(e.target.value)} />
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
