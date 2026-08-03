import { useEffect, useRef, useState } from "react";
import { AXIS_LABELS, LINK_FIELDS, NICHE_OPTIONS, SEED_CARDS } from "./cards.js";
import { COURSE_PRICE, pickHook, WHAT_YOU_GET } from "./offer.js";
import { clearSession, loadSession, PENDING_PHASES, saveSession } from "./session.js";
import { setTrackNiche, track } from "./analytics.js";
import { authErrorFromUrl, loadProgress, saveProgress, signInWithGoogle, signOut, supabase } from "./auth.js";
import { APP_VERSION } from "./version.js";
import { ARTICLES, articleBySlug } from "./articles.js";
import { diagnose, getCourse, getDeck, gradeHomework, joinWaitlist, sendFeedback } from "./api.js";
import { getLang, LANGS, setLang, t } from "./i18n.js";
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

function LangSwitch() {
  const cur = getLang();
  return (
    <div className="langsw">
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={"langsw-b" + (l.code === cur ? " on" : "")}
          onClick={() => l.code !== cur && setLang(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

// Маскот Melyo — хамелеон (картинка дизайнера).
function Mascot({ size = 96 }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}melyo-mascot.png`}
      alt="Маскот Melyo"
      className="mascot"
      style={{ width: size, height: "auto" }}
    />
  );
}

// Единый прогресс Фазы 1 — сегментами через все шаги.
const FLOW = ["intro", "niche", "seed", "tradeoffs", "links"];
function FlowBar({ phase }) {
  const idx = FLOW.indexOf(phase);
  if (idx < 0) return null;
  return (
    <div className="flowbar">
      <div className="dots5">
        {FLOW.map((_, i) => <span key={i} className={"d5" + (i <= idx ? " on" : "")} />)}
      </div>
      <div className="stepnum">{t("step_of")} {idx + 1} {t("step_of2")} {FLOW.length}</div>
    </div>
  );
}

const NICHE_ICON_PATHS = {
  "Дизайн или услуги на заказ": "M4 20l6-16h4l6 16M8 14h8",
  "Приложение или игра": "M6 5h12v14H6zM10 9h4M12 7v4",
  "Онлайн-магазин": "M4 8l2-4h12l2 4M4 8v11h16V8M9 19v-6h6v6",
  "Салон, студия, кафе": "M6 11h9a3 3 0 010 6H6zM6 11V6M15 8h2a2 2 0 010 4h-2",
  "Программа по подписке": "M4 6h16v12H4zM4 10h16M8 15h5",
  "Блог или личный бренд": "M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0",
  "Другое": "M12 4v16M4 12h16",
};
function NicheIcon({ name, on }) {
  const d = NICHE_ICON_PATHS[name] || NICHE_ICON_PATHS["Другое"];
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} stroke={on ? "var(--amber)" : "var(--muted)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
  const resultsRef = useRef([]);
  const item = items[i];
  if (!item) return null;

  const isRight = picked && picked === item.correct;
  const next = () => {
    resultsRef.current[i] = { q: item.q, picked, correct: item.correct, ok: picked === item.correct };
    setPicked(null);
    if (i + 1 >= items.length) onDone(resultsRef.current);
    else setI(i + 1);
  };

  const opt = (side) => (
    <button
      className={"qopt" + (picked ? (item.correct === side ? " correct" : picked === side ? " wrong" : " dim") : "")}
      disabled={!!picked}
      onClick={() => setPicked(side)}
    >
      <span>{side === "left" ? item.left : item.right}</span>
      {picked && item.correct === side && <span className="qcheck">✓</span>}
    </button>
  );

  return (
    <div className="qz-grid">
      <div className="qz-left">
        <div className="eyebrow" style={{ color: "var(--amber)" }}>{t("quiz_question")} {i + 1} {t("step_of2")} {items.length}</div>
        <div className="qz-q">{item.q}</div>
        <div className="qz-opts">
          {opt("left")}
          {opt("right")}
        </div>
      </div>
      <div className="qz-side">
        <img src={`${import.meta.env.BASE_URL}melyo-mascot.png`} alt="" className="qz-masc" />
        {picked ? (
          <>
            <div className={"qz-verdict" + (isRight ? " ok" : " miss")}>{isRight ? t("quiz_right") : t("quiz_wrong")}</div>
            <div className="qz-explain">{item.explain}</div>
            <div className="qz-foot">
              <span className={isRight ? "qz-xp" : "qz-xp off"}>{isRight ? t("quiz_xp") : t("quiz_noxp")}</span>
              <span className="qz-cnt">{i + 1}/{items.length}</span>
            </div>
            <button className="btnp" onClick={next}>{i + 1 >= items.length ? t("quiz_finish") : t("quiz_next")}</button>
          </>
        ) : (
          <div className="qz-prompt">{t("quiz_prompt")}</div>
        )}
      </div>
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

function Deck({ questions, onDone, label, hint }) {
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
              <span className="side">Вариант А</span>{c.left}
            </button>
            <span className="optor">или</span>
            <button className="opt r" onClick={() => isTop && commit(c.right, 1)}>
              <span className="side">Вариант Б</span>{c.right}
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

  const n = Math.min(idx + 1, questions.length);
  return (
    <div className={"deckwrap" + (label ? " deck-dilemma" : "")}>
      <div className="deckhead">
        <span className="deckcount">{label ? label(n, questions.length) : `${String(n).padStart(2, "0")} / ${String(questions.length).padStart(2, "0")}`}</span>
        <div className="bar"><div className="fill" style={{ width: `${(idx / questions.length) * 100}%` }} /></div>
      </div>
      <div className="deck">{stack}</div>
      {card && !card.rows && (
        <div className="deckbtns">
          <button className="dbtn no" onClick={() => commit(card.left, -1)}>{card.left}</button>
          <button className="dbtn yes" onClick={() => commit(card.right, 1)}>{card.right}</button>
        </div>
      )}
      {hint && (
        <div className="deckhint">
          <img src={`${import.meta.env.BASE_URL}melyo-mascot.png`} alt="" className="dhmasc" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const saved = useRef(loadSession()).current;
  const s = saved ?? {};

  const [phase, setPhase] = useState(s.phase ?? "welcome");
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
  const [lessonStage, setLessonStage] = useState(
    ["read", "quiz", "homework", "done"].includes(s.lessonStage) ? s.lessonStage : "read",
  );
  const [lessonIndex, setLessonIndex] = useState(s.lessonIndex ?? 0);
  const [submission, setSubmission] = useState("");
  const [grade, setGrade] = useState(null);
  const [grading, setGrading] = useState(false);
  const [shared, setShared] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [historyIdx, setHistoryIdx] = useState(null);
  const [readStep, setReadStep] = useState(0);
  const [meetStep, setMeetStep] = useState(0);
  const [profileAnswers, setProfileAnswers] = useState(["", "", ""]);
  const [courseLog, setCourseLog] = useState({});
  const lesson = lessons?.[lessonIndex] ?? null;
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [prevPhase, setPrevPhase] = useState("welcome");
  const [articleSlug, setArticleSlug] = useState(null);
  const lastAction = useRef(null);
  const resumed = useRef(false);

  useEffect(() => { track("landed"); }, []);

  // Шаро-ссылка на статью: .../#article=<slug> открывает её напрямую.
  useEffect(() => {
    const m = window.location.hash.match(/article=([a-z0-9-]+)/i);
    if (m && articleBySlug(m[1])) { setArticleSlug(m[1]); setPhase("article"); }
  }, []);

  function openArticle(slug) {
    setArticleSlug(slug);
    try { history.replaceState(null, "", `#article=${slug}`); } catch { /* ignore */ }
    setPhase("article");
    track("article_opened", { slug });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeArticle() {
    try { history.replaceState(null, "", window.location.pathname); } catch { /* ignore */ }
    setArticleSlug(null);
    setPhase("welcome");
  }

  // Авторизация: подхватываем сессию и слушаем вход/выход.
  useEffect(() => {
    const err = authErrorFromUrl();
    if (err) { setError(`Вход не удался: ${err}`); setPhase("error"); }
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadProgress(user.id).then((p) => p && setProgress(p));
    else setProgress(null);
  }, [user]);

  // Залогинился на велком-экране — сразу веду дальше, а не оставляю на воротах.
  useEffect(() => {
    if (user && phase === "welcome") setPhase("intro");
  }, [user, phase]);

  // Сохраняем прогресс только для залогиненных: сливаем патч в общий снимок.
  function persist(patch) {
    if (!user) return;
    setProgress((prev) => {
      const next = { ...(prev || {}), ...patch, updatedAt: new Date().toISOString() };
      saveProgress(user.id, next);
      return next;
    });
  }

  // Открытие урока — только аналитика. maxLesson НЕ трогаем здесь:
  // иначе простой просмотр «докручивал» прогресс и «Продолжить» перескакивал уроки.
  useEffect(() => {
    if (phase === "lesson" && lessons?.[lessonIndex]) {
      const total = courseTotal || lessons[lessonIndex].total;
      track("lesson_viewed", { index: lessonIndex, human: lessonIndex + 1, total });
      persist({ courseAxis: result?.weakness?.axis, total });
    }
  }, [phase, lessonIndex]);

  // maxLesson = число реально ЗАВЕРШЁННЫХ уроков. Растёт только при доходе до «done».
  useEffect(() => {
    if (phase === "lesson" && lessonStage === "done" && lesson) {
      const total = courseTotal || lesson.total;
      const completed = Math.max(progress?.maxLesson ?? 0, lesson.index + 1);
      if (completed >= total) track("course_completed", { total });
      persist({ maxLesson: completed });
      saveLessonLog(lesson.index, { title: lesson.title, completedAt: new Date().toISOString() });
    }
  }, [phase, lessonStage]);

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
    track("seed_done");
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
    track("tradeoffs_done");
    setPhase("links");
  }

  function assess(finalLinks = links, ds = decisions) {
    guard(async () => {
      setPhase("analyzing");
      const res = await diagnose({ name, niche, seedAnswers, calibration, decisions: ds, links: finalLinks, deckUsage, version: APP_VERSION });
      setResult(res.result);
      setDiagnosticId(res.id);
      track("diagnosis_shown", { weakness: res.result?.weakness?.axis });
      persist({
        weaknessAxis: res.result?.weakness?.axis,
        weaknessLabel: AXIS_LABELS[res.result?.weakness?.axis] ?? "",
        superLabel: AXIS_LABELS[res.result?.superpower?.axis] ?? "",
        diagnosisAt: new Date().toISOString(),
        maxLesson: 0, homework: {},
      });
      setPhase("result");
    });
  }

  // Точку входа в курс раздваиваем: если уроков ещё нет — сперва знакомство с Мелио,
  // потом генерация. Если уроки уже собраны — сразу открываем.
  function beginCourse() {
    if (lessons?.[0]) { openCourse(); return; }
    setMeetStep(0);
    setProfileAnswers(["", "", ""]);
    setPhase("meet");
    track("meet_opened");
  }

  // Собираем ответы знакомства в короткий профиль дела — он уточняет генерацию.
  function profileText() {
    const qs = [t("meet_q1"), t("meet_q2"), t("meet_q3")];
    return profileAnswers
      .map((a, i) => (a.trim() ? `${qs[i]} — ${a.trim()}` : ""))
      .filter(Boolean)
      .join(" | ");
  }

  // Весь курс собирается одним запросом; дальше уроки листаются мгновенно, без загрузки.
  function openCourse(profile) {
    track("course_opened");
    if (lessons?.[0]) {
      setLessonIndex(0);
      setReadStep(0);
      setLessonStage("read");
      setPhase("lesson");
      return;
    }
    guard(async () => {
      setPhase("building");
      const res = await getCourse(calibration, niche, result, profile);
      const byIndex = {};
      for (const l of res.lessons) byIndex[l.index] = l;
      setLessons(byIndex);
      if (res.total) setCourseTotal(res.total);
      setLessonIndex(0);
      setReadStep(0);
      setLessonStage("read");
      setPhase("lesson");
    });
  }

  function goToLesson(index) {
    if (!lessons?.[index]) return;
    setLessonIndex(index);
    setLessonStage("read");
    setReadStep(0);
    setSubmission(""); setGrade(null); setGrading(false); setQuizResult(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // История урока: держим в памяти (для гостей и разбора темы) и персистим для залогиненных.
  function saveLessonLog(index, patch) {
    setCourseLog((prev) => ({ ...prev, [index]: { ...(prev[index] || {}), ...patch } }));
    const prevLog = progress?.lessonLog || {};
    const merged = { ...(prevLog[index] || {}), ...patch };
    persist({ lessonLog: { ...prevLog, [index]: merged } });
  }

  function onQuizDone(results) {
    const items = (results || []).filter(Boolean);
    const correct = items.filter((r) => r.ok).length;
    setQuizResult({ correct, total: items.length, items });
    saveLessonLog(lesson.index, {
      title: lesson.title,
      term: lesson.term,
      takeaway: lesson.takeaway,
      relevance: lesson.relevance,
      quiz: items,
      quizCorrect: correct,
      quizTotal: items.length,
    });
    // Подытог после каждого урока не показываем — «чему научились» соберём в разбор темы в конце.
    setLessonStage(lesson.task ? "homework" : "done");
  }

  async function submitHomework() {
    if (submission.trim().length < 3) return;
    setGrading(true);
    try {
      const res = await gradeHomework(result.weakness.axis, lesson.index, lesson.task, submission, calibration, niche);
      setGrade(res);
      track("homework_graded", { index: lesson.index, score: res?.total });
      persist({ homework: { ...(progress?.homework || {}), [lesson.index]: res?.total } });
      saveLessonLog(lesson.index, {
        title: lesson.title,
        task: lesson.task,
        homework: { submission, total: res?.total, max: res?.max ?? 10, comment: res?.comment ?? "" },
      });
    } catch (e) {
      setGrade({ error: String(e?.message ?? e) });
    } finally {
      setGrading(false);
    }
  }

  // Снимок сессии: вкладку могут выгрузить в фоне, особенно на телефоне.
  useEffect(() => {
    if (phase === "intro" || phase === "welcome" || phase === "article") return;
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
    setSubmission(""); setGrade(null); setGrading(false); setShared(false); setQuizResult(null); setHistoryIdx(null);
    setReadStep(0); setMeetStep(0); setProfileAnswers(["", "", ""]); setCourseLog({});
    setDecisions([]); setLinks({ store: "", landing: "", social: "" }); setResult(null);
    setDiagnosticId(null); setFeedbackSent(null); setJoined(false); setEmail(""); setDeckUsage([]); setIntent(null);
  };

  async function giveFeedback(verdict) {
    setFeedbackSent(verdict);
    track("feedback", { verdict });
    try { await sendFeedback(diagnosticId, verdict); } catch { /* не блокируем UI */ }
  }

  async function join(intent = "plan") {
    try {
      await joinWaitlist(email, diagnosticId, intent);
      setJoined(true);
      track("email_captured", { intent });
    } catch (e) {
      setError(String(e?.message ?? e));
    }
  }

  async function shareResult() {
    track("share_clicked", { weakness: result?.weakness?.axis });
    const label = AXIS_LABELS[result?.weakness?.axis] ?? "";
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Прошёл диагностику в Melyo: моя слепая зона — ${label}. А твоя? ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Моя бизнес-диагностика", text, url });
        track("share_done", { via: "native" });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        track("share_done", { via: "clipboard" });
      }
    } catch { /* пользователь отменил — не ошибка */ }
  }

  const weakLabel = result ? (AXIS_LABELS[result.weakness?.axis] ?? "") : "";
  const superLabel = result ? (AXIS_LABELS[result.superpower?.axis] ?? "") : "";
  const hook = result ? pickHook(niche, result.weakness?.axis) : null;

  return (
    <div className="bd">
      <style>{CSS}</style>
      <div className="blob a" /><div className="blob b" />
      <div className={"wrap" + (["welcome", "result", "niche", "intro", "tradeoffs", "lesson", "offer"].includes(phase) ? " wrap-wide" : "")}>

        {phase !== "welcome" && (
          <div className="topbar">
            <LangSwitch />
            {user ? (
              <>
                <button className="tbtn" onClick={() => { setPrevPhase(phase); setPhase("cabinet"); }}>{t("cabinet")}</button>
                <button className="tbtn ghost" onClick={() => signOut()}>{t("logout")}</button>
              </>
            ) : (
              <button className="tbtn" onClick={() => signInWithGoogle()}>{t("login")}</button>
            )}
          </div>
        )}

        {phase === "welcome" && (
          <div className="phase wl">
            <div className="wl-brand"><img src={`${import.meta.env.BASE_URL}melyo-mascot.png`} alt="" className="wl-brandimg" /><span>melyo</span><LangSwitch /></div>

            <div className="wl-grid">
              <div className="wl-left">
                <div className="wl-hero">
                  <img src={`${import.meta.env.BASE_URL}melyo-mascot.png`} alt="Маскот Melyo" className="wl-mascot" />
                  <div className="wl-bubble">{t("melio_hi")}</div>
                </div>
                <h1 className="wl-h1">{t("wl_h1")}</h1>
                <p className="wl-sub">{t("wl_sub")}</p>
                <div className="wl-stats">
                  <div className="wl-stat"><b>10</b><span>{t("wl_dilemmas")}</span></div>
                  <div className="wl-stat"><b>5</b><span>{t("wl_minicourses")}</span></div>
                  <div className="wl-stat"><b>4</b><span>{t("wl_minlesson")}</span></div>
                </div>
              </div>

              <div className="wl-right">
                <h2 className="wl-h2">{t("wl_begin")}</h2>
                <p className="wl-note">{t("wl_savenote")}</p>
                <button className="gbtn" onClick={() => { track("login_clicked", { from: "welcome" }); signInWithGoogle(); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/><path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 010-4.18V7.07H2.18a11 11 0 000 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                  {t("wl_google")}
                </button>
                <button className="gbtn ghost" onClick={() => { track("guest_chosen"); setPhase("intro"); }}>{t("wl_guest")}</button>
                <p className="wl-fine">{t("wl_fine")}</p>

                <div className="wl-or"><span>{t("wl_orread")}</span></div>
                <div className="wl-articles">
                  {ARTICLES.map((a) => (
                    <button className="wl-arow" key={a.slug} onClick={() => openArticle(a.slug)}>
                      <span className="wl-atitle">{a.title}</span>
                      <span className="wl-atime">3 мин</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "article" && articleBySlug(articleSlug) && (() => {
          const a = articleBySlug(articleSlug);
          return (
            <div className="phase article">
              <button className="btn ghost" style={{ marginBottom: 14 }} onClick={closeArticle}>← Все статьи</button>
              <div className="eyebrow">Статья · брендинг</div>
              <h1 style={{ fontSize: "clamp(26px,5.2vw,40px)" }}>{a.title}</h1>
              <p className="lede">{a.description}</p>
              <div className="artbody">
                {a.blocks.map((b, i) => {
                  if (b.h) return <h3 className="arth" key={i}>{b.h}</h3>;
                  if (b.list) return <ul className="artul" key={i}>{b.list.map((x, j) => <li key={j}>{x}</li>)}</ul>;
                  return <p key={i}>{b.p}</p>;
                })}
              </div>
              <div className="coursecta" style={{ marginTop: 26 }}>
                <div>
                  <div className="cctatitle" style={{ fontSize: 20 }}>А какая слепая зона у твоего бизнеса?</div>
                  <div className="cctasub">Проверь за 10 свайпов — AI-разбор твоих решений.</div>
                </div>
                <button className="btn amber cctabtn" onClick={() => { closeArticle(); setPhase("niche"); track("cta_from_article", { slug: a.slug }); }}>Пройти диагностику →</button>
              </div>
              <div className="artnext">
                <div className="eyebrow" style={{ color: "var(--violet)" }}>Ещё статьи</div>
                <div className="artlist">
                  {ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3).map((x) => (
                    <button className="artitem" key={x.slug} onClick={() => openArticle(x.slug)}>
                      <span className="artititle">{x.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {phase === "cabinet" && (
          <div className="phase">
            <button className="btn ghost" style={{ marginBottom: 14 }} onClick={() => setPhase(prevPhase && prevPhase !== "cabinet" ? prevPhase : (result ? "result" : "welcome"))}>← Назад</button>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img src={`${import.meta.env.BASE_URL}melyo-mascot.png`} alt="" style={{ width: 64, height: "auto", flex: "none" }} />
              <div>
                <div className="eyebrow">Личный кабинет</div>
                <h1 style={{ fontSize: "clamp(24px,3vw,34px)", margin: "6px 0 0" }}>Привет{user?.user_metadata?.name ? `, ${user.user_metadata.name.split(" ")[0]}` : ""}</h1>
              </div>
            </div>
            {!progress?.weaknessAxis ? (
              <>
                <p className="lede">Ты ещё не проходил диагностику. Пройди — и тут появится твой прогресс.</p>
                <button className="btn amber" onClick={() => setPhase("intro")}>Пройти диагностику</button>
              </>
            ) : (
              <>
                <div className="card" style={{ marginTop: 8 }}>
                  <div className="eyebrow">Твой последний диагноз</div>
                  <div className="big" style={{ fontSize: "clamp(22px,4vw,30px)" }}>Слепая зона: {progress.weaknessLabel}</div>
                  {progress.superLabel && <div className="summary">Суперсила: {progress.superLabel}</div>}
                </div>

                <div className="block">
                  <h3 style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--violet)" }}>Курс</h3>
                  {progress.total ? (
                    <>
                      <div className="bar" style={{ marginTop: 4 }}><div className="fill" style={{ width: `${Math.min(100, ((progress.maxLesson || 0) / progress.total) * 100)}%` }} /></div>
                      <div className="hint" style={{ marginTop: 8 }}>Пройдено {progress.maxLesson || 0} из {progress.total} уроков</div>
                    </>
                  ) : (
                    <div className="hint">Курс ещё не начат.</div>
                  )}
                </div>

                {progress.lessonLog && Object.keys(progress.lessonLog).length > 0 && (
                  <div className="block">
                    <h3 style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--amber)" }}>История уроков</h3>
                    <div className="histlist">
                      {Object.entries(progress.lessonLog).sort((a, b) => a[0] - b[0]).map(([idx, log]) => {
                        const i = Number(idx);
                        const open = historyIdx === i;
                        return (
                          <div className={"histitem" + (open ? " open" : "")} key={idx}>
                            <button className="histhead" onClick={() => setHistoryIdx(open ? null : i)}>
                              <span className="histnum">Урок {i + 1}</span>
                              <span className="histtitle">{log.title || log.term || ""}</span>
                              <span className="histmeta">
                                {log.quizTotal ? <span className="histbadge">квиз {log.quizCorrect}/{log.quizTotal}</span> : null}
                                {log.homework?.total != null ? <span className="histbadge amber">дз {log.homework.total}/{log.homework.max || 10}</span> : null}
                                <span className="histchev">{open ? "▾" : "▸"}</span>
                              </span>
                            </button>
                            {open && (
                              <div className="histbody">
                                {log.takeaway && <div className="histtake">{log.takeaway}</div>}
                                {log.quiz?.length > 0 && (
                                  <div className="histsec">
                                    <div className="eyebrow">Как ты ответил</div>
                                    {log.quiz.map((r, qi) => (
                                      <div className={"recap-row" + (r.ok ? " ok" : " miss")} key={qi}>
                                        <span className="recap-mk">{r.ok ? "✓" : "✕"}</span>
                                        <span className="recap-q">{r.q}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {log.homework && (
                                  <div className="histsec">
                                    <div className="eyebrow">Домашка</div>
                                    {log.task && <div className="histtask">{log.task}</div>}
                                    {log.homework.submission && <div className="histsub">«{log.homework.submission}»</div>}
                                    {log.homework.total != null && <div className="histscore">Оценка: {log.homework.total} / {log.homework.max || 10}</div>}
                                    {log.homework.comment && <div className="histcomment">{log.homework.comment}</div>}
                                  </div>
                                )}
                                {lessons?.[i] && (
                                  <button className="btnlink" onClick={() => { goToLesson(i); setPhase("lesson"); }}>Открыть урок заново →</button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="nav">
                  <button className="btn ghost" onClick={() => setPhase("intro")}>Новая диагностика</button>
                  {result && Object.keys(lessons).length > 0 && (
                    <button className="btn amber" onClick={() => {
                      const total = courseTotal || 1;
                      const nextIdx = Math.min(progress.maxLesson || 0, total - 1);
                      goToLesson(nextIdx);
                      setPhase("lesson");
                    }}>{(progress.maxLesson || 0) >= (courseTotal || 1) ? "Повторить курс" : "Продолжить курс"}</button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {phase === "intro" && (
          <div className="phase screen">
            <FlowBar phase="intro" />
            <Mascot size={110} />
            <h2 className="scr-h" style={{ marginTop: 14 }}>{t("ob_name_q")}</h2>
            <p className="scr-sub">{t("ob_name_sub")}</p>
            <input className="field" style={{ maxWidth: 360, textAlign: "center" }} placeholder={t("ob_name_ph")} value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btnp" style={{ marginTop: 18 }} onClick={() => setPhase("niche")}>{t("start")}</button>
            <button className="btnlink" onClick={() => setPhase("welcome")}>{t("back")}</button>
          </div>
        )}

        {phase === "niche" && (
          <div className="phase screen">
            <FlowBar phase="niche" />
            <Mascot />
            <h2 className="scr-h">{t("ob_niche_q")}</h2>
            <div className="tiles">
              {NICHE_OPTIONS.map((o) => (
                <button key={o} className={"tile" + (niche === o ? " on" : "")} onClick={() => setNiche(o)}>
                  <NicheIcon name={o} on={niche === o} />
                  <span className="tilelabel">{o}</span>
                </button>
              ))}
            </div>
            <button className="btnp" disabled={!niche} onClick={() => { setTrackNiche(niche); track("niche_picked", { niche }); setPhase("seed"); }}>Дальше</button>
            <button className="btnlink" onClick={() => setPhase("intro")}>Назад</button>
          </div>
        )}

        {phase === "seed" && (
          <div className="phase">
            <FlowBar phase="seed" />
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
            <FlowBar phase="tradeoffs" />
            {calibration && (
              <div className="share" style={{ marginBottom: 16, marginTop: 0, justifyContent: "center" }}>
                <span className="pill">Похоже на: {calibration.industry} · {calibration.model}</span>
                <span className="pill">Метрика ниши: {calibration.key_metric}</span>
              </div>
            )}
            <Deck
              questions={tradeoffs}
              onDone={onTradeoffsDone}
              label={(i, t) => `Дилемма ${i} из ${t}`}
              hint="Здесь нет правильных ответов — только твои приоритеты."
            />
          </div>
        )}

        {phase === "links" && (
          <div className="phase">
            <FlowBar phase="links" />
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
          <div className="phase res">
            <div className="res-top">
              <div className="res-head">
                <Mascot size={76} />
                <div>
                  <div className="eyebrow">Твой профиль предпринимателя</div>
                  <h1 className="res-title">{result.superpower?.title ? `${result.superpower.title}, но слабое место — ${weakLabel.toLowerCase()}` : `Слепая зона: ${weakLabel}`}</h1>
                </div>
              </div>
              <div className="res-done">Диагностика завершена · {decisions.length} дилемм</div>
            </div>

            <p className="res-diag">{result.diagnosis}</p>

            <div className="res-two">
              <div className="rescard super">
                <div className="rlabel">Суперсила</div>
                <div className="rtitle">{result.superpower?.title}</div>
                <div className="rnote">{result.superpower?.note}</div>
              </div>
              <div className="rescard weak">
                <div className="rlabel muted">Слепая зона</div>
                <div className="rtitle">{result.weakness?.title || weakLabel}</div>
                <div className="rnote">{result.weakness?.note}</div>
              </div>
            </div>

            <div className="res-bottom">
              <div className="res-plan">
                <div className="eyebrow">Мини-план на 3 недели</div>
                {(result.sprints || []).slice(0, 3).map((s, i) => (
                  <div className="planrow2" key={i}>
                    <span className="pnum2">{i + 1}</span>
                    <span className="ptxt">{s.title}</span>
                    <span className="pweek">неделя {i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="res-share">
                <div className="rsq">«Моя слепая зона — {weakLabel}. А твоя?»</div>
                <div className="rsbrand">MELYO · ДИАГНОСТИКА БИЗНЕСА</div>
                <button className="btnp" onClick={shareResult}>{shared ? "Скопировано ✓" : "Поделиться карточкой"}</button>
              </div>
            </div>

            {!user && (
              <div className="loginnudge">
                <div>
                  <div className="lntitle">Сохранить твой результат?</div>
                  <div className="lnsub">Войди через Google — диагноз, план и прогресс курса не потеряются, вернёшься с любого устройства.</div>
                </div>
                <button className="btn amber lnbtn" onClick={() => { track("login_clicked", { from: "result" }); signInWithGoogle(); }}>Сохранить с Google</button>
              </div>
            )}

            {hook && (
              <div className="coursecta">
                <div>
                  <div className="eyebrow" style={{ color: "var(--amber)" }}>Есть курс под твою слепую зону</div>
                  <div className="cctatitle">{hook.course}</div>
                  <div className="cctasub">Уроки от основ к глубине, по одной идее за раз. Первый — бесплатно.</div>
                </div>
                <button className="btnp cctabtn" onClick={beginCourse}>Открыть курс →</button>
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
              <button className="btnlink" onClick={reset} style={{ marginLeft: "auto" }}>Пройти заново</button>
            </div>
          </div>
        )}

        {phase === "offer" && result && hook && (
          <div className="phase off-grid">
            <div className="off-main">
              <div className="eyebrow">Курс под твою слепую зону</div>
              <h1 style={{ fontSize: "clamp(26px,3.4vw,40px)" }}>{hook.course}</h1>
              <p className="lede">
                Ты только что прочитал начало первого урока. Дальше — ещё уроки, собранные под {weakLabel.toLowerCase()} и твою нишу
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
                  <div className="eyebrow" style={{ color: "var(--amber)" }}>Что ты сделаешь за месяц</div>
                  {result.sprints.map((s, i) => (
                    <div className="planrow" key={i}>
                      <span className="pnum">{i + 1}</span>
                      <span>{s.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="off-side">
              <img src={`${import.meta.env.BASE_URL}melyo-mascot.png`} alt="" className="off-masc" />
              <div className="price">{COURSE_PRICE}</div>
              <div className="pricenote">весь курс навсегда</div>
              <button className="btn amber" style={{ width: "100%", padding: "15px", marginTop: 8 }} onClick={beginCourse}>Начать курс — бесплатно</button>
              <button className="btnp" style={{ marginTop: 10 }} onClick={() => setPhase("checkout")}>Забрать весь курс</button>
              <button className="btnlink" onClick={() => setPhase("result")}>← к диагнозу</button>
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
                  <button className="btn amber" style={{ width: "100%" }} onClick={() => { setIntent("purchase"); track("buy_clicked"); }}>Оплатить</button>
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
                <button className="btn amber" onClick={beginCourse}>Открыть курс</button>
                <div className="hint" style={{ marginTop: 10 }}>Доступ на время беты открыт — курс собирается под тебя прямо сейчас.</div>
              </div>
            )}

            <div className="nav">
              <button className="btn ghost" onClick={() => setPhase("offer")}>Назад</button>
            </div>
          </div>
        )}

        {phase === "meet" && (
          <div className="phase meet">
            {meetStep === 0 ? (
              <div className="meet-intro">
                <img src={`${import.meta.env.BASE_URL}melyo-mascot.png`} alt="Мелио" className="meet-masc" />
                <div className="meet-bubble">{t("meet_intro")}</div>
                <button className="btnp" style={{ maxWidth: 260 }} onClick={() => setMeetStep(1)}>{t("next")}</button>
              </div>
            ) : (() => {
              const qi = meetStep - 1;
              const last = meetStep >= 3;
              return (
                <div className="meet-q">
                  <div className="meet-dots">
                    {[0, 1, 2].map((d) => <span key={d} className={"d5" + (d <= qi ? " on" : "")} />)}
                  </div>
                  <div className="meet-row">
                    <img src={`${import.meta.env.BASE_URL}melyo-mascot.png`} alt="Мелио" className="meet-masc sm" />
                    <div className="meet-bubble sm">{t(`meet_q${meetStep}`)}</div>
                  </div>
                  <input
                    className="field"
                    style={{ maxWidth: 420, marginTop: 6 }}
                    placeholder={t(`meet_q${meetStep}_ph`)}
                    value={profileAnswers[qi]}
                    autoFocus
                    onChange={(e) => setProfileAnswers((a) => a.map((x, k) => (k === qi ? e.target.value : x)))}
                    onKeyDown={(e) => { if (e.key === "Enter" && !last) setMeetStep(meetStep + 1); }}
                  />
                  <div className="nav">
                    <button className="btn ghost" onClick={() => openCourse(profileText())}>{t("meet_skip")}</button>
                    {last ? (
                      <button className="btn amber" onClick={() => openCourse(profileText())}>{t("meet_go")}</button>
                    ) : (
                      <button className="btnp" style={{ maxWidth: 200 }} onClick={() => setMeetStep(meetStep + 1)}>{t("next")}</button>
                    )}
                  </div>
                </div>
              );
            })()}
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
            <div className="lsn-top">
              <span className="deckcount">{lesson.index + 1} / {courseTotal || lesson.total}{lesson.term ? ` · ${lesson.term}` : ""}</span>
              <div className="bar"><div className="fill" style={{ width: `${((lesson.index + 1) / (courseTotal || lesson.total)) * 100}%` }} /></div>
            </div>

            {lessonStage === "read" && (
              <div className="lsn-grid">
                <div className="lsn-visual">
                  {lesson.scheme?.length > 1 && (
                    <div className="lsn-vcard">
                      <div className="eyebrow" style={{ color: "var(--amber)" }}>{t("lsn_how")}</div>
                      <div className="scheme">
                        {lesson.scheme.map((sc, i) => (
                          <span className="schemepart" key={i}>
                            <span className="schemenode">{sc}</span>
                            {i < lesson.scheme.length - 1 && <span className="schemearrow">→</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {lesson.examples?.length > 0 && (
                    <div className="lsn-vcard">
                      <div className="eyebrow" style={{ color: "var(--violet)" }}>{t("lsn_break")}</div>
                      {lesson.examples.map((ex, i) => (
                        <div className="example" key={i}>
                          <div className="excase">{ex.case}</div>
                          <div className="exwhy"><span className="exmk">{t("lsn_why")}</span> {ex.why}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!(lesson.scheme?.length > 1) && !(lesson.examples?.length > 0) && (
                    <div className="lsn-ph"><img src={`${import.meta.env.BASE_URL}melyo-mascot.png`} alt="" /></div>
                  )}
                </div>

                <div className="lsn-main">
                  <div className="lsn-num">{t("word_lesson")} {lesson.index + 1}</div>
                  <h1 className="lsn-about">{lesson.title}</h1>
                  {lesson.summary && <p className="lsn-lead">{lesson.summary}</p>}

                  {(() => {
                    const steps = lesson.steps?.length ? lesson.steps : [lesson.body].filter(Boolean);
                    const nsteps = Math.max(steps.length, 1);
                    const cur = Math.min(readStep, nsteps - 1);
                    const isFirst = cur === 0;
                    const isLast = cur >= nsteps - 1;
                    return (
                      <>
                        <div className="lsn-steps">
                          {steps.map((_, si) => <span key={si} className={"lsn-dot" + (si <= cur ? " on" : "")} />)}
                          <span className="lsn-stepn">{cur + 1} / {nsteps}</span>
                        </div>

                        {isFirst && lesson.stat && <div className="tstat">{lesson.stat}</div>}
                        {isFirst && lesson.statNote && <div className="tstatnote">{lesson.statNote}</div>}

                        <p className="lsn-text" key={cur}>{steps[cur]}</p>

                        {isLast && (
                          <div className="termbox">
                            <div className="eyebrow" style={{ color: "var(--amber)" }}>{t("lsn_plain")}</div>
                            <div className="termnote">{lesson.termNote}</div>
                            <span className="termtag">{lesson.term}</span>
                          </div>
                        )}

                        <div className="nav">
                          {isFirst ? (
                            <button className="btnlink" onClick={() => setPhase("result")}>← {t("lsn_todiag")}</button>
                          ) : (
                            <button className="btnlink" onClick={() => setReadStep(cur - 1)}>← {t("back")}</button>
                          )}
                          {isLast ? (
                            <button className="btnp" style={{ maxWidth: 220 }} onClick={() => setLessonStage(lesson.quiz?.length ? "quiz" : "homework")}>
                              {lesson.quiz?.length ? t("lsn_toquiz") : t("lsn_totask")}
                            </button>
                          ) : (
                            <button className="btnp" style={{ maxWidth: 200 }} onClick={() => setReadStep(cur + 1)}>{t("lsn_next_step")}</button>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {lessonStage === "quiz" && (
              <Quiz items={lesson.quiz} onDone={onQuizDone} />
            )}

            {lessonStage === "homework" && (
              <div className="quizbox">
                <div className="eyebrow" style={{ color: "var(--amber)" }}>{t("hw_title")}</div>
                <div className="quizq">{lesson.task}</div>
                {!grade ? (
                  <>
                    <textarea
                      className="field"
                      style={{ minHeight: 120, marginTop: 14 }}
                      placeholder={t("hw_ph")}
                      value={submission}
                      onChange={(e) => setSubmission(e.target.value)}
                    />
                    <div className="nav">
                      <button className="btn ghost" onClick={() => setLessonStage("done")}>{t("hw_skip")}</button>
                      <button className="btn amber" disabled={submission.trim().length < 3 || grading} onClick={submitHomework}>
                        {grading ? t("hw_checking") : t("hw_submit")}
                      </button>
                    </div>
                  </>
                ) : grade.error ? (
                  <div className="err" style={{ marginTop: 14 }}>{grade.error}
                    <div className="nav">
                      <button className="btn ghost" onClick={() => setLessonStage("done")}>{t("hw_skip")}</button>
                      <button className="btn" onClick={() => setGrade(null)}>{t("hw_again")}</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 16 }}>
                    <div className="scorebig">{grade.total}<span className="scoremax"> / {grade.max}</span></div>
                    {grade.breakdown?.map((b, i) => (
                      <div className="critrow" key={i}>
                        <div className="crithead">
                          <span>{b.label}</span>
                          <span className="critpts">{b.awarded}/{b.max}</span>
                        </div>
                        <div className="critbar"><div className="critfill" style={{ width: `${(b.awarded / b.max) * 100}%` }} /></div>
                        {b.note && <div className="critnote">{b.note}</div>}
                      </div>
                    ))}
                    {grade.comment && <div className="next" style={{ marginTop: 14 }}>{grade.comment}</div>}
                    <div className="nav">
                      <button className="btn ghost" onClick={() => { setGrade(null); }}>{t("hw_rewrite")}</button>
                      <button className="btn amber" onClick={() => setLessonStage("done")}>{t("next")}</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {lessonStage === "done" && (() => {
              const nextIdx = lesson.index + 1;
              const total = courseTotal || lesson.total;
              const isThemeEnd = nextIdx >= total;

              if (!isThemeEnd) {
                return (
                  <div className="lsn-doneshort">
                    <img src={`${import.meta.env.BASE_URL}melyo-mascot.png`} alt="Мелио" className="meet-masc sm" />
                    <div className="meet-bubble sm">{t("lsn_done_short")}</div>
                    <div className="nav">
                      <button className="btn ghost" onClick={() => setPhase("result")}>{t("lsn_todiag")}</button>
                      <button className="btn amber" onClick={() => goToLesson(nextIdx)}>{t("lsn_done_next")}</button>
                    </div>
                  </div>
                );
              }

              // Разбор всей темы: собираем из журнала (память + прогресс).
              const log = { ...(progress?.lessonLog || {}), ...courseLog };
              const rows = Object.entries(log).map(([i, l]) => ({ i: Number(i), ...l })).sort((a, b) => a.i - b.i);
              const correct = rows.reduce((s, r) => s + (r.quizCorrect || 0), 0);
              const qtotal = rows.reduce((s, r) => s + (r.quizTotal || 0), 0);
              return (
                <div className="theme">
                  <div className="meet-row">
                    <img src={`${import.meta.env.BASE_URL}melyo-mascot.png`} alt="Мелио" className="meet-masc sm" />
                    <div>
                      <div className="lsn-num" style={{ fontSize: "clamp(26px,4vw,40px)" }}>{t("theme_title")}</div>
                      <div className="lsn-lead" style={{ margin: 0 }}>{t("theme_sub")}</div>
                    </div>
                  </div>

                  {qtotal > 0 && (
                    <div className="recap-score" style={{ marginTop: 18 }}>
                      <span className="recap-num">{correct}<span className="recap-den"> / {qtotal}</span></span>
                      <span className="recap-lbl">{t("theme_score")}</span>
                    </div>
                  )}

                  <div className="theme-list">
                    {rows.map((r) => (
                      <div className="theme-item" key={r.i}>
                        <div className="theme-head"><span className="histnum">{t("word_lesson")} {r.i + 1}</span><span className="theme-title">{r.title || r.term}</span></div>
                        {r.quiz?.length > 0 && (
                          <div className="theme-qs">
                            {r.quiz.map((q, qi) => (
                              <div className={"recap-row" + (q.ok ? " ok" : " miss")} key={qi}>
                                <span className="recap-mk">{q.ok ? "✓" : "✕"}</span>
                                <span className="recap-q">{q.q}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {r.takeaway && (
                          <div className="theme-take"><span className="lsn-rel-mk">{t("theme_learned")}: </span>{r.takeaway}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="nav">
                    <button className="btn ghost" onClick={() => setPhase("result")}>{t("lsn_todiag")}</button>
                    <button className="btn amber" onClick={reset}>{t("done_retake")}</button>
                  </div>
                  <div className="hint" style={{ marginTop: 12 }}>{t("done_coursedone")}</div>
                </div>
              );
            })()}
          </div>
        )}

        <div className="verstamp">v{APP_VERSION}</div>
      </div>
    </div>
  );
}
