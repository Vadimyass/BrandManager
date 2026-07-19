export const AXIS_LABELS = {
  product: "Продукт",
  marketing: "Маркетинг",
  operations: "Операционка",
  brand: "Бренд",
};

export const NICHE_OPTIONS = [
  "Дизайн или услуги на заказ",
  "Приложение или игра",
  "Онлайн-магазин",
  "Салон, студия, кафе",
  "Программа по подписке",
  "Блог или личный бренд",
  "Другое",
];

// Ниша выбирается явно (тап), свайпы уточняют модель для Калибратора.
export const SEED_CARDS = [
  { id: "seed_who", type: "duo", tag: "Разминка", q: "Кто тебе платит?", left: "Обычные люди", right: "Компании" },
  { id: "seed_how", type: "duo", tag: "Разминка", q: "Что у тебя покупают на самом деле?", left: "Готовый продукт", right: "Меня и мой опыт" },
];

export const LINK_FIELDS = [
  { id: "store", placeholder: "Стор / Steam / маркетплейс" },
  { id: "landing", placeholder: "Лендинг / сайт" },
  { id: "social", placeholder: "Соцсеть / карты" },
];
