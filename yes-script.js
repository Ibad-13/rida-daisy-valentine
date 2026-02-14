let musicPlaying = false;

function getVDAYConfig(){
  const fallback = {
    fromName: "Your Husband",
    wifeName: "My Love",
    wifeNick: "my love",
    year: new Date().getFullYear(),
    yesLine: "You just made me the happiest person! 💕",
    letterTitle: "A little note for you 💌",
    letterLines: [
      "Happy Valentine's Day, {nick} ❤️",
      "Thank you for being my calm, my home, and my favorite person.",
      "I choose you today, tomorrow, and always.",
      "Love, {from} 💕"
    ],
    admireItems: [],
    openWhen: [],
    siteUrl: ""
  };
  return (window.VDAY && typeof window.VDAY === "object") ? { ...fallback, ...window.VDAY } : fallback;
}

/* --- Clean hidden/weird characters (fix black boxes) --- */
function cleanWeirdChars(str){
  return String(str)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")     // zero-width
    .replace(/[\u0000-\u001F\u007F]/g, "")     // control chars
    .normalize("NFC");
}

function formatLine(line, cfg){
  return cleanWeirdChars(String(line))
    .replaceAll("{from}", cfg.fromName || "me")
    .replaceAll("{name}", cfg.wifeName || "my love")
    .replaceAll("{nick}", cfg.wifeNick || cfg.wifeName || "my love")
    .replaceAll("{year}", String(cfg.year || new Date().getFullYear()));
}

/* --- Apply personalization (plain, no typewriter) --- */
function applyYesPersonalization(){
  const cfg = getVDAYConfig();

  const wifeNameEl = document.getElementById('wife-name');
  if (wifeNameEl) wifeNameEl.textContent = cfg.wifeName || cfg.wifeNick || "my love";

  const title = `Happy Valentine's Day, ${cfg.wifeNick || cfg.wifeName || "my love"} ❤️`;
  document.title = title;

  const yesLineEl = document.getElementById('yes-line');
  if (yesLineEl) yesLineEl.textContent = cfg.yesLine || yesLineEl.textContent;

  const letterTitleEl = document.getElementById('letter-title');
  if (letterTitleEl) letterTitleEl.textContent = cfg.letterTitle || letterTitleEl.textContent;

  const body = document.getElementById('letter-body');
  if (body){
    const lines = Array.isArray(cfg.letterLines) ? cfg.letterLines : [];
    body.innerHTML = lines.map(l => `<p>${formatLine(l, cfg)}</p>`).join("");
  }
}

/* --- Right panel: admire reveal --- */
let admireIndex = 0;
function renderAdmireInitial(){
  const cfg = getVDAYConfig();
  const wrap = document.getElementById('admire-cards');
  const btn = document.getElementById('admire-more');
  if (!wrap || !btn) return;

  const items = Array.isArray(cfg.admireItems) ? cfg.admireItems : [];
  if (!items.length){
    btn.style.display = "none";
    return;
  }

  // show first 3
  admireIndex = 0;
  wrap.innerHTML = "";
  const firstCount = Math.min(3, items.length);
  for (let i=0;i<firstCount;i++){
    addAdmireCard(items[i], wrap);
    admireIndex++;
  }

  btn.addEventListener('click', () => {
    if (admireIndex >= items.length){
      btn.textContent = "That’s everything… and still not enough 🌼";
      btn.disabled = true;
      btn.style.opacity = "0.85";
      return;
    }
    addAdmireCard(items[admireIndex], wrap);
    admireIndex++;
  });
}

function addAdmireCard(text, wrap){
  const d = document.createElement('div');
  d.className = "admire-card";
  d.textContent = text;
  wrap.appendChild(d);
  // ✅ keep newest card visible inside panel
  try { wrap.scrollTop = wrap.scrollHeight; } catch(e) {}
}

/* --- Open when… envelopes --- */
function renderOpenWhen(){
  const cfg = getVDAYConfig();
  const grid = document.getElementById('openwhen-grid');
  if (!grid) return;

  const items = Array.isArray(cfg.openWhen) ? cfg.openWhen : [];
  if (!items.length){
    grid.innerHTML = "<div style='font-weight:800;color:#555;'>Add openWhen messages in custom.js ✨</div>";
    return;
  }

  grid.innerHTML = "";
  items.slice(0,3).forEach((it, idx) => {
    const b = document.createElement('button');
    b.className = "openwhen-btn";
    b.type = "button";
    b.textContent = it.title || `Open when… #${idx+1}`;
    b.addEventListener('click', () => openOpenWhen(it));
    grid.appendChild(b);
  });
}

function openOpenWhen(item){
  const modal = document.getElementById('ow-modal');
  const title = document.getElementById('ow-title');
  const body = document.getElementById('ow-body');
  if (!modal || !title || !body) return;

  title.textContent = item.title || "Open when…";
  const lines = Array.isArray(item.lines) ? item.lines : [];
  body.innerHTML = lines.map(l => `<p>${cleanWeirdChars(l)}</p>`).join("");

  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}

function wireOpenWhenModal(){
  const modal = document.getElementById('ow-modal');
  const closeBtn = document.getElementById('ow-close');
  if (!modal) return;

  const close = () => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  };

  if (closeBtn) closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    close();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

/* --- QR code (optional) --- */
function renderQR(){
  const cfg = getVDAYConfig();
  const url = (cfg.siteUrl || "").trim();
  const panel = document.getElementById('qr-panel');
  const qrEl = document.getElementById('qr');
  const hint = document.getElementById('qr-hint');
  if (!panel || !qrEl || !hint) return;

  if (!url){
    panel.style.display = "none";
    return;
  }

  // show panel
  panel.style.display = "";
  hint.textContent = url;

  try{
    qrEl.innerHTML = "";
    // QRCode library (cdn)
    if (typeof QRCode === "function"){
      new QRCode(qrEl, { text: url, width: 170, height: 170 });
    } else {
      panel.style.display = "none";
    }
  } catch(e){
    panel.style.display = "none";
  }
}

/* --- Letter modal --- */
function wireLetterModal(){
  const openBtn = document.getElementById('open-letter');
  const modal = document.getElementById('letter-modal');
  const closeBtn = document.getElementById('close-letter');
  if (!modal) return;

  const close = () => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  };
  const open = () => {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  };

  if (openBtn) openBtn.addEventListener('click', open);

  if (closeBtn) closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    close();
  });

  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* --- Smooth music fade in --- */
function startMusicWithFade(){
  const music = document.getElementById('bg-music');
  if (!music) return;

  music.volume = 0;
  music.play().then(() => {
    musicPlaying = true;
    const mt = document.getElementById('music-toggle');
    if (mt) mt.textContent = '🔊';

    const target = 0.35;
    let v = 0;
    const fade = setInterval(() => {
      v += 0.02;
      music.volume = Math.min(v, target);
      if (v >= target) clearInterval(fade);
    }, 120);
  }).catch(() => {
    document.addEventListener('click', () => {
      music.volume = 0;
      music.play().then(() => {
        musicPlaying = true;
        const mt = document.getElementById('music-toggle');
        if (mt) mt.textContent = '🔊';

        const target = 0.35;
        let v = 0;
        const fade = setInterval(() => {
          v += 0.02;
          music.volume = Math.min(v, target);
          if (v >= target) clearInterval(fade);
        }, 120);
      }).catch(() => {});
    }, { once: true });
  });
}

window.addEventListener('load', () => {
  applyYesPersonalization();
  wireLetterModal();
  wireOpenWhenModal();
  renderAdmireInitial();
  renderOpenWhen();
  renderQR();
  launchConfetti();
  startSlideshow();
  startPetals()
    initDaisyFloat()
    initHugs()
;
  initDaisyEgg();
;
  startMusicWithFade();
});

/* --- Slideshow --- */
function startSlideshow(){
  const img = document.getElementById('slide-img');
  const cap = document.getElementById('slide-caption');
  if (!img || !cap) return;

  const cfg = getVDAYConfig();
  const photos = Array.isArray(cfg.photos) ? cfg.photos : [];
  if (!photos.length){
    const wrap = document.getElementById('slideshow');
    if (wrap) wrap.style.display = 'none';
    return;
  }
  let i = 0;
  const apply = () => {
    const item = photos[i % photos.length];
    img.style.display = '';
    img.src = item.src;
    cap.textContent = item.caption || "Our little memories 💞";
    i++;
  };
  apply();
  setInterval(apply, 3500);
}

/* --- Petals --- */
function startPetals(){
  const cfg = getVDAYConfig();
  if (!cfg.petalsOn) return;
  const petalSrcs = Array.isArray(cfg.petalImages) ? cfg.petalImages : [];
  if (!petalSrcs.length) return;

  const spawn = () => {
    const img = document.createElement('img');
    img.className = 'petal';
    img.src = petalSrcs[Math.floor(Math.random()*petalSrcs.length)];
    img.style.left = (Math.random()*100) + 'vw';
    img.style.setProperty('--x', '0px');
    img.style.setProperty('--x2', ((Math.random()*140)-70) + 'px');
    const dur = 6 + Math.random()*6;
    img.style.animationDuration = dur + 's';
    document.body.appendChild(img);
    setTimeout(() => img.remove(), (dur+1)*1000);
  };
  for (let i=0;i<8;i++) setTimeout(spawn, i*220);
  setInterval(spawn, 480);
}

/* --- Confetti --- */
function launchConfetti() {
  if (typeof confetti === 'function') {
    const colors = ['#ff69b4', '#ff1493', '#ff85a2', '#ffb3c1', '#ffdf00', '#ffffff'];
    const duration = 5000;
    const end = Date.now() + duration;

    confetti({ particleCount: 150, spread: 100, origin: { x: 0.5, y: 0.3 }, colors });
    const interval = setInterval(() => {
      if (Date.now() > end) { clearInterval(interval); return; }
      confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors });
      confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors });
    }, 320);
    return;
  }

  const end = Date.now() + 3200;
  const burst = () => {
    for (let i=0;i<28;i++){
      const d = document.createElement('div');
      d.className = 'confetti-piece';
      d.style.left = (Math.random()*100) + 'vw';
      d.style.setProperty('--x', '0px');
      d.style.setProperty('--x2', ((Math.random()*220)-110) + 'px');
      d.style.animationDuration = (2.8 + Math.random()*1.8) + 's';
      d.style.background = ['#ff69b4','#ff1493','#ff85a2','#ffb3c1','#ffdf00','#ffffff'][Math.floor(Math.random()*6)];
      document.body.appendChild(d);
      setTimeout(()=>d.remove(), 5200);
    }
  };
  burst();
  const t = setInterval(() => {
    if (Date.now() > end) { clearInterval(t); return; }
    burst();
  }, 420);
}



/* --- Daisy Easter Egg (tap 🌼) --- */
function showEggToast(message){
  const toast = document.getElementById('egg-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2400);
}

function confettiBurstOnce(){
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 110,
      spread: 90,
      origin: { x: 0.5, y: 0.35 }
    });
    return;
  }
  // fallback (if CDN blocked): quick burst using existing confetti pieces
  for (let i=0;i<18;i++){
    const d = document.createElement('div');
    d.className = 'confetti-piece';
    d.style.left = (Math.random()*100) + 'vw';
    d.style.setProperty('--x', '0px');
    d.style.setProperty('--x2', ((Math.random()*220)-110) + 'px');
    d.style.animationDuration = (2.4 + Math.random()*1.4) + 's';
    document.body.appendChild(d);
    setTimeout(()=>d.remove(), 4200);
  }
}

function initDaisyEgg(){
  const btn = document.getElementById('daisy-egg');
  if (!btn) return;

  // mobile-friendly: ensure it's clickable above everything
  btn.style.pointerEvents = 'auto';

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    confettiBurstOnce();
    const cfg = getVDAYConfig();
    const nick = cfg.wifeNick || cfg.wifeName || "my love";
    showEggToast(`Daisy moment 🌼 — you’re magic, ${nick} 💖`);
  });
}

/* --- Hug counter --- */
function initHugs(){
  const btn = document.getElementById("hug-btn");
  const countEl = document.getElementById("hug-count");
  const msgEl = document.getElementById("hug-msg");
  if(!btn || !countEl) return;

  const KEY = "vday_hugs_count";
  let count = Number(localStorage.getItem(KEY) || "0");
  if (!Number.isFinite(count)) count = 0;
  countEl.textContent = String(count);

  const resetBtn = document.getElementById("hug-reset");
  if (resetBtn){
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(KEY);
      count = 0;
      countEl.textContent = "0";
      if (msgEl) msgEl.textContent = "Fresh start 🌼 Now send a hug 🤗";
      if (typeof showDaisyToast === "function") showDaisyToast("Reset done 🌼");
    });
  }


  const milestoneMessages = {
    50:  "50 hugs?! 🥹 You’re the sweetest, Daisy 💕",
    100: "100 hugs unlocked! 🥰 BIG LOVE for you 🌼💖",
    150: "150 hugs… okay I’m officially melting 🫠💘",
    200: "200 hugs! You’re my favorite notification 😭💕",
    250: "250 hugs! You deserve a crown, Daisy 👑🌼",
    300: "300 hugs!! At this point you’re unstoppable 💖✨"
  };

  const clickNotes = [
    "Sent 🤍",
    "One more for you 🌼",
    "A warm hug, just because 💕",
    "For my Daisy 💖",
    "You deserve all the love ✨"
  ];

  function celebrate(text){
    if (msgEl) msgEl.textContent = text;

    if (typeof window.confetti === "function"){
      window.confetti({ particleCount: 140, spread: 110, origin: { x: 0.5, y: 0.35 } });
      setTimeout(()=>window.confetti({ particleCount: 80, spread: 90, origin: { x: 0.2, y: 0.45 } }), 140);
      setTimeout(()=>window.confetti({ particleCount: 80, spread: 90, origin: { x: 0.8, y: 0.45 } }), 140);
    }
    if (typeof loveBurst === "function") loveBurst();
    if (typeof showDaisyToast === "function") showDaisyToast(text);
  }

  btn.addEventListener("click", () => {
    count += 1;
    countEl.textContent = String(count);

  const resetBtn = document.getElementById("hug-reset");
  if (resetBtn){
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(KEY);
      count = 0;
      countEl.textContent = "0";
      if (msgEl) msgEl.textContent = "Fresh start 🌼 Now send a hug 🤗";
      if (typeof showDaisyToast === "function") showDaisyToast("Reset done 🌼");
    });
  }

    localStorage.setItem(KEY, String(count));

    if (msgEl) msgEl.textContent = clickNotes[Math.floor(Math.random()*clickNotes.length)];

    // milestones every 50 (50,100,150,...)
    if (count % 50 === 0){
      const text = milestoneMessages[count] || `${count} hugs! 🫶 You’re so loved, Daisy 🌼`;
      celebrate(text);
    }
  });
}

/* --- Toggle music --- */
function toggleMusic() {
  const music = document.getElementById('bg-music');
  if (!music) return;

  if (musicPlaying) {
    music.pause();
    musicPlaying = false;
    const mt = document.getElementById('music-toggle');
    if (mt) mt.textContent = '🔇';
  } else {
    music.play().then(() => {
      musicPlaying = true;
      const mt = document.getElementById('music-toggle');
      if (mt) mt.textContent = '🔊';
    }).catch(() => {});
  }
}

const daisyMessages = [
  "You make the world softer just by being you 💕",
  "Daisy, you are magic in human form ✨",
  "I adore your light, always 🌼",
  "You are your own beautiful universe 💖",
  "You’re my favorite kind of beautiful — the real kind 🤍"
];

function showDaisyToast(text){
  const t = document.createElement("div");
  t.className = "daisy-toast";
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 3100);
}

function loveBurst(origin){
  const hearts = ["💖","💕","💗","💝","🌼"];
  for(let i=0;i<18;i++){
    const h = document.createElement("div");
    h.className = "love-burst";
    h.textContent = hearts[Math.floor(Math.random()*hearts.length)];
    const dx = (Math.random()*380)-190;
    const dy = (Math.random()*260)-140;
    h.style.setProperty("--dx", dx + "px");
    h.style.setProperty("--dy", dy + "px");
    h.style.fontSize = (18 + Math.random()*18) + "px";
    // optional: shift origin a bit
    if (origin){
      h.style.left = origin.x;
      h.style.top = origin.y;
    }
    document.body.appendChild(h);
    setTimeout(()=>h.remove(), 1500);
  }
}

let _daisyCooldown = false;
function initDaisyFloat(){
  const btn = document.getElementById("daisy-float");
  if(!btn) return;

  let lastFire = 0;

  const fireOnce = () => {
    const now = Date.now();
    // Guard against duplicate events (pointerdown + click)
    if (now - lastFire < 600) return;
    lastFire = now;

    if (typeof window.confetti === "function"){
      window.confetti({ particleCount: 90, spread: 90, origin: { x: 0.92, y: 0.14 } });
    }
    if (typeof loveBurst === "function"){
      loveBurst({ x: "92%", y: "16%" });
    }
    const msg = (Array.isArray(daisyMessages) && daisyMessages.length)
      ? daisyMessages[Math.floor(Math.random()*daisyMessages.length)]
      : "You are so loved 🌼💖";
    if (typeof showDaisyToast === "function") showDaisyToast(msg);
  };

  // Use only one primary event + guard
  btn.addEventListener("pointerup", (e) => { e.preventDefault(); fireOnce(); }, { passive: false });
  // Fallback for browsers without pointer events
  btn.addEventListener("click", (e) => { e.preventDefault(); fireOnce(); });
}
