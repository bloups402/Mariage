// ── SCROLL EN HAUT AU CHARGEMENT/RECHARGEMENT ──
window.addEventListener('load', () => window.scrollTo(0, 0));

// ── SHEET URL (RSVP) ──
const SHEET_URL = atob('aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J4YkdIMHVWaEFrQ2h4RkxXN1BTSUI0WWtkLUljZmZKQ2pobmhSUFNab0ZHMHRxR0FHR0xhd3lOX2Ixd1NDWjVoVU0vZXhlYw==');

// ── URL DU CLASSEMENT (jeu caché) ──
// À remplacer par l'URL du Web App Google Apps Script une fois déployé (voir instructions fournies).
const SCORES_URL = 'REPLACE_WITH_SCORES_WEBAPP_URL';

// ── COMPTE À REBOURS ──
function updateCountdown() {
  const target = new Date('2027-06-26T14:00:00');
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) {
    document.getElementById('cd-j').textContent = '0';
    document.getElementById('cd-h').textContent = '0';
    document.getElementById('cd-m').textContent = '0';
    document.getElementById('cd-s').textContent = '0';
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  document.getElementById('cd-j').textContent = days;
  document.getElementById('cd-h').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-m').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-s').textContent = String(secs).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ── AGENDA ICS ──
function downloadICS() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mariage Marine & Antonin//FR',
    'BEGIN:VEVENT',
    'DTSTART:20270626T120000Z',
    'DTEND:20270627T000000Z',
    'SUMMARY:Mariage Marine & Antonin',
    'DESCRIPTION:Cérémonie à 14h00 au Domaine de Berville',
    'LOCATION:17 Rte de Moret\\, 77690 La Genevraye',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mariage-marine-antonin.ics';
  a.click();
  URL.revokeObjectURL(url);
}

// ── RSVP ──
function setPresence(val, btn) {
  document.getElementById('rsvp-presence').value = val;
  document.querySelectorAll('.switch-opt').forEach(b => b.classList.remove('switch-opt--active'));
  btn.classList.add('switch-opt--active');
  const repasBlock = document.getElementById('rsvp-repas-block');
  repasBlock.style.display = val === 'oui' ? 'block' : 'none';
  if (val === 'non') {
    document.getElementById('rsvp-repas').value = '';
    document.getElementById('rsvp-autre').style.display = 'none';
    document.getElementById('rsvp-autre').value = '';
  }
}

document.getElementById('rsvp-repas').addEventListener('change', function () {
  const autre = document.getElementById('rsvp-autre');
  autre.style.display = this.value === 'autre' ? 'block' : 'none';
  if (this.value !== 'autre') autre.value = '';
});

async function submitRSVP() {
  const prenom = document.getElementById('rsvp-prenom').value.trim();
  const nom = document.getElementById('rsvp-nom').value.trim();
  const email = document.getElementById('rsvp-email').value.trim();
  const presence = document.getElementById('rsvp-presence').value;
  const repasEl = document.getElementById('rsvp-repas');
  const allergie = repasEl.value ? repasEl.options[repasEl.selectedIndex].text : '';
  const commentaire = document.getElementById('rsvp-autre').value.trim();

  if (!prenom) {
    alert('Merci de renseigner votre prénom.');
    return;
  }
  if (!nom) {
    alert('Merci de renseigner votre nom.');
    return;
  }
  if (!email) {
    alert('Merci de renseigner votre adresse e-mail.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("L'adresse e-mail saisie n'est pas valide.");
    return;
  }
  if (presence === 'oui' && !repasEl.value) {
    alert('Merci de sélectionner votre régime alimentaire.');
    return;
  }

  const btn = document.querySelector('#rsvpForm .rsvp-btn');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';
  btn.classList.add('rsvp-btn--loading');

  fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ prenom, nom, email, presence, regimeAlimentaire: allergie, commentaire, timestamp: new Date().toISOString() })
  }).catch(() => {});

  await new Promise(resolve => setTimeout(resolve, 4000));
  btn.classList.remove('rsvp-btn--loading');

  const msg = presence === 'oui'
    ? 'Merci pour ta réponse, nous sommes impatients de te recevoir à notre mariage !'
    : 'Merci pour cette réponse décevante.';
  document.getElementById('rsvpSuccessMsg').textContent = msg;
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('rsvpIntro').style.display = 'none';
  document.getElementById('rsvpSuccess').style.display = 'block';
}

function resetRSVP() {
  const btn = document.querySelector('#rsvpForm .rsvp-btn');
  btn.disabled = false;
  btn.textContent = 'Confirmer';
  btn.classList.remove('rsvp-btn--loading');
  document.getElementById('rsvp-prenom').value = '';
  document.getElementById('rsvp-nom').value = '';
  document.getElementById('rsvp-email').value = '';
  document.getElementById('rsvp-presence').value = 'oui';
  document.getElementById('rsvp-repas').value = '';
  document.getElementById('rsvp-autre').value = '';
  document.getElementById('rsvp-autre').style.display = 'none';
  document.getElementById('rsvp-repas-block').style.display = 'block';
  document.querySelectorAll('.switch-opt').forEach((b, i) => b.classList.toggle('switch-opt--active', i === 0));
  document.getElementById('rsvpSuccess').style.display = 'none';
  document.getElementById('rsvpForm').style.display = 'flex';
  document.getElementById('rsvpIntro').style.display = 'block';
  document.getElementById('rsvp-prenom').focus();
}

// ── COPIE EMAIL ──
function toggleMailPicker(e) {
  e.stopPropagation();
  const picker = document.getElementById('mailPicker');
  picker.classList.toggle('active');
  if (picker.classList.contains('active')) {
    document.addEventListener('click', function close() {
      picker.classList.remove('active');
      document.removeEventListener('click', close);
    });
  }
}

function copyEmail(btn) {
  navigator.clipboard.writeText('marine.antonin2027@gmail.com').then(() => {
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(() => {
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    }, 2000);
  });
}

function copyAddress(btn) {
  navigator.clipboard.writeText('17 Rte de Moret, 77690 La Genevraye').then(() => {
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(() => {
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    }, 2000);
  });
}

// ── HÉBERGEMENTS ──
const DEFAULT_HOTELS = [
  { id: 1, name: 'Château Les Glycines', addr: '12 Avenue du Château, 33000 Bordeaux', stars: '★★★★', dist: 'à 2,5 km du domaine', url: '#' },
  { id: 2, name: 'Hôtel du Domaine', addr: '8 Rue de la Vigne, 33240 Saint-André-de-Cubzac', stars: '★★★', dist: 'à 4 km du domaine', url: '#' },
  { id: 3, name: "La Maison d'Hôtes du Bois", addr: 'Route du Bois Fleuri, 33240 Cézac', stars: '★★★ · Chambre d\'hôtes', dist: 'à 5,5 km du domaine', url: '#' },
  { id: 4, name: 'Ibis Styles Fontainebleau', addr: 'Place de la République, 77300 Fontainebleau', stars: '★★ · Budget', dist: 'à 10 km du domaine', url: '#' }
];

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function safeUrl(url) {
  let u = String(url || '').trim();
  if (!u || u === '#') return '#';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return /^https?:\/\/[^\s]+\.[^\s]+/i.test(u) ? u : '#';
}

async function getHotels() {
  try {
    const res = await fetch(SHEET_URL + '?type=hebergements');
    const data = await res.json();
    if (Array.isArray(data) && data.length) return data;
  } catch (e) {}
  return DEFAULT_HOTELS;
}

function renderHotelsList(hotels) {
  const list = document.getElementById('hotelsList');
  if (!list) return;
  list.innerHTML = hotels.map(h => `
    <div class="hotel-item">
      <div class="hotel-info">
        <div class="hotel-name">${escHtml(h.name)}</div>
        <div class="hotel-addr">${escHtml(h.addr)}</div>
        <div class="hotel-stars">${escHtml(h.stars)}</div>
      </div>
      <div style="text-align:right">
        <div class="hotel-dist">${escHtml(h.dist)}</div>
        <a href="${safeUrl(h.url)}" target="_blank" rel="noopener" style="font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--black);text-decoration:none;border-bottom:1px solid var(--accent);margin-top:0.5rem;display:inline-block;">Réserver →</a>
      </div>
    </div>
  `).join('');
}

async function renderHotels() {
  renderHotelsList(DEFAULT_HOTELS);
  const hotels = await getHotels();
  renderHotelsList(hotels);
}

renderHotels();

// ── CAGNOTTE ──
// Renseigner le lien de la cagnotte ici quand il sera disponible (ex: 'https://www.leetchi.com/...')
const CAGNOTTE_URL = '';

function getCagnotteUrl() {
  return CAGNOTTE_URL;
}

function renderCagnotte() {
  const link = document.getElementById('cagnotte-link');
  const empty = document.getElementById('cagnotte-empty');
  if (!link || !empty) return;
  const raw = getCagnotteUrl();
  const url = safeUrl(raw);
  if (raw && url !== '#') {
    link.href = url;
    link.style.display = 'inline-block';
    empty.style.display = 'none';
  } else {
    link.style.display = 'none';
    empty.style.display = 'block';
  }
}

renderCagnotte();


// ── ZOOM AU SCROLL (toutes les sections) ──
(function () {
  const BREAKPOINT = 768;

  const targets = [
    { section: document.getElementById('photo'), content: document.querySelector('#photo .banner-wrap') },
    { section: document.getElementById('accueil'), content: document.getElementById('hero-content') },
    ...Array.from(document.querySelectorAll('section.page')).map(s => ({ section: s, content: s.querySelector('.page-inner') }))
  ].filter(t => t.section && t.content);

  function isMobile() { return window.innerWidth <= BREAKPOINT; }

  function computeMaxScale(t) {
    t.content.style.zoom = 1;
    const contentH = t.content.getBoundingClientRect().height;
    const navH = document.querySelector('nav').offsetHeight;
    const available = window.innerHeight - 2 * navH - 16;
    return Math.max(1, Math.min(available / contentH, 1.2));
  }

  function update() {
    if (isMobile()) { targets.forEach(t => { t.content.style.zoom = 1; }); return; }
    const maxScroll = window.innerHeight * 0.65;
    targets.forEach(t => {
      const distance = Math.abs(t.section.getBoundingClientRect().top);
      const ratio = Math.min(distance / maxScroll, 1);
      const scale = t.maxScale - (t.maxScale - 1) * ratio;
      t.content.style.zoom = scale;
    });
  }

  function init() {
    if (isMobile()) { targets.forEach(t => { t.content.style.zoom = 1; }); return; }
    targets.forEach(t => { t.maxScale = computeMaxScale(t); });
    update();
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', init, { passive: true });
  init();
})();

// ── NAV BURGER ──
function toggleNav() {
  document.querySelector('nav').classList.toggle('nav-open');
}
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => document.querySelector('nav').classList.remove('nav-open'));
});

// ── NAV ACTIVE ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? 'var(--accent)' : '';
  });
});

// ── JEU BAGUETTE ──
(function () {
  let animId = null;
  let gs = null; // game state

  const overlay  = document.getElementById('game-overlay');
  const canvas   = document.getElementById('game-canvas');
  const ctx      = canvas.getContext('2d');

  canvas.addEventListener('click', handleInput);
  canvas.addEventListener('touchstart', function (e) { e.preventDefault(); handleInput(); }, { passive: false });
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('active')) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); handleInput(); }
    if (e.code === 'Escape') closeBaguetteGame();
  });

  function handleInput() {
    if (!gs) return;
    if (gs.waiting) { gs.waiting = false; return; }
    if (gs.over) { resetGame(); return; }
    if (gs.boy.ground) {
      gs.boy.vy = gs.JUMP; gs.boy.ground = false;
      gs.girl.vy = gs.JUMP; gs.girl.ground = false;
    }
  }

  function resetGame() {
    const g = gs;
    g.boy.y  = g.floor; g.boy.vy  = 0; g.boy.ground  = true;
    g.girl.y = g.floor; g.girl.vy = 0; g.girl.ground = true;
    g.baguettes = []; g.next = 120; g.speed = 2.5;
    g.score = 0; g.frame = 0; g.over = false;
  }

  function rr(x, y, w, h, r) {
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); }
    else { ctx.rect(x, y, w, h); }
  }

  function drawBoy(x, y, f) {
    const run = f % 16 < 8;
    // Ombre
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.beginPath(); ctx.ellipse(x+15, gs.floor+gs.CH+3, 13, 4, 0, 0, Math.PI*2); ctx.fill();
    // Chaussures
    ctx.fillStyle = '#111';
    ctx.fillRect(x+4,  y+44+(run?4:0),  11, 6);
    ctx.fillRect(x+17, y+44+(run?0:4),  11, 6);
    // Pantalon
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x+5,  y+28+(run?0:-4), 9, 18);
    ctx.fillRect(x+17, y+28+(run?-4:0), 9, 18);
    // Veste
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x+3, y+13, 24, 17);
    // Chemise
    ctx.fillStyle = '#f0ebe3';
    ctx.fillRect(x+11, y+14, 9, 15);
    // Cravate
    ctx.fillStyle = '#B47848';
    ctx.fillRect(x+13, y+15, 5, 12);
    // Bras
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x-1, y+13, 5, 14);
    ctx.fillRect(x+27, y+13, 5, 14);
    // Mains
    ctx.fillStyle = '#d4956a';
    ctx.beginPath(); ctx.arc(x+1,  y+28, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+29, y+28, 3, 0, Math.PI*2); ctx.fill();
    // Cou
    ctx.fillStyle = '#d4956a';
    ctx.fillRect(x+12, y+10, 7, 6);
    // Tête
    ctx.fillStyle = '#dea070';
    ctx.beginPath(); ctx.arc(x+15, y+8, 10, 0, Math.PI*2); ctx.fill();
    // Cheveux bruns (marron foncé, pas noir)
    ctx.fillStyle = '#5c2a0c';
    ctx.beginPath(); ctx.arc(x+15, y+2, 9, Math.PI, 2*Math.PI); ctx.fill();
    ctx.fillRect(x+6,  y+2, 4, 6); // côté gauche
    ctx.fillRect(x+21, y+2, 4, 6); // côté droit
    // Yeux (dessinés après les cheveux)
    ctx.fillStyle = '#1a0a04';
    ctx.fillRect(x+10, y+8, 2, 2);
    ctx.fillRect(x+19, y+8, 2, 2);
    // Sourire
    ctx.strokeStyle = '#7a4030'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x+15, y+13, 3, 0.2, Math.PI-0.2); ctx.stroke();
  }

  function drawGirl(x, y, f) {
    const run = f % 16 < 8;
    const S = '#f2c4a0'; // peau
    const H = '#3a1a08'; // châtain foncé
    // Ombre
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.beginPath(); ctx.ellipse(x+15, gs.floor+gs.CH+3, 13, 4, 0, 0, Math.PI*2); ctx.fill();
    // Chaussures
    ctx.fillStyle = '#B47848';
    ctx.fillRect(x+5,  y+46+(run?3:0), 9, 5);
    ctx.fillRect(x+17, y+46+(run?0:3), 9, 5);
    // Jambes
    ctx.fillStyle = S;
    ctx.fillRect(x+7,  y+34+(run?0:-4), 7, 14);
    ctx.fillRect(x+17, y+34+(run?-4:0), 7, 14);
    // Robe
    ctx.fillStyle = '#FCF0EA';
    ctx.beginPath();
    ctx.moveTo(x+4,y+14); ctx.lineTo(x+26,y+14);
    ctx.lineTo(x+30,y+42); ctx.lineTo(x,y+42);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#B47848'; ctx.lineWidth = 1; ctx.stroke();
    // Corset
    ctx.fillStyle = '#ece9e0';
    ctx.fillRect(x+8, y+14, 14, 9);
    // Bras
    ctx.fillStyle = S;
    ctx.fillRect(x-1, y+14, 6, 11);
    ctx.fillRect(x+25, y+14, 6, 11);
    // Bouquet
    ctx.fillStyle = '#EAB4D2';
    ctx.beginPath(); ctx.arc(x+2, y+25, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#EA96A8';
    ctx.beginPath(); ctx.arc(x+2, y+23, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#669048'; ctx.fillRect(x+1, y+28, 2, 7);
    // Cou
    ctx.fillStyle = S; ctx.fillRect(x+11, y+9, 8, 7);
    // Tête
    ctx.fillStyle = S;
    ctx.beginPath(); ctx.arc(x+15, y+9, 10, 0, Math.PI*2); ctx.fill();
    // --- CHEVEUX (châtain foncé) ---
    ctx.fillStyle = H;
    // Calotte (sommet)
    ctx.beginPath(); ctx.arc(x+15, y+3, 9, Math.PI, 2*Math.PI); ctx.fill();
    // Mèches latérales
    ctx.fillRect(x+5,  y+3, 5, 13); // nuque gauche
    ctx.fillRect(x+21, y+3, 5, 11); // côté droit
    // FRANGE : rectangle simple et net, du front jusqu'à y+9 (yeux à y+11)
    ctx.fillRect(x+12, y+3, 14, 6);
    // Voile
    ctx.fillStyle = 'rgba(252,240,234,0.5)';
    ctx.beginPath();
    ctx.moveTo(x+20,y+2); ctx.lineTo(x+34,y+20);
    ctx.lineTo(x+30,y+20); ctx.lineTo(x+16,y+2);
    ctx.closePath(); ctx.fill();
    // Yeux — dessinés EN DERNIER, toujours visibles
    ctx.fillStyle = '#1a0a04';
    ctx.fillRect(x+10, y+11, 2, 2);
    ctx.fillRect(x+19, y+11, 2, 2);
    // Sourire
    ctx.strokeStyle = '#c06878'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x+15, y+15, 3, 0.2, Math.PI-0.2); ctx.stroke();
  }

  function drawObstacle(b) {
    if (b.type === 'champagne') drawChampagne(b);
    else if (b.type === 'gateau') drawGateau(b);
    else drawBouquet(b);
  }

  function drawChampagne(b) {
    const cx = b.x + b.w / 2;
    // Corps de la bouteille
    const g = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
    g.addColorStop(0, '#305430'); g.addColorStop(0.5, '#669048'); g.addColorStop(1, '#305430');
    ctx.fillStyle = g;
    ctx.beginPath(); rr(b.x + 3, b.y + b.h * 0.32, b.w - 6, b.h * 0.68, 5); ctx.fill();
    // Col
    ctx.fillStyle = '#669048';
    ctx.fillRect(cx - 4, b.y + 8, 8, b.h * 0.28);
    // Capsule dorée
    ctx.fillStyle = '#B47848';
    ctx.beginPath(); rr(cx - 5, b.y, 10, 14, 3); ctx.fill();
    // Étiquette
    ctx.fillStyle = '#f0ebe3';
    ctx.beginPath(); rr(b.x + 5, b.y + b.h * 0.48, b.w - 10, b.h * 0.28, 2); ctx.fill();
    ctx.fillStyle = '#B47848'; ctx.font = 'bold 6px serif';
    ctx.textAlign = 'center'; ctx.fillText('♦', cx, b.y + b.h * 0.65);
    // Reflet
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(b.x + 5, b.y + b.h * 0.35, 3, b.h * 0.5);
  }

  function drawGateau(b) {
    const cx = b.x + b.w / 2;
    const layers = 4;
    for (let i = 0; i < layers; i++) {
      const lw = b.w * (1 - i * 0.18);
      const lh = b.h / (layers + 0.5);
      const lx = b.x + (b.w - lw) / 2;
      const ly = b.y + b.h - (i + 1) * lh;
      // Couche
      ctx.fillStyle = i % 2 === 0 ? '#f5e6d0' : '#eddcc0';
      ctx.beginPath(); rr(lx, ly, lw, lh, 3); ctx.fill();
      // Choux
      ctx.fillStyle = '#B47848';
      const n = Math.max(1, Math.floor(lw / 11));
      for (let j = 0; j < n; j++) {
        ctx.beginPath();
        ctx.arc(lx + lw / (n * 2) + j * (lw / n), ly + lh / 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Crème
      ctx.fillStyle = '#fff8f0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + lw, ly);
      ctx.stroke();
    }
    // Bouquet du sommet
    ctx.fillStyle = '#EAA2C0';
    ctx.beginPath(); ctx.arc(cx, b.y + 3, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#EA96A8';
    ctx.beginPath(); ctx.arc(cx, b.y + 2, 3, 0, Math.PI * 2); ctx.fill();
  }

  function drawBouquet(b) {
    const cx = b.x + b.w / 2;
    // Tige
    ctx.fillStyle = '#305430';
    ctx.fillRect(cx - 2, b.y + b.h * 0.52, 4, b.h * 0.48);
    // Ruban doré
    ctx.fillStyle = '#B47848';
    ctx.beginPath(); rr(cx - 6, b.y + b.h * 0.52, 12, 7, 2); ctx.fill();
    // Feuilles
    ctx.fillStyle = '#669048';
    ctx.beginPath(); ctx.ellipse(b.x + b.w * 0.2, b.y + b.h * 0.5, 9, 4, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(b.x + b.w * 0.8, b.y + b.h * 0.5, 9, 4,  0.5, 0, Math.PI * 2); ctx.fill();
    // Fleurs
    const fl = [
      { dx: 0,           dy: 0,            r: b.w*0.23, c: '#FCD2E4' },
      { dx: -b.w*0.19,   dy:  b.h*0.09,   r: b.w*0.18, c: '#EA96A8' },
      { dx:  b.w*0.19,   dy:  b.h*0.07,   r: b.w*0.18, c: '#EAA2C0' },
      { dx: -b.w*0.09,   dy: -b.h*0.13,   r: b.w*0.14, c: '#FCF0EA' },
      { dx:  b.w*0.09,   dy: -b.h*0.11,   r: b.w*0.14, c: '#EAB4D2' },
    ];
    fl.forEach(f => {
      ctx.fillStyle = f.c;
      ctx.beginPath(); ctx.arc(cx + f.dx, b.y + b.h * 0.3 + f.dy, f.r, 0, Math.PI * 2); ctx.fill();
    });
    // Cœurs des fleurs
    fl.forEach(f => {
      ctx.fillStyle = '#FCF0EA';
      ctx.beginPath(); ctx.arc(cx + f.dx, b.y + b.h * 0.3 + f.dy, f.r * 0.35, 0, Math.PI * 2); ctx.fill();
    });
  }

  function hit(c, b) {
    const m = 6;
    return c.x+m       < b.x+b.w &&
           c.x+gs.CW-m > b.x &&
           c.y+8        < b.y+b.h &&
           c.y+gs.CH    > b.y;
  }

  function tick() {
    const g = gs;
    ctx.clearRect(0, 0, g.W, g.H);
    ctx.fillStyle = '#FCF0EA'; ctx.fillRect(0, 0, g.W, g.H);
    ctx.fillStyle = '#F6E4D8'; ctx.fillRect(0, g.floor+g.CH, g.W, g.H - g.floor - g.CH);
    ctx.fillStyle = '#EA5A4E'; ctx.fillRect(0, g.floor+g.CH, g.W, 2);

    if (g.waiting) {
      // Écran d'attente
      drawBoy( Math.round(g.boy.x),  Math.round(g.boy.y),  0);
      drawGirl(Math.round(g.girl.x), Math.round(g.girl.y), 0);
      ctx.fillStyle = '#1E1E1E'; ctx.font = 'italic 300 22px "Playfair Display",serif';
      ctx.textAlign = 'center';
      ctx.fillText('Prêts ?', g.W/2, g.H/2 - 10);
      ctx.fillStyle = '#846048'; ctx.font = '10px "DM Sans",sans-serif';
      ctx.fillText('ESPACE · ↑ · CLIQUER POUR COMMENCER', g.W/2, g.H/2 + 14);
      animId = requestAnimationFrame(tick); return;
    }

    if (!g.over) {
      g.frame++; g.score = Math.floor(g.frame / 7);
      g.speed = 2.5 + Math.log(1 + g.score * 0.04) * 0.6;

      [g.boy, g.girl].forEach(c => {
        if (!c.ground) {
          c.vy += g.GRAV; c.y += c.vy;
          if (c.y >= g.floor) { c.y = g.floor; c.vy = 0; c.ground = true; }
        }
      });

      g.next--;
      if (g.next <= 0) {
        const types = ['champagne', 'gateau', 'bouquet'];
        const type  = types[Math.floor(Math.random() * types.length)];
        let bw, bh;
        if (type === 'champagne') { bw = 18 + Math.random()*8;  bh = 55 + Math.random()*18; }
        else if (type === 'gateau') { bw = 42 + Math.random()*18; bh = 58 + Math.random()*20; }
        else                        { bw = 40 + Math.random()*16; bh = 50 + Math.random()*14; }
        g.baguettes.push({ x: g.W, y: g.floor+g.CH - bh, w: bw, h: bh, type });
        g.next = Math.max(50, 120 - g.score*0.08) + Math.random()*110;
      }
      g.baguettes = g.baguettes.filter(b => b.x + b.w > -10);
      g.baguettes.forEach(b => b.x -= g.speed);
      if (g.baguettes.some(b => hit(g.boy, b) || hit(g.girl, b))) g.over = true;
    }

    g.baguettes.forEach(drawObstacle);
    drawBoy( Math.round(g.boy.x),  Math.round(g.boy.y),  g.frame);
    drawGirl(Math.round(g.girl.x), Math.round(g.girl.y), g.frame);

    ctx.fillStyle = '#846048'; ctx.font = '500 13px "DM Sans",sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(g.score).padStart(5,'0'), g.W-16, 26);

    if (g.over && !g.scoresShown) {
      g.scoresShown = true;
      document.getElementById('scores-final-num').textContent = g.score;
      document.getElementById('scores-name').value = '';
      document.getElementById('scores-entry').style.display = 'block';
      document.getElementById('scores-board').style.display = 'none';
      document.getElementById('game-scores').classList.add('active');
      setTimeout(() => document.getElementById('scores-name').focus(), 50);
    }

    animId = requestAnimationFrame(tick);
  }

  window.openBaguetteGame = function () {
    const W = Math.min(window.innerWidth - 32, 720);
    const H = 260;
    canvas.width = W; canvas.height = H;

    gs = {
      W, H, GRAV: 0.22, JUMP: -10, CW: 30, CH: 52,
      floor: H - 52 - 50, speed: 2.5, score: 0, frame: 0, over: false, waiting: true, scoresShown: false,
      baguettes: [], next: 120,
      boy:  { x: 70,  y: 0, vy: 0, ground: true },
      girl: { x: 118, y: 0, vy: 0, ground: true }
    };
    gs.boy.y = gs.floor; gs.girl.y = gs.floor;

    overlay.classList.add('active');
    if (animId) cancelAnimationFrame(animId);
    tick();
  };

  window.closeBaguetteGame = function () {
    overlay.classList.remove('active');
    document.getElementById('game-scores').classList.remove('active');
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    gs = null;
  };

  // ── SCORES (classement partagé via Google Sheet) ──
  async function fetchLeaderboard() {
    try {
      const res = await fetch(SCORES_URL);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }

  async function submitScoreRemote(name, score) {
    try {
      await fetch(SCORES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ name, score })
      });
    } catch (e) {}
  }

  function renderLeaderboard(top10, currentScore, currentName) {
    const list = document.getElementById('scores-list');
    list.innerHTML = top10.map((s, i) => {
      const hi = s.score === currentScore && s.name === currentName;
      return '<li class="' + (hi ? 'scores-highlight' : '') + '">' +
        '<span class="scores-rank">' + (i+1) + '</span>' +
        '<span class="scores-name-col">' + escHtml(s.name) + '</span>' +
        '<span class="scores-score-col">' + escHtml(String(s.score)) + '</span>' +
        '</li>';
    }).join('');
  }

  window.submitScore = async function () {
    const name = (document.getElementById('scores-name').value.trim() || 'Anonyme').slice(0, 20);
    const score = gs ? gs.score : 0;
    const btn = document.querySelector('#scores-entry .scores-btn');
    btn.disabled = true;
    btn.textContent = 'Envoi…';
    await submitScoreRemote(name, score);
    const top10 = await fetchLeaderboard();
    btn.disabled = false;
    btn.textContent = 'Enregistrer';
    renderLeaderboard(top10, score, name);
    document.getElementById('scores-entry').style.display = 'none';
    document.getElementById('scores-board').style.display = 'block';
  };

  window.restartFromScores = function () {
    document.getElementById('game-scores').classList.remove('active');
    if (gs) {
      gs.boy.y  = gs.floor; gs.boy.vy  = 0; gs.boy.ground  = true;
      gs.girl.y = gs.floor; gs.girl.vy = 0; gs.girl.ground = true;
      gs.baguettes = []; gs.next = 120; gs.speed = 2.5;
      gs.score = 0; gs.frame = 0; gs.over = false;
      gs.waiting = true; gs.scoresShown = false;
    }
  };
})();
