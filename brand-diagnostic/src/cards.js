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
  {
    id: "seed_who", type: "duo", tag: "Разминка", q: "Кто тебе платит?",
    left: "Обычные люди", right: "Компании",
    skippable: true, skipLabel: "И те, и другие", skipValue: "и обычные люди, и компании",
  },
  {
    id: "seed_how", type: "duo", tag: "Разминка", q: "Что у тебя покупают на самом деле?",
    left: "Готовый продукт", right: "Меня и мой опыт",
    skippable: true, skipLabel: "Поровну", skipValue: "и продукт, и меня как эксперта",
  },
  {
    id: "seed_where", type: "duo", tag: "Разминка", q: "Где происходит сделка?",
    left: "Онлайн", right: "Вживую",
    skippable: true, skipLabel: "И там, и там", skipValue: "и онлайн, и вживую",
  },
  {
    id: "seed_repeat", type: "duo", tag: "Разминка", q: "Как часто покупают?",
    left: "Один раз", right: "Возвращаются регулярно",
    skippable: true, skipLabel: "По-разному", skipValue: "по-разному",
  },
  {
    id: "seed_ticket", type: "duo", tag: "Разминка", q: "Твой средний чек — это…",
    left: "Мелкая покупка", right: "Дорогое решение",
    skippable: true, skipLabel: "Средне", skipValue: "средний чек",
  },
];

export const LINK_FIELDS = [
  { id: "store", placeholder: "Стор / Steam / маркетплейс" },
  { id: "landing", placeholder: "Лендинг / сайт" },
  { id: "social", placeholder: "Соцсеть / карты" },
];
