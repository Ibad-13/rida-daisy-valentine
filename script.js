const gifStages = [
  "assets/stages/0-normal.png",      // 0 normal
  "assets/stages/1-confused.png",    // 1 confused
  "https://media.giphy.com/media/ROF8OQvDmxytW/giphy.gif",      // 2 crying cute
  "https://media.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif",      // 3 pleading eyes
  "https://media.giphy.com/media/l378giAZgxPw3eO52/giphy.gif",  // 4 sad face
  "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif",      // 5 very sad
  "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif", // 6 devastated
  "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif",      // 7 crying hard
  "https://media1.giphy.com/media/Ec8Ey7YPPCAwm1GzKf/giphy.gif"      // 8 crying runaway
]

const noMessages = [
  "No",
  "Are you positive? 🤔",
  "Pookie please... 🥺",
  "If you say no, I will be really sad...",
  "I will be very sad... 😢",
  "Please??? 💔",
  "Don't do this to me...",
  "Last chance! 😭",
  "You can't catch me anyway 😜"
]

const yesTeasePokes = [
  "try saying no first... I bet you want to know what happens 😏",
  "go on, hit no... just once 👀",
  "you're missing out 😈",
  "click no, I dare you 😏"
]

function getVDAYConfig(){
  const fallback = { fromName: "Your Husband", wifeName: "My Love", wifeNick: "my love", year: new Date().getFullYear() }
  return (window.VDAY && typeof window.VDAY === "object") ? { ...fallback, ...window.VDAY } : fallback
}

function applyPersonalization(){
  const cfg = getVDAYConfig()
  const nickEl = document.getElementById('wife-nick')
  if (nickEl) nickEl.textContent = cfg.wifeNick || cfg.wifeName || "my love"

  const q = `Will you be my Valentine, ${cfg.wifeNick || cfg.wifeName || "my love"}? 💕`
  const h = document.getElementById('main-question')
  if (h) h.childNodes[0].textContent = "Will you be my Valentine, "
  const titleEl = document.getElementById('page-title')
  if (titleEl) titleEl.textContent = q
  document.title = q
}

applyPersonalization()

// --- Romantic background: dynamic floating hearts ---
const HEART_EMOJIS = ["💗","💖","💕","💝","💓","🌼"];
function spawnFloatingHearts(){
  const layer = document.querySelector('.hearts-bg');
  if (!layer) return;
  const create = () => {
    const s = document.createElement('span');
    s.className = 'heart';
    s.textContent = HEART_EMOJIS[Math.floor(Math.random()*HEART_EMOJIS.length)];
    const size = 14 + Math.random()*22;
    s.style.fontSize = size + 'px';
    s.style.left = (Math.random()*100) + 'vw';
    const duration = 7 + Math.random()*7;
    s.style.animationDuration = duration + 's';
    s.style.animationDelay = (Math.random()*0.6) + 's';
    layer.appendChild(s);
    setTimeout(() => s.remove(), (duration+1)*1000);
  };
  for (let i=0;i<10;i++) setTimeout(create, i*180);
  setInterval(create, 420);
}
spawnFloatingHearts();

// --- Preload images/GIFs (call after Start click) ---
function preloadStages(urls){
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

let yesTeasedCount = 0
let noClickCount = 0
let runawayEnabled = false
let musicPlaying = false   // start false (Start click ke baad true)

const catGif = document.getElementById('cat-gif')
const yesBtn = document.getElementById('yes-btn')
const noBtn = document.getElementById('no-btn')
const bgMusic = document.getElementById('bg-music')

function toggleMusic() {
  if (!bgMusic) return
  if (musicPlaying) {
    bgMusic.pause()
    musicPlaying = false
    document.getElementById('music-toggle').textContent = '🔇'
  } else {
    bgMusic.muted = false
    bgMusic.play().catch(() => {})
    musicPlaying = true
    document.getElementById('music-toggle').textContent = '🔊'
  }
}

function handleYesClick() {
  if (!runawayEnabled) {
    const msg = yesTeasePokes[Math.min(yesTeasedCount, yesTeasePokes.length - 1)]
    yesTeasedCount++
    showTeaseMessage(msg)
    return
  }
  window.location.href = 'yes.html'
}

function showTeaseMessage(msg) {
  const toast = document.getElementById('tease-toast')
  if (!toast) return
  toast.textContent = msg
  toast.classList.add('show')
  clearTimeout(toast._timer)
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500)
}

function handleNoClick() {
  noClickCount++

  const msgIndex = Math.min(noClickCount, noMessages.length - 1)
  noBtn.textContent = noMessages[msgIndex]

  const currentSize = parseFloat(window.getComputedStyle(yesBtn).fontSize)
  yesBtn.style.fontSize = `${currentSize * 1.35}px`
  const padY = Math.min(18 + noClickCount * 5, 60)
  const padX = Math.min(45 + noClickCount * 10, 120)
  yesBtn.style.padding = `${padY}px ${padX}px`

  if (noClickCount >= 2) {
    const noSize = parseFloat(window.getComputedStyle(noBtn).fontSize)
    noBtn.style.fontSize = `${Math.max(noSize * 0.85, 10)}px`
  }

  const gifIndex = Math.min(noClickCount, gifStages.length - 1)
  swapGif(gifStages[gifIndex])

  if (noClickCount >= 5 && !runawayEnabled) {
    enableRunaway()
    runawayEnabled = true
  }
}

function swapGif(src) {
  catGif.style.opacity = '0'
  setTimeout(() => {
    catGif.src = src
    catGif.style.opacity = '1'
  }, 200)
}

function enableRunaway() {
  noBtn.addEventListener('mouseover', runAway)
  noBtn.addEventListener('touchstart', runAway, { passive: true })
}

function runAway() {
  const margin = 20
  const btnW = noBtn.offsetWidth
  const btnH = noBtn.offsetHeight
  const maxX = window.innerWidth - btnW - margin
  const maxY = window.innerHeight - btnH - margin

  const randomX = Math.random() * maxX + margin / 2
  const randomY = Math.random() * maxY + margin / 2

  noBtn.style.position = 'fixed'
  noBtn.style.left = `${randomX}px`
  noBtn.style.top = `${randomY}px`
  noBtn.style.zIndex = '50'
}

// --- Start overlay (fix autoplay music on mobile) ---
const startOverlay = document.getElementById("start-overlay")
const startBtn = document.getElementById("start-btn")

function startExperience(){
  if (!bgMusic) return

  bgMusic.muted = false
  bgMusic.volume = 0.3

  bgMusic.play().then(() => {
    musicPlaying = true
    const mt = document.getElementById("music-toggle")
    if (mt) mt.textContent = "🔊"
    if (startOverlay) startOverlay.style.display = "none"

    // ✅ Preload AFTER start, so overlay doesn’t feel stuck
    setTimeout(() => preloadStages(gifStages), 300)

  }).catch(() => {
    // agar block ho, next click pe try ho jayega
  })
}

if (startBtn) {
  startBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    startExperience()
  })
}

if (startOverlay) {
  startOverlay.addEventListener("click", startExperience)
}
