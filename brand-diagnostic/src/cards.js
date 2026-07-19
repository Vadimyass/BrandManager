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

export const BUILDING_OPTIONS = ["Приложение", "Игра", "SaaS", "Сервис", "Личный бренд", "Другое"];

// type: "bool" — свайп да/нет; "scale" — самооценка 0–5; "duo" — выбор из двух (сигнал характера, не оценка)
const COMMON = [
  { id: "logo", type: "bool", axis: "visual", q: "Логотип есть?", left: "Нет", right: "Есть" },
  { id: "palette", type: "bool", axis: "visual", q: "Фирменные цвета зафиксированы?", sub: "Записаны где-то, а не по памяти." },
  { id: "fonts", type: "bool", axis: "visual", q: "Шрифты выбраны?", sub: "Один-два, известно какие." },
  { id: "stylefile", type: "bool", axis: "visual", q: "Есть файл, где собран весь визуал?", sub: "Гайдлайн, Figma — хотя бы папка." },
  { id: "audience_clarity", type: "scale", axis: "positioning", q: "Насколько чётко представляешь своего пользователя?", sub: "0 — пока смутно · 5 — вижу конкретного человека" },
  { id: "offer_ease", type: "scale", axis: "positioning", q: "Насколько легко объяснить продукт одной фразой?", sub: "0 — каждый раз по-разному · 5 — фраза отлетает" },
  { id: "one_look", type: "scale", axis: "consistency", q: "Насколько твои страницы выглядят как одно целое?", sub: "Представь стор, сайт и соцсети рядом." },
  { id: "stand_out", type: "scale", axis: "differentiation", q: "Насколько твой стиль отличается от соседей по нише?", sub: "0 — сольюсь с толпой · 5 — узнают сразу" },
  { id: "tone_duo", type: "duo", axis: "tone", q: "Твой бренд по характеру ближе к…", left: "Друг", right: "Эксперт" },
  { id: "goal_duo", type: "duo", axis: "tone", q: "Что сейчас важнее?", left: "Доверие", right: "Заметность" },
  { id: "state_duo", type: "duo", axis: "tone", q: "Бренд сегодня скорее…", left: "Стихийный", right: "Собранный" },
];

const TYPE_SETS = {
  "Игра": [
    { id: "store_page", type: "bool", axis: "conversion", q: "Страница в сторе оформлена?" },
    { id: "shots_emotion", type: "scale", axis: "conversion", q: "Насколько скриншоты передают эмоцию игры?", sub: "0 — просто кадры · 5 — хочется играть" },
    { id: "icon_small", type: "bool", axis: "conversion", q: "Смотрел иконку в маленьком размере?", sub: "Как её видят в списке среди других." },
    { id: "frame_recognizable", type: "scale", axis: "differentiation", q: "Насколько игру можно узнать по одному кадру?" },
    { id: "game_hook_duo", type: "duo", axis: "tone", q: "Игра цепляет скорее…", left: "Атмосферой", right: "Механикой" },
    { id: "trailer", type: "bool", axis: "conversion", q: "Трейлер есть?" },
  ],
  "Приложение": [
    { id: "shots_captions", type: "bool", axis: "conversion", q: "На скриншотах есть подписи с пользой?" },
    { id: "desc_benefit", type: "scale", axis: "conversion", q: "Насколько описание — про выгоду, а не про функции?", sub: "«Засыпай быстрее» против «трекер сна»." },
    { id: "icon_neighbors", type: "scale", axis: "conversion", q: "Насколько иконка выделяется среди соседей по категории?" },
    { id: "onboarding_tone", type: "scale", axis: "consistency", q: "Насколько приложение внутри звучит так же, как его стор-страница?" },
    { id: "ab_tried", type: "bool", axis: "conversion", q: "Пробовал менять страницу и сравнивать результат?" },
  ],
  "SaaS": [
    { id: "landing", type: "bool", axis: "conversion", q: "Лендинг есть?" },
    { id: "headline_result", type: "scale", axis: "conversion", q: "Насколько заголовок лендинга — про результат клиента?", sub: "«Закрывай сделки быстрее» против «CRM-платформа»." },
    { id: "vs_big", type: "scale", axis: "differentiation", q: "Насколько понятно, чем ты отличаешься от крупных игроков?" },
    { id: "proof", type: "bool", axis: "conversion", q: "Кейсы или отзывы на сайте есть?" },
    { id: "saas_tone_duo", type: "duo", axis: "tone", q: "Тон компании ближе к…", left: "Корпоративный", right: "Живой" },
  ],
  "Сервис": [
    { id: "client_page", type: "bool", axis: "conversion", q: "Есть страница, куда ведёшь клиентов?" },
    { id: "offer_price_clear", type: "scale", axis: "positioning", q: "Насколько клиенту понятно, что он получит и за сколько?" },
    { id: "reviews", type: "bool", axis: "conversion", q: "Отзывы собраны в одном месте?" },
    { id: "pitch_diff", type: "scale", axis: "differentiation", q: "Насколько твоя подача отличается от других в нише?" },
  ],
  "Личный бренд": [
    { id: "profile_about", type: "scale", axis: "positioning", q: "Насколько профиль сразу говорит, о чём ты?", sub: "Глазами человека, зашедшего впервые." },
    { id: "avatars", type: "bool", axis: "consistency", q: "Аватар и обложка совпадают между площадками?" },
    { id: "content_style", type: "scale", axis: "differentiation", q: "Насколько у контента узнаваемая подача?" },
    { id: "voice_duo", type: "duo", axis: "tone", q: "Твоя подача ближе к…", left: "Учу", right: "Делюсь путём" },
    { id: "bio_cta", type: "bool", axis: "conversion", q: "В био есть ссылка, куда идти дальше?" },
  ],
  "Другое": [
    { id: "public_page", type: "bool", axis: "conversion", q: "Есть публичная страница продукта?" },
    { id: "value_clear", type: "scale", axis: "positioning", q: "Насколько понятно, какую пользу человек получит?" },
    { id: "niche_diff", type: "scale", axis: "differentiation", q: "Насколько ты отличаешься от похожих проектов?" },
  ],
};

export function buildQuestions(building) {
  return [...COMMON, ...(TYPE_SETS[building] ?? TYPE_SETS["Другое"])];
}

export const LINK_FIELDS = [
  { id: "store", placeholder: "Стор / Steam / itch.io" },
  { id: "landing", placeholder: "Лендинг / сайт" },
  { id: "social", placeholder: "Соцсеть / LinkedIn" },
];
