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

export const CARDS = [
  { id: "offer_clear", axis: "positioning", q: "Объяснишь свой продукт одной фразой?", sub: "Так, чтобы понял человек не из индустрии." },
  { id: "audience_known", axis: "positioning", q: "Знаешь, кто твой пользователь?", sub: "Конкретный человек, а не «все, кому интересно»." },
  { id: "instant_why", axis: "positioning", q: "За 10 секунд понятно, зачем это скачивать?", sub: "Глазами человека, который видит страницу впервые." },
  { id: "logo", axis: "visual", q: "Логотип есть?", left: "Нет", right: "Есть" },
  { id: "palette", axis: "visual", q: "Цвета бренда выбраны и записаны?", sub: "Палитра, а не «беру что нравится под настроение»." },
  { id: "fonts", axis: "visual", q: "Шрифты определены?", sub: "Один-два, и ты знаешь их названия." },
  { id: "guideline", axis: "visual", q: "Есть гайдлайн или файл со стилями?", sub: "Любой документ, где собран визуал." },
  { id: "icon_effort", axis: "visual", q: "Иконка сделана всерьёз?", sub: "Не «накидал за вечер и забыл»." },
  { id: "avatars_same", axis: "consistency", q: "Аватарки и обложки везде одинаковые?", sub: "Стор, соцсети, сайт." },
  { id: "one_product", axis: "consistency", q: "Все твои страницы выглядят как один продукт?", sub: "Если открыть рядом — родня или чужие?" },
  { id: "tone_same", axis: "consistency", q: "Тон текстов везде один?", sub: "Описание в сторе, посты, ответы на отзывы." },
  { id: "competitors_known", axis: "differentiation", q: "Назовёшь 2–3 конкурентов по именам?", left: "Нет", right: "Легко" },
  { id: "difference_known", axis: "differentiation", q: "Знаешь, чем от них отличаешься?", sub: "Кроме «у меня качественнее»." },
  { id: "recognizable", axis: "differentiation", q: "Твой продукт узнают по скриншоту?", sub: "Без названия и логотипа." },
  { id: "screenshots_sell", axis: "conversion", q: "Скриншоты показывают пользу?", sub: "А не просто экраны интерфейса." },
  { id: "first_line", axis: "conversion", q: "Первая строка описания цепляет?", sub: "Или начинается с «Это приложение позволяет…»?" },
  { id: "conversion_watched", axis: "conversion", q: "Следишь за конверсией страницы?", sub: "Просмотры → установки или покупки." },
  { id: "tested_changes", axis: "conversion", q: "Менял что-то и сравнивал результат?", sub: "Иконку, скриншоты, описание." },
];

export const LINK_FIELDS = [
  { id: "store", placeholder: "Стор / Steam / itch.io" },
  { id: "landing", placeholder: "Лендинг / сайт" },
  { id: "social", placeholder: "Соцсеть / LinkedIn" },
];
