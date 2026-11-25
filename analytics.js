/* Google Analytics (same property as fura.is), loaded only after the visitor accepts cookies. */
(function () {
  var GA_ID = 'G-PBCK2DB9V4';
  var KEY = 'bilaforgun-cookie-consent';

  var TEXT = {
    is: { msg: 'Við notum valfrjálsar vafrakökur til að mæla umferð um síðuna. Þú getur samþykkt eða hafnað þeim.', ok: 'Samþykkja', no: 'Hafna', label: 'Vafrakökustillingar' },
    en: { msg: 'We use optional cookies to measure traffic on this site. You can accept or decline them.', ok: 'Accept', no: 'Decline', label: 'Cookie settings' },
    pl: { msg: 'Używamy opcjonalnych plików cookie do pomiaru ruchu na stronie. Możesz je zaakceptować lub odrzucić.', ok: 'Akceptuję', no: 'Odrzuć', label: 'Ustawienia plików cookie' }
  };

  function loadGA() {
    if (window.__bfGA) return;
    window.__bfGA = true;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { linker: { domains: ['fura.is'] } });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.plate-btn');
    if (btn && window.gtag) window.gtag('event', 'farga_bilnum_click', { link_url: btn.href, transport_type: 'beacon' });
  });

  function readChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function saveChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  function showBanner() {
    var lang = (document.documentElement.lang || 'is').slice(0, 2);
    var t = TEXT[lang] || TEXT.is;

    var css = document.createElement('style');
    css.textContent =
      '#bf-cc{position:fixed;left:0;right:0;bottom:0;z-index:9998;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px 20px;' +
      'padding:16px 5%;background:#1a1512;color:#fff;font-family:"Onest",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;' +
      'box-shadow:0 -4px 24px rgba(0,0,0,.25);animation:bf-cc-up .35s ease}' +
      '@keyframes bf-cc-up{from{transform:translateY(100%)}to{transform:none}}' +
      '#bf-cc p{margin:0;max-width:720px;font-size:15px;line-height:1.5;color:rgba(255,255,255,.85)}' +
      '#bf-cc div{display:flex;gap:10px;flex-shrink:0}' +
      '#bf-cc button{font:inherit;font-size:15px;font-weight:600;cursor:pointer;border-radius:6px;padding:10px 20px;border:1px solid transparent;transition:opacity .2s,border-color .2s}' +
      '#bf-cc .bf-ok{background:#ffc400;color:#111}#bf-cc .bf-ok:hover{opacity:.9}' +
      '#bf-cc .bf-no{background:transparent;color:#fff;border-color:rgba(255,255,255,.4)}#bf-cc .bf-no:hover{border-color:#fff}' +
      '@media(max-width:600px){#bf-cc{flex-direction:column;text-align:center}#bf-cc div{width:100%}#bf-cc button{flex:1}}' +
      '@media(prefers-reduced-motion:reduce){#bf-cc{animation:none}}';
    document.head.appendChild(css);

    var bar = document.createElement('div');
    bar.id = 'bf-cc';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', t.label);

    var msg = document.createElement('p');
    msg.textContent = t.msg;

    var btns = document.createElement('div');
    var no = document.createElement('button');
    no.type = 'button';
    no.className = 'bf-no';
    no.textContent = t.no;
    var ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'bf-ok';
    ok.textContent = t.ok;

    function close() { if (bar.parentNode) bar.parentNode.removeChild(bar); }
    no.addEventListener('click', function () { saveChoice('denied'); close(); });
    ok.addEventListener('click', function () { saveChoice('granted'); loadGA(); close(); });

    btns.appendChild(no);
    btns.appendChild(ok);
    bar.appendChild(msg);
    bar.appendChild(btns);
    document.body.appendChild(bar);
  }

  function start() {
    var choice = readChoice();
    if (choice === 'granted') loadGA();
    else if (choice !== 'denied') showBanner();
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
