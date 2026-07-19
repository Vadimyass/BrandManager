export const AXES = [
  { key: "positioning", name: "Позиционирование" },
  { key: "visual", name: "Визуал" },
  { key: "consistency", name: "Консистентность" },
  { key: "differentiation", name: "Дифференциация" },
  { key: "conversion", name: "Конверсия" },
];

export const LEVELS = [
  { n: 1, name: "Хаос" },
  { n: 2, name: "Ремесленник" },
  { n: 3, name: "Согласованность" },
  { n: 4, name: "Позиционирование" },
  { n: 5, name: "Магнит" },
];

export const BUILDING_OPTIONS = ["Приложение", "Игра", "SaaS", "Магазин / e-com", "Локальный бизнес / услуги", "Сервис", "Личный бренд", "Другое"];

export const AXIS_LABELS = {
  positioning: "Позиционирование",
  visual: "Визуал",
  consistency: "Консистентность",
  differentiation: "Дифференциация",
  conversion: "Конверсия",
  tone: "Характер бренда",
  context: "Бизнес-пульс",
};

// Воронка: факты → оптика → характер → проверка на прочность.
// Проверочные пары: audience_clarity↔audience_type, stand_out↔strip_name, offer_ease↔outsider_desc.
const STAGE_FACTS = [
  { id: "logo", type: "bool", axis: "visual", q: "Логотип есть?", left: "Нет", right: "Есть" },
  { id: "palette", type: "bool", axis: "visual", q: "Свои цвета записаны?", sub: "Есть файл или заметка, где они зафиксированы." },
  { id: "fonts", type: "bool", axis: "visual", q: "Шрифты выбраны?", sub: "Ты знаешь их названия." },
  { id: "stylefile", type: "bool", axis: "visual", q: "Всё это лежит в одном месте?", sub: "Figma, папка, документ — что угодно." },
];

const STAGE_OPTICS = [
  { id: "audience_clarity", type: "scale", axis: "positioning", q: "Насколько ясно видишь своего пользователя?", sub: "0 — пока смутно · 5 — представляю конкретного человека" },
  { id: "offer_ease", type: "scale", axis: "positioning", q: "Легко объяснить продукт одной фразой?", sub: "0 — каждый раз по-разному · 5 — фраза всегда одна" },
  { id: "one_look", type: "scale", axis: "consistency", q: "Все твои страницы выглядят как одно целое?", sub: "Представь их рядом: стор, сайт, соцсети. 0 — разнобой · 5 — один стиль" },
  { id: "stand_out", type: "scale", axis: "differentiation", q: "Твой стиль отличается от соседей по нише?", sub: "0 — как у всех · 5 — узнают сразу" },
  { id: "onliness", type: "scale", axis: "differentiation", q: "Продолжи: «Мы единственные, кто…»", sub: "0 — фраза не складывается · 5 — договариваю не думая" },
  { id: "why_phrase", type: "scale", axis: "positioning", q: "Легко сказать, ЗАЧЕМ ты это делаешь?", sub: "Например: «хочу, чтобы инди-игры выглядели дорого»." },
];

const STAGE_IDENTITY = [
  { id: "tone_duo", type: "duo", axis: "tone", q: "Твой бренд по характеру ближе к…", sub: "Нет правильного ответа — это про характер.", left: "Друг", right: "Эксперт" },
  { id: "party_duo", type: "duo", axis: "tone", q: "Твой бренд на вечеринке — кто он?", left: "Душа компании", right: "Глубокий собеседник" },
  { id: "feel_now_duo", type: "duo", axis: "tone", q: "Каким бренд ощущается сейчас?", left: "Тёплым", right: "Строгим" },
  { id: "feel_want_duo", type: "duo", axis: "tone", q: "А каким хочешь, чтобы ощущался?", left: "Тёплым", right: "Строгим" },
];

const STAGE_PULSE = [
  { id: "conv_known", type: "scale", axis: "conversion", q: "Знаешь свою конверсию в цифрах?", sub: "Просмотры → покупки/установки/записи. 0 — без понятия · 5 — слежу постоянно" },
  { id: "attribution", type: "scale", axis: "conversion", q: "Знаешь, откуда приходят клиенты?", sub: "0 — загадка · 5 — вижу каждый канал в цифрах" },
  { id: "channel_duo", type: "duo", axis: "context", q: "Клиенты приходят скорее из…", left: "Сарафан и органика", right: "Реклама", skippable: true, skipLabel: "Пока их мало", skipValue: "клиентов пока мало" },
  { id: "reels_cadence", type: "scale", axis: "context", q: "Сколько коротких видео выходит в неделю?", sub: "Reels, TikTok, Shorts. 0 — не снимаем · 5 — пять и больше" },
  { id: "youtube", type: "bool", axis: "context", q: "YouTube-канал ведётся?", sub: "Хотя бы изредка, но живой." },
  { id: "breakeven", type: "duo", axis: "context", q: "Проект уже окупается?", sub: "Это контекст для рекомендаций, не экзамен.", left: "Пока нет", right: "Да", skippable: true, skipLabel: "Сложно сказать", skipValue: "сложно сказать" },
  { id: "team", type: "duo", axis: "context", q: "Кто всё это делает?", left: "Я один", right: "Команда" },
];

const STAGE_DEPTH = [
  { id: "hero_duo", type: "duo", axis: "positioning", q: "О ком твоя главная страница?", sub: "Чего там больше: про продукт или про то, что получит человек?", left: "Про продукт", right: "Про человека" },
  { id: "audience_type", type: "duo", axis: "positioning", q: "Твой типичный пользователь скорее…", sub: "Ответь навскидку, не думая.", left: "Новичок", right: "Профи", skippable: true, skipLabel: "Не знаю", skipValue: "не знаю" },
  { id: "strip_name", type: "duo", axis: "differentiation", q: "Убери название со страницы. Что будет?", sub: "Только честно.", left: "Спутают с другими", right: "Всё равно узнают" },
  { id: "outsider_desc", type: "duo", axis: "positioning", q: "Кто-то чужой описывал твой продукт своими словами?", sub: "Вспомни последний раз.", left: "Описал не так, как я", right: "Совпало с моим", skippable: true, skipLabel: "Такого не было", skipValue: "такого не было" },
  { id: "tradeoff_duo", type: "duo", axis: "tone", q: "Если выбирать одно?", left: "+1000 установок сейчас", right: "Узнаваемость через год" },
];

const TYPE_SETS = {
  "Игра": [
    { id: "store_page", type: "bool", axis: "conversion", q: "Страница в сторе оформлена?" },
    { id: "shots_emotion", type: "scale", axis: "conversion", q: "Скриншоты передают эмоцию игры?", sub: "0 — просто кадры · 5 — смотришь и хочется играть" },
    { id: "frame_recognizable", type: "scale", axis: "differentiation", q: "Игру можно узнать по одному кадру?" },
    { id: "trailer", type: "bool", axis: "conversion", q: "Трейлер есть?" },
  ],
  "Приложение": [
    { id: "shots_captions", type: "bool", axis: "conversion", q: "На скриншотах есть подписи с пользой?", sub: "Текст, который объясняет, что человек получит." },
    { id: "desc_benefit", type: "scale", axis: "conversion", q: "Описание — про выгоду, а не про функции?", sub: "«Засыпай быстрее» против «трекер сна»." },
    { id: "icon_neighbors", type: "scale", axis: "conversion", q: "Иконка выделяется среди соседей по категории?", sub: "Открой стор и посмотри на неё в списке." },
    { id: "ab_tried", type: "bool", axis: "conversion", q: "Пробовал менять страницу и сравнивать результат?" },
  ],
  "SaaS": [
    { id: "landing", type: "bool", axis: "conversion", q: "Лендинг есть?" },
    { id: "headline_result", type: "scale", axis: "conversion", q: "Заголовок лендинга — про результат клиента?", sub: "«Закрывай сделки быстрее» против «CRM-платформа»." },
    { id: "proof", type: "bool", axis: "conversion", q: "Кейсы или отзывы на сайте есть?" },
    { id: "vs_big", type: "scale", axis: "differentiation", q: "Понятно, чем ты лучше крупных игроков?", sub: "Для клиента, который сравнивает." },
  ],
  "Магазин / e-com": [
    { id: "product_cards_style", type: "bool", axis: "consistency", q: "Карточки товаров в одном стиле?", sub: "Фото, фоны, подписи." },
    { id: "packaging", type: "scale", axis: "differentiation", q: "Товар или упаковку узнают без логотипа?", sub: "0 — как у всех · 5 — узнают по фото" },
    { id: "shop_reviews", type: "bool", axis: "conversion", q: "Отзывы собираешь и показываешь?" },
    { id: "ad_landing", type: "bool", axis: "conversion", q: "Реклама ведёт на оформленную страницу?", sub: "А не просто в общий каталог или личку." },
  ],
  "Локальный бизнес / услуги": [
    { id: "maps_profile", type: "bool", axis: "conversion", q: "Профиль в картах оформлен?", sub: "Google Maps, 2ГИС — фото, часы, описание." },
    { id: "work_photos", type: "scale", axis: "visual", q: "Фото работ в едином стиле?", sub: "0 — что сняли, то сняли · 5 — лента как витрина" },
    { id: "price_clear", type: "scale", axis: "positioning", q: "Клиент поймёт цены до звонка?", sub: "Без «ответили в директ»." },
    { id: "easy_booking", type: "bool", axis: "conversion", q: "Записаться можно в пару кликов?" },
  ],
  "Сервис": [
    { id: "client_page", type: "bool", axis: "conversion", q: "Есть страница, куда ведёшь клиентов?" },
    { id: "offer_price_clear", type: "scale", axis: "positioning", q: "Клиенту понятно, что он получит и за сколько?" },
    { id: "reviews", type: "bool", axis: "conversion", q: "Отзывы собраны в одном месте?" },
    { id: "pitch_diff", type: "scale", axis: "differentiation", q: "Твоя подача отличается от других в нише?" },
  ],
  "Личный бренд": [
    { id: "profile_about", type: "scale", axis: "positioning", q: "Профиль сразу говорит, о чём ты?", sub: "Глазами человека, зашедшего впервые." },
    { id: "avatars", type: "bool", axis: "consistency", q: "Аватар и обложка совпадают между площадками?" },
    { id: "content_style", type: "scale", axis: "differentiation", q: "У контента узнаваемая подача?", sub: "Твой пост можно узнать без имени сверху." },
    { id: "bio_cta", type: "bool", axis: "conversion", q: "В био есть ссылка, куда идти дальше?" },
  ],
  "Другое": [
    { id: "public_page", type: "bool", axis: "conversion", q: "Есть публичная страница продукта?" },
    { id: "value_clear", type: "scale", axis: "positioning", q: "Понятно, какую пользу человек получит?" },
    { id: "niche_diff", type: "scale", axis: "differentiation", q: "Ты отличаешься от похожих проектов?" },
  ],
};

export function buildQuestions(building) {
  const typed = TYPE_SETS[building] ?? TYPE_SETS["Другое"];
  const typedFacts = typed.filter((c) => c.type === "bool");
  const typedRest = typed.filter((c) => c.type !== "bool");
  return [...STAGE_FACTS, ...typedFacts, ...STAGE_OPTICS, ...typedRest, ...STAGE_IDENTITY, ...STAGE_PULSE, ...STAGE_DEPTH];
}

export const LINK_FIELDS = [
  { id: "store", placeholder: "Стор / Steam / itch.io" },
  { id: "landing", placeholder: "Лендинг / сайт" },
  { id: "social", placeholder: "Соцсеть / LinkedIn" },
];
