// Парсер CSS-строк в объект стилей React.
// Нужен там, где стиль вычисляется в данных (например, состояние карточки книги).
export function s(css) {
  if (!css || typeof css === 'object') return css || undefined;
  const out = {};
  css.split(';').forEach((decl) => {
    const i = decl.indexOf(':');
    if (i < 0) return;
    const key = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!key || !val) return;
    out[key.startsWith('--') ? key : key.replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = val;
  });
  return out;
}
