import { useState } from "react";
import { AXES, LEVELS, STEPS } from "./steps.js";
import { diagnose, joinWaitlist, sendFeedback } from "./api.js";
import { CSS } from "./styles.js";

const EMPTY_ANSWERS = {
  building: "", name: "", offer: "", audience: "", differentiation: "", selfBrand: "",
  assets: [], touchpoints: [],
  links: { store: "", landing: "", social: "" },
  selfScores: {},
  clarification: "",
};

export default function App() {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [clarifyQuestion, setClarifyQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [diagnosticId, setDiagnosticId] = useState(null);
  const [error, setError] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(null);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const s = STEPS[step];
  const set = (id, v) => setAnswers((a) => ({ ...a, [id]: v }));
  const toggleMulti = (id, v) =>
    setAnswers((a) => ({ ...a, [id]: a[id].includes(v) ? a[id].filter((x) => x !== v) : [...a[id], v] }));
  const setLink = (id, v) => setAnswers((a) => ({ ...a, links: { ...a.links, [id]: v } }));
  const setScore = (axis, v) => setAnswers((a) => ({ ...a, selfScores: { ...a.selfScores, [axis]: v } }));

  const canNext = () => {
    if (s.type === "choice") return !!answers.building;
    if (s.type === "text" || s.type === "textarea") return answers[s.id].trim().length >= (s.minLen ?? 1);
    if (s.type === "scores") return AXES.every((ax) => answers.selfScores[ax.key] >= 1);
    return true;
  };

  async function assess(skipGate = false) {
    setPhase("analyzing");
    setError("");
    try {
      const res = await diagnose(answers, skipGate);
      if (res.status === "clarify") {
        setClarifyQuestion(res.question || "Расскажи чуть подробнее о продукте.");
        setPhase("clarify");
        return;
      }
      setResult(res.result);
      setDiagnosticId(res.id);
      setPhase("result");
    } catch (e) {
      setError(String(e?.message ?? e));
      setPhase("error");
    }
  }

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

  const reset = () => {
    setPhase("intro"); setStep(0); setAnswers(EMPTY_ANSWERS); setResult(null);
    setDiagnosticId(null); setFeedbackSent(null); setJoined(false); setEmail(""); setClarifyQuestion("");
  };

  const selfLevel = AXES.every((ax) => answers.selfScores[ax.key] >= 1)
    ? Math.min(...AXES.map((ax) => answers.selfScores[ax.key]))
    : null;

  return (
    <div className="bd">
      <style>{CSS}</style>
      <div className="wrap">

        {phase === "intro" && (
          <div>
            <div className="eyebrow">Диагностика бренда · v1</div>
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
            <div className="foot">Бета · рубрика v1 · оценка через AI-ассессор с валидатором</div>
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
                <input className="field" placeholder={s.placeholder} value={answers[s.id]} onChange={(e) => set(s.id, e.target.value)} />
              )}
              {s.type === "textarea" && (
                <textarea className="field" placeholder={s.placeholder} value={answers[s.id]} onChange={(e) => set(s.id, e.target.value)} />
              )}
              {s.type === "multi" && (
                <div className="row">
                  {s.options.map((o) => (
                    <button key={o} className={"chip" + (answers[s.id].includes(o) ? " on" : "")} onClick={() => toggleMulti(s.id, o)}>{o}</button>
                  ))}
                </div>
              )}
              {s.type === "links" && (
                <div>
                  {s.fields.map((f) => (
                    <div className="lfield" key={f.id}>
                      <input className="field" placeholder={f.placeholder} value={answers.links[f.id]} onChange={(e) => setLink(f.id, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
              {s.type === "scores" && (
                <div>
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
                </div>
              )}

              <div className="nav">
                <button className="btn ghost" onClick={() => (step === 0 ? setPhase("intro") : setStep(step - 1))}>Назад</button>
                <div style={{ display: "flex", gap: 10 }}>
                  {s.skippable && step < STEPS.length - 1 && (
                    <button className="btn ghost" onClick={() => setStep(step + 1)}>Пропустить</button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button className="btn" disabled={!canNext()} onClick={() => setStep(step + 1)}>Дальше</button>
                  ) : (
                    <button className="btn amber" disabled={!canNext()} onClick={() => assess(false)}>Оценить бренд</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "clarify" && (
          <div className="qwrap">
            <div className="eyebrow">Один уточняющий вопрос</div>
            <div className="q">{clarifyQuestion}</div>
            <div className="hint">Без этого оценка получится мимо — лучше два предложения сейчас.</div>
            <textarea className="field" placeholder="Твой ответ…" value={answers.clarification} onChange={(e) => set("clarification", e.target.value)} />
            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("quiz")}>К вводу</button>
              <button className="btn amber" disabled={answers.clarification.trim().length < 5} onClick={() => assess(true)}>Оценить бренд</button>
            </div>
          </div>
        )}

        {phase === "analyzing" && (
          <div className="center">
            <div className="spin" />
            <div>
              <div className="eyebrow" style={{ color: "var(--violet)" }}>Анализирую</div>
              <div style={{ fontFamily: "var(--disp)", fontSize: 22, marginTop: 8 }}>Ассессор сверяет твой бренд с рубрикой, валидатор проверяет ассессора…</div>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div>
            <div className="q" style={{ marginTop: 0 }}>Не удалось получить оценку</div>
            <div className="err">{error || "Неизвестная ошибка."}</div>
            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("quiz")}>К вводу</button>
              <button className="btn" onClick={() => assess(false)}>Повторить</button>
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <div>
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
