export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
/* Nocturne dark: тёмный сине-серый фон, один сине-фиолетовый акцент, Montserrat */
.bd{--paper:#0F1420;--surface:#1B2130;--surface2:#242B3B;--ink:#EAECEF;--ink2:#242B3B;--bone:#EAECEF;--amber:#2DD4BF;--violet:#8B80E0;--muted:#8C93A3;--muted-d:#6A7180;--line:#2A3040;--line-d:#20263A;--no:#E0736A;
  --disp:'Montserrat',system-ui,sans-serif;--body:'Montserrat',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace;
  font-family:var(--body);color:var(--ink);background:var(--paper);min-height:100vh;width:100%;box-sizing:border-box;padding:clamp(20px,5vw,56px);position:relative;overflow-x:hidden}
.bd *{box-sizing:border-box}
/* Текст никогда не вылезает за границы, в т.ч. длинные слова/ссылки на телефоне */
.bd{overflow-x:hidden}
.bd p,.bd div,.bd span,.bd li,.bd h1,.bd h2,.bd h3,.bd button{overflow-wrap:anywhere;word-break:break-word;min-width:0}
.bd .row,.bd .nav,.bd .deckbtns,.bd .share,.bd .fbrow,.bd .coursecta,.bd .loginnudge,.bd .sharecard,.bd .pricecard,.bd .wcards,.bd .paths{min-width:0}
.bd .coursecta>div,.bd .loginnudge>div,.bd .sharecard>div,.bd .pricecard>div{min-width:0;flex:1}
.bd svg{max-width:100%;height:auto;display:block}
.bd .blob{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0}
.bd .blob.a{width:520px;height:520px;background:rgba(145,132,217,.14);top:-160px;right:-120px;animation:drift 22s ease-in-out infinite alternate}
.bd .blob.b{width:460px;height:460px;background:rgba(145,132,217,.12);bottom:-140px;left:-120px;animation:drift 26s ease-in-out infinite alternate-reverse}
@keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(60px,40px) scale(1.12)}}
.bd .wrap{max-width:720px;margin:0 auto;position:relative;z-index:1}
.bd .wrap.wrap-wide{max-width:1320px}
/* Экран результата по мокапу Melyo */
.bd .res-top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:16px}
.bd .res-head{display:flex;align-items:center;gap:18px}
.bd .res-head .mascot{width:76px}
.bd .res-title{font-family:var(--disp);font-weight:700;font-size:clamp(26px,3.4vw,40px);line-height:1.08;letter-spacing:-.02em;color:var(--ink);margin:6px 0 0}
.bd .res-done{font-family:var(--mono);font-size:12px;color:var(--muted-d);white-space:nowrap;padding-top:6px}
.bd .res-diag{font-size:16.5px;line-height:1.6;color:var(--muted);max-width:70ch;margin:0 0 26px}
.bd .res-two{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.bd .rescard{padding:24px;border-radius:16px;background:var(--surface);border:1px solid var(--line)}
.bd .rescard.super{border-color:rgba(45,212,191,.35);box-shadow:inset 0 0 0 1px rgba(45,212,191,.15)}
.bd .rlabel{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--amber);margin-bottom:10px}
.bd .rlabel.muted{color:var(--muted-d)}
.bd .rtitle{font-family:var(--disp);font-weight:600;font-size:clamp(20px,2.6vw,26px);letter-spacing:-.01em;color:var(--ink);margin-bottom:8px}
.bd .rnote{font-size:15.5px;line-height:1.55;color:var(--muted)}
.bd .res-bottom{display:grid;grid-template-columns:1.5fr 1fr;gap:16px;margin-bottom:18px}
.bd .res-plan{padding:22px 24px;border-radius:16px;background:var(--surface);border:1px solid var(--line)}
.bd .planrow2{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--line)}
.bd .planrow2:last-child{border-bottom:none}
.bd .planrow2 .pnum2{width:26px;height:26px;flex:none;border-radius:50%;background:var(--surface2);color:var(--amber);font-family:var(--mono);font-size:13px;display:flex;align-items:center;justify-content:center}
.bd .planrow2 .ptxt{flex:1;font-size:15.5px;line-height:1.4;color:var(--ink)}
.bd .planrow2 .pweek{font-size:12.5px;color:var(--muted-d);white-space:nowrap}
.bd .res-share{padding:24px;border-radius:16px;background:var(--surface2);border:1px solid var(--line);display:flex;flex-direction:column;justify-content:center}
.bd .rsq{font-family:var(--disp);font-weight:600;font-size:19px;line-height:1.35;color:var(--ink);margin-bottom:12px}
.bd .rsbrand{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;color:var(--muted-d);margin-bottom:16px}
@media(max-width:820px){
  .bd .res-two{grid-template-columns:1fr}
  .bd .res-bottom{grid-template-columns:1fr}
  .bd .res-head .mascot{width:56px}
}
.bd .artblock{margin-top:32px}
.bd .artlist{display:flex;flex-direction:column;gap:10px;margin-top:12px}
.bd .artitem{text-align:left;padding:16px 18px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,0.055);cursor:pointer;display:flex;flex-direction:column;gap:5px;transition:all .15s cubic-bezier(.2,.8,.2,1)}
.bd .artitem:hover{transform:translateY(-2px);border-color:var(--violet);box-shadow:0 10px 24px rgba(22,23,43,.08)}
.bd .artititle{font-family:var(--disp);font-weight:600;font-size:16px;letter-spacing:-.01em;color:var(--ink)}
.bd .artidesc{font-size:13.5px;color:var(--muted);line-height:1.45}
.bd .artbody{margin-top:8px}
.bd .artbody p{font-size:16.5px;line-height:1.7;margin:0 0 15px;color:var(--ink)}
.bd .arth{font-family:var(--disp);font-weight:600;font-size:clamp(19px,3.6vw,23px);letter-spacing:-.01em;margin:24px 0 10px}
.bd .artul{margin:0 0 15px;padding-left:20px}
.bd .artul li{font-size:16.5px;line-height:1.6;margin-bottom:8px}
.bd .artnext{margin-top:30px}
.bd .verstamp{text-align:center;font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;color:var(--muted);opacity:.55;margin:38px 0 4px}
.bd .topbar{display:flex;justify-content:flex-end;gap:8px;margin-bottom:14px}
.bd .tbtn{font-family:var(--body);font-size:13px;padding:8px 16px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,0.055);color:var(--ink);cursor:pointer;transition:all .15s}
.bd .tbtn:hover{border-color:var(--ink)}
.bd .tbtn.ghost{background:transparent;color:var(--muted)}
.bd .langsw{display:inline-flex;gap:2px;padding:3px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,0.04);margin-right:auto}
.bd .langsw-b{font-family:var(--body);font-size:11px;font-weight:600;letter-spacing:.02em;padding:5px 10px;border-radius:999px;border:none;background:transparent;color:var(--muted);cursor:pointer;transition:all .15s}
.bd .langsw-b:hover{color:var(--ink)}
.bd .langsw-b.on{background:var(--amber);color:#0F1420}
.bd .wl-brand .langsw{margin-left:auto;margin-right:0}
.bd .phase{animation:fadeUp .45s cubic-bezier(.2,.8,.2,1) both}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.bd .eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--violet)}
.bd .brandmark{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:-.02em;color:var(--amber)}
/* Экраны в стиле мокапа Melyo: центрированные, маскот, плитки */
.bd .screen{display:flex;flex-direction:column;align-items:center;text-align:center;max-width:1000px;margin:0 auto;padding-top:10px}
.bd .screen .scr-h{font-size:clamp(24px,3vw,34px)}
.bd .flowbar{max-width:340px;margin:0 auto 24px;text-align:center}
.bd .flowbar .dots5{margin:0 0 8px}
.bd .flowbar .stepnum{margin:0}
.bd .dots5{display:flex;gap:6px;width:100%;max-width:340px;margin:6px auto 22px}
.bd .d5{height:4px;flex:1;border-radius:4px;background:var(--line)}
.bd .d5.on{background:var(--amber)}
.bd .mascot{filter:drop-shadow(0 10px 22px rgba(0,0,0,.45));margin-bottom:6px}
.bd .stepnum{font-size:12px;color:var(--muted-d);margin:8px 0 6px}
.bd .scr-h{font-family:var(--disp);font-weight:600;font-size:24px;letter-spacing:-.01em;color:var(--ink);margin:0 0 8px}
.bd .scr-sub{font-size:15px;line-height:1.55;color:var(--muted);margin:0 0 20px;max-width:40ch}
.bd .mascot{filter:drop-shadow(0 14px 28px rgba(0,0,0,.4))}
.bd .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;width:100%;margin-bottom:24px}
.bd .tile{min-height:112px}
.bd .tile{display:flex;flex-direction:column;align-items:flex-start;gap:9px;padding:16px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--ink);cursor:pointer;text-align:left;transition:all .16s cubic-bezier(.2,.8,.2,1)}
.bd .tile:hover{border-color:var(--muted);transform:translateY(-2px)}
.bd .tile.on{border-color:var(--amber);box-shadow:inset 0 0 0 1px var(--amber),0 0 24px rgba(145,132,217,.18)}
.bd .tilelabel{font-size:14px;line-height:1.35;font-weight:500}
.bd .btnp{width:100%;font-family:var(--body);font-weight:500;font-size:15px;padding:14px;border-radius:12px;background:transparent;border:1px solid var(--amber);color:var(--amber);cursor:pointer;transition:all .16s}
.bd .screen .btnp{max-width:380px}
.bd .btnp:hover:not(:disabled){background:rgba(145,132,217,.12)}
.bd .btnp:disabled{opacity:.4;cursor:not-allowed;border-color:var(--line);color:var(--muted)}
.bd .btnlink{background:none;border:none;color:var(--muted);font-family:var(--body);font-size:14px;padding:12px;cursor:pointer;margin-top:4px}
.bd .btnlink:hover{color:var(--ink)}
.bd h1{font-family:var(--disp);font-weight:700;font-size:clamp(30px,6vw,46px);line-height:1.04;letter-spacing:-.02em;margin:16px 0 14px}
.bd .lede{font-size:17px;line-height:1.6;color:var(--muted);max-width:52ch}
.bd .btn{font-family:var(--body);font-weight:500;font-size:15px;padding:13px 24px;border-radius:999px;border:none;cursor:pointer;background:var(--surface2);color:var(--bone);transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s,opacity .15s}
.bd .btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(22,23,43,.18)}
.bd .btn:active{transform:scale(.97)}
.bd .btn:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.bd .btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
.bd .btn.amber{background:var(--amber);color:#ffffff}
.bd .chip{font-family:var(--body);font-size:14px;padding:10px 18px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,0.055);color:var(--ink);cursor:pointer;transition:all .15s cubic-bezier(.2,.8,.2,1)}
.bd .chip:hover{border-color:var(--ink);transform:translateY(-1px)}
.bd .chip.on{background:var(--surface2);color:var(--bone);border-color:var(--ink)}
.bd .row{display:flex;flex-wrap:wrap;gap:10px}
.bd .field{width:100%;font-family:var(--body);font-size:16px;padding:14px 18px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,0.055);color:var(--ink);outline:none;transition:border-color .15s,box-shadow .15s}
.bd .field:focus{border-color:var(--violet);box-shadow:0 0 0 3px rgba(145,132,217,.12)}
.bd .qnum{font-family:var(--mono);font-size:12px;color:var(--muted);letter-spacing:.1em}
.bd .q{font-family:var(--disp);font-weight:500;font-size:24px;letter-spacing:-.01em;margin:8px 0 6px}
.bd .hint{font-size:14px;color:var(--muted);margin-bottom:16px}
.bd .bar{height:4px;border-radius:2px;background:var(--line);margin-bottom:30px;overflow:hidden}
.bd .bar .fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--violet),var(--amber));transition:width .35s cubic-bezier(.2,.8,.2,1)}
.bd .deck{position:relative;height:min(380px,58vh);margin:10px 0 22px;touch-action:pan-y}
.bd .deckhead{display:flex;align-items:center;gap:16px;margin-bottom:20px}
.bd .deckcount{font-family:var(--mono);font-size:12px;color:var(--muted);white-space:nowrap;letter-spacing:.04em}
.bd .deckhead .bar{flex:1;margin-bottom:0}
.bd .optor{display:none}
.bd .deckhint{display:flex;align-items:center;gap:12px;margin-top:24px;max-width:460px}
.bd .dhmasc{width:56px;height:auto;flex:none}
.bd .deckhint span{font-size:14px;line-height:1.5;color:var(--muted);background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px 16px}
.bd .deck-dilemma{max-width:940px;margin:0 auto}
@media(min-width:760px){
  .bd .deck-dilemma .deck{height:auto;position:static;margin:0}
  .bd .deck-dilemma .scard{position:static;inset:auto;background:transparent;border:none;box-shadow:none;padding:0;cursor:default;gap:0}
  .bd .deck-dilemma .scard.behind1,.bd .deck-dilemma .scard.behind2,.bd .deck-dilemma .scard.fly,.bd .deck-dilemma .stamp{display:none}
  .bd .deck-dilemma .ax{text-align:center;margin-bottom:6px}
  .bd .deck-dilemma .cq{text-align:center;font-family:var(--body);font-weight:400;font-size:15px;color:var(--muted);margin:0 auto 26px;max-width:600px}
  .bd .deck-dilemma .optrow{flex-direction:row;align-items:stretch;gap:0;margin-top:0}
  .bd .deck-dilemma .opt{flex:1;min-height:230px;padding:28px;border-radius:20px;background:var(--surface);border:1px solid var(--line);font-family:var(--disp);font-weight:600;font-size:22px;line-height:1.25;letter-spacing:-.01em;color:var(--ink);display:flex;flex-direction:column;gap:12px}
  .bd .deck-dilemma .opt:hover{transform:translateY(-3px);border-color:var(--amber)}
  .bd .deck-dilemma .opt .side{font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--muted-d);text-transform:uppercase}
  .bd .deck-dilemma .optor{display:flex;align-items:center;justify-content:center;width:64px;flex:none;color:var(--muted-d);font-size:14px}
}
.bd .scard{position:absolute;inset:0;background:var(--surface);border:1px solid var(--line);border-radius:24px;padding:clamp(22px,5vw,36px);display:flex;flex-direction:column;justify-content:center;gap:12px;box-shadow:0 24px 60px rgba(22,23,43,.10);will-change:transform;user-select:none;cursor:grab;transition:transform .34s cubic-bezier(.2,.8,.2,1),opacity .3s}
.bd .scard:active{cursor:grabbing}
.bd .scard.drag{transition:none}
.bd .scard.behind1{transform:translateY(14px) scale(.955);opacity:.75;pointer-events:none}
.bd .scard.behind2{transform:translateY(26px) scale(.915);opacity:.4;pointer-events:none}
.bd .scard.fly{transition:transform .42s cubic-bezier(.5,0,.8,.4),opacity .42s ease-out;opacity:0;pointer-events:none}
.bd .scard.fly.r{transform:translateX(135%) rotate(13deg)}
.bd .scard.fly.l{transform:translateX(-135%) rotate(-13deg)}
.bd .optrow{display:flex;flex-direction:column;gap:10px;margin-top:18px}
.bd .opt{padding:13px 16px;border:1px solid var(--line);border-radius:14px;font-family:var(--body);font-size:15px;line-height:1.45;color:var(--ink);background:var(--surface);cursor:pointer;text-align:left;transition:all .15s cubic-bezier(.2,.8,.2,1)}
.bd .opt:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(22,23,43,.1)}
.bd .opt.l:hover{border-color:var(--violet)}
.bd .opt.r:hover{border-color:var(--amber)}
.bd .opt .side{display:block;font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
.bd .scalerow{display:flex;gap:8px;margin-top:16px}
.bd .scbtn{flex:1;max-width:58px;aspect-ratio:1;border-radius:14px;font-family:var(--mono);font-size:16px;border:1px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;transition:all .2s cubic-bezier(.34,1.56,.64,1)}
.bd .scbtn:hover{transform:translateY(-3px);border-color:var(--ink)}
.bd .scbtn.picked{background:var(--amber);border-color:var(--amber);color:#ffffff;transform:scale(1.2)}
.bd .scbtn.dimmed{opacity:.3;transform:scale(.9)}
.bd .scard .ax{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--violet)}
.bd .scard .cq{font-family:var(--disp);font-weight:600;font-size:clamp(22px,4.6vw,30px);line-height:1.15;letter-spacing:-.015em}
.bd .scard .csub{font-size:15px;line-height:1.55;color:var(--muted)}
.bd .stamp{position:absolute;top:22px;font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.06em;padding:6px 16px;border-radius:12px;border:3px solid;transform:rotate(-8deg);pointer-events:none}
.bd .stamp.yes{right:22px;color:var(--amber);border-color:var(--amber);transform:rotate(8deg)}
.bd .stamp.no{left:22px;color:var(--violet);border-color:var(--violet)}
.bd .deckbtns{display:flex;justify-content:center;align-items:center;gap:14px}
.bd .dbtn{font-family:var(--disp);font-weight:600;font-size:16px;padding:14px 28px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,0.055);cursor:pointer;transition:all .15s cubic-bezier(.2,.8,.2,1)}
.bd .dbtn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(22,23,43,.12)}
.bd .dbtn:active{transform:scale(.95)}
.bd .dbtn.no{color:var(--ink);border-color:var(--line)}
.bd .dbtn.no:hover{border-color:var(--violet)}
.bd .dbtn.yes{color:var(--ink);border-color:var(--line)}
.bd .dbtn.yes:hover{border-color:var(--amber)}
.bd .dbtn.bool.yes{color:#ffffff;background:var(--amber);border-color:var(--amber)}
.bd .dbtn.skip{font-size:13px;color:var(--muted);padding:10px 18px}
.bd .ladder{display:flex;flex-direction:column-reverse;gap:8px;margin:22px 0}
.bd .rung{display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,0.055);transition:all .3s}
.bd .rung .rn{font-family:var(--mono);font-size:13px;color:var(--muted);width:18px}
.bd .rung .rname{font-family:var(--disp);font-weight:500;font-size:15px}
.bd .rung.dim{opacity:.5}
.bd .card{background:var(--surface2);color:var(--bone);border-radius:24px;padding:clamp(22px,4vw,36px);box-shadow:0 30px 80px rgba(22,23,43,.35)}
.bd .card .eyebrow{color:var(--amber)}
.bd .ladder.dark .rung{background:var(--surface);border-color:var(--line-d);color:var(--bone);animation:fadeUp .4s both}
.bd .ladder.dark .rung:nth-child(1){animation-delay:.05s}.bd .ladder.dark .rung:nth-child(2){animation-delay:.1s}.bd .ladder.dark .rung:nth-child(3){animation-delay:.15s}.bd .ladder.dark .rung:nth-child(4){animation-delay:.2s}.bd .ladder.dark .rung:nth-child(5){animation-delay:.25s}
.bd .ladder.dark .rung .rn{color:var(--muted-d)}
.bd .ladder.dark .rung.active{background:var(--amber);border-color:var(--amber);color:#ffffff;transform:translateX(8px)}
.bd .ladder.dark .rung.active .rn{color:#d2cefd}
.bd .ladder.dark .rung.passed{opacity:.85}
.bd .ladder.dark .rung.future{opacity:.34}
.bd .big{font-family:var(--disp);font-weight:700;font-size:clamp(28px,5vw,40px);letter-spacing:-.02em;line-height:1.05;margin:4px 0 10px}
.bd .summary{font-size:16px;line-height:1.6;color:var(--bone);opacity:.92;max-width:56ch}
.bd .contrast{font-family:var(--mono);font-size:13px;color:var(--amber);margin-top:10px}
.bd .axes{margin:26px 0 6px;border-top:1px solid var(--line-d)}
.bd .axis{padding:15px 0;border-bottom:1px solid var(--line-d);animation:fadeUp .4s both}
.bd .axis:nth-child(1){animation-delay:.3s}.bd .axis:nth-child(2){animation-delay:.4s}.bd .axis:nth-child(3){animation-delay:.5s}.bd .axis:nth-child(4){animation-delay:.6s}.bd .axis:nth-child(5){animation-delay:.7s}
.bd .axis .top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.bd .axis .aname{font-family:var(--mono);font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted-d)}
.bd .dots{display:flex;gap:5px}
.bd .dot{width:9px;height:9px;border-radius:3px;background:var(--line-d);transition:background .3s}
.bd .dot.f{background:var(--amber)}
.bd .anote{font-size:14.5px;line-height:1.5;color:var(--bone);opacity:.8;margin-top:7px;max-width:60ch}
.bd .aself{font-family:var(--mono);font-size:11.5px;color:var(--muted-d);margin-top:5px}
.bd .block{margin-top:26px;animation:fadeUp .4s .75s both}
.bd .block h3{font-family:var(--mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--amber);margin:0 0 12px}
.bd .gap{display:flex;gap:12px;font-size:15.5px;line-height:1.55;color:var(--bone);opacity:.92;margin-bottom:10px}
.bd .gap .mk{color:var(--amber);font-family:var(--mono)}
.bd .next{font-size:16px;line-height:1.6;color:var(--bone);background:var(--surface);border-left:2px solid var(--amber);padding:14px 16px;border-radius:0 14px 14px 0}
.bd .share{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.bd .pill{font-family:var(--mono);font-size:12px;color:var(--muted);padding:6px 14px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,0.055)}
.bd .fbrow{margin-top:18px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.bd .fbrow .fbq{font-size:14px;color:var(--muted)}
.bd .srow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}
.bd .srow .sname{font-size:15px}
.bd .schips{display:flex;gap:6px}
.bd .schip{width:38px;height:38px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,0.055);color:var(--ink);cursor:pointer;font-family:var(--mono);font-size:13px;transition:all .15s cubic-bezier(.2,.8,.2,1)}
.bd .schip:hover{border-color:var(--ink);transform:translateY(-1px)}
.bd .schip.on{background:var(--surface2);color:var(--bone);border-color:var(--ink);transform:scale(1.08)}
.bd .lfield{margin-bottom:12px}
.bd .nav{display:flex;justify-content:space-between;align-items:center;margin-top:26px;gap:12px}
.bd .spin{width:34px;height:34px;border:3px solid var(--line);border-top-color:var(--violet);border-radius:50%;animation:bdspin 1s linear infinite}
@keyframes bdspin{to{transform:rotate(360deg)}}
.bd .center{display:flex;flex-direction:column;align-items:center;gap:18px;padding:60px 0;text-align:center}
.bd .sharecard{margin-top:18px;padding:18px 20px;border-radius:18px;background:var(--surface2);color:var(--bone);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.bd .sharecard .cctatitle{color:var(--bone)}
.bd .sharecard .cctasub{color:var(--muted-d)}
.bd .sharecard .btn{background:var(--amber);color:#ffffff}
@media(max-width:520px){.bd .sharecard{flex-direction:column;align-items:stretch}.bd .sharecard .cctabtn{width:100%}}
/* ВЕЛКОМ по мокапу Melyo: десктоп — 2 колонки с разделителем, мобилка — стопка */
.bd .wl{width:100%;margin:0 auto}
.bd .wl-brand{display:flex;align-items:center;gap:10px;margin-bottom:34px}
.bd .wl-brandimg{width:34px;height:34px;object-fit:contain}
.bd .wl-brand span{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:-.01em;color:var(--ink)}
.bd .wl-grid{display:grid;grid-template-columns:1fr 1fr;gap:0}
.bd .wl-grid{grid-template-columns:1.15fr 1fr;gap:0}
.bd .wl-left{padding-right:80px;max-width:640px}
.bd .wl-right{padding-left:80px;border-left:1px solid var(--line);display:flex;flex-direction:column;max-width:560px}
.bd .wl-stat b{white-space:nowrap}
.bd .wl-stat span{white-space:nowrap}
.bd .wl-hero{position:relative;margin-bottom:26px}
.bd .wl-mascot{width:210px;max-width:60%;height:auto;filter:drop-shadow(0 18px 34px rgba(0,0,0,.4))}
.bd .wl-bubble{display:inline-block;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px 18px;font-size:15px;line-height:1.5;color:var(--ink);max-width:280px;margin-top:-30px;margin-left:60px}
.bd .wl-h1{font-family:var(--disp);font-weight:700;font-size:clamp(34px,4.4vw,52px);line-height:1.05;letter-spacing:-.02em;color:var(--ink);margin:0 0 16px}
.bd .wl-sub{font-size:16.5px;line-height:1.6;color:var(--muted);margin:0 0 30px;max-width:46ch}
.bd .wl-stats{display:flex;gap:40px}
.bd .wl-stat b{display:block;font-family:var(--disp);font-weight:700;font-size:34px;color:var(--amber);line-height:1}
.bd .wl-stat span{font-size:13px;color:var(--muted);margin-top:4px;display:block}
.bd .wl-h2{font-family:var(--disp);font-weight:700;font-size:30px;letter-spacing:-.01em;color:var(--ink);margin:0 0 6px}
.bd .wl-note{font-size:15px;color:var(--muted);margin:0 0 22px}
.bd .gbtn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:15px;border-radius:12px;font-family:var(--body);font-weight:500;font-size:15px;background:var(--surface2);border:1px solid var(--line);color:var(--ink);cursor:pointer;margin-bottom:12px;transition:all .15s}
.bd .gbtn:hover{border-color:var(--muted);background:var(--surface)}
.bd .gbtn.ghost{background:transparent}
.bd .wl-fine{font-size:13px;color:var(--muted-d);line-height:1.5;margin:4px 0 0}
.bd .wl-or{display:flex;align-items:center;gap:14px;margin:26px 0 18px;color:var(--muted-d);font-size:13px}
.bd .wl-or:before,.bd .wl-or:after{content:"";flex:1;height:1px;background:var(--line)}
.bd .wl-articles{display:flex;flex-direction:column}
.bd .wl-arow{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid var(--line);background:none;border-left:none;border-right:none;border-top:none;cursor:pointer;text-align:left;transition:padding .15s}
.bd .wl-arow:hover{padding-left:6px}
.bd .wl-atitle{font-size:15px;color:var(--ink);font-weight:500}
.bd .wl-atime{font-size:13px;color:var(--muted-d);white-space:nowrap}
@media(max-width:860px){
  .bd .wl-grid{grid-template-columns:1fr}
  .bd .wl-left{padding-right:0;margin-bottom:34px}
  .bd .wl-right{padding-left:0;border-left:none;border-top:1px solid var(--line);padding-top:30px}
  .bd .wl-h1{font-size:clamp(28px,8vw,40px)}
  .bd .wl-mascot{width:150px}
  .bd .wl-bubble{margin-left:20px}
  .bd .wl-stats{gap:28px}
}
.bd .welcome h1{margin-top:18px}
.bd .wcards{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:26px 0 6px}
.bd .wcard{padding:22px;border:1px solid var(--line);border-radius:20px;background:rgba(255,255,255,0.055);display:flex;flex-direction:column;gap:10px;transition:all .2s cubic-bezier(.2,.8,.2,1)}
.bd .wcard:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(22,23,43,.1)}
.bd .wcard.on{border-color:var(--amber);box-shadow:0 0 0 3px rgba(145,132,217,.16)}
.bd .wtag{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--violet)}
.bd .wtitle{font-family:var(--disp);font-weight:600;font-size:20px;letter-spacing:-.01em}
.bd .wlist{list-style:none;padding:0;margin:2px 0 14px;display:flex;flex-direction:column;gap:7px;flex:1}
.bd .wlist li{font-size:14px;line-height:1.45;color:var(--muted);padding-left:20px;position:relative}
.bd .wlist li:before{content:"→";position:absolute;left:0;color:var(--amber);font-family:var(--mono)}
@media(max-width:560px){.bd .wcards{grid-template-columns:1fr}}
.bd .loginnudge{margin-top:18px;padding:18px 20px;border-radius:18px;background:linear-gradient(120deg,rgba(145,132,217,.12),rgba(145,132,217,.14));border:1px solid rgba(145,132,217,.28);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;animation:fadeUp .5s .1s both}
.bd .lntitle{font-family:var(--disp);font-weight:600;font-size:18px;letter-spacing:-.01em}
.bd .lnsub{font-size:14px;color:var(--muted);line-height:1.5;margin-top:5px;max-width:46ch}
.bd .lnbtn{white-space:nowrap}
@media(max-width:520px){.bd .loginnudge{flex-direction:column;align-items:stretch}.bd .lnbtn{width:100%}}
.bd .coursecta{margin-top:20px;padding:20px 22px;border-radius:20px;background:linear-gradient(120deg,rgba(145,132,217,.1),rgba(145,132,217,.12));border:1px solid rgba(145,132,217,.25);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;animation:fadeUp .5s .15s both}
.bd .cctatitle{font-family:var(--disp);font-weight:700;font-size:clamp(19px,3.6vw,24px);letter-spacing:-.01em;margin-top:4px}
.bd .cctasub{font-size:14px;color:var(--muted);line-height:1.5;margin-top:6px;max-width:44ch}
.bd .cctabtn{white-space:nowrap;padding:15px 26px;font-size:16px}
@media(max-width:520px){.bd .coursecta{flex-direction:column;align-items:stretch}.bd .cctabtn{width:100%}}
.bd .teaser{margin-top:34px;padding:clamp(22px,4vw,34px);background:rgba(255,255,255,0.055);border:1px solid var(--line);border-radius:24px;box-shadow:0 20px 50px rgba(22,23,43,.07);animation:fadeUp .5s .2s both}
.bd .tstat{font-family:var(--disp);font-weight:700;font-size:clamp(28px,4.4vw,42px);letter-spacing:-.02em;line-height:1.05;margin:14px 0 8px;max-width:100%;overflow-wrap:anywhere;word-break:break-word;background:linear-gradient(92deg,var(--ink),var(--violet));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.bd .tstatnote{font-size:14px;color:var(--muted);margin-bottom:18px;max-width:46ch}
.bd .tbody{font-size:16.5px;line-height:1.65;margin:0 0 14px;max-width:58ch}
.bd .tturn{font-size:16.5px;line-height:1.65;margin:0;padding-left:16px;border-left:2px solid var(--amber);max-width:58ch}
/* Строгая иерархия урока: номер (крупно) → про что → лид → текст → итог+связь */
.bd .lsn-num{font-family:var(--disp);font-weight:800;font-size:clamp(30px,5vw,46px);line-height:1;letter-spacing:-.03em;color:var(--amber);margin:0 0 8px}
.bd .lsn-about{font-family:var(--disp);font-weight:700;font-size:clamp(20px,2.6vw,28px);line-height:1.15;letter-spacing:-.02em;color:var(--ink);margin:0 0 10px}
.bd .lsn-lead{font-size:15px;line-height:1.5;color:var(--muted);margin:0 0 18px;max-width:56ch}
.bd .lsn-text{font-size:15px;line-height:1.7;color:var(--ink);margin:0 0 14px;max-width:60ch;opacity:.92}
.bd .lsn-outcome{margin-top:22px;padding:18px 20px;background:rgba(45,212,191,.07);border:1px solid var(--line);border-left:3px solid var(--amber);border-radius:16px}
.bd .lsn-take{font-family:var(--disp);font-weight:600;font-size:clamp(17px,2.2vw,21px);line-height:1.3;letter-spacing:-.01em;color:var(--ink);margin-top:4px}
.bd .lsn-rel{font-size:14px;line-height:1.55;color:var(--muted);margin-top:10px}
.bd .lsn-rel-mk{color:var(--amber);font-weight:600}
/* Подытог квиза */
.bd .recap{max-width:640px;margin:0 auto;animation:fadeUp .4s both}
.bd .recap-score{display:flex;align-items:baseline;gap:12px;margin:8px 0 18px}
.bd .recap-num{font-family:var(--disp);font-weight:800;font-size:clamp(40px,9vw,64px);line-height:1;letter-spacing:-.03em;color:var(--amber)}
.bd .recap-den{color:var(--muted);font-size:.5em;font-weight:600}
.bd .recap-lbl{font-size:15px;color:var(--muted)}
.bd .recap-card{padding:18px 20px;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:16px;margin-bottom:16px}
.bd .recap-take{font-family:var(--disp);font-weight:600;font-size:clamp(17px,2.2vw,21px);line-height:1.3;color:var(--ink);margin-top:4px}
.bd .recap-list{display:flex;flex-direction:column;gap:8px;margin-bottom:8px}
.bd .recap-row{display:flex;gap:10px;align-items:flex-start;font-size:14.5px;line-height:1.45;padding:10px 12px;border-radius:12px;border:1px solid var(--line)}
.bd .recap-row.ok{background:rgba(45,212,191,.08)}
.bd .recap-row.miss{background:rgba(224,115,106,.08)}
.bd .recap-mk{font-weight:800;flex:none}
.bd .recap-row.ok .recap-mk{color:var(--amber)}
.bd .recap-row.miss .recap-mk{color:var(--no)}
/* История уроков в кабинете */
.bd .histlist{display:flex;flex-direction:column;gap:8px;margin-top:6px}
.bd .histitem{border:1px solid var(--line);border-radius:14px;overflow:hidden}
.bd .histitem.open{border-color:var(--amber)}
.bd .histhead{display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;background:transparent;border:none;cursor:pointer;text-align:left;color:var(--ink)}
.bd .histnum{font-family:var(--mono);font-size:12px;letter-spacing:.06em;color:var(--violet);flex:none}
.bd .histtitle{font-size:14.5px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bd .histmeta{display:flex;align-items:center;gap:6px;flex:none}
.bd .histbadge{font-size:11px;font-weight:600;padding:3px 8px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}
.bd .histbadge.amber{color:var(--amber);border-color:rgba(45,212,191,.4)}
.bd .histchev{color:var(--muted);margin-left:2px}
.bd .histbody{padding:4px 14px 16px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:14px}
.bd .histtake{font-size:15px;line-height:1.4;color:var(--ink);padding-top:12px}
.bd .histsec{display:flex;flex-direction:column;gap:6px}
.bd .histtask{font-size:13.5px;color:var(--muted);line-height:1.5}
.bd .histsub{font-size:14px;line-height:1.55;color:var(--ink);padding:10px 12px;background:rgba(255,255,255,.04);border-radius:12px}
.bd .histscore{font-size:14px;font-weight:600;color:var(--amber)}
.bd .histcomment{font-size:13.5px;color:var(--muted);line-height:1.5}
/* Пошаговое чтение урока */
.bd .lsn-steps{display:flex;align-items:center;gap:6px;margin:2px 0 16px}
.bd .lsn-dot{width:24px;height:4px;border-radius:2px;background:var(--line);transition:background .2s}
.bd .lsn-dot.on{background:var(--amber)}
.bd .lsn-stepn{margin-left:6px;font-family:var(--mono);font-size:11px;letter-spacing:.06em;color:var(--muted)}
.bd .lsn-text{animation:fadeUp .25s both}
.bd .lsn-doneshort{display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px;max-width:520px;margin:24px auto;animation:fadeUp .4s both}
/* Диалог Мелио: знакомство */
.bd .meet{max-width:640px;margin:0 auto}
.bd .meet-intro{display:flex;flex-direction:column;align-items:center;text-align:center;gap:18px;padding-top:12px;animation:fadeUp .4s both}
.bd .meet-masc{width:120px;height:auto}
.bd .meet-masc.sm{width:56px;flex:none}
.bd .meet-bubble{position:relative;max-width:520px;font-size:16.5px;line-height:1.55;color:var(--ink);background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:18px;padding:16px 20px}
.bd .meet-bubble.sm{font-size:15.5px;padding:12px 16px}
.bd .meet-q{display:flex;flex-direction:column;gap:14px;animation:fadeUp .3s both}
.bd .meet-dots{display:flex;gap:6px;margin-bottom:4px}
.bd .meet-row{display:flex;align-items:flex-start;gap:12px}
/* Разбор темы (финал курса) */
.bd .theme{max-width:720px;margin:0 auto;animation:fadeUp .4s both}
.bd .theme-list{display:flex;flex-direction:column;gap:14px;margin:22px 0 8px}
.bd .theme-item{padding:16px 18px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.03)}
.bd .theme-head{display:flex;align-items:baseline;gap:10px;margin-bottom:10px}
.bd .theme-title{font-family:var(--disp);font-weight:600;font-size:15.5px;color:var(--ink)}
.bd .theme-qs{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
.bd .theme-take{font-size:14px;line-height:1.5;color:var(--ink)}
.bd .tq{font-family:var(--disp);font-weight:600;font-size:clamp(19px,3.4vw,24px);letter-spacing:-.01em;margin:22px 0 8px}
.bd .tlesson{font-size:15px;color:var(--muted);line-height:1.55;max-width:52ch}
/* Оффер: десктоп 2 колонки (контент | карточка покупки) */
.bd .off-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:32px;align-items:start;max-width:1040px;margin:0 auto}
.bd .off-side{position:sticky;top:20px;padding:26px;border-radius:20px;background:var(--surface);border:1px solid var(--line);display:flex;flex-direction:column;align-items:center;text-align:center}
.bd .off-masc{width:96px;height:auto;margin-bottom:10px}
.bd .off-side .price{font-family:var(--disp);font-weight:700;font-size:40px;color:var(--ink);line-height:1}
.bd .off-side .pricenote{font-size:13px;color:var(--muted);margin:6px 0 6px}
@media(max-width:820px){.bd .off-grid{grid-template-columns:1fr}.bd .off-side{position:static}}
.bd .gets{margin:26px 0 6px}
.bd .get{display:flex;gap:16px;padding:15px 0;border-bottom:1px solid var(--line);animation:fadeUp .4s both}
.bd .get:nth-child(1){animation-delay:.05s}.bd .get:nth-child(2){animation-delay:.1s}.bd .get:nth-child(3){animation-delay:.15s}.bd .get:nth-child(4){animation-delay:.2s}.bd .get:nth-child(5){animation-delay:.25s}
.bd .gnum{font-family:var(--mono);font-size:12px;color:var(--violet);padding-top:3px;letter-spacing:.08em}
.bd .gtitle{font-family:var(--disp);font-weight:500;font-size:16.5px;letter-spacing:-.01em}
.bd .gnote{font-size:14.5px;color:var(--muted);line-height:1.5;margin-top:4px;max-width:52ch}
.bd .planbox{margin-top:26px;padding:20px 22px;background:var(--surface2);color:var(--bone);border-radius:20px}
.bd .planrow{display:flex;gap:14px;align-items:baseline;padding:11px 0;border-bottom:1px solid var(--line-d);font-size:15.5px;line-height:1.5}
.bd .planrow:last-child{border-bottom:none}
.bd .planrow .pnum{font-family:var(--mono);font-size:12px;color:var(--amber)}
.bd .paths{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:24px}
.bd .path{padding:22px;border:1px solid var(--line);border-radius:20px;background:rgba(255,255,255,0.055);transition:all .2s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;gap:8px}
.bd .path:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(22,23,43,.1)}
.bd .path.on{border-color:var(--amber);box-shadow:0 0 0 3px rgba(145,132,217,.18)}
.bd .ptag{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--violet)}
.bd .pprice{font-family:var(--disp);font-weight:700;font-size:30px;letter-spacing:-.02em;line-height:1}
.bd .pnote{font-size:14px;color:var(--muted);line-height:1.5;margin-bottom:8px;flex:1}
.bd .pricecard{margin-top:26px;padding:22px 24px;border:1px solid var(--line);border-radius:20px;background:rgba(255,255,255,0.055);display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}
.bd .price{font-family:var(--disp);font-weight:700;font-size:38px;letter-spacing:-.03em;line-height:1}
.bd .pricenote{font-size:13.5px;color:var(--muted);margin-top:6px;max-width:34ch}
.bd .buildlist{display:flex;flex-direction:column;gap:11px;text-align:left;margin-top:6px}
.bd .bstep{display:flex;gap:12px;align-items:center;font-size:15.5px;color:var(--muted);opacity:.45;transition:all .4s}
.bd .bstep .bmark{font-family:var(--mono);font-size:13px;width:14px;color:var(--violet)}
.bd .bstep.now{opacity:1;color:var(--ink)}
.bd .bstep.done{opacity:.8;color:var(--muted)}
.bd .bstep.done .bmark{color:var(--amber)}
.bd .scheme{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:22px;padding:18px;border-radius:16px;background:rgba(145,132,217,.07);border:1px dashed rgba(145,132,217,.3)}
.bd .schemepart{display:inline-flex;align-items:center;gap:6px}
.bd .schemenode{font-family:var(--disp);font-weight:500;font-size:14px;padding:9px 14px;background:var(--surface);border:1px solid var(--line);border-radius:10px;white-space:nowrap;animation:fadeUp .4s both}
.bd .schemearrow{color:var(--violet);font-size:16px}
.bd .examples{margin-top:22px}
.bd .example{padding:14px 16px;margin-top:10px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,0.055)}
.bd .excase{font-size:15px;font-weight:500;line-height:1.5}
.bd .exwhy{font-size:14.5px;color:var(--muted);line-height:1.55;margin-top:6px}
.bd .exmk{font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
/* Урок: десктоп 2 колонки (визуал | контент) */
.bd .lsn-top{display:flex;align-items:center;gap:16px;margin-bottom:24px}
.bd .lsn-top .bar{flex:1;margin-bottom:0}
.bd .lsn-grid{display:grid;grid-template-columns:1fr 1.15fr;gap:32px;align-items:start}
.bd .lsn-visual{display:flex;flex-direction:column;gap:16px;position:sticky;top:20px}
.bd .lsn-vcard{padding:20px;border-radius:16px;background:var(--surface);border:1px solid var(--line)}
.bd .lsn-ph{min-height:280px;border-radius:16px;background:var(--surface);border:1px dashed var(--line);display:flex;align-items:center;justify-content:center}
.bd .lsn-ph img{width:120px;opacity:.5}
.bd .lsn-h1{font-family:var(--disp);font-weight:700;font-size:clamp(24px,2.8vw,32px);line-height:1.1;letter-spacing:-.02em;color:var(--ink);margin:6px 0 16px}
.bd .termtag{display:inline-block;margin-top:12px;font-family:var(--mono);font-size:12px;padding:5px 12px;border-radius:8px;background:var(--surface2);color:var(--amber)}
@media(max-width:820px){
  .bd .lsn-grid{grid-template-columns:1fr;gap:20px}
  .bd .lsn-visual{position:static;order:2}
  .bd .lsn-main{order:1}
}
.bd .quizbox{max-width:760px;margin:0 auto}
/* Квиз: десктоп 2 колонки (вопрос+варианты | хамелеон-разбор) */
.bd .qz-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:30px;align-items:start}
.bd .qz-q{font-family:var(--disp);font-weight:700;font-size:clamp(22px,2.8vw,30px);line-height:1.18;letter-spacing:-.01em;color:var(--ink);margin:10px 0 22px}
.bd .qz-opts{display:flex;flex-direction:column;gap:12px}
.bd .qopt{display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;padding:16px 18px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:15.5px;line-height:1.4;cursor:pointer;transition:all .15s cubic-bezier(.2,.8,.2,1)}
.bd .qopt:hover:not(:disabled){border-color:var(--amber);transform:translateY(-1px)}
.bd .qopt:disabled{cursor:default}
.bd .qopt.correct{border-color:var(--amber);background:rgba(45,212,191,.12);color:var(--ink)}
.bd .qopt.wrong{border-color:var(--no);background:rgba(224,115,106,.1)}
.bd .qopt.dim{opacity:.45}
.bd .qcheck{color:var(--amber);font-weight:700}
.bd .qz-side{padding:24px;border-radius:18px;background:var(--surface);border:1px solid var(--line);display:flex;flex-direction:column;align-items:flex-start;position:sticky;top:20px}
.bd .qz-masc{width:88px;height:auto;margin-bottom:14px}
.bd .qz-prompt{font-size:15px;line-height:1.55;color:var(--muted)}
.bd .qz-verdict{font-family:var(--disp);font-weight:700;font-size:24px;margin-bottom:10px}
.bd .qz-verdict.ok{color:var(--amber)}
.bd .qz-verdict.miss{color:var(--muted)}
.bd .qz-explain{font-size:15px;line-height:1.6;color:var(--muted);margin-bottom:16px}
.bd .qz-foot{display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:16px}
.bd .qz-xp{font-family:var(--mono);font-size:12px;color:var(--amber)}
.bd .qz-xp.off{color:var(--muted-d)}
.bd .qz-cnt{font-family:var(--mono);font-size:12px;color:var(--muted-d)}
.bd .qz-side .btnp{width:100%}
@media(max-width:820px){
  .bd .qz-grid{grid-template-columns:1fr;gap:18px}
  .bd .qz-side{position:static;flex-direction:row;flex-wrap:wrap;align-items:center}
  .bd .qz-masc{width:56px;margin-bottom:0;margin-right:12px}
}
.bd .termbox{margin-top:26px;padding:18px 20px;border:1px solid var(--line);border-left:2px solid var(--amber);border-radius:0 16px 16px 0;background:rgba(255,255,255,0.055)}
.bd .termnote{font-size:15.5px;line-height:1.6;margin-top:8px;max-width:58ch}
.bd .taskbox{margin-top:18px;padding:20px 22px;background:var(--surface2);color:var(--bone);border-radius:18px}
.bd .tasktext{font-size:16px;line-height:1.65;margin-top:8px;white-space:pre-line}
.bd .quizbox{animation:fadeUp .4s both}
.bd .quizq{font-family:var(--disp);font-weight:500;font-size:clamp(19px,3.4vw,24px);line-height:1.3;margin-top:12px}
.bd .opt.good{border-color:var(--amber);background:rgba(145,132,217,.12)}
.bd .opt.meh{opacity:.5}
.bd .opt:disabled{cursor:default;transform:none;box-shadow:none}
.bd .quizfb{margin-top:18px;padding:18px 20px;border-radius:16px;background:rgba(255,255,255,0.055);border:1px solid var(--line);animation:fadeUp .35s both}
.bd .qverdict{font-family:var(--disp);font-weight:600;font-size:18px}
.bd .qexplain{font-size:15px;line-height:1.6;color:var(--muted);margin-top:6px;max-width:58ch}
.bd .scorebig{font-family:var(--disp);font-weight:700;font-size:56px;line-height:1;letter-spacing:-.03em;color:var(--amber)}
.bd .scoremax{font-size:24px;color:var(--muted)}
.bd .critrow{margin-top:14px}
.bd .crithead{display:flex;justify-content:space-between;gap:12px;font-size:14.5px;line-height:1.4}
.bd .critpts{font-family:var(--mono);font-size:13px;color:var(--violet);white-space:nowrap}
.bd .critbar{height:6px;border-radius:3px;background:var(--line);margin-top:6px;overflow:hidden}
.bd .critfill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--violet),var(--amber));transition:width .5s cubic-bezier(.2,.8,.2,1)}
.bd .critnote{font-size:13.5px;color:var(--muted);margin-top:5px;line-height:1.5}
.bd .quote{max-width:46ch;animation:fadeUp .7s cubic-bezier(.2,.8,.2,1) both}
.bd .qtext{font-family:var(--disp);font-weight:500;font-size:21px;line-height:1.45;letter-spacing:-.01em}
.bd .qauthor{font-family:var(--mono);font-size:12px;color:var(--muted);margin-top:12px;letter-spacing:.06em}
.bd .err{background:var(--surface);border:1px solid var(--line);border-left:3px solid var(--no);border-radius:0 14px 14px 0;padding:16px;font-size:14.5px;color:var(--ink);line-height:1.5}
.bd .foot{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.06em;margin-top:26px}
@media(prefers-reduced-motion:reduce){.bd *{transition:none!important;animation:none!important}}
`;
