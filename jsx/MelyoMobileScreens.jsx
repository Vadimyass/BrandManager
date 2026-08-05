import React from 'react';
import PhoneFrame from './PhoneFrame';
import { s } from './style-utils';

/** Демо-данные экранов. Заменяются реальными из API. */
export function useMobileData() {
  const green = '#01D27F';
  const books = [
    { author: 'Шарп', title: 'Как растут бренды', meta: 'Пройдено · +40 XP', state: 'done' },
    { author: 'Остервальдер', title: 'Бизнес‑модели', meta: 'Пройдено · +35 XP', state: 'done' },
    { author: 'Манн', title: 'Маркетинг без бюджета', meta: '3 из 4 уроков', state: 'current' },
    { author: 'Барден', title: 'Психология покупки', meta: 'Откроется после Манна', state: 'locked' },
    { author: 'Сьюэлл', title: 'Клиенты на всю жизнь', meta: 'Заблокировано', state: 'locked' },
  ];
  const pathBooks = books.map(b => {
    const done = b.state === 'done', cur = b.state === 'current';
    return {
      author: b.author, title: b.title, meta: b.meta,
      cardStyle: `display:flex;gap:12px;align-items:center;padding:14px 16px;border-radius:20px;margin-bottom:10px;${
        cur ? 'background:#FFFFFF;border:2px solid #01D27F;box-shadow:0 6px 18px rgba(1,210,127,.16);'
        : done ? 'background:#FFFFFF;border:1.5px solid #E7E4F3;'
        : 'background:#FAFAFD;border:1.5px solid #EFEFF5;opacity:.62;'}`,
      badgeStyle: `width:34px;height:34px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;${
        done ? 'background:#D2FFB4;color:#01A263;'
        : cur ? `background:${green};color:#FFFFFF;`
        : 'background:#EFEFF5;color:#9AA6AC;'}`,
      badge: done ? '✓' : cur ? '▶' : '🔒',
    };
  });
  
  const deckDots = Array.from({ length: 10 }, (_, i) => ({
    style: `width:${i === 3 ? 22 : 7}px;height:7px;border-radius:4px;background:${i < 3 ? '#C5B6F2' : i === 3 ? green : '#E7E4F3'};`,
  }));
  
  const planSteps = [
    { n: 1, text: 'Посчитать, сколько раз в год возвращается клиент' },
    { n: 2, text: 'Ввести причину вернуться вместо скидки' },
    { n: 3, text: 'Замерить повторные покупки и сравнить' },
  ];
  
  const vals = [22, 24, 23, 27, 29, 31];
  const metricBars = vals.map((v, i) => ({
    label: 'Н' + (i + 1),
    barStyle: `width:100%;height:${Math.round((v / 34) * 100)}px;border-radius:8px 8px 3px 3px;background:${i === vals.length - 1 ? '#014753' : '#D2FFB4'};`,
  }));

  return { pathBooks, deckDots, planSteps, metricBars };
}

/**
 * Полотно со всеми 11 мобильными экранами Melyo (фаза 1 — диагностика, фаза 2 — курс).
 * Каждый экран — содержимое внутри <PhoneFrame>: копируйте его как отдельную страницу.
 * Картинки лежат в assets/ (маскот и брендовые пятна вырезаны из брендбука).
 */
export default function MelyoMobileScreens() {
  const { pathBooks, deckDots, planSteps, metricBars } = useMobileData();

  return (
      <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '56px 48px 90px', background: '#F4F3FA', fontFamily: 'Montserrat,sans-serif', position: 'relative', overflow: 'hidden' }}>
      
        <img src="assets/splat-lav.png" alt="" style={{ position: 'absolute', right: '-90px', top: '-60px', width: '420px', opacity: '.5', pointerEvents: 'none' }} />
        <img src="assets/splat-lime.png" alt="" style={{ position: 'absolute', left: '-120px', bottom: '240px', width: '340px', opacity: '.35', pointerEvents: 'none' }} />
      
        <div style={{ position: 'relative', maxWidth: '1180px', margin: '0 0 46px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <img src="assets/mascot-cool.png" alt="Мелио" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: '900', fontSize: '34px', letterSpacing: '-0.01em', color: '#014753', textTransform: 'uppercase' }}>Melyo</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: '999px', background: '#D2FFB4', color: '#014753', fontWeight: '700', fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase' }}>Редизайн · v2</span>
          </div>
          <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: '900', fontSize: '46px', lineHeight: '1.05', letterSpacing: '-0.01em', color: '#1A1B33', margin: '0 0 14px', maxWidth: '900px', textTransform: 'uppercase', textWrap: 'balance' }}>Микрообучение для предпринимателей</h1>
          <p style={{ fontWeight: '500', fontSize: '16px', lineHeight: '1.65', color: '#014753', margin: '0', maxWidth: '760px', textWrap: 'pretty' }}>Тот же продукт в новой айдентике: фаза 1 — диагностика колодой дилемм «или‑или», фаза 2 — короткие курсы по книгам с уроком, термином и квизом. Ниша демо: приложение или игра, рынок Украина, ₴.</p>
        </div>
      
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '1180px', margin: '0 0 22px' }}>
          <span style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: '900', fontSize: '15px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#1A1B33' }}>Фаза 1 · Диагностика</span>
          <span style={{ flex: '1', height: '2px', background: 'linear-gradient(90deg,#C5B6F2,rgba(197,182,242,0))' }}></span>
        </div>
      
        <div style={{ position: 'relative', display: 'flex', gap: '44px', overflowX: 'auto', paddingBottom: '28px', alignItems: 'flex-start', marginBottom: '52px' }}>
      
          {/* 1 · Велком */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 'none' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>1 · Велком‑ворота</div>
            <PhoneFrame>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', padding: '56px 22px 26px', fontFamily: 'Montserrat,sans-serif', position: 'relative', overflow: 'hidden' }}>
                <img src="assets/splat-green.png" alt="" style={{ position: 'absolute', left: '-70px', top: '120px', width: '240px', opacity: '.12' }} />
                <div style={{ position: 'relative', textAlign: 'center' }}>
                  <div style={{ fontWeight: '900', fontSize: '38px', letterSpacing: '-0.01em', color: '#014753', textTransform: 'uppercase', lineHeight: '1' }}>Melyo</div>
                  <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.22em', textTransform: 'uppercase', color: '#01D27F', marginTop: '9px' }}>Диагностика бизнеса</div>
                </div>
                <div style={{ position: 'relative', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '190px' }}>
                  <img src="assets/mascot-cool.png" alt="Мелио" style={{ width: '210px', objectFit: 'contain' }} />
                </div>
                <div style={{ position: 'relative', textAlign: 'center', marginBottom: '26px' }}>
                  <h2 style={{ fontWeight: '900', fontSize: '22px', lineHeight: '1.22', color: '#1A1B33', margin: '0 0 12px', textTransform: 'uppercase' }}>Найди свою суперсилу в бизнесе</h2>
                  <div style={{ fontWeight: '500', fontSize: '13px', lineHeight: '1.55', color: '#014753' }}>Диагностика узких мест и личный план обучения</div>
                </div>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button style={{ padding: '16px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Пройти диагностику</button>
                  <button style={{ padding: '15px', borderRadius: '999px', background: '#FFFFFF', border: '1.5px solid #C5B6F2', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '13px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Войти через Google</button>
                  <div style={{ textAlign: 'center', fontWeight: '500', fontSize: '11px', color: '#6A7A82', marginTop: '6px' }}>2 минуты · 10 дилемм · без регистрации</div>
                </div>
              </div>
            </PhoneFrame>
          </div>
      
          {/* 2 · Разминка */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 'none' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>2 · Разминка</div>
            <PhoneFrame>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', padding: '56px 22px 26px', fontFamily: 'Montserrat,sans-serif' }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '22px' }}>
                  <div style={{ height: '5px', flex: '1', borderRadius: '4px', background: '#01D27F' }}></div>
                  <div style={{ height: '5px', flex: '1', borderRadius: '4px', background: '#E7E4F3' }}></div>
                  <div style={{ height: '5px', flex: '1', borderRadius: '4px', background: '#E7E4F3' }}></div>
                </div>
                <h2 style={{ fontWeight: '900', fontSize: '21px', lineHeight: '1.2', color: '#1A1B33', margin: '0 0 6px', textTransform: 'uppercase' }}>Чем вы занимаетесь?</h2>
                <div style={{ fontWeight: '500', fontSize: '12px', color: '#6A7A82', marginBottom: '18px' }}>Быстрая разминка перед колодой дилемм</div>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 16px', borderRadius: '16px', background: '#D2FFB4', border: '1.5px solid #01D27F' }}>
                    <span style={{ width: '20px', height: '20px', flex: 'none', borderRadius: '50%', border: '2px solid #01D27F', background: '#01D27F', boxShadow: 'inset 0 0 0 3px #D2FFB4' }}></span>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#014753' }}>Приложение или игра</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 16px', borderRadius: '16px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                    <span style={{ width: '20px', height: '20px', flex: 'none', borderRadius: '50%', border: '2px solid #D3D6E2' }}></span>
                    <span style={{ fontWeight: '500', fontSize: '14px', color: '#014753' }}>Кофейня или кафе</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 16px', borderRadius: '16px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                    <span style={{ width: '20px', height: '20px', flex: 'none', borderRadius: '50%', border: '2px solid #D3D6E2' }}></span>
                    <span style={{ fontWeight: '500', fontSize: '14px', color: '#014753' }}>Онлайн‑магазин</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 16px', borderRadius: '16px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                    <span style={{ width: '20px', height: '20px', flex: 'none', borderRadius: '50%', border: '2px solid #D3D6E2' }}></span>
                    <span style={{ fontWeight: '500', fontSize: '14px', color: '#014753' }}>Услуги и агентство</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 16px', borderRadius: '16px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                    <span style={{ width: '20px', height: '20px', flex: 'none', borderRadius: '50%', border: '2px solid #D3D6E2' }}></span>
                    <span style={{ fontWeight: '500', fontSize: '14px', color: '#014753' }}>Другое</span>
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                    <img src="assets/mascot-stand.png" alt="Мелио" style={{ width: '62px', objectFit: 'contain', flex: 'none' }} />
                    <div style={{ flex: '1', padding: '12px 14px', borderRadius: '16px 16px 16px 4px', background: '#F4F3FA', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '12px', lineHeight: '1.5', color: '#014753' }}>Подберу примеры под твою нишу — так дилеммы будут про тебя.</div>
                  </div>
                </div>
                <button style={{ marginTop: '16px', padding: '16px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Дальше</button>
              </div>
            </PhoneFrame>
          </div>
      
          {/* 3 · Колода дилемм */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 'none' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>3 · Колода дилемм</div>
            <PhoneFrame>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', padding: '56px 22px 26px', fontFamily: 'Montserrat,sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <span style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A7A82' }}>Дилемма 4 из 10</span>
                  <span style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#C5B6F2' }}>Пропустить</span>
                </div>
                <div style={{ height: '6px', borderRadius: '4px', background: '#E7E4F3', overflow: 'hidden', marginBottom: '26px' }}><div style={{ width: '40%', height: '100%', background: '#01D27F' }}></div></div>
                <div style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#01D27F', marginBottom: '16px' }}>Чем ты готов пожертвовать?</div>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ flex: '1', padding: '24px 20px', borderRadius: '24px', background: '#D2FFB4', border: '1.5px solid #01D27F', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#01A263' }}>Вариант A</div>
                    <div style={{ fontWeight: '900', fontSize: '21px', lineHeight: '1.2', color: '#1A1B33', textTransform: 'uppercase' }}>Поднять цену на 15%</div>
                    <div style={{ fontWeight: '500', fontSize: '13px', lineHeight: '1.55', color: '#014753' }}>Маржа растёт сразу, но часть игроков уйдёт к тем, кто дешевле.</div>
                  </div>
                  <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#C5B6F2' }}>или</div>
                  <div style={{ flex: '1', padding: '24px 20px', borderRadius: '24px', background: '#F4F3FA', border: '1.5px solid #C5B6F2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#8B7BC8' }}>Вариант B</div>
                    <div style={{ fontWeight: '900', fontSize: '21px', lineHeight: '1.2', color: '#1A1B33', textTransform: 'uppercase' }}>Оставить цену как есть</div>
                    <div style={{ fontWeight: '500', fontSize: '13px', lineHeight: '1.55', color: '#014753' }}>Аудитория спокойна, но каждый месяц ты теряешь часть маржи.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
                  {deckDots.map((d, i) => (
      <React.Fragment key={i}>
                    <div style={s(d.style)}></div>
                  </React.Fragment>
      ))}
                </div>
              </div>
            </PhoneFrame>
          </div>
      
          {/* 4 · Результат */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 'none' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>4 · Результат диагноза</div>
            <PhoneFrame>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', padding: '56px 22px 26px', fontFamily: 'Montserrat,sans-serif', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                  <img src="assets/mascot-think.png" alt="Мелио" style={{ width: '86px', objectFit: 'contain', flex: 'none' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#01D27F', marginBottom: '6px' }}>Твой профиль</div>
                    <div style={{ fontWeight: '900', fontSize: '19px', lineHeight: '1.15', color: '#1A1B33', textTransform: 'uppercase' }}>Быстрый экспериментатор</div>
                  </div>
                </div>
                <div style={{ padding: '18px', borderRadius: '22px', background: '#D2FFB4', marginBottom: '12px' }}>
                  <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#01A263', marginBottom: '8px' }}>Суперсила</div>
                  <div style={{ fontWeight: '900', fontSize: '17px', color: '#1A1B33', marginBottom: '8px', textTransform: 'uppercase' }}>Быстро тестируешь гипотезы</div>
                  <div style={{ fontWeight: '500', fontSize: '12.5px', lineHeight: '1.6', color: '#014753' }}>В 8 из 10 дилемм ты выбирал скорость вместо гарантии — это много попыток за короткий срок.</div>
                </div>
                <div style={{ padding: '18px', borderRadius: '22px', background: '#F4F3FA', border: '1.5px solid #C5B6F2', marginBottom: '16px' }}>
                  <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#8B7BC8', marginBottom: '8px' }}>Слепая зона</div>
                  <div style={{ fontWeight: '900', fontSize: '17px', color: '#1A1B33', marginBottom: '8px', textTransform: 'uppercase' }}>Удержание клиентов</div>
                  <div style={{ fontWeight: '500', fontSize: '12.5px', lineHeight: '1.6', color: '#014753' }}>Ты почти всегда выбирал нового клиента вместо возвращения старого — деньги утекают там, где уже заработаны.</div>
                </div>
                <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '10px' }}>Мини‑план на 3 недели</div>
                {planSteps.map((st, i) => (
      <React.Fragment key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 15px', borderRadius: '16px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', marginBottom: '8px' }}>
                    <div style={{ width: '26px', height: '26px', flex: 'none', borderRadius: '50%', background: '#C6F220', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px', color: '#014753' }}>{st.n}</div>
                    <div style={{ flex: '1', fontWeight: '500', fontSize: '12.5px', lineHeight: '1.4', color: '#014753' }}>{st.text}</div>
                  </div>
                </React.Fragment>
      ))}
                <button style={{ marginTop: '14px', padding: '16px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Открыть путь обучения</button>
              </div>
            </PhoneFrame>
          </div>
      
          {/* 5 · Шаринг */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 'none' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>5 · Карточка шаринга</div>
            <PhoneFrame>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#F4F3FA', display: 'flex', flexDirection: 'column', padding: '56px 22px 26px', fontFamily: 'Montserrat,sans-serif' }}>
                <div style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A7A82', textAlign: 'center', marginBottom: '20px' }}>Поделиться результатом</div>
                <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '100%', padding: '28px 24px', borderRadius: '28px', background: '#C5B6F2', position: 'relative', overflow: 'hidden' }}>
                    <img src="assets/splat-lime.png" alt="" style={{ position: 'absolute', right: '-40px', top: '-30px', width: '150px', opacity: '.55' }} />
                    <div style={{ position: 'relative', fontWeight: '900', fontSize: '11px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#014753', marginBottom: '18px' }}>Melyo · диагностика</div>
                    <div style={{ position: 'relative', fontWeight: '900', fontSize: '26px', lineHeight: '1.12', color: '#1A1B33', textTransform: 'uppercase', marginBottom: '16px' }}>Моя слепая зона — удержание. А твоя?</div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ padding: '8px 14px', borderRadius: '999px', background: '#D2FFB4', fontWeight: '700', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>melyo.io</div>
                      <img src="assets/mascot-cool.png" alt="Мелио" style={{ width: '104px', objectFit: 'contain' }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button style={{ flex: '1', padding: '15px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '13px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Поделиться</button>
                  <button style={{ flex: 'none', padding: '15px 20px', borderRadius: '999px', background: '#FFFFFF', border: '1.5px solid #C5B6F2', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '13px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Скачать</button>
                </div>
                <div style={{ textAlign: 'center', fontWeight: '500', fontSize: '11px', color: '#6A7A82' }}>Друг проходит диагностику — тебе неделя Pro</div>
              </div>
            </PhoneFrame>
          </div>
        </div>
      
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '1180px', margin: '0 0 22px' }}>
          <span style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: '900', fontSize: '15px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#1A1B33' }}>Фаза 2 · Курс</span>
          <span style={{ flex: '1', height: '2px', background: 'linear-gradient(90deg,#01D27F,rgba(1,210,127,0))' }}></span>
        </div>
      
        <div style={{ position: 'relative', display: 'flex', gap: '44px', overflowX: 'auto', paddingBottom: '28px', alignItems: 'flex-start' }}>
      
          {/* 6 · Дашборд */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 'none' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>6 · Путь обучения</div>
            <PhoneFrame>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', fontFamily: 'Montserrat,sans-serif' }}>
                <div style={{ padding: '56px 22px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '900', fontSize: '22px', letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#014753' }}>Melyo</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '6px 12px', borderRadius: '999px', background: '#D2FFB4', fontWeight: '700', fontSize: '11px', color: '#014753' }}>1 240 XP</span>
                    <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#C5B6F2' }}></span>
                  </div>
                </div>
                <div style={{ flex: '1', overflowY: 'auto', padding: '0 22px 20px' }}>
                  <div style={{ padding: '18px', borderRadius: '24px', background: '#D2FFB4', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                    <img src="assets/mascot-stand.png" alt="Мелио" style={{ width: '74px', objectFit: 'contain', flex: 'none' }} />
                    <div>
                      <div style={{ fontWeight: '900', fontSize: '15px', lineHeight: '1.2', color: '#1A1B33', textTransform: 'uppercase', marginBottom: '6px' }}>Урок 3 ждёт тебя</div>
                      <div style={{ fontWeight: '500', fontSize: '12px', lineHeight: '1.5', color: '#014753' }}>4 минуты — и Манн будет закрыт</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '12px' }}>Пять книг — пять углов зрения</div>
                  {pathBooks.map((b, i) => (
      <React.Fragment key={i}>
                    <div style={s(b.cardStyle)}>
                      <div style={s(b.badgeStyle)}>{b.badge}</div>
                      <div style={{ flex: '1', minWidth: '0' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '4px' }}>{b.author}</div>
                        <div style={{ fontWeight: '900', fontSize: '14px', lineHeight: '1.2', color: '#1A1B33', textTransform: 'uppercase', marginBottom: '5px' }}>{b.title}</div>
                        <div style={{ fontWeight: '500', fontSize: '11.5px', color: '#014753' }}>{b.meta}</div>
                      </div>
                    </div>
                  </React.Fragment>
      ))}
                </div>
                <div style={{ flex: 'none', display: 'flex', borderTop: '1.5px solid #E7E4F3', padding: '12px 22px 8px', gap: '8px' }}>
                  <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '10px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#01D27F' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 11L12 4L20 11V20H4V11Z" stroke="#01D27F" strokeWidth="1.8" strokeLinejoin="round" /></svg>Путь
                  </div>
                  <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '10px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#9AA6AC' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 19V11M12 19V5M19 19V14" stroke="#9AA6AC" strokeWidth="2" strokeLinecap="round" /></svg>Метрики
                  </div>
                  <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '10px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#9AA6AC' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="#9AA6AC" strokeWidth="1.8" /><path d="M5 20C5 16 8 14 12 14C16 14 19 16 19 20" stroke="#9AA6AC" strokeWidth="1.8" strokeLinecap="round" /></svg>Профиль
                  </div>
                </div>
              </div>
            </PhoneFrame>
          </div>
      
          {/* 7 · Урок */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 'none' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>7 · Микро‑урок</div>
            <PhoneFrame>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', padding: '56px 22px 26px', fontFamily: 'Montserrat,sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#6A7A82' }}>Сьюэлл · урок 3 из 4</span>
                  <span style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#01D27F' }}>4 мин</span>
                </div>
                <div style={{ height: '6px', borderRadius: '4px', background: '#E7E4F3', overflow: 'hidden', marginBottom: '22px' }}><div style={{ width: '58%', height: '100%', background: '#01D27F' }}></div></div>
                <div style={{ flex: '1', overflowY: 'auto' }}>
                  <div style={{ fontWeight: '900', fontSize: '64px', lineHeight: '.9', color: '#01D27F', marginBottom: '10px' }}>27%</div>
                  <div style={{ fontWeight: '500', fontSize: '14px', lineHeight: '1.5', color: '#014753', marginBottom: '22px' }}>прибыли теряют кофейни, раздавая скидку каждому третьему клиенту.</div>
                  <h2 style={{ fontWeight: '900', fontSize: '21px', lineHeight: '1.18', color: '#1A1B33', margin: '0 0 14px', textTransform: 'uppercase' }}>Почему скидки съедают LTV</h2>
                  <p style={{ fontWeight: '500', fontSize: '13.5px', lineHeight: '1.7', color: '#014753', margin: '0 0 20px' }}>Карл Сьюэлл посчитал: клиент, который возвращается годами, приносит в сотни раз больше, чем разовая продажа. Поэтому он тратил на удержание больше, чем на рекламу.</p>
                  <div style={{ width: '100%', aspectRatio: '16/10', borderRadius: '20px', background: '#F4F3FA', border: '1.5px dashed #C5B6F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                    <img src="assets/bulb.png" alt="" style={{ width: '44px', objectFit: 'contain', opacity: '.8' }} />
                    <span style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#8B7BC8' }}>Иллюстрация урока</span>
                  </div>
                  <div style={{ padding: '18px', borderRadius: '20px', background: '#D2FFB4', marginBottom: '18px' }}>
                    <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#01A263', marginBottom: '9px' }}>Простыми словами</div>
                    <div style={{ fontWeight: '500', fontSize: '13.5px', lineHeight: '1.55', color: '#014753', marginBottom: '12px' }}>Сумма, которую один клиент приносит бизнесу за всё время, что остаётся с вами.</div>
                    <span style={{ display: 'inline-block', padding: '6px 13px', borderRadius: '999px', background: '#FFFFFF', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#014753' }}>LTV · Lifetime Value</span>
                  </div>
                  <div style={{ padding: '18px', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <img src="assets/mascot-laptop.png" alt="Мелио" style={{ width: '66px', objectFit: 'contain', flex: 'none' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '7px' }}>Сделай на своём продукте</div>
                      <div style={{ fontWeight: '500', fontSize: '12.5px', lineHeight: '1.55', color: '#014753' }}>Посчитай, сколько раз в год возвращается средний игрок — и что будет, если вдвое чаще.</div>
                    </div>
                  </div>
                </div>
                <button style={{ marginTop: '16px', padding: '16px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>К квизу</button>
              </div>
            </PhoneFrame>
          </div>
      
          {/* 8 · Квиз */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 'none' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>8 · Квиз · верный ответ</div>
            <PhoneFrame>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', padding: '56px 22px 26px', fontFamily: 'Montserrat,sans-serif', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '24px' }}>
                  <div style={{ height: '5px', flex: '1', borderRadius: '4px', background: '#01D27F' }}></div>
                  <div style={{ height: '5px', flex: '1', borderRadius: '4px', background: '#01D27F' }}></div>
                  <div style={{ height: '5px', flex: '1', borderRadius: '4px', background: '#01D27F' }}></div>
                  <div style={{ height: '5px', flex: '1', borderRadius: '4px', background: '#E7E4F3' }}></div>
                </div>
                <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '12px' }}>Вопрос 3 из 4</div>
                <h2 style={{ fontWeight: '900', fontSize: '20px', lineHeight: '1.25', color: '#1A1B33', margin: '0 0 22px', textTransform: 'uppercase' }}>Что сильнее всего влияет на LTV клиента?</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '16px 18px', borderRadius: '18px', background: '#D2FFB4', border: '1.5px solid #01D27F', fontWeight: '700', fontSize: '13.5px', color: '#014753' }}>
                    <span>Частота повторных покупок</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#01D27F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div style={{ padding: '16px 18px', borderRadius: '18px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '13.5px', color: '#6A7A82' }}>Скорость доставки</div>
                  <div style={{ padding: '16px 18px', borderRadius: '18px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '13.5px', color: '#6A7A82' }}>Красивая упаковка</div>
                  <div style={{ padding: '16px 18px', borderRadius: '18px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '13.5px', color: '#6A7A82' }}>Наличие приложения</div>
                </div>
                <div style={{ flex: '1' }}></div>
                <div style={{ margin: '0 -22px -26px', padding: '20px 22px 26px', borderRadius: '28px 28px 0 0', background: '#F4F3FA', borderTop: '1.5px solid #C5B6F2' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                    <img src="assets/mascot-cool.png" alt="Мелио" style={{ width: '76px', objectFit: 'contain', flex: 'none' }} />
                    <div>
                      <div style={{ fontWeight: '900', fontSize: '17px', color: '#01A263', textTransform: 'uppercase', marginBottom: '7px' }}>Точно!</div>
                      <div style={{ fontWeight: '500', fontSize: '12.5px', lineHeight: '1.55', color: '#014753' }}>Клиент, который возвращается снова и снова, стоит в разы больше разового — частота двигает LTV сильнее всего.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#6A7A82' }}><span>+15 XP</span><span style={{ color: '#01D27F' }}>3 / 3</span></div>
                  <button style={{ width: '100%', padding: '16px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Следующий вопрос</button>
                </div>
              </div>
            </PhoneFrame>
          </div>
      
          {/* 9 · Домашка */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 'none' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>9 · Домашка</div>
            <PhoneFrame>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', padding: '56px 22px 26px', fontFamily: 'Montserrat,sans-serif' }}>
                <h2 style={{ fontWeight: '900', fontSize: '22px', color: '#1A1B33', margin: '10px 0 12px', textTransform: 'uppercase' }}>Домашка</h2>
                <div style={{ fontWeight: '500', fontSize: '13px', lineHeight: '1.6', color: '#014753', marginBottom: '16px' }}>Опиши, как применишь LTV‑подход в своём продукте за две недели.</div>
                <div style={{ padding: '16px', borderRadius: '20px', background: '#F4F3FA', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '13px', lineHeight: '1.6', color: '#9AA6AC', minHeight: '150px', marginBottom: '14px' }}>Введу еженедельную награду за возврат в игру и замерю retention D7…</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                  <span style={{ padding: '8px 13px', borderRadius: '999px', background: '#D2FFB4', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#014753' }}>Прикрепить файл</span>
                  <span style={{ padding: '8px 13px', borderRadius: '999px', background: '#F4F3FA', border: '1.5px solid #E7E4F3', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#6A7A82' }}>Черновик</span>
                </div>
                <div style={{ padding: '16px', borderRadius: '20px', background: '#C5B6F2', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src="assets/mascot-think.png" alt="Мелио" style={{ width: '60px', objectFit: 'contain', flex: 'none' }} />
                  <div style={{ fontWeight: '500', fontSize: '12.5px', lineHeight: '1.5', color: '#1A1B33' }}>Проверю за сутки и дам оценку по трём критериям.</div>
                </div>
                <div style={{ flex: '1' }}></div>
                <button style={{ padding: '16px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Сдать домашку</button>
              </div>
            </PhoneFrame>
          </div>
      
          {/* 10 · Пейволл */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 'none' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>10 · Пейволл</div>
            <PhoneFrame>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', padding: '56px 22px 26px', fontFamily: 'Montserrat,sans-serif', position: 'relative', overflow: 'hidden' }}>
                <img src="assets/splat-lav.png" alt="" style={{ position: 'absolute', right: '-60px', top: '40px', width: '200px', opacity: '.4' }} />
                <h2 style={{ position: 'relative', fontWeight: '900', fontSize: '24px', lineHeight: '1.15', color: '#1A1B33', margin: '8px 0 18px', textTransform: 'uppercase' }}>Открой полный курс</h2>
                <div style={{ position: 'relative', padding: '24px', borderRadius: '26px', background: '#D2FFB4', textAlign: 'center', marginBottom: '18px' }}>
                  <div style={{ fontWeight: '900', fontSize: '44px', lineHeight: '1', color: '#014753', marginBottom: '6px' }}>199 ₴</div>
                  <div style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#01A263' }}>в месяц · отмена в любой момент</div>
                </div>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500', fontSize: '13px', color: '#014753' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#01D27F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Пять книг и 20 уроков</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500', fontSize: '13px', color: '#014753' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#01D27F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Проверка домашек с оценкой</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500', fontSize: '13px', color: '#014753' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#01D27F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Переоценка слепой зоны раз в месяц</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500', fontSize: '13px', color: '#014753' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#01D27F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Метрики продукта в динамике</div>
                </div>
                <div style={{ position: 'relative', flex: '1', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <img src="assets/mascot-stand.png" alt="Мелио" style={{ width: '130px', objectFit: 'contain' }} />
                </div>
                <button style={{ position: 'relative', marginTop: '16px', padding: '16px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Оформить Pro</button>
                <div style={{ position: 'relative', textAlign: 'center', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#8B7BC8', marginTop: '12px' }}>Продолжить бесплатно · 1 урок в неделю</div>
              </div>
            </PhoneFrame>
          </div>
      
          {/* 11 · Переоценка */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 'none' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>11 · Переоценка и метрики</div>
            <PhoneFrame>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', padding: '56px 22px 26px', fontFamily: 'Montserrat,sans-serif' }}>
                <h2 style={{ fontWeight: '900', fontSize: '21px', lineHeight: '1.15', color: '#1A1B33', margin: '6px 0 16px', textTransform: 'uppercase' }}>Метрики за 6 недель</h2>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
                  <div style={{ flex: '1', padding: '14px', borderRadius: '18px', background: '#D2FFB4' }}>
                    <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#01A263', marginBottom: '7px' }}>Повторные</div>
                    <div style={{ fontWeight: '900', fontSize: '24px', color: '#014753' }}>+9%</div>
                  </div>
                  <div style={{ flex: '1', padding: '14px', borderRadius: '18px', background: '#F4F3FA', border: '1.5px solid #E7E4F3' }}>
                    <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '7px' }}>Средний чек</div>
                    <div style={{ fontWeight: '900', fontSize: '24px', color: '#1A1B33' }}>840 ₴</div>
                  </div>
                </div>
                <div style={{ padding: '18px', borderRadius: '22px', background: '#C5B6F2', marginBottom: '18px' }}>
                  <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#014753', marginBottom: '14px' }}>Повторные покупки по неделям, %</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px', height: '120px' }}>
                    {metricBars.map((b, i) => (
      <React.Fragment key={i}>
                      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', justifyContent: 'flex-end', height: '100%' }}>
                        <div style={s(b.barStyle)}></div>
                        <span style={{ fontWeight: '700', fontSize: '9px', color: '#014753' }}>{b.label}</span>
                      </div>
                    </React.Fragment>
      ))}
                  </div>
                </div>
                <div style={{ padding: '18px', borderRadius: '22px', background: '#F4F3FA', border: '1.5px solid #E7E4F3', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src="assets/mascot-think.png" alt="Мелио" style={{ width: '64px', objectFit: 'contain', flex: 'none' }} />
                  <div style={{ fontWeight: '500', fontSize: '12.5px', lineHeight: '1.5', color: '#014753' }}>Слепая зона сдвинулась. Пройдёшь диагностику заново?</div>
                </div>
                <div style={{ flex: '1' }}></div>
                <button style={{ padding: '16px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Переоценка · 10 дилемм</button>
              </div>
            </PhoneFrame>
          </div>
        </div>
      </div>
  );
}
