import React from 'react';
import BrowserFrame from './BrowserFrame';
import { s } from './style-utils';

/** Демо-данные экранов. Заменяются реальными из API. */
export function useDesktopData() {
  const green = '#01D27F';
  const books = [
    { author: 'Шарп', title: 'Как растут бренды', meta: 'Пройдено · +40 XP', state: 'done' },
    { author: 'Остервальдер', title: 'Бизнес‑модели', meta: 'Пройдено · +35 XP', state: 'done' },
    { author: 'Манн', title: 'Маркетинг без бюджета', meta: '3 из 4 уроков', state: 'current' },
    { author: 'Барден', title: 'Психология покупки', meta: 'Откроется после Манна', state: 'locked' },
    { author: 'Сьюэлл', title: 'Клиенты на всю жизнь', meta: 'Заблокировано', state: 'locked' },
  ];
  const deskPath = books.map((b, i) => {
    const done = b.state === 'done', cur = b.state === 'current';
    return {
      author: b.author, title: b.title, meta: b.meta,
      wrapStyle: `flex:1;position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:0 4px;min-width:0;${b.state === 'locked' ? 'opacity:.55;' : ''}`,
      connectorStyle: i === 0 ? 'display:none;' : 'position:absolute;left:0;top:23px;width:50%;height:3px;border-radius:2px;background:#E7E4F3;',
      badgeStyle: `position:relative;z-index:1;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;flex:none;${
        done ? 'background:#D2FFB4;color:#01A263;'
        : cur ? `background:${green};color:#FFFFFF;box-shadow:0 0 0 6px rgba(1,210,127,.18);`
        : 'background:#EFEFF5;color:#9AA6AC;'}`,
      badge: done ? '✓' : cur ? '▶' : '🔒',
      cardStyle: `width:100%;padding:16px 18px;border-radius:20px;text-align:center;${
        cur ? 'background:#FFFFFF;border:2px solid #01D27F;box-shadow:0 8px 22px rgba(1,210,127,.16);'
        : 'background:#FFFFFF;border:1.5px solid #E7E4F3;'}`,
    };
  });
  
  const deckDots = Array.from({ length: 10 }, (_, i) => ({
    style: `width:${i === 3 ? 24 : 8}px;height:8px;border-radius:4px;background:${i < 3 ? '#C5B6F2' : i === 3 ? green : '#E7E4F3'};`,
  }));
  
  const planSteps = [
    { n: 1, text: 'Посчитать, сколько раз в год возвращается клиент', meta: 'неделя 1' },
    { n: 2, text: 'Ввести причину вернуться вместо скидки', meta: 'неделя 2' },
    { n: 3, text: 'Замерить повторные покупки и сравнить', meta: 'неделя 3' },
  ];
  
  const vals = [22, 24, 23, 27, 29, 31];
  const metricBars = vals.map((v, i) => ({
    label: 'Н' + (i + 1),
    barStyle: `width:100%;height:${Math.round((v / 34) * 140)}px;border-radius:10px 10px 3px 3px;background:${i === vals.length - 1 ? '#014753' : 'rgba(255,255,255,.75)'};`,
  }));

  return { deskPath, deckDots, planSteps, metricBars };
}

/**
 * Полотно с 6 десктопными экранами Melyo: урок, путь обучения, колода дилемм,
 * результат диагноза, квиз и метрики. Содержимое внутри <BrowserFrame> — реальный layout страницы.
 */
export default function MelyoDesktopScreens() {
  const { deskPath, deckDots, planSteps, metricBars } = useDesktopData();

  return (
      <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '56px 48px 90px', background: '#F4F3FA', fontFamily: 'Montserrat,sans-serif', position: 'relative', overflow: 'hidden' }}>
      
        <img src="assets/splat-lime.png" alt="" style={{ position: 'absolute', right: '-100px', top: '-70px', width: '400px', opacity: '.35', pointerEvents: 'none' }} />
      
        <div style={{ position: 'relative', maxWidth: '1180px', margin: '0 0 44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <img src="assets/mascot-laptop.png" alt="Мелио" style={{ width: '74px', objectFit: 'contain' }} />
            <span style={{ fontWeight: '900', fontSize: '34px', letterSpacing: '-0.01em', color: '#014753', textTransform: 'uppercase' }}>Melyo</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: '999px', background: '#C5B6F2', color: '#1A1B33', fontWeight: '700', fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase' }}>Десктоп · v2</span>
          </div>
          <h1 style={{ fontWeight: '900', fontSize: '46px', lineHeight: '1.05', letterSpacing: '-0.01em', color: '#1A1B33', margin: '0 0 14px', maxWidth: '900px', textTransform: 'uppercase', textWrap: 'balance' }}>Веб‑приложение в новой айдентике</h1>
          <p style={{ fontWeight: '500', fontSize: '16px', lineHeight: '1.65', color: '#014753', margin: '0', maxWidth: '780px', textWrap: 'pretty' }}>Сайдбар курса и тонкий топбар, маскот живёт компаньоном в углу. Шесть экранов: урок, путь обучения, колода дилемм, результат диагноза, квиз и метрики.</p>
        </div>
      
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '44px' }}>
      
          {/* Экран урока */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>1 · Экран урока — программа, текст, заметки</div>
            <BrowserFrame url="app.melyo.io/course/sewell/lesson-3">
              <div style={{ display: 'flex', height: '100%', background: '#FFFFFF', fontFamily: 'Montserrat,sans-serif', color: '#014753' }}>
                <div style={{ width: '252px', flex: 'none', borderRight: '1.5px solid #EFEFF5', display: 'flex', flexDirection: 'column', background: '#F4F3FA' }}>
                  <div style={{ padding: '22px 20px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '900', fontSize: '22px', letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#014753' }}>Melyo</span>
                  </div>
                  <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: '#D2FFB4', color: '#014753', fontSize: '12px', fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 11L12 4L20 11V20H4V11Z" stroke="#01A263" strokeWidth="1.8" strokeLinejoin="round" /></svg>Путь обучения
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', color: '#6A7A82', fontSize: '12px', fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 19V11M12 19V5M19 19V14" stroke="#9AA6AC" strokeWidth="2" strokeLinecap="round" /></svg>Метрики
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', color: '#6A7A82', fontSize: '12px', fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h13" stroke="#9AA6AC" strokeWidth="1.8" strokeLinecap="round" /></svg>Диагностика
                    </div>
                  </div>
                  <div style={{ flex: 'none', margin: '26px 20px 12px', fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#9AA6AC' }}>Сьюэлл · 4 урока</div>
                  <div style={{ flex: '1', minHeight: '0', overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', fontSize: '12.5px', fontWeight: '500', color: '#014753' }}>
                      <span style={{ width: '20px', height: '20px', flex: 'none', borderRadius: '50%', background: '#D2FFB4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900', color: '#01A263' }}>✓</span>Цена и ценность
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', fontSize: '12.5px', fontWeight: '500', color: '#014753' }}>
                      <span style={{ width: '20px', height: '20px', flex: 'none', borderRadius: '50%', background: '#D2FFB4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900', color: '#01A263' }}>✓</span>Кто твой постоянный клиент
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 12px', borderRadius: '12px', background: '#FFFFFF', border: '2px solid #01D27F', fontSize: '12.5px', fontWeight: '700', color: '#1A1B33' }}>
                      <span style={{ width: '20px', height: '20px', flex: 'none', borderRadius: '50%', background: '#01D27F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#FFFFFF' }}>▶</span>Почему скидки съедают LTV
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', fontSize: '12.5px', fontWeight: '500', color: '#9AA6AC' }}>
                      <span style={{ width: '20px', height: '20px', flex: 'none', borderRadius: '50%', border: '1.5px solid #DCDCE6' }}></span>Программа возврата
                    </div>
                  </div>
                  <div style={{ flex: 'none', margin: '14px', padding: '14px 16px', borderRadius: '18px', background: '#C5B6F2' }}>
                    <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#1A1B33', marginBottom: '9px' }}>Курс пройден на 62%</div>
                    <div style={{ height: '7px', borderRadius: '4px', background: 'rgba(255,255,255,.55)', overflow: 'hidden' }}><div style={{ width: '62%', height: '100%', background: '#014753' }}></div></div>
                  </div>
                </div>
      
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                  <div style={{ height: '60px', flex: 'none', borderBottom: '1.5px solid #EFEFF5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px' }}>
                    <div style={{ fontWeight: '500', fontSize: '12px', color: '#6A7A82' }}>Сьюэлл · Клиенты на всю жизнь <span style={{ color: '#C5B6F2' }}>/</span> <span style={{ color: '#1A1B33', fontWeight: '700' }}>Урок 3</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ padding: '7px 13px', borderRadius: '999px', background: '#D2FFB4', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#014753' }}>6 уроков подряд</span>
                      <span style={{ padding: '7px 13px', borderRadius: '999px', background: '#F4F3FA', border: '1.5px solid #E7E4F3', fontWeight: '700', fontSize: '11px', color: '#014753' }}>1 240 XP</span>
                      <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#C5B6F2' }}></span>
                    </div>
                  </div>
      
                  <div style={{ flex: '1', display: 'flex', minHeight: '0' }}>
                    <div style={{ flex: '1', overflowY: 'auto', padding: '34px 40px 40px', minWidth: '0' }}>
                      <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#9AA6AC', marginBottom: '20px' }}>Урок 3 из 4 · 4 мин</div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '26px' }}>
                        <div style={{ fontWeight: '900', fontSize: '78px', lineHeight: '.85', color: '#01D27F', flex: 'none' }}>27%</div>
                        <div style={{ fontWeight: '500', fontSize: '16px', lineHeight: '1.5', color: '#014753', paddingTop: '8px' }}>именно столько прибыли теряют кофейни, раздавая скидку каждому третьему клиенту.</div>
                      </div>
                      <h2 style={{ fontWeight: '900', fontSize: '28px', lineHeight: '1.15', color: '#1A1B33', margin: '0 0 16px', textTransform: 'uppercase' }}>Почему скидки съедают LTV</h2>
                      <p style={{ fontWeight: '500', fontSize: '14.5px', lineHeight: '1.75', color: '#014753', margin: '0 0 24px', maxWidth: '640px' }}>Карл Сьюэлл, автодилер из Далласа, посчитал: клиент, который возвращается годами, приносит в сотни раз больше, чем разовая продажа. Поэтому он тратил на удержание больше, чем на рекламу для новых покупателей.</p>
                      <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '22px', background: '#F4F3FA', border: '1.5px dashed #C5B6F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '26px' }}>
                        <img src="assets/bulb.png" alt="" style={{ width: '54px', objectFit: 'contain', opacity: '.85' }} />
                        <span style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#8B7BC8' }}>Иллюстрация урока · 16:9</span>
                      </div>
                      <div style={{ padding: '22px 24px', borderRadius: '22px', background: '#D2FFB4', marginBottom: '26px', maxWidth: '640px' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#01A263', marginBottom: '10px' }}>Простыми словами</div>
                        <div style={{ fontWeight: '500', fontSize: '15px', lineHeight: '1.6', color: '#014753', marginBottom: '12px' }}>Сумма, которую один клиент приносит бизнесу за всё время, что остаётся с вами.</div>
                        <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '999px', background: '#FFFFFF', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#014753' }}>LTV · Lifetime Value</span>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', minWidth: '260px', padding: '20px', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                          <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '16px' }}>Воронка: увидел → зашёл → купил</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '100%', height: '24px', borderRadius: '8px', background: '#E7E4F3' }}></div><span style={{ fontWeight: '700', fontSize: '11px', color: '#6A7A82' }}>100%</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '58%', height: '24px', borderRadius: '8px', background: '#C5B6F2' }}></div><span style={{ fontWeight: '700', fontSize: '11px', color: '#6A7A82' }}>34%</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '22%', height: '24px', borderRadius: '8px', background: '#01D27F' }}></div><span style={{ fontWeight: '700', fontSize: '11px', color: '#6A7A82' }}>9%</span></div>
                          </div>
                        </div>
                        <div style={{ flex: '1', minWidth: '260px', padding: '20px', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                          <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '16px' }}>Весы: выгода − усилие</div>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '18px', height: '88px' }}>
                            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><div style={{ width: '100%', height: '70px', borderRadius: '10px', background: '#01D27F' }}></div><span style={{ fontWeight: '700', fontSize: '11px', color: '#6A7A82' }}>выгода</span></div>
                            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><div style={{ width: '100%', height: '34px', borderRadius: '10px', background: '#C6F220' }}></div><span style={{ fontWeight: '700', fontSize: '11px', color: '#6A7A82' }}>усилие</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
      
                    <div style={{ width: '326px', flex: 'none', borderLeft: '1.5px solid #EFEFF5', display: 'flex', flexDirection: 'column', background: '#F4F3FA', minHeight: '0' }}>
                      <div style={{ padding: '24px 22px 0', flex: '1', minHeight: '0', overflowY: 'auto' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#9AA6AC', marginBottom: '12px' }}>Сделай на своём продукте</div>
                        <div style={{ padding: '16px', borderRadius: '18px', background: '#FFFFFF', border: '1.5px dashed #C5B6F2', fontWeight: '500', fontSize: '13px', lineHeight: '1.6', color: '#014753', marginBottom: '20px' }}>Посчитай: сколько раз в год к тебе возвращается средний клиент — и что изменится, если это будет в 2 раза чаще?</div>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#9AA6AC', marginBottom: '10px' }}>Мои заметки</div>
                        <div style={{ padding: '16px', borderRadius: '18px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '13px', lineHeight: '1.6', color: '#9AA6AC', minHeight: '112px' }}>Пиши здесь, что применишь на своём продукте…</div>
                        <div style={{ marginTop: '18px', padding: '16px', borderRadius: '20px', background: '#C5B6F2' }}>
                          <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '14px', background: 'rgba(255,255,255,.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '9px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#01D27F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M8 5.5L18 12L8 18.5V5.5Z" fill="#FFFFFF" /></svg>
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#014753' }}>Видео‑разбор · 90 сек</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ flex: 'none', padding: '14px 22px 20px', background: '#F4F3FA', borderTop: '1.5px solid #EFEFF5' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '14px' }}>
                          <img src="assets/mascot-stand.png" alt="Мелио" style={{ width: '70px', objectFit: 'contain', flex: 'none' }} />
                          <div style={{ flex: '1', padding: '12px 14px', borderRadius: '16px 16px 16px 4px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '12px', lineHeight: '1.5', color: '#014753' }}>Дочитал? Проверим — квиз всего на 4 вопроса.</div>
                        </div>
                        <button style={{ width: '100%', padding: '16px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>К квизу</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </BrowserFrame>
          </div>
      
          {/* Путь обучения */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>2 · Путь обучения — пять книг дорожкой</div>
            <BrowserFrame url="app.melyo.io/path">
              <div style={{ display: 'flex', height: '100%', background: '#FFFFFF', fontFamily: 'Montserrat,sans-serif', color: '#014753' }}>
                <div style={{ width: '252px', flex: 'none', borderRight: '1.5px solid #EFEFF5', background: '#F4F3FA', padding: '22px 12px' }}>
                  <div style={{ padding: '0 8px 20px', fontWeight: '900', fontSize: '22px', letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#014753' }}>Melyo</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: '#D2FFB4', color: '#014753', fontSize: '12px', fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 11L12 4L20 11V20H4V11Z" stroke="#01A263" strokeWidth="1.8" strokeLinejoin="round" /></svg>Путь обучения
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', color: '#6A7A82', fontSize: '12px', fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 19V11M12 19V5M19 19V14" stroke="#9AA6AC" strokeWidth="2" strokeLinecap="round" /></svg>Метрики
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', color: '#6A7A82', fontSize: '12px', fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="#9AA6AC" strokeWidth="1.8" /><path d="M5 20C5 16 8 14 12 14C16 14 19 16 19 20" stroke="#9AA6AC" strokeWidth="1.8" strokeLinecap="round" /></svg>Профиль
                    </div>
                  </div>
                  <div style={{ marginTop: '26px', padding: '18px', borderRadius: '20px', background: '#C5B6F2' }}>
                    <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#1A1B33', marginBottom: '9px' }}>Слепая зона</div>
                    <div style={{ fontWeight: '900', fontSize: '15px', textTransform: 'uppercase', color: '#1A1B33', marginBottom: '10px' }}>Удержание клиентов</div>
                    <div style={{ fontWeight: '500', fontSize: '11.5px', lineHeight: '1.5', color: '#014753' }}>Переоценка доступна через 4 дня</div>
                  </div>
                </div>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                  <div style={{ height: '60px', flex: 'none', borderBottom: '1.5px solid #EFEFF5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px' }}>
                    <div style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#1A1B33' }}>Твой путь</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ padding: '7px 13px', borderRadius: '999px', background: '#D2FFB4', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#014753' }}>6 уроков подряд</span>
                      <span style={{ padding: '7px 13px', borderRadius: '999px', background: '#F4F3FA', border: '1.5px solid #E7E4F3', fontWeight: '700', fontSize: '11px', color: '#014753' }}>1 240 XP</span>
                      <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#C5B6F2' }}></span>
                    </div>
                  </div>
                  <div style={{ flex: '1', overflowY: 'auto', padding: '32px 34px 40px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '26px', padding: '26px 30px', borderRadius: '28px', background: '#D2FFB4', marginBottom: '34px' }}>
                      <img src="assets/mascot-cool.png" alt="Мелио" style={{ width: '132px', objectFit: 'contain', flex: 'none' }} />
                      <div style={{ flex: '1' }}>
                        <div style={{ fontWeight: '900', fontSize: '24px', lineHeight: '1.15', color: '#1A1B33', textTransform: 'uppercase', marginBottom: '10px' }}>Пять книг — пять углов зрения на один бизнес</div>
                        <div style={{ fontWeight: '500', fontSize: '13.5px', lineHeight: '1.6', color: '#014753', maxWidth: '520px' }}>План собран из твоей диагностики: сначала удержание, потом цена и только затем привлечение.</div>
                      </div>
                      <button style={{ padding: '15px 26px', borderRadius: '999px', border: 'none', background: '#014753', color: '#D2FFB4', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '13px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', flex: 'none' }}>Продолжить урок</button>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#9AA6AC', marginBottom: '16px' }}>Дорожка курса</div>
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      {deskPath.map((p, i) => (
      <React.Fragment key={i}>
                        <div style={s(p.wrapStyle)}>
                          <div style={s(p.connectorStyle)}></div>
                          <div style={s(p.badgeStyle)}>{p.badge}</div>
                          <div style={s(p.cardStyle)}>
                            <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#9AA6AC', marginBottom: '7px' }}>{p.author}</div>
                            <div style={{ fontWeight: '900', fontSize: '13px', lineHeight: '1.25', textTransform: 'uppercase', color: '#1A1B33', marginBottom: '8px' }}>{p.title}</div>
                            <div style={{ fontWeight: '500', fontSize: '11px', color: '#6A7A82' }}>{p.meta}</div>
                          </div>
                        </div>
                      </React.Fragment>
      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '18px', marginTop: '34px' }}>
                      <div style={{ flex: '1', padding: '20px 22px', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '9px' }}>Уроков пройдено</div>
                        <div style={{ fontWeight: '900', fontSize: '32px', color: '#1A1B33' }}>6</div>
                      </div>
                      <div style={{ flex: '1', padding: '20px 22px', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '9px' }}>Домашек сдано</div>
                        <div style={{ fontWeight: '900', fontSize: '32px', color: '#1A1B33' }}>4</div>
                      </div>
                      <div style={{ flex: '1', padding: '20px 22px', borderRadius: '20px', background: '#D2FFB4' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#01A263', marginBottom: '9px' }}>Средняя оценка</div>
                        <div style={{ fontWeight: '900', fontSize: '32px', color: '#014753' }}>8,1</div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', right: '30px', bottom: '26px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                      <div style={{ padding: '12px 15px', borderRadius: '16px 16px 4px 16px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '12px', lineHeight: '1.5', color: '#014753', maxWidth: '220px' }}>Два урока — и откроется Барден.</div>
                      <img src="assets/mascot-stand.png" alt="Мелио" style={{ width: '78px', objectFit: 'contain', flex: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>
            </BrowserFrame>
          </div>
      
          {/* Колода дилемм */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>3 · Колода дилемм — выбор клавишами ← →</div>
            <BrowserFrame url="app.melyo.io/diagnostics">
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF', fontFamily: 'Montserrat,sans-serif', color: '#014753', position: 'relative', overflow: 'hidden' }}>
                <img src="assets/splat-lav.png" alt="" style={{ position: 'absolute', right: '-80px', top: '-60px', width: '300px', opacity: '.35' }} />
                <div style={{ height: '60px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', borderBottom: '1.5px solid #EFEFF5', position: 'relative' }}>
                  <span style={{ fontWeight: '900', fontSize: '21px', letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#014753' }}>Melyo</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#6A7A82' }}>Дилемма 4 из 10</span>
                    <div style={{ width: '170px', height: '7px', borderRadius: '4px', background: '#E7E4F3', overflow: 'hidden' }}><div style={{ width: '40%', height: '100%', background: '#01D27F' }}></div></div>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#C5B6F2' }}>Пропустить</span>
                </div>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', position: 'relative' }}>
                  <div style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#01D27F', marginBottom: '28px' }}>Чем ты готов пожертвовать?</div>
                  <div style={{ display: 'flex', alignItems: 'stretch', gap: '20px', width: '100%', maxWidth: '900px' }}>
                    <div style={{ flex: '1', padding: '36px 32px', borderRadius: '28px', background: '#D2FFB4', border: '2px solid #01D27F', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#01A263' }}>Вариант A</div>
                      <div style={{ fontWeight: '900', fontSize: '26px', lineHeight: '1.15', color: '#1A1B33', textTransform: 'uppercase' }}>Поднять цену на 15%</div>
                      <div style={{ fontWeight: '500', fontSize: '13.5px', lineHeight: '1.6', color: '#014753' }}>Маржа растёт сразу, но часть клиентов уйдёт к тем, кто дешевле.</div>
                      <div style={{ flex: '1' }}></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#01A263' }}>
                        <span style={{ padding: '5px 11px', borderRadius: '8px', background: '#FFFFFF', fontSize: '12px' }}>←</span>выбрать
                      </div>
                    </div>
                    <div style={{ flex: 'none', width: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#C5B6F2' }}>или</div>
                    <div style={{ flex: '1', padding: '36px 32px', borderRadius: '28px', background: '#F4F3FA', border: '2px solid #C5B6F2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#8B7BC8' }}>Вариант B</div>
                      <div style={{ fontWeight: '900', fontSize: '26px', lineHeight: '1.15', color: '#1A1B33', textTransform: 'uppercase' }}>Оставить цену как есть</div>
                      <div style={{ fontWeight: '500', fontSize: '13.5px', lineHeight: '1.6', color: '#014753' }}>Клиенты спокойны, но каждый месяц ты теряешь часть маржи.</div>
                      <div style={{ flex: '1' }}></div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '9px', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#8B7BC8' }}>выбрать
                        <span style={{ padding: '5px 11px', borderRadius: '8px', background: '#FFFFFF', fontSize: '12px' }}>→</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '28px', display: 'flex', gap: '6px' }}>
                    {deckDots.map((d, i) => (
      <React.Fragment key={i}>
                      <div style={s(d.style)}></div>
                    </React.Fragment>
      ))}
                  </div>
                  <div style={{ position: 'absolute', left: '30px', bottom: '26px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                    <img src="assets/mascot-think.png" alt="Мелио" style={{ width: '84px', objectFit: 'contain', flex: 'none' }} />
                    <div style={{ padding: '12px 15px', borderRadius: '16px 16px 16px 4px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '12px', lineHeight: '1.5', color: '#014753', maxWidth: '250px' }}>Здесь нет правильных ответов — только твои приоритеты.</div>
                  </div>
                </div>
              </div>
            </BrowserFrame>
          </div>
      
          {/* Результат диагноза */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>4 · Результат диагноза</div>
            <BrowserFrame url="app.melyo.io/diagnostics/result">
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF', fontFamily: 'Montserrat,sans-serif', color: '#014753' }}>
                <div style={{ height: '60px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', borderBottom: '1.5px solid #EFEFF5' }}>
                  <span style={{ fontWeight: '900', fontSize: '21px', letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#014753' }}>Melyo</span>
                  <span style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#6A7A82' }}>Диагностика завершена · 10 дилемм</span>
                </div>
                <div style={{ flex: '1', overflowY: 'auto', padding: '38px 44px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '32px' }}>
                    <img src="assets/mascot-think.png" alt="Мелио" style={{ width: '130px', objectFit: 'contain', flex: 'none' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#01D27F', marginBottom: '12px' }}>Твой профиль предпринимателя</div>
                      <div style={{ fontWeight: '900', fontSize: '34px', lineHeight: '1.1', color: '#1A1B33', textTransform: 'uppercase', maxWidth: '720px' }}>Быстрый экспериментатор с дырой в удержании</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ flex: '1', padding: '26px', borderRadius: '26px', background: '#D2FFB4' }}>
                      <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#01A263', marginBottom: '12px' }}>Суперсила</div>
                      <div style={{ fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', color: '#1A1B33', marginBottom: '10px' }}>Быстро тестируешь гипотезы</div>
                      <div style={{ fontWeight: '500', fontSize: '13px', lineHeight: '1.65', color: '#014753' }}>В 8 из 10 дилемм ты выбирал скорость вместо гарантии — это даёт много попыток за короткий срок.</div>
                    </div>
                    <div style={{ flex: '1', padding: '26px', borderRadius: '26px', background: '#C5B6F2' }}>
                      <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#014753', marginBottom: '12px' }}>Слепая зона</div>
                      <div style={{ fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', color: '#1A1B33', marginBottom: '10px' }}>Удержание клиентов</div>
                      <div style={{ fontWeight: '500', fontSize: '13px', lineHeight: '1.65', color: '#014753' }}>Ты почти всегда выбирал нового клиента вместо возвращения старого — деньги утекают там, где их уже заработали.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1' }}>
                      <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#9AA6AC', marginBottom: '14px' }}>Мини‑план на 3 недели</div>
                      {planSteps.map((st, i) => (
      <React.Fragment key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderRadius: '18px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', marginBottom: '10px' }}>
                          <div style={{ width: '30px', height: '30px', flex: 'none', borderRadius: '50%', background: '#C6F220', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', color: '#014753' }}>{st.n}</div>
                          <div style={{ flex: '1', fontWeight: '500', fontSize: '14px', color: '#014753' }}>{st.text}</div>
                          <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#9AA6AC' }}>{st.meta}</div>
                        </div>
                      </React.Fragment>
      ))}
                      <button style={{ marginTop: '16px', padding: '16px 32px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Открыть путь обучения</button>
                    </div>
                    <div style={{ width: '330px', flex: 'none', padding: '26px', borderRadius: '26px', background: '#014753', textAlign: 'center' }}>
                      <div style={{ fontWeight: '900', fontSize: '19px', lineHeight: '1.3', color: '#D2FFB4', textTransform: 'uppercase', marginBottom: '18px' }}>«Моя слепая зона — удержание. А твоя?»</div>
                      <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#C5B6F2', marginBottom: '20px' }}>melyo · диагностика бизнеса</div>
                      <button style={{ width: '100%', padding: '14px', borderRadius: '999px', background: 'transparent', border: '1.5px solid #D2FFB4', color: '#D2FFB4', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '12px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Поделиться карточкой</button>
                    </div>
                  </div>
                </div>
              </div>
            </BrowserFrame>
          </div>
      
          {/* Квиз */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>5 · Квиз — фидбэк маскота панелью справа</div>
            <BrowserFrame url="app.melyo.io/course/sewell/quiz">
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF', fontFamily: 'Montserrat,sans-serif', color: '#014753' }}>
                <div style={{ height: '6px', flex: 'none', background: '#E7E4F3' }}><div style={{ width: '75%', height: '100%', background: '#01D27F' }}></div></div>
                <div style={{ flex: '1', display: 'flex', minHeight: '0' }}>
                  <div style={{ flex: '1', padding: '48px 52px', minWidth: '0' }}>
                    <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#9AA6AC', marginBottom: '22px' }}>Вопрос 3 из 4</div>
                    <h2 style={{ fontWeight: '900', fontSize: '32px', lineHeight: '1.2', color: '#1A1B33', margin: '0 0 32px', maxWidth: '640px', textTransform: 'uppercase' }}>Что сильнее всего влияет на LTV клиента?</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px', borderRadius: '20px', background: '#D2FFB4', border: '2px solid #01D27F', fontWeight: '700', fontSize: '15px', color: '#014753' }}>
                        <span>Частота повторных покупок</span>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#01D27F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <div style={{ padding: '20px 22px', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '15px', color: '#6A7A82' }}>Скорость доставки</div>
                      <div style={{ padding: '20px 22px', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '15px', color: '#6A7A82' }}>Красивая упаковка</div>
                      <div style={{ padding: '20px 22px', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '15px', color: '#6A7A82' }}>Наличие мобильного приложения</div>
                    </div>
                  </div>
                  <div style={{ width: '390px', flex: 'none', borderLeft: '1.5px solid #EFEFF5', background: '#F4F3FA', padding: '42px 32px', display: 'flex', flexDirection: 'column' }}>
                    <img src="assets/mascot-cool.png" alt="Мелио" style={{ width: '150px', objectFit: 'contain', marginBottom: '22px' }} />
                    <div style={{ fontWeight: '900', fontSize: '24px', textTransform: 'uppercase', color: '#01A263', marginBottom: '14px' }}>Точно!</div>
                    <div style={{ fontWeight: '500', fontSize: '14px', lineHeight: '1.7', color: '#014753', marginBottom: '22px' }}>Клиент, который возвращается снова и снова, стоит бизнесу в разы больше, чем разовый покупатель — именно частота повторных покупок двигает LTV сильнее всего.</div>
                    <div style={{ padding: '16px 18px', borderRadius: '18px', background: '#FFFFFF', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '12.5px', lineHeight: '1.6', color: '#6A7A82' }}>Скорость доставки влияет на удовлетворённость, но не на то, вернётся ли клиент вообще.</div>
                    <div style={{ flex: '1' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#6A7A82' }}><span>+15 XP за верный ответ</span><span style={{ color: '#01D27F' }}>3 / 3</span></div>
                    <button style={{ width: '100%', padding: '16px', borderRadius: '999px', border: 'none', background: '#01D27F', color: '#014753', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '14px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Следующий вопрос</button>
                  </div>
                </div>
              </div>
            </BrowserFrame>
          </div>
      
          {/* Метрики */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#014753' }}>6 · Личный кабинет — метрики и сдвиг слепой зоны</div>
            <BrowserFrame url="app.melyo.io/metrics">
              <div style={{ display: 'flex', height: '100%', background: '#FFFFFF', fontFamily: 'Montserrat,sans-serif', color: '#014753' }}>
                <div style={{ width: '252px', flex: 'none', borderRight: '1.5px solid #EFEFF5', background: '#F4F3FA', padding: '22px 12px' }}>
                  <div style={{ padding: '0 8px 20px', fontWeight: '900', fontSize: '22px', letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#014753' }}>Melyo</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', color: '#6A7A82', fontSize: '12px', fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 11L12 4L20 11V20H4V11Z" stroke="#9AA6AC" strokeWidth="1.8" strokeLinejoin="round" /></svg>Путь обучения
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: '#D2FFB4', color: '#014753', fontSize: '12px', fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 19V11M12 19V5M19 19V14" stroke="#01A263" strokeWidth="2" strokeLinecap="round" /></svg>Метрики
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', color: '#6A7A82', fontSize: '12px', fontWeight: '700', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="#9AA6AC" strokeWidth="1.8" /><path d="M5 20C5 16 8 14 12 14C16 14 19 16 19 20" stroke="#9AA6AC" strokeWidth="1.8" strokeLinecap="round" /></svg>Профиль
                    </div>
                  </div>
                </div>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                  <div style={{ height: '60px', flex: 'none', borderBottom: '1.5px solid #EFEFF5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px' }}>
                    <div style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#1A1B33' }}>Метрики за 6 недель</div>
                    <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '999px', background: '#F4F3FA', border: '1.5px solid #E7E4F3' }}>
                      <span style={{ padding: '7px 14px', borderRadius: '999px', background: '#01D27F', color: '#014753', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase' }}>6 недель</span>
                      <span style={{ padding: '7px 14px', borderRadius: '999px', fontWeight: '700', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: '#6A7A82' }}>3 месяца</span>
                    </div>
                  </div>
                  <div style={{ flex: '1', overflowY: 'auto', padding: '30px 34px' }}>
                    <div style={{ display: 'flex', gap: '18px', marginBottom: '26px' }}>
                      <div style={{ flex: '1', padding: '22px', borderRadius: '20px', background: '#D2FFB4' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#01A263', marginBottom: '10px' }}>Повторные покупки</div>
                        <div style={{ fontWeight: '900', fontSize: '32px', color: '#014753' }}>+9%</div>
                        <div style={{ fontWeight: '500', fontSize: '11px', color: '#014753', marginTop: '7px' }}>было 22% → стало 31%</div>
                      </div>
                      <div style={{ flex: '1', padding: '22px', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '10px' }}>Средний чек</div>
                        <div style={{ fontWeight: '900', fontSize: '32px', color: '#1A1B33' }}>840 ₴</div>
                        <div style={{ fontWeight: '500', fontSize: '11px', color: '#6A7A82', marginTop: '7px' }}>+120 ₴ к старту</div>
                      </div>
                      <div style={{ flex: '1', padding: '22px', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '10px' }}>Уроков в неделю</div>
                        <div style={{ fontWeight: '900', fontSize: '32px', color: '#1A1B33' }}>3,2</div>
                        <div style={{ fontWeight: '500', fontSize: '11px', color: '#6A7A82', marginTop: '7px' }}>цель — 3</div>
                      </div>
                      <div style={{ flex: '1', padding: '22px', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '10px' }}>Средняя домашка</div>
                        <div style={{ fontWeight: '900', fontSize: '32px', color: '#1A1B33' }}>8,1</div>
                        <div style={{ fontWeight: '500', fontSize: '11px', color: '#6A7A82', marginTop: '7px' }}>из 10</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ flex: '1', padding: '24px', borderRadius: '24px', background: '#C5B6F2' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#014753', marginBottom: '20px' }}>Повторные покупки по неделям, %</div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '160px' }}>
                          {metricBars.map((b, i) => (
      <React.Fragment key={i}>
                            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px', justifyContent: 'flex-end', height: '100%' }}>
                              <div style={s(b.barStyle)}></div>
                              <span style={{ fontWeight: '700', fontSize: '10px', color: '#014753' }}>{b.label}</span>
                            </div>
                          </React.Fragment>
      ))}
                        </div>
                      </div>
                      <div style={{ width: '370px', flex: 'none', padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1.5px solid #E7E4F3' }}>
                        <div style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#6A7A82', marginBottom: '18px' }}>Сдвиг слепой зоны</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#9AA6AC', marginBottom: '10px' }}><span>6 недель назад</span><span>сейчас</span></div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
                          <div style={{ flex: '1', height: '10px', borderRadius: '5px', background: '#E7E4F3' }}></div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#C5B6F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          <div style={{ flex: '1', height: '10px', borderRadius: '5px', background: '#01D27F' }}></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                          <img src="assets/mascot-think.png" alt="Мелио" style={{ width: '70px', objectFit: 'contain', flex: 'none' }} />
                          <div style={{ flex: '1', padding: '12px 14px', borderRadius: '16px 16px 16px 4px', background: '#F4F3FA', border: '1.5px solid #E7E4F3', fontWeight: '500', fontSize: '12px', lineHeight: '1.5', color: '#014753' }}>Зона сдвинулась. Пройди диагностику снова?</div>
                        </div>
                        <button style={{ marginTop: '18px', width: '100%', padding: '14px', borderRadius: '999px', border: 'none', background: '#014753', color: '#D2FFB4', fontFamily: 'Montserrat,sans-serif', fontWeight: '700', fontSize: '12.5px', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Переоценка</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </BrowserFrame>
          </div>
        </div>
      </div>
  );
}
