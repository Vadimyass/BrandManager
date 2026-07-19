export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');
.bd{--paper:#EEF0F3;--ink:#16172B;--ink2:#20223B;--bone:#E9E7DF;--amber:#E8A13A;--violet:#5A54C9;--muted:#6A6D7C;--muted-d:#8E91A6;--line:#D6D9E0;--line-d:#343657;--no:#C0483C;
  --disp:'Space Grotesk',system-ui,sans-serif;--body:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace;
  font-family:var(--body);color:var(--ink);background:var(--paper);min-height:100vh;width:100%;box-sizing:border-box;padding:clamp(20px,5vw,56px);position:relative;overflow-x:hidden}
.bd *{box-sizing:border-box}
.bd .blob{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0}
.bd .blob.a{width:520px;height:520px;background:rgba(90,84,201,.14);top:-160px;right:-120px;animation:drift 22s ease-in-out infinite alternate}
.bd .blob.b{width:460px;height:460px;background:rgba(232,161,58,.12);bottom:-140px;left:-120px;animation:drift 26s ease-in-out infinite alternate-reverse}
@keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(60px,40px) scale(1.12)}}
.bd .wrap{max-width:720px;margin:0 auto;position:relative;z-index:1}
.bd .phase{animation:fadeUp .45s cubic-bezier(.2,.8,.2,1) both}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.bd .eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--violet)}
.bd h1{font-family:var(--disp);font-weight:700;font-size:clamp(30px,6vw,46px);line-height:1.04;letter-spacing:-.02em;margin:16px 0 14px}
.bd .lede{font-size:17px;line-height:1.6;color:var(--muted);max-width:52ch}
.bd .btn{font-family:var(--body);font-weight:500;font-size:15px;padding:13px 24px;border-radius:999px;border:none;cursor:pointer;background:var(--ink);color:var(--bone);transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s,opacity .15s}
.bd .btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(22,23,43,.18)}
.bd .btn:active{transform:scale(.97)}
.bd .btn:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.bd .btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
.bd .btn.amber{background:var(--amber);color:#3a2607}
.bd .chip{font-family:var(--body);font-size:14px;padding:10px 18px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.7);color:var(--ink);cursor:pointer;transition:all .15s cubic-bezier(.2,.8,.2,1)}
.bd .chip:hover{border-color:var(--ink);transform:translateY(-1px)}
.bd .chip.on{background:var(--ink);color:var(--bone);border-color:var(--ink)}
.bd .row{display:flex;flex-wrap:wrap;gap:10px}
.bd .field{width:100%;font-family:var(--body);font-size:16px;padding:14px 18px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.85);color:var(--ink);outline:none;transition:border-color .15s,box-shadow .15s}
.bd .field:focus{border-color:var(--violet);box-shadow:0 0 0 3px rgba(90,84,201,.12)}
.bd .qnum{font-family:var(--mono);font-size:12px;color:var(--muted);letter-spacing:.1em}
.bd .q{font-family:var(--disp);font-weight:500;font-size:24px;letter-spacing:-.01em;margin:8px 0 6px}
.bd .hint{font-size:14px;color:var(--muted);margin-bottom:16px}
.bd .bar{height:4px;border-radius:2px;background:var(--line);margin-bottom:30px;overflow:hidden}
.bd .bar .fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--violet),var(--amber));transition:width .35s cubic-bezier(.2,.8,.2,1)}
.bd .deck{position:relative;height:min(380px,58vh);margin:10px 0 22px;touch-action:pan-y}
.bd .scard{position:absolute;inset:0;background:rgba(255,255,255,.95);border:1px solid var(--line);border-radius:24px;padding:clamp(22px,5vw,36px);display:flex;flex-direction:column;justify-content:center;gap:12px;box-shadow:0 24px 60px rgba(22,23,43,.10);will-change:transform;user-select:none;cursor:grab}
.bd .scard:active{cursor:grabbing}
.bd .scard.behind1{transform:translateY(14px) scale(.955);opacity:.75;pointer-events:none}
.bd .scard.behind2{transform:translateY(26px) scale(.915);opacity:.4;pointer-events:none}
.bd .scard.snap{transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.bd .scard.fly{transition:transform .38s cubic-bezier(.5,0,.8,.4),opacity .38s ease-out;opacity:0}
.bd .scard .ax{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--violet)}
.bd .scard .cq{font-family:var(--disp);font-weight:600;font-size:clamp(22px,4.6vw,30px);line-height:1.15;letter-spacing:-.015em}
.bd .scard .csub{font-size:15px;line-height:1.55;color:var(--muted)}
.bd .stamp{position:absolute;top:22px;font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.06em;padding:6px 16px;border-radius:12px;border:3px solid;transform:rotate(-8deg);pointer-events:none}
.bd .stamp.yes{right:22px;color:var(--amber);border-color:var(--amber);transform:rotate(8deg)}
.bd .stamp.no{left:22px;color:var(--no);border-color:var(--no)}
.bd .deckbtns{display:flex;justify-content:center;align-items:center;gap:14px}
.bd .dbtn{font-family:var(--disp);font-weight:600;font-size:16px;padding:14px 28px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.9);cursor:pointer;transition:all .15s cubic-bezier(.2,.8,.2,1)}
.bd .dbtn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(22,23,43,.12)}
.bd .dbtn:active{transform:scale(.95)}
.bd .dbtn.no{color:var(--no);border-color:rgba(192,72,60,.4)}
.bd .dbtn.yes{color:#3a2607;background:var(--amber);border-color:var(--amber)}
.bd .dbtn.skip{font-size:13px;color:var(--muted);padding:10px 18px}
.bd .ladder{display:flex;flex-direction:column-reverse;gap:8px;margin:22px 0}
.bd .rung{display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.8);transition:all .3s}
.bd .rung .rn{font-family:var(--mono);font-size:13px;color:var(--muted);width:18px}
.bd .rung .rname{font-family:var(--disp);font-weight:500;font-size:15px}
.bd .rung.dim{opacity:.5}
.bd .card{background:var(--ink);color:var(--bone);border-radius:24px;padding:clamp(22px,4vw,36px);box-shadow:0 30px 80px rgba(22,23,43,.35)}
.bd .card .eyebrow{color:var(--amber)}
.bd .ladder.dark .rung{background:var(--ink2);border-color:var(--line-d);color:var(--bone);animation:fadeUp .4s both}
.bd .ladder.dark .rung:nth-child(1){animation-delay:.05s}.bd .ladder.dark .rung:nth-child(2){animation-delay:.1s}.bd .ladder.dark .rung:nth-child(3){animation-delay:.15s}.bd .ladder.dark .rung:nth-child(4){animation-delay:.2s}.bd .ladder.dark .rung:nth-child(5){animation-delay:.25s}
.bd .ladder.dark .rung .rn{color:var(--muted-d)}
.bd .ladder.dark .rung.active{background:var(--amber);border-color:var(--amber);color:#3a2607;transform:translateX(8px)}
.bd .ladder.dark .rung.active .rn{color:#7a5410}
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
.bd .next{font-size:16px;line-height:1.6;color:var(--bone);background:var(--ink2);border-left:2px solid var(--amber);padding:14px 16px;border-radius:0 14px 14px 0}
.bd .share{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.bd .pill{font-family:var(--mono);font-size:12px;color:var(--muted);padding:6px 14px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.7)}
.bd .fbrow{margin-top:18px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.bd .fbrow .fbq{font-size:14px;color:var(--muted)}
.bd .srow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}
.bd .srow .sname{font-size:15px}
.bd .schips{display:flex;gap:6px}
.bd .schip{width:38px;height:38px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.85);color:var(--ink);cursor:pointer;font-family:var(--mono);font-size:13px;transition:all .15s cubic-bezier(.2,.8,.2,1)}
.bd .schip:hover{border-color:var(--ink);transform:translateY(-1px)}
.bd .schip.on{background:var(--ink);color:var(--bone);border-color:var(--ink);transform:scale(1.08)}
.bd .lfield{margin-bottom:12px}
.bd .nav{display:flex;justify-content:space-between;align-items:center;margin-top:26px;gap:12px}
.bd .spin{width:34px;height:34px;border:3px solid var(--line);border-top-color:var(--violet);border-radius:50%;animation:bdspin 1s linear infinite}
@keyframes bdspin{to{transform:rotate(360deg)}}
.bd .center{display:flex;flex-direction:column;align-items:center;gap:18px;padding:60px 0;text-align:center}
.bd .err{background:#fff;border:1px solid var(--line);border-left:3px solid var(--no);border-radius:0 14px 14px 0;padding:16px;font-size:14.5px;color:var(--ink);line-height:1.5}
.bd .foot{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.06em;margin-top:26px}
@media(prefers-reduced-motion:reduce){.bd *{transition:none!important;animation:none!important}}
`;
