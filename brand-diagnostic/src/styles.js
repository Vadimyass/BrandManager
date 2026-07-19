export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');
.bd{--paper:#EEF0F3;--ink:#16172B;--ink2:#20223B;--bone:#E9E7DF;--amber:#E8A13A;--violet:#5A54C9;--muted:#6A6D7C;--muted-d:#8E91A6;--line:#D6D9E0;--line-d:#343657;
  --disp:'Space Grotesk',system-ui,sans-serif;--body:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace;
  font-family:var(--body);color:var(--ink);background:var(--paper);min-height:100vh;width:100%;box-sizing:border-box;padding:clamp(20px,5vw,56px)}
.bd *{box-sizing:border-box}
.bd .wrap{max-width:720px;margin:0 auto}
.bd .eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--violet)}
.bd h1{font-family:var(--disp);font-weight:700;font-size:clamp(30px,6vw,46px);line-height:1.04;letter-spacing:-.02em;margin:16px 0 14px}
.bd .lede{font-size:17px;line-height:1.6;color:var(--muted);max-width:52ch}
.bd .btn{font-family:var(--body);font-weight:500;font-size:15px;padding:13px 22px;border-radius:10px;border:none;cursor:pointer;background:var(--ink);color:var(--bone);transition:transform .15s ease,opacity .15s ease}
.bd .btn:hover{transform:translateY(-1px)}
.bd .btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
.bd .btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
.bd .btn.amber{background:var(--amber);color:#3a2607}
.bd .chip{font-family:var(--body);font-size:14px;padding:10px 16px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;transition:all .12s ease}
.bd .chip:hover{border-color:var(--ink)}
.bd .chip.on{background:var(--ink);color:var(--bone);border-color:var(--ink)}
.bd .row{display:flex;flex-wrap:wrap;gap:10px}
.bd .field{width:100%;font-family:var(--body);font-size:16px;padding:14px 16px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);outline:none}
.bd .field:focus{border-color:var(--violet)}
.bd textarea.field{min-height:150px;resize:vertical;line-height:1.5}
.bd .qwrap{margin-top:30px}
.bd .qnum{font-family:var(--mono);font-size:12px;color:var(--muted);letter-spacing:.1em}
.bd .q{font-family:var(--disp);font-weight:500;font-size:24px;letter-spacing:-.01em;margin:8px 0 6px}
.bd .hint{font-size:14px;color:var(--muted);margin-bottom:16px}
.bd .ticks{display:flex;gap:6px;margin-bottom:28px}
.bd .tick{height:3px;flex:1;border-radius:2px;background:var(--line);transition:background .2s}
.bd .tick.done{background:var(--violet)}
.bd .nav{display:flex;justify-content:space-between;align-items:center;margin-top:26px;gap:12px}
.bd .ladder{display:flex;flex-direction:column-reverse;gap:8px;margin:22px 0}
.bd .rung{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:#fff;transition:all .3s}
.bd .rung .rn{font-family:var(--mono);font-size:13px;color:var(--muted);width:18px}
.bd .rung .rname{font-family:var(--disp);font-weight:500;font-size:15px}
.bd .rung.dim{opacity:.5}
.bd .card{background:var(--ink);color:var(--bone);border-radius:18px;padding:clamp(22px,4vw,34px)}
.bd .card .eyebrow{color:var(--amber)}
.bd .ladder.dark .rung{background:var(--ink2);border-color:var(--line-d);color:var(--bone)}
.bd .ladder.dark .rung .rn{color:var(--muted-d)}
.bd .ladder.dark .rung.active{background:var(--amber);border-color:var(--amber);color:#3a2607;transform:translateX(6px)}
.bd .ladder.dark .rung.active .rn{color:#7a5410}
.bd .ladder.dark .rung.passed{opacity:.85}
.bd .ladder.dark .rung.future{opacity:.34}
.bd .big{font-family:var(--disp);font-weight:700;font-size:clamp(28px,5vw,40px);letter-spacing:-.02em;line-height:1.05;margin:4px 0 10px}
.bd .summary{font-size:16px;line-height:1.6;color:var(--bone);opacity:.92;max-width:56ch}
.bd .contrast{font-family:var(--mono);font-size:13px;color:var(--amber);margin-top:10px}
.bd .axes{margin:26px 0 6px;border-top:1px solid var(--line-d)}
.bd .axis{padding:15px 0;border-bottom:1px solid var(--line-d)}
.bd .axis .top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.bd .axis .aname{font-family:var(--mono);font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted-d)}
.bd .dots{display:flex;gap:5px}
.bd .dot{width:9px;height:9px;border-radius:2px;background:var(--line-d)}
.bd .dot.f{background:var(--amber)}
.bd .anote{font-size:14.5px;line-height:1.5;color:var(--bone);opacity:.8;margin-top:7px;max-width:60ch}
.bd .aself{font-family:var(--mono);font-size:11.5px;color:var(--muted-d);margin-top:5px}
.bd .block{margin-top:26px}
.bd .block h3{font-family:var(--mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--amber);margin:0 0 12px}
.bd .gap{display:flex;gap:12px;font-size:15.5px;line-height:1.55;color:var(--bone);opacity:.92;margin-bottom:10px}
.bd .gap .mk{color:var(--amber);font-family:var(--mono)}
.bd .next{font-size:16px;line-height:1.6;color:var(--bone);background:var(--ink2);border-left:2px solid var(--amber);padding:14px 16px;border-radius:0 10px 10px 0}
.bd .share{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.bd .pill{font-family:var(--mono);font-size:12px;color:var(--muted);padding:6px 12px;border:1px solid var(--line);border-radius:999px}
.bd .fbrow{margin-top:18px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.bd .fbrow .fbq{font-size:14px;color:var(--muted)}
.bd .srow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)}
.bd .srow .sname{font-size:15px}
.bd .schips{display:flex;gap:6px}
.bd .schip{width:36px;height:36px;border-radius:8px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;font-family:var(--mono);font-size:13px;transition:all .12s}
.bd .schip:hover{border-color:var(--ink)}
.bd .schip.on{background:var(--ink);color:var(--bone);border-color:var(--ink)}
.bd .lfield{margin-bottom:12px}
.bd .spin{width:34px;height:34px;border:3px solid var(--line);border-top-color:var(--violet);border-radius:50%;animation:bdspin 1s linear infinite}
@keyframes bdspin{to{transform:rotate(360deg)}}
.bd .center{display:flex;flex-direction:column;align-items:center;gap:18px;padding:60px 0;text-align:center}
.bd .err{background:#fff;border:1px solid var(--line);border-left:3px solid #C0483C;border-radius:0 10px 10px 0;padding:16px;font-size:14.5px;color:var(--ink);line-height:1.5}
.bd .foot{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.06em;margin-top:26px}
@media(prefers-reduced-motion:reduce){.bd *{transition:none!important;animation:none!important}}
`;
