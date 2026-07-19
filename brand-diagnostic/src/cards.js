export const AXIS_LABELS = {
  product: "Продукт",
  marketing: "Маркетинг",
  operations: "Операционка",
  brand: "Бренд",
};

// Сид-свайпы для Калибратора: по трём «или-или» агент определяет индустрию и модель.
export const SEED_CARDS = [
  { id: "seed_what", type: "duo", tag: "Разминка", q: "Что ты продаёшь?", left: "Пиксели и код", right: "Физическое или руками" },
  { id: "seed_who", type: "duo", tag: "Разминка", q: "Кто платит?", left: "Люди для себя", right: "Компании" },
  { id: "seed_how", type: "duo", tag: "Разминка", q: "Что покупают на самом деле?", left: "Продукт сам по себе", right: "Меня и мою экспертизу" },
];

export const LINK_FIELDS = [
  { id: "store", placeholder: "Стор / Steam / маркетплейс" },
  { id: "landing", placeholder: "Лендинг / сайт" },
  { id: "social", placeholder: "Соцсеть / карты" },
];
