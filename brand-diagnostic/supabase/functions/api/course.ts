import { llmJson, type LlmUsage } from "./llm.ts";
import { AXIS_NAMES, type Calibration, type Diagnosis, langRule } from "./agents.ts";
import { buildRulesBlock, type CourseConfig, DEFAULT_CONFIG, difficultyLine } from "./config.ts";
import { runMelio } from "./melio.ts";

export interface QuizItem {
  q: string;
  left: string;
  right: string;
  correct: "left" | "right";
  explain: string;
}

export interface CaseExample {
  case: string;
  why: string;
}

export interface Lesson {
  index: number;
  total: number;
  title: string;
  summary: string;
  stat: string;
  statNote: string;
  steps: string[];
  body: string;
  turn: string;
  term: string;
  termNote: string;
  scheme?: string[];
  examples?: CaseExample[];
  task: string;
  quiz: QuizItem[];
  takeaway: string;
  relevance: string;
}

type Depth = "intro" | "core" | "advanced";

// Линейная прогрессия: каждый урок — СВОЁ понятие, СВОЯ история, растущая сложность.
// Никаких линз/повторов: от основ к книжной глубине (Шарп, Барден, Остервальдер, Сьюэлл, Манн).
interface LessonPlan {
  term: string;
  depth: Depth;
  anchor: string;
  focus: string;
}

const PLAN_BY_AXIS: Record<string, LessonPlan[]> = {
  marketing: [
    { term: "путь клиента (воронка)", depth: "intro", anchor: "MrBeast: одно видео стоит 3–4 млн, медиабизнес за 2024 принёс 246 млн и потерял 80 млн, зато его шоколадки Feastables заработали 250 млн выручки. Контент — это реклама, деньги забирает продукт в конце пути.", focus: "контент не обязан продавать сам — продаёт то, что стоит в конце пути" },
    { term: "позиционирование", depth: "intro", anchor: "Liquid Death продаёт обычную воду в пивных банках: оценка 1,4 млрд, 333 млн выручки. Основатель искал самую тупую идею, потому что умные заняты конкурентами.", focus: "без причины выбрать тебя людей выбирают по цене" },
    { term: "рост через охват (Шарп)", depth: "core", anchor: "Among Us вышла в 2018 и два года лежала незамеченной. Летом 2020 в неё сыграл один стример, за ним другие — 100 млн загрузок к сентябрю. Продукт не менялся, изменился охват.", focus: "бренды растут новыми и редкими покупателями, а не преданностью старых" },
    { term: "закон двойного риска (Шарп)", depth: "core", anchor: "Правило, выведенное на сотнях брендов: маленькие бренды имеют и меньше покупателей, и чуть меньшую их лояльность — сразу по двум причинам. Крупные выигрывают в обоих.", focus: "маленький проигрывает дважды, поэтому единственный путь вверх — расти вширь, а не углублять любовь ядра" },
    { term: "доступность бренда (Шарп)", depth: "core", anchor: "Duolingo отдали заброшенный TikTok 23-летней сотруднице: абсурдные ролики с совой дали 17 млн подписчиков, дневная аудитория выросла с 4,9 до 80 млн. Их стали легко вспоминать.", focus: "тебя должны легко вспомнить в момент покупки и легко купить — это важнее, чем быть лучшим" },
    { term: "отличительные активы (Шарп)", depth: "core", anchor: "Coca-Cola к чемпионату выпустила 18 банок на основе джерси: единая сетка, общий ритм — узнаются как одна коллекция. Узнают не по слогану, а по повторяющемуся визуальному коду.", focus: "тебя узнают по активам (цвет, форма, персонаж), а не по фразе «мы лучше»" },
    { term: "автопилот покупателя (Барден)", depth: "advanced", anchor: "Imagine Earth поменяли обложку игры в Steam — продажи выросли в 20 раз без нового трафика. Решение о покупке приняли за долю секунды по картинке, а не по разбору.", focus: "покупку решает быстрый автопилот, а не логика — оформление важнее аргументов" },
    { term: "воспринимаемая ценность (Барден)", depth: "advanced", anchor: "Vampire Survivors стоила 2,99 доллара — так дёшево, что не думаешь. На этом импульсе игра принесла около 57 млн. Цена сказала «попробуй не раздумывая».", focus: "ценность = воспринимаемое вознаграждение минус воспринимаемая боль (цена, усилие, риск)" },
    { term: "пожизненная ценность клиента (Сьюэлл)", depth: "advanced", anchor: "Классический пример автодилера Сьюэлла: лояльный клиент приносит около 332 000 долларов за годы. Один визит и «клиент навсегда» — разница в десятки раз.", focus: "клиент стоит всех своих покупок за жизнь, а не одной — это меняет, сколько можно потратить на его привлечение" },
    { term: "виральность через историю", depth: "advanced", anchor: "Columbia предложила сторонникам плоской Земли: найдёте край планеты — заберёте всю компанию. Приз не забрали, но кампания стала вирусной, потому что легла на их слоган «Создано для чего угодно». Levi's, чей логотип на стадионе закрыли полотном, сам обыграл это и собрал почти 90 млн просмотров.", focus: "люди пересылают не рекламу, а историю — думай не «как рассказать о продукте», а «что люди сами захотят пересказать»" },
  ],
  brand: [
    { term: "бренд это обещание, а не логотип", depth: "intro", anchor: "Liquid Death: обычная вода в пивных банках, оценка 1,4 млрд. Внутри банки ничего особенного — всё отличие построено снаружи продукта.", focus: "бренд это ассоциация и обещание в голове клиента, а не набор файлов" },
    { term: "характер бренда", depth: "intro", anchor: "Duolingo: чем более «поехавшими» были ролики с совой, тем сильнее их разносили. Дневная аудитория выросла в 16 раз без рекламного бюджета.", focus: "у бренда должен быть характер, который можно отыгрывать — нечего отыгрывать, нечего постить" },
    { term: "отличительные активы (Шарп)", depth: "core", anchor: "Coca-Cola выпустила 18 банок на основе джерси в единой системе — узнаются как одна коллекция без логотипа. Узнаваемость строится повторяющимися активами.", focus: "узнают по повторяющимся активам во всех точках, а не по отдельному красивому элементе" },
    { term: "первое впечатление (точка контакта)", depth: "core", anchor: "Ранний Airbnb не мог раскачать брони, пока хозяева снимали жильё на телефон. Основатели сами поехали фотографировать — броней стало в 2–3 раза больше, выручка удвоилась.", focus: "люди покупают то, что видят до покупки — первое впечатление и есть продукт в момент решения" },
    { term: "контроль качества (бренд нельзя одолжить)", depth: "core", anchor: "MrBeast Burger отдал готовку чужим кухням: качество упало, дошло до суда. Его шоколадки под полным контролем выросли до 250 млн.", focus: "канал и аудиторию можно одолжить, а качество под своим именем — нет" },
    { term: "сигналы и оформление (Барден)", depth: "advanced", anchor: "Смена обложки в Steam давала другим командам +30–70% к спискам желаемого без нового трафика. Люди считывают сигнал, а не читают описание.", focus: "воспринимаемую ценность создают сигналы (оформление, контекст, якорь), а не аргументы" },
    { term: "история, которую пересылают", depth: "advanced", anchor: "Levi's превратил закрытый полотном логотип на стадионе в сюжет с песней «Никто не узнает» и собрал почти 90 млн просмотров по цене нескольких метров ткани.", focus: "бренд растёт, когда даёт людям историю, которую хочется передать дальше" },
    { term: "бренд как актив на всю жизнь (Сьюэлл)", depth: "advanced", anchor: "Сьюэлл считал клиента на всю жизнь (~332 000 долларов у автодилера) и строил сервис как систему, а не как разовый вау. Сильный бренд — это повод вернуться.", focus: "бренд окупается не первой покупкой, а тем, что человек возвращается годами" },
  ],
  product: [
    { term: "ядро продукта (что держит)", depth: "intro", anchor: "Vampire Survivors: автор потратил на всю графику и звук 1100 фунтов, игра выглядела дёшево — но от неё невозможно оторваться, и она принесла около 57 млн.", focus: "сначала найди то, что заставляет вернуться, потом полируй то, что видно" },
    { term: "цена как сигнал", depth: "intro", anchor: "Vampire Survivors стоила 2,99 доллара — цена сказала «попробуй не раздумывая» вернее любого описания.", focus: "цена говорит о продукте раньше, чем его открыли" },
    { term: "контроль качества", depth: "core", anchor: "MrBeast Burger отдал готовку чужим кухням без контроля — качество просело, дошло до суда. Свои шоколадки под контролем выросли до 250 млн.", focus: "всё, что ты не контролируешь в продукте, однажды выставит счёт репутации" },
    { term: "путь новичка (первые пять минут)", depth: "core", anchor: "У Notion была проблема пустой страницы — человек заходил и уходил. Галерея пользовательских шаблонов убрала этот момент и стала главным каналом роста.", focus: "путь новичка и первое впечатление — часть продукта, а не «потом допилим»" },
    { term: "короткий цикл обратной связи", depth: "core", anchor: "Vampire Survivors вышла сырой в раннем доступе без плана — автор правил её по реакции игроков и бросил работу через два месяца после старта продаж.", focus: "выигрывает не тот, кто лучше придумал, а тот, кто быстрее узнал правду и поправил" },
    { term: "работа клиента (Остервальдер)", depth: "advanced", anchor: "Ранний Airbnb продавал не «комнату», а спокойствие и доверие — как только это показали через фото, брони пошли. Клиент нанимает продукт сделать работу.", focus: "люди покупают не продукт, а «работу», которую он для них делает — начинай с неё" },
    { term: "боли и выгоды клиента (Остервальдер)", depth: "advanced", anchor: "Канва ценности: с одной стороны задачи, боли и желаемые выгоды клиента, с другой — твои обезболивающие и создатели выгод. Продаётся только то, что совпало.", focus: "описывай продукт языком болей и выгод клиента, а не списком своих функций" },
    { term: "проверка гипотез (fit)", depth: "advanced", anchor: "Чески запустил впечатления Airbnb сразу в 100 городах и провалился. Вернулся к правилу: доведи до совершенства в одном месте, поговори с первыми людьми, потом масштабируй.", focus: "не влюбляйся в продукт заранее — проверь на малом, что ценность реально попала" },
  ],
  operations: [
    { term: "дешёвые точки роста", depth: "intro", anchor: "Imagine Earth поменяли обложку в Steam — продажи выросли в 20 раз. Трафик не рос, продукт не менялся.", focus: "самый дешёвый рост — в том, что уже работает наполовину, а не в новом трафике" },
    { term: "привычка смотреть на цифры", depth: "intro", anchor: "Профили в картах: 100+ фото дают +520% звонков, кнопка записи +27% конверсии, ответы на отзывы +16% обращений. Это регулярность, а не гениальность.", focus: "процесс регулярной проверки обыгрывает талант и бюджет" },
    { term: "проверка на малом (Чески)", depth: "core", anchor: "Чески запустил сервис Airbnb сразу в 100 городах и провалился. Правило: один город, живые разговоры, найти поломку, исправить — потом масштаб. Лучше 100 любящих, чем миллион равнодушных.", focus: "сначала доведи до ума на малом и на живых людях, потом расширяй" },
    { term: "короткий цикл вместо большого плана", depth: "core", anchor: "Vampire Survivors вышла сырой в раннем доступе и правилась по реакции игроков — короткий цикл «выпустил, посмотрел, поправил» победил идеальный замысел.", focus: "скорость цикла важнее качества первого плана" },
    { term: "делегирование", depth: "core", anchor: "MrBeast Burger отдал качество чужим рукам и получил суд. Notion, наоборот, отдал пользователям создание шаблонов — и получил главный канал роста бесплатно.", focus: "делегировать можно распространение, но не контроль качества" },
    { term: "точки контакта без бюджета (Манн)", depth: "advanced", anchor: "Dollar Shave Club роликом за 4500 долларов за один день собрал 12 000 заказов — маркетинг это действия, а не бюджет. Каждая точка контакта либо продаёт, либо отталкивает.", focus: "начни с ревизии точек контакта и дешёвых инструментов, а не с бюджета" },
    { term: "система удержания (Сьюэлл)", depth: "advanced", anchor: "Сьюэлл считал клиента на всю жизнь (~332 000 долларов) и строил сервис как систему процессов, а не как разовый героизм сотрудников.", focus: "удержание — это система, а не старание; хороший сервис держится на процессах" },
    { term: "жалоба как шанс (Сьюэлл)", depth: "advanced", anchor: "Правило Сьюэлла: недообещай — перевыполняй, и облегчай жалобы. Жалоба — это шанс удержать клиента, а не проблема, которую надо спрятать.", focus: "управляй ожиданиями вниз, результатом вверх, а жалобу используй как способ вернуть клиента" },
  ],
};

export function planFor(axis: string): LessonPlan[] {
  return PLAN_BY_AXIS[axis] ?? PLAN_BY_AXIS.marketing;
}

export function courseLength(axis: string): number {
  return planFor(axis).length;
}

// Структура урока (сколько экранов чтения и вопросов). Сложность и вербальные
// правила теперь приходят из конфигурации весов (config.ts / таблица course_config).
const DEPTH_STRUCTURE: Record<Depth, string> = {
  intro: "СТРУКТУРА: 2 шага чтения (steps), 1 вопрос в квизе, examples: [].",
  core: "СТРУКТУРА: 3 шага чтения (steps), 2 вопроса в квизе, examples: 0–1 (case + why).",
  advanced: "СТРУКТУРА: 3 шага чтения (steps), 2 вопроса в квизе, examples: 0–1 (case + why).",
};

function lessonSystem(
  plan: LessonPlan,
  cal: Calibration,
  niche: string | undefined,
  diagnosis: Diagnosis,
  position: { n: number; total: number; prevTerms: string[] },
  cfg: CourseConfig,
  profile?: string,
): string {
  const already = position.prevTerms.length
    ? `\nУЖЕ РАЗОБРАНО в прошлых уроках (не повторяй эти понятия, истории и примеры): ${position.prevTerms.join("; ")}.`
    : "";
  const profileLine = profile?.trim()
    ? `\nТОЧНОЕ ДЕЛО ПОЛЬЗОВАТЕЛЯ (используй в примерах и задании, говори про ИМЕННО это): ${profile.trim()}`
    : "";

  const rulesBlock = buildRulesBlock(cfg.rules);
  const diffLine = difficultyLine(position.n - 1, position.total, cfg);

  return `Ты — Мелио, наставник по бизнес-мышлению. Пишешь для основателя, который в этой теме новичок. Ниша: ${niche ?? cal.industry} (${cal.model}). Его слабое место: ${AXIS_NAMES[diagnosis.weakness.axis]} — ${diagnosis.weakness.title}, ${diagnosis.weakness.note}. Его сила: ${AXIS_NAMES[diagnosis.superpower.axis]} — ${diagnosis.superpower.title}.${profileLine}

Это урок ${position.n} из ${position.total}. Новое понятие урока: «${plan.term}». Главная мысль: ${plan.focus}.
${DEPTH_STRUCTURE[plan.depth]}${already}

${diffLine}

ПРАВИЛА ПОСТРОЕНИЯ УРОКА (соблюдай по силе важности — префикс задаёт приоритет):
${rulesBlock}

Поля-подсказки:
- steps — это сам урок, разбитый на маленькие экраны; главная история (с цифрами) внутри шагов.
- summary — одна фраза «про что урок», до 80 знаков. takeaway — ёмкий вывод одной строкой.
- relevance — 1 предложение: как урок связан со слабым местом «${AXIS_NAMES[diagnosis.weakness.axis]} — ${diagnosis.weakness.title}».
- scheme — 2–3 подписи стрелками только если помогает; иначе [].

ИСТОРИЯ (единственный источник фактов):
${plan.anchor}

Верни ТОЛЬКО JSON: {"title":"заголовок урока, до 50 знаков","summary":"про что урок, до 80 знаков","stat":"главная цифра истории, до 18 знаков","statNote":"что это за цифра, до 80 знаков","steps":["шаг 1: 1–2 коротких предложения","шаг 2: 1–2 коротких предложения"],"term":"${plan.term}","termNote":"объяснение понятия бытовым примером","scheme":[],"examples":[],"task":"задание на его продукте","quiz":[{"q":"...","left":"...","right":"...","correct":"left|right","explain":"..."}],"takeaway":"вывод урока одной строкой","relevance":"как связано с его слабым местом"}`;
}

// Параллельность ограничена (по 2): бесплатные модели упираются в лимит провайдера.
const CONCURRENCY = 2;

export async function runCourse(
  axis: string,
  cal: Calibration,
  niche: string | undefined,
  diagnosis: Diagnosis,
  usage: LlmUsage[],
  lang?: string,
  profile?: string,
  cfg: CourseConfig = DEFAULT_CONFIG,
): Promise<Lesson[]> {
  const plan = planFor(axis);
  const out: Lesson[] = [];
  for (let i = 0; i < plan.length; i += CONCURRENCY) {
    const batch = plan.slice(i, i + CONCURRENCY);
    const done = await Promise.all(
      batch.map((_, j) =>
        cfg.engine === "weights"
          ? runLesson(i + j, axis, cal, niche, diagnosis, usage, lang, profile, cfg)
          : melioLesson(i + j, axis, cal, niche, diagnosis, usage, lang, profile)
      ),
    );
    out.push(...done);
  }
  return out.sort((a, b) => a.index - b.index);
}

// Уровень L1–L5 по позиции урока в теме.
function levelFor(i: number, total: number): number {
  if (total <= 1) return 3;
  return Math.min(5, Math.max(1, 1 + Math.round((i / (total - 1)) * 4)));
}

// Один урок через агента Мелио + маппинг его JSON в форму Lesson, которую рисует приложение.
// Историю (факт) даём из анкора плана — Мелио берёт факты только из input.
async function melioLesson(
  index: number,
  axis: string,
  cal: Calibration,
  niche: string | undefined,
  diagnosis: Diagnosis,
  usage: LlmUsage[],
  lang?: string,
  profile?: string,
): Promise<Lesson> {
  const plan = planFor(axis);
  const total = plan.length;
  const i = Math.min(Math.max(index, 0), total - 1);
  const p = plan[i];
  const prevTerms = plan.slice(0, i).map((x) => x.term);

  const memory = {
    business: { niche: niche || cal.industry, model: cal.model, profile: profile || null },
    level: levelFor(i, total),
    focus_weakspot: axis,
    learning: { concepts_used: prevTerms, stories_used: plan.slice(0, i).map((_, k) => `f-${axis}-${k}`), quiz_log: [], difficulty_pos: Math.round((i / Math.max(total - 1, 1)) * 100) },
    diagnostic: {
      weakness: { axis: diagnosis.weakness.axis, title: diagnosis.weakness.title, note: diagnosis.weakness.note },
      superpower: { axis: diagnosis.superpower.axis, title: diagnosis.superpower.title },
      summary: diagnosis.diagnosis,
    },
    work: [],
  };
  const input = {
    facts: [{ id: `f-${axis}-${i}`, text: p.anchor, src: "observed" }],
    hint: { term: p.term, focus: p.focus },
  };

  const res = await runMelio("lesson", memory, input, usage, lang);
  const m = (res?.lesson ?? {}) as {
    title?: string; steps?: string[];
    story?: { text?: string; fact_ref?: string };
    quiz?: { situation?: string; options?: string[]; correct?: number; explain?: string };
    task?: string;
  };

  const steps = Array.isArray(m.steps) ? m.steps.filter((x) => typeof x === "string" && x.trim()).slice(0, 5) : [];
  if (m.story?.text) steps.push(String(m.story.text));
  const opts = Array.isArray(m.quiz?.options) ? m.quiz!.options! : [];
  const quiz = m.quiz?.situation && opts.length >= 2
    ? [{
      q: String(m.quiz.situation),
      left: String(opts[0]),
      right: String(opts[1]),
      correct: (Number(m.quiz.correct) === 1 ? "right" : "left") as "left" | "right",
      explain: String(m.quiz.explain ?? ""),
    }]
    : [];

  return {
    index: i,
    total,
    title: m.title || p.term,
    summary: p.focus,
    stat: "",
    statNote: "",
    steps: steps.length ? steps : [p.focus],
    body: "",
    turn: "",
    term: p.term,
    termNote: p.focus,
    scheme: [],
    examples: [],
    task: m.task || `Сделай маленький шаг по теме «${p.term}» на своём продукте.`,
    quiz,
    takeaway: p.focus,
    relevance: `Это шаг по твоему слабому месту: ${AXIS_NAMES[axis]} — ${diagnosis.weakness.title}.`,
  };
}

export async function runLesson(
  index: number,
  axis: string,
  cal: Calibration,
  niche: string | undefined,
  diagnosis: Diagnosis,
  usage: LlmUsage[],
  lang?: string,
  profile?: string,
  cfg: CourseConfig = DEFAULT_CONFIG,
): Promise<Lesson> {
  const plan = planFor(axis);
  const total = plan.length;
  const i = Math.min(Math.max(index, 0), total - 1);
  const prevTerms = plan.slice(0, i).map((p) => p.term);

  const lesson = await llmJson<Lesson>(
    "assessor",
    lessonSystem(plan[i], cal, niche, diagnosis, { n: i + 1, total, prevTerms }, cfg, profile) + langRule(lang),
    `Диагноз фаундера: ${diagnosis.diagnosis}`,
    usage,
    1600,
  );

  lesson.index = i;
  lesson.total = total;
  lesson.term = lesson.term || plan[i].term;
  lesson.title = lesson.title || plan[i].term;
  lesson.summary = (lesson.summary && String(lesson.summary).trim()) || plan[i].focus;
  lesson.steps = Array.isArray(lesson.steps)
    ? lesson.steps.filter((x) => typeof x === "string" && x.trim()).slice(0, 3)
    : [];
  if (!lesson.steps.length) {
    lesson.steps = String(lesson.body || plan[i].focus)
      .split(/(?<=[.!?])\s+/)
      .reduce<string[]>((acc, s) => {
        const t = s.trim();
        if (!t) return acc;
        if (acc.length && (acc[acc.length - 1].length < 90)) acc[acc.length - 1] += " " + t;
        else acc.push(t);
        return acc;
      }, [])
      .slice(0, 3);
  }
  lesson.takeaway = (lesson.takeaway && String(lesson.takeaway).trim()) || plan[i].focus;
  lesson.relevance = (lesson.relevance && String(lesson.relevance).trim())
    || `Это закрывает твоё слабое место: ${AXIS_NAMES[diagnosis.weakness.axis]} — ${diagnosis.weakness.title}.`;
  lesson.scheme = Array.isArray(lesson.scheme)
    ? lesson.scheme.filter((x) => typeof x === "string" && x.trim()).slice(0, 4)
    : [];
  lesson.examples = Array.isArray(lesson.examples)
    ? lesson.examples.filter((e) => e?.case && e?.why).slice(0, 3)
    : [];
  const maxQuiz = plan[i].depth === "intro" ? 1 : 2;
  lesson.quiz = (lesson.quiz ?? [])
    .filter((q) => q?.q && q?.left && q?.right)
    .slice(0, maxQuiz)
    .map((q) => ({ ...q, correct: q.correct === "right" ? "right" : "left" }));
  return lesson;
}
