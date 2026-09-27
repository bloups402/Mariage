// ── SCROLL EN HAUT AU CHARGEMENT/RECHARGEMENT ──
window.addEventListener('load', () => window.scrollTo(0, 0));

// ── LOUPE SUR L'ILLUSTRATION DE BANNIÈRE ──
// Loupe vectorielle : un second rendu du SVG inline (via <use href="#g10">)
// dont le viewBox est recadré en continu autour du curseur — zoom net à
// n'importe quel niveau, animations comprises.
(function initIlluZoomLens() {
  const host = document.getElementById('bannerIllustration');
  const lens = document.querySelector('.illu-zoom-lens');
  if (!host || !lens) return;
  const lensSvg = lens.querySelector('svg');

  const ZOOM = 2.2;
  const VBW = 855.18, VBH = 1186.2653;

  function moveLens(e) {
    const rect = host.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      lens.classList.remove('active');
      return;
    }
    lens.classList.add('active');

    // Position de la loupe dans banner-wrap (le zoom au scroll transforme
    // .banner-illustration sans déplacer la boîte du parent positionné).
    const parentRect = lens.offsetParent.getBoundingClientRect();
    const lensSize = lens.offsetWidth;
    lens.style.left = (rect.left - parentRect.left + x - lensSize / 2) + 'px';
    lens.style.top  = (rect.top - parentRect.top + y - lensSize / 2) + 'px';

    // Fenêtre de zoom en coordonnées internes du SVG, centrée sous le curseur
    const w = (lensSize / rect.width) * VBW / ZOOM;
    const h = (lensSize / rect.height) * VBH / ZOOM;
    const ux = (x / rect.width) * VBW - w / 2;
    const uy = (y / rect.height) * VBH - h / 2;
    lensSvg.setAttribute('viewBox', ux + ' ' + uy + ' ' + w + ' ' + h);
  }

  // Coalescence : les événements souris arrivent plus vite que les frames,
  // on ne recalcule le cadrage qu'une fois par frame.
  let pending = null;
  function queueMove(e) {
    pending = e;
    if (queueMove.raf) return;
    queueMove.raf = requestAnimationFrame(() => { queueMove.raf = null; moveLens(pending); });
  }
  host.addEventListener('mouseenter', queueMove);
  host.addEventListener('mousemove', queueMove);
  host.addEventListener('mouseleave', () => {
    if (queueMove.raf) { cancelAnimationFrame(queueMove.raf); queueMove.raf = null; }
    lens.classList.remove('active');
  });
})();

// ── MODE NUIT (clic sur le soleil / la lune de l'illustration) ──
(function initNightMode() {
  const sun = document.querySelector('.banner-illustration .anim-sun');
  const moon = document.querySelector('.banner-illustration .night-moon');
  if (!sun) return;
  // Fenêtres du train : recolorées en inline pour que les clones <use> (masque) suivent
  const trainWindows = ['path1810', 'path1570'].map(id => document.getElementById(id)).filter(Boolean);
  trainWindows.forEach(p => { p.dataset.dayFill = p.style.fill; });
  function toggleNight(e) {
    e.stopPropagation(); // ne pas déclencher le crédit de l'illustration
    const night = document.body.classList.toggle('night');
    trainWindows.forEach(p => { p.style.fill = night ? '#FFD27A' : p.dataset.dayFill; });
  }
  sun.addEventListener('click', toggleNight);
  if (moon) moon.addEventListener('click', toggleNight);
})();

// ── CRÉDIT PHOTO (clic sur la bannière) ──
const BANNER_DATE_TEXT = '26.06.2027';
const PHOTO_CREDIT_TEXT = 'Merci à Audrey pour le visuel ! ❤️';
let photoCreditTimer = null;
function showPhotoCredit() {
  const dateEl = document.getElementById('bannerDate');
  if (!dateEl) return;
  dateEl.textContent = PHOTO_CREDIT_TEXT;
  dateEl.classList.add('banner-date--credit');
  clearTimeout(photoCreditTimer);
  photoCreditTimer = setTimeout(() => {
    dateEl.textContent = BANNER_DATE_TEXT;
    dateEl.classList.remove('banner-date--credit');
  }, 4000);
}

// ── SHEET URL (RSVP) ──
const SHEET_URL = atob('aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J4YkdIMHVWaEFrQ2h4RkxXN1BTSUI0WWtkLUljZmZKQ2pobmhSUFNab0ZHMHRxR0FHR0xhd3lOX2Ixd1NDWjVoVU0vZXhlYw==');

// ── COMPTE À REBOURS ──
function updateCountdown() {
  const target = new Date('2027-06-26T14:30:00');
  const end = new Date('2027-06-28T09:00:00');
  const now = new Date();
  const countdown = document.getElementById('countdown');
  const message = document.getElementById('countdown-message');

  if (now >= end) {
    countdown.style.display = 'none';
    message.textContent = 'Terminé';
    message.style.display = 'block';
    return;
  }
  if (now >= target) {
    countdown.style.display = 'none';
    message.textContent = 'Maintenant';
    message.style.display = 'block';
    return;
  }
  countdown.style.display = 'flex';
  message.style.display = 'none';

  const diff = target - now;
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
    'DTSTART:20270626T123000Z',
    'DTEND:20270627T000000Z',
    'SUMMARY:Mariage Marine & Antonin',
    'DESCRIPTION:Début à 14h30 au Domaine de Berville',
    'LOCATION:17 Route de Moret\\, 77690 La Genevraye',
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

function safeUrl(url) {
  let u = String(url || '').trim();
  if (!u || u === '#') return '#';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return /^https?:\/\/[^\s]+\.[^\s]+/i.test(u) ? u : '#';
}

// ── CAGNOTTE ──
// Renseigner le lien de la cagnotte ici quand il sera disponible (ex: 'https://www.leetchi.com/...')
const CAGNOTTE_URL = 'https://www.millemercismariage.com/mariineantonin/liste.html';

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
    { section: document.getElementById('photo'), content: document.querySelector('#photo .banner-illustration'), useTransform: true, anchorBottom: true },
    { section: document.getElementById('accueil'), content: document.getElementById('hero-content') },
    ...Array.from(document.querySelectorAll('section.page')).map(s => ({ section: s, content: s.querySelector('.page-inner') }))
  ].filter(t => t.section && t.content);

  function isMobile() { return window.innerWidth <= BREAKPOINT; }

  function setScale(t, scale) {
    scale = Math.round(scale * 1000) / 1000;
    if (t.lastScale === scale) return;
    t.lastScale = scale;
    if (t.useTransform) t.content.style.transform = scale === 1 ? '' : `scale(${scale})`;
    else t.content.style.zoom = scale;
  }

  function computeMaxScale(t) {
    setScale(t, 1);
    const contentH = t.content.getBoundingClientRect().height;
    const navH = document.querySelector('nav').offsetHeight;
    if (t.anchorBottom) {
      // Ancrée en bas (transform-origin: center bottom) : toute la croissance
      // se fait vers le haut, donc seule la place au-dessus de l'élément compte.
      // On utilise la position absolue dans le document (indépendante du scroll
      // courant) : sinon un resize pendant que la page est scrollée ailleurs
      // (fenêtre redimensionnée, zoom navigateur...) mesure un "top" négatif,
      // verrouille maxScale à 1 et désactive le zoom pour le reste de la visite.
      const top = t.content.getBoundingClientRect().top + window.scrollY;
      const headroom = Math.max(0, top - navH - 8);
      return Math.max(1, Math.min(1 + headroom / contentH, 1.2));
    }
    const available = window.innerHeight - 2 * navH - 16;
    return Math.max(1, Math.min(available / contentH, 1.2));
  }

  function update() {
    if (isMobile()) { targets.forEach(t => setScale(t, 1)); return; }
    const maxScroll = window.innerHeight * 0.65;
    targets.forEach(t => {
      const distance = Math.abs(t.section.getBoundingClientRect().top);
      const ratio = Math.min(distance / maxScroll, 1);
      const scale = t.maxScale - (t.maxScale - 1) * ratio;
      setScale(t, scale);
    });
  }

  function init() {
    if (isMobile()) { targets.forEach(t => setScale(t, 1)); return; }
    targets.forEach(t => { t.maxScale = computeMaxScale(t); });
    update();
  }

  // Un seul recalcul par frame, même si le navigateur émet plusieurs événements scroll
  let scrollRaf = null;
  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => { scrollRaf = null; update(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
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

// ── NAVIGATION PRÉCISE ──
// Les sections hors écran ont une hauteur estimée (content-visibility) et le zoom au scroll
// modifie leur mise en page : un simple ancrage atterrit donc à côté. On fige la mise en page
// pendant le trajet, puis on recale le haut de la section sur le haut de l'écran.
(function () {
  const root = document.documentElement;
  let token = 0;
  function goTo(el) {
    const my = ++token;
    root.classList.add('nav-jump');
    const y = () => Math.max(0, el.getBoundingClientRect().top + window.scrollY);
    window.scrollTo({ top: y(), behavior: 'smooth' });
    let done = false;
    function settle() {
      if (done || my !== token) return;
      done = true;
      let tries = 0;
      (function fix() {
        if (my !== token) return;
        const off = el.getBoundingClientRect().top;
        if (Math.abs(off) > 1 && tries++ < 10) {
          window.scrollTo({ top: window.scrollY + off, behavior: 'instant' });
          requestAnimationFrame(fix);
        } else {
          setTimeout(() => { if (my === token) root.classList.remove('nav-jump'); }, 120);
        }
      })();
    }
    if ('onscrollend' in window) window.addEventListener('scrollend', settle, { once: true });
    setTimeout(settle, 1100);
  }
  // Toute intervention de l'utilisateur pendant le trajet reprend la main
  ['wheel', 'touchstart', 'keydown'].forEach(ev =>
    window.addEventListener(ev, () => { token++; root.classList.remove('nav-jump'); }, { passive: true }));
  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    goTo(el);
  });
})();

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

  // Les sprites sont dessinés en 30×52 : on les agrandit depuis leurs pieds
  let PK = 1.7;
  function big(fn, x, y, f) {
    // Ombre au sol (dans le repère de l'écran, pas agrandie avec le sprite)
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.beginPath(); ctx.ellipse(x + 15 * PK, gs.floor + gs.CH + 3, 13 * PK, 4 * PK, 0, 0, Math.PI*2); ctx.fill();
    ctx.save();
    ctx.translate(x, y + gs.CH);
    ctx.scale(PK, PK);
    ctx.translate(-x, -(y + 52));
    fn(x, y, f);
    ctx.restore();
  }

  function drawBoy(x, y, f) {
    const run = f % 16 < 8;
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
    ctx.fillStyle = '#EBCDE9'; ctx.fillRect(0, g.floor+g.CH, g.W, g.H - g.floor - g.CH);
    ctx.fillStyle = '#1E1E1E'; ctx.fillRect(0, g.floor+g.CH, g.W, 3);

    if (g.waiting) {
      // Écran d'attente
      big(drawBoy, Math.round(g.boy.x),  Math.round(g.boy.y),  0);
      big(drawGirl, Math.round(g.girl.x), Math.round(g.girl.y), 0);
      ctx.fillStyle = '#7C2D4A'; ctx.font = 'italic 300 22px "Playfair Display",serif';
      ctx.textAlign = 'center';
      ctx.fillText('Prêts ?', g.W/2, g.H/2 - 10);
      ctx.fillStyle = 'rgba(124,45,74,0.75)'; ctx.font = '10px "DM Sans",sans-serif';
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
    big(drawBoy, Math.round(g.boy.x),  Math.round(g.boy.y),  g.frame);
    big(drawGirl, Math.round(g.girl.x), Math.round(g.girl.y), g.frame);

    ctx.fillStyle = '#7C2D4A'; ctx.font = '700 41px "Clash Display","DM Sans",sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(g.score).padStart(5,'0'), g.W-35, 62);

    if (g.over && !g.scoresShown) {
      g.scoresShown = true;
      document.getElementById('scores-final-num').textContent = g.score;
      document.getElementById('game-scores').classList.add('active');
    }

    animId = requestAnimationFrame(tick);
  }

  // Mobile (écran tactile) en portrait → on tourne l'overlay de 90° pour jouer en paysage
  function gameDims() {
    const mobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const rot = mobile && window.innerHeight > window.innerWidth;
    return { rot, W: rot ? window.innerHeight : window.innerWidth, H: rot ? window.innerWidth : window.innerHeight };
  }
  function applyRotation(D) {
    overlay.classList.toggle('rotated', D.rot);
    overlay.style.width  = D.rot ? D.W + 'px' : '';
    overlay.style.height = D.rot ? D.H + 'px' : '';
    overlay.style.transform = D.rot ? 'translateX(' + D.H + 'px) rotate(90deg)' : '';
  }
  // Le téléphone pivote pendant une partie : on relance la mise en page
  function onOrient() {
    if (!gs || !overlay.classList.contains('active')) return;
    if (gameDims().rot !== gs.rot) window.openBaguetteGame();
  }
  window.addEventListener('orientationchange', function () { setTimeout(onOrient, 250); });
  window.addEventListener('resize', onOrient);

  window.openBaguetteGame = function () {
    // Plein écran, sol à 66 px du bas (comme .neko-ground).
    // Sur mobile tenu en portrait, le jeu est pivoté pour s'afficher en paysage.
    const D = gameDims();
    const W = D.W, H = D.H;
    applyRotation(D);
    PK = H < 480 ? 1.25 : 1.7;
    canvas.width = W; canvas.height = H;

    gs = {
      W, H, GRAV: 0.22, JUMP: H < 480 ? -8.6 : -10, CW: 30 * PK, CH: 52 * PK, rot: D.rot,
      floor: H - 66 - 52 * PK, speed: 2.5, score: 0, frame: 0, over: false, waiting: true, scoresShown: false,
      baguettes: [], next: 120,
      boy:  { x: 80,  y: 0, vy: 0, ground: true },
      girl: { x: 80 + 30 * PK + 14, y: 0, vy: 0, ground: true }
    };
    gs.boy.y = gs.floor; gs.girl.y = gs.floor;

    overlay.classList.add('active');
    if (animId) cancelAnimationFrame(animId);
    tick();
  };

  window.closeBaguetteGame = function () {
    overlay.classList.remove('active');
    applyRotation({ rot: false });
    document.getElementById('game-scores').classList.remove('active');
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    gs = null;
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

// ── JEU CACHÉ : LE CHAT PORTE-BONHEUR ──
// Déclenché d'un clic sur le maneki-neko de la section Cagnotte.
// Flèches ou souris pour déplacer le maneki : pièces d'or = +1, gros koban = +5,
// chat noir attrapé = fin de partie (il se pose au sol puis s'évapore sinon).
(function initNekoGame() {
  const overlay  = document.getElementById('neko-overlay');
  const field    = document.getElementById('neko-field');
  const playerEl = document.getElementById('neko-player');
  const playerSvg = playerEl ? playerEl.querySelector('svg') : null;
  const scoreEl  = document.getElementById('neko-score');
  const hiscoreEl = document.getElementById('neko-hiscore');
  if (!overlay || !field || !playerEl) return;

  const PW = 92, PH = 120;    // taille du maneki à l'écran
  const MTX = 'matrix(1.3333333,0,0,-1.3333333,0,1186.2653)';
  let st = null, raf = null;
  const keys = {};

  function spawn() {
    const roll = Math.random();
    const catProb = 0.18 + Math.min(0.22, st.score * 0.004);
    let type = 'coin';
    if (roll < catProb) type = 'cat';
    else if (roll < catProb + 0.08) type = 'big';
    const el = document.createElement('div');
    let h;
    if (type === 'cat') {
      el.className = 'neko-item neko-chat';
      el.innerHTML = '<svg viewBox="733 481 41 42"><use href="#g5766" transform="' + MTX + '"/></svg>';
      h = 59;
    } else if (type === 'big') {
      el.className = 'neko-item neko-coin neko-coin--big';
      el.textContent = '千両';
      h = 60;
    } else {
      el.className = 'neko-item neko-coin';
      el.textContent = '両';
      h = 44;
    }
    field.appendChild(el);
    st.items.push({
      el, x: 45 + Math.random() * (st.W - 90), y: -70, h, type,
      rot: 0, spin: (Math.random() - 0.5) * 2.4, dead: false, deadT: 0,
      vy: st.baseSpeed * (type === 'big' ? 1.18 : 0.85 + Math.random() * 0.45)
    });
  }

  function popPlus(x, y, n) {
    const el = document.createElement('div');
    el.className = 'neko-plus';
    el.textContent = '+' + n;
    el.style.left = (x - 14) + 'px';
    el.style.top = y + 'px';
    field.appendChild(el);
    setTimeout(function (e) { e.remove(); }, 720, el);
  }

  function addScore(n, x, y) {
    st.score += n;
    scoreEl.textContent = st.score;
    scoreEl.classList.remove('neko-bump');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('neko-bump');
    popPlus(x, y, n);
    if (playerSvg) {
      playerSvg.classList.remove('neko-catch-anim');
      void playerSvg.offsetWidth;
      playerSvg.classList.add('neko-catch-anim');
    }
  }

  function fadeOut(it, flat) {
    it.el.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
    it.el.style.transform += flat ? ' scale(1, 0.35)' : ' scale(1.6)';
    it.el.style.opacity = '0';
    setTimeout(function (e) { e.remove(); }, 240, it.el);
  }

  function gameOver() {
    st.over = true;
    const best = Math.max(st.score, parseInt(localStorage.getItem('nekoBestScore') || '0', 10));
    localStorage.setItem('nekoBestScore', String(best));
    document.getElementById('neko-final').textContent = st.score;
    document.getElementById('neko-best').textContent = best;
    document.getElementById('neko-gameover').classList.add('active');
  }

  function tick(now) {
    if (!st) return;
    const dt = Math.min((now - st.last) / 16.7, 3);
    st.last = now;

    if (!st.over) {
      // Déplacement du maneki : clavier prioritaire, sinon suivi de la souris
      const prev = st.px;
      const dir = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
      if (dir) { st.px += dir * 8 * dt; st.mouseX = null; }
      else if (st.mouseX != null) st.px += (st.mouseX - st.px) * Math.min(0.28 * dt, 1);
      st.px = Math.max(PW / 2, Math.min(st.W - PW / 2, st.px));
      // inclinaison dans le sens du mouvement, amortie
      st.tilt += (Math.max(-12, Math.min(12, (st.px - prev) * 1.4)) - st.tilt) * Math.min(0.3 * dt, 1);
      playerEl.style.transform = 'translateX(' + (st.px - PW / 2) + 'px) rotate(' + st.tilt.toFixed(2) + 'deg)';

      // Apparitions, de plus en plus rapprochées et rapides
      st.spawnT -= dt * 16.7;
      if (st.spawnT <= 0) {
        spawn();
        st.spawnGap = Math.max(300, st.spawnGap - 8);
        st.baseSpeed = Math.min(14, st.baseSpeed + 0.07);
        st.spawnT = st.spawnGap;
      }

      // Chute, collisions, atterrissages
      const groundY = st.H - 66;
      const catchY = groundY - PH;
      for (let i = st.items.length - 1; i >= 0; i--) {
        const it = st.items[i];
        if (it.dead) {
          // un chat noir posé au sol reste dangereux tant qu'il n'a pas disparu
          if (it.type === 'cat' && Math.abs(it.x - st.px) < PW * 0.5) { gameOver(); continue; }
          it.deadT -= dt * 16.7;
          if (it.deadT <= 0) { fadeOut(it, true); st.items.splice(i, 1); }
          continue;
        }
        it.y += it.vy * dt;
        it.rot += it.spin * dt;
        it.el.style.transform = 'translate(' + it.x + 'px,' + it.y + 'px) rotate(' + it.rot + 'deg)';
        const centerY = it.y + it.h / 2;
        const caught = centerY > catchY && centerY < groundY + 10 && Math.abs(it.x - st.px) < PW * 0.5;
        if (caught) {
          if (it.type === 'cat') { gameOver(); continue; }
          addScore(it.type === 'big' ? 5 : 1, it.x, catchY - 10);
          fadeOut(it, false);
          st.items.splice(i, 1);
        } else if (it.y + it.h >= groundY + 6) {
          // atterrissage : le chat se pose un instant, les pièces s'aplatissent
          it.y = groundY + 6 - it.h;
          it.rot = 0; it.spin = 0;
          it.el.style.transform = 'translate(' + it.x + 'px,' + it.y + 'px)';
          it.dead = true;
          it.deadT = it.type === 'cat' ? 2500 : 40;
        }
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function reset() {
    field.innerHTML = '';
    document.getElementById('neko-gameover').classList.remove('active');
    st = {
      W: window.innerWidth, H: window.innerHeight,
      px: window.innerWidth / 2, mouseX: null, tilt: 0,
      items: [], score: 0, over: false,
      baseSpeed: 3.6, spawnGap: 700, spawnT: 400,
      last: performance.now()
    };
    scoreEl.textContent = '0';
    hiscoreEl.textContent = 'Record · ' + (localStorage.getItem('nekoBestScore') || '0');
  }

  window.openNekoGame = function () {
    reset();
    overlay.classList.add('active');
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  };

  window.closeNekoGame = function () {
    overlay.classList.remove('active');
    document.getElementById('neko-gameover').classList.remove('active');
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    field.innerHTML = '';
    st = null;
  };

  window.restartNekoGame = function () {
    reset();
  };

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('active')) return;
    if (e.code === 'Escape') { closeNekoGame(); return; }
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') e.preventDefault();
    keys[e.code] = true;
  });
  document.addEventListener('keyup', function (e) { keys[e.code] = false; });
  overlay.addEventListener('mousemove', function (e) { if (st) st.mouseX = e.clientX; });
  overlay.addEventListener('touchmove', function (e) {
    if (st && e.touches.length) st.mouseX = e.touches[0].clientX;
  }, { passive: true });
  window.addEventListener('resize', function () {
    if (st) { st.W = window.innerWidth; st.H = window.innerHeight; }
  });
})();

// ── JEU CACHÉ : LE CONDUCTEUR ──
// 6 manches : le train entre par la gauche, un appui freine (décélération constante),
// le score dépend de la distance entre le nez du train et la ligne d'arrêt.
// Entre deux manches, le train repart de la gare ; la pluie rend les rails glissants.
(function initCondGame() {
  const overlay = document.getElementById('cond-overlay');
  const trainEl = document.getElementById('cond-train');
  if (!overlay || !trainEl) return;
  const $ = id => document.getElementById(id);
  const catEl = $('cond-cat'), scoreEl = $('cond-score'), roundEl = $('cond-round'), resultEl = $('cond-result');
  const chipEl = $('cond-chip'), fxEl = $('cond-fx'), needle = $('cond-needle'), arc = $('cond-arc');
  const speedEl = $('cond-speed'), lamp = $('cond-brakelamp');
  const markerEl = overlay.querySelector('.cond-marker'), signEl = overlay.querySelector('.cond-sign');

  // Manches : vitesse (largeurs d'écran / s), position de la ligne (fraction), rails mouillés
  const ROUNDS = [
    { v: 0.30, m: 0.62, wet: false }, { v: 0.38, m: 0.58, wet: false }, { v: 0.46, m: 0.66, wet: false },
    { v: 0.50, m: 0.56, wet: true },  { v: 0.58, m: 0.64, wet: true },  { v: 0.68, m: 0.60, wet: false },
  ];
  const DECEL = 0.55;                     // largeurs d'écran / s² (identique à toutes les manches)
  const KMH = 120;                        // 1 largeur d'écran/s ≈ 120 km/h (affichage)
  const METERS = 40;                      // 1 largeur d'écran ≈ 40 m (distance affichée)
  let st = null, raf = null, timer = null, sparks = [];

  function layout() {
    const W = window.innerWidth;
    const trainW = Math.min(W * 0.42, 520);
    trainEl.style.width = trainW + 'px';
    return { W, H: window.innerHeight, trainW };
  }
  function placeMarker(frac) {
    st.markerX = Math.round(st.W * frac);
    markerEl.style.left = st.markerX + 'px';
    signEl.style.left = (st.markerX + 60) + 'px';
    catEl.style.left = (st.markerX + 14) + 'px';
  }
  function setSpeedUI(v) {
    const kmh = st.W ? Math.round(v / st.W * KMH) : 0;
    speedEl.textContent = kmh;
    const f = Math.min(kmh / 100, 1);
    needle.setAttribute('transform', 'rotate(' + (-90 + f * 180) + ' 60 62)');
    arc.style.strokeDashoffset = 151 - f * 151;
  }
  function chip(text, ms) {
    chipEl.textContent = text;
    chipEl.classList.add('show');
    clearTimeout(chip.t);
    chip.t = setTimeout(() => chipEl.classList.remove('show'), ms);
  }
  function showResult(title, sub) {
    resultEl.innerHTML = title + (sub ? '<small>' + sub + '</small>' : '');
    resultEl.classList.add('show');
  }
  function spawnPoints(n, x, y) {
    const el = document.createElement('div');
    el.className = 'cond-points';
    el.textContent = '+' + n;
    el.style.left = (x - 18) + 'px'; el.style.top = y + 'px';
    fxEl.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
  function spawnPetals(x, y) {
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('div');
      p.className = 'cond-petal';
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.setProperty('--dx', (Math.random() - 0.5) * 220 + 'px');
      p.style.setProperty('--dy', (-60 - Math.random() * 160) + 'px');
      p.style.animationDelay = (Math.random() * 0.2) + 's';
      fxEl.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    }
  }
  function spawnSpark(x) {
    const el = document.createElement('div');
    el.className = 'cond-spark';
    fxEl.appendChild(el);
    sparks.push({ el, x, y: st.H - 121, vx: -(80 + Math.random() * 160), vy: -(40 + Math.random() * 120), life: 0.35 });
  }
  function updateSparks(dt) {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 500 * dt;
      if (s.life <= 0) { s.el.remove(); sparks.splice(i, 1); continue; }
      s.el.style.transform = 'translate(' + s.x + 'px,' + s.y + 'px)';
      s.el.style.opacity = Math.min(1, s.life * 4);
    }
  }

  function startRound() {
    const r = ROUNDS[st.round];
    Object.assign(st, layout());
    placeMarker(r.m);
    st.decel = DECEL * st.W;
    st.vMax = r.v * st.W;
    st.v = 0;
    st.x = -st.trainW - 40;
    st.phase = 'wait';
    st.waitT = 1.1;
    overlay.classList.toggle('wet', r.wet);
    roundEl.textContent = 'Manche ' + (st.round + 1) + ' / ' + ROUNDS.length;
    chip('Manche ' + (st.round + 1) + ' · ' + Math.round(r.v * KMH) + ' km/h' + (r.wet ? ' · 🌧' : ''), 1500);
    resultEl.classList.remove('show');
    trainEl.classList.remove('braking'); lamp.classList.remove('on');
    markerEl.classList.remove('hit');
    catEl.classList.remove('boarded'); catEl.style.transform = '';
    trainEl.style.transform = 'translateX(' + st.x + 'px)';
    setSpeedUI(0);
  }

  function scoreStop() {
    const nose = st.x + st.trainW;
    const err = (nose - st.markerX) / st.W;      // > 0 : trop loin, < 0 : trop court
    const a = Math.abs(err);
    const pts = a <= 0.004 ? 100 : Math.max(0, Math.round((1 - (a - 0.004) / 0.096) * 100 / 5) * 5);
    const meters = a * METERS;
    let title = pts === 100 ? 'Pile sur la ligne !' : pts >= 80 ? 'Très bien' : pts >= 50 ? 'Pas mal' : pts > 0 ? 'Approximatif…' : 'Raté';
    let dist = meters < 1 ? Math.round(meters * 100) + ' cm' : meters.toFixed(1).replace('.', ',') + ' m';
    let sub = pts === 100 ? 'Tout le monde à bord' : 'Arrêté à ' + dist + (err > 0 ? ' après la ligne' : ' avant la ligne');
    endRound(pts, title, sub);
  }

  function endRound(pts, title, sub) {
    st.phase = 'result';
    st.total += pts;
    scoreEl.textContent = st.total;
    scoreEl.classList.remove('neko-bump'); void scoreEl.offsetWidth; scoreEl.classList.add('neko-bump');
    showResult(title, sub);
    lamp.classList.remove('on');
    if (pts > 0) spawnPoints(pts, st.markerX, st.H * 0.5);
    if (pts >= 70) {
      markerEl.classList.add('hit');
      const nose = st.x + st.trainW;
      catEl.style.transform = 'translateX(' + Math.round(nose - st.trainW * 0.22 - (st.markerX + 14)) + 'px)';
      catEl.classList.add('boarded');
    }
    if (pts >= 90) spawnPetals(st.markerX, st.H - 240);
    clearTimeout(timer);
    timer = setTimeout(() => { if (st) { st.phase = 'depart'; st.v = 0; } }, 1500);
  }

  function tick(now) {
    if (!st) return;
    const dt = Math.min((now - st.last) / 1000, 0.1);
    st.last = now;
    if (st.phase === 'wait') {
      st.waitT -= dt;
      if (st.waitT <= 0) { st.phase = 'run'; st.v = st.vMax; }
    } else if (st.phase === 'run') {
      st.x += st.v * dt;
      if (st.x + st.trainW > st.W + 40) endRound(0, 'Il ne s\'est pas arrêté !', 'Espace ou clic pour freiner');
    } else if (st.phase === 'brake') {
      st.v = Math.max(0, st.v - st.decel * dt);
      st.x += st.v * dt;
      if (st.v > 0 && sparks.length < 24 && Math.random() < 0.5) { spawnSpark(st.x + st.trainW * 0.12); spawnSpark(st.x + st.trainW * 0.62); }
      if (st.v === 0) { trainEl.classList.remove('braking'); scoreStop(); }
    } else if (st.phase === 'depart') {
      st.v = Math.min(st.v + st.W * 1.2 * dt, st.W * 0.9);
      st.x += st.v * dt;
      if (st.x > st.W + 20) { st.round++; if (st.round >= ROUNDS.length) gameOver(); else startRound(); }
    }
    if (st.phase !== 'wait') setSpeedUI(st.v);
    trainEl.style.transform = 'translateX(' + st.x + 'px)';
    updateSparks(dt);
    raf = requestAnimationFrame(tick);
  }

  function brake() {
    if (!st || st.phase !== 'run') return;
    st.phase = 'brake';
    trainEl.classList.add('braking'); lamp.classList.add('on');
  }

  function gameOver() {
    st.phase = 'over';
    const max = ROUNDS.length * 100;
    const best = Math.max(st.total, parseInt(localStorage.getItem('condBestScore') || '0', 10));
    localStorage.setItem('condBestScore', String(best));
    const ratio = st.total / max;
    const stars = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : ratio >= 0.3 ? 1 : 0;
    $('cond-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    $('cond-verdict').textContent = stars === 3 ? 'Chef de gare !' : stars === 2 ? 'Conducteur confirmé' : stars === 1 ? 'Apprenti prometteur' : 'Encore un peu d\'entraînement…';
    $('cond-final').textContent = st.total;
    $('cond-best').textContent = best;
    $('cond-gameover').classList.add('active');
  }

  function reset() {
    $('cond-gameover').classList.remove('active');
    sparks.forEach(s => s.el.remove()); sparks = [];
    fxEl.innerHTML = '';
    st = { round: 0, total: 0, phase: 'wait', x: 0, v: 0, vMax: 0, decel: 0, W: 0, H: 0, trainW: 0, markerX: 0, waitT: 0, last: performance.now() };
    scoreEl.textContent = '0';
    startRound();
  }

  window.openCondGame = function () {
    reset();
    overlay.classList.add('active');
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  };
  window.closeCondGame = function () {
    overlay.classList.remove('active', 'wet');
    $('cond-gameover').classList.remove('active');
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    clearTimeout(timer); clearTimeout(chip.t);
    st = null;
  };
  window.restartCondGame = function () { reset(); };

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('active')) return;
    if (e.code === 'Escape') { closeCondGame(); return; }
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowDown') { e.preventDefault(); brake(); }
  });
  overlay.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button') || e.target.closest('#cond-gameover')) return;
    brake();
  });
  window.addEventListener('resize', function () { if (st && st.phase !== 'over') { Object.assign(st, layout()); placeMarker(ROUNDS[st.round].m); } });
})();

// ── PENDANT UNE PARTIE : la page derrière l'overlay est masquée et figée ──
// (le SVG de la bannière et ses animations coûtent cher ; un jeu doit tourner à 60 fps)
(function pausePageDuringGames() {
  const wrap = (name, on) => {
    const fn = window[name];
    if (typeof fn !== 'function') return;
    window[name] = function () { document.body.classList.toggle('game-open', on); return fn.apply(this, arguments); };
  };
  ['openBaguetteGame', 'openNekoGame', 'openCondGame'].forEach(n => wrap(n, true));
  ['closeBaguetteGame', 'closeNekoGame', 'closeCondGame'].forEach(n => wrap(n, false));
})();

// ── EASTER EGG : PLUIE DE CŒURS ──
// Taper les lettres L-O-V-E (hors champs de formulaire), ou toucher trois fois
// rapidement le "&" du héros sur mobile : une pluie de cœurs traverse l'écran.
(function initLoveEasterEgg() {
  const layer = document.getElementById('love-rain');
  if (!layer) return;
  const COLORS = ['#EA5A4E', '#F09084', '#EAB4D2', '#CC5448', '#FF62C8'];
  const HEART = '<svg viewBox="0 0 32 29" xmlns="http://www.w3.org/2000/svg"><path d="M16 29 3.2 16.6C-1 12.5-1 6.1 3.2 2.3 7-1.2 12.6-.6 16 3.4 19.4-.6 25-1.2 28.8 2.3c4.2 3.8 4.2 10.2 0 14.3Z" fill="COLOR"/></svg>';
  let raining = false;

  function rain() {
    if (raining) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    raining = true;
    const N = 110;
    for (let i = 0; i < N; i++) {
      setTimeout(() => {
        const h = document.createElement('div');
        h.className = 'love-heart';
        const size = 14 + Math.random() * 26;
        h.style.width = size + 'px'; h.style.height = size * 0.9 + 'px';
        h.style.left = (Math.random() * 100) + 'vw';
        h.style.setProperty('--d', (3.4 + Math.random() * 3) + 's');
        h.style.setProperty('--s', (1.2 + Math.random() * 1.4) + 's');
        h.style.setProperty('--r', (Math.random() * 360 - 180) + 'deg');
        h.style.opacity = (0.75 + Math.random() * 0.25).toFixed(2);
        h.innerHTML = HEART.replace('COLOR', COLORS[Math.floor(Math.random() * COLORS.length)]);
        h.addEventListener('animationend', () => h.remove(), { once: true });
        layer.appendChild(h);
      }, i * 28);
    }
    setTimeout(() => { raining = false; }, N * 28 + 1000);
  }

  // Clavier : les 4 dernières lettres tapées forment "love"
  let typed = '';
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed === 'love') { typed = ''; rain(); }
  });

  // Tactile : trois tapes rapides sur le "&" du héros
  const amp = document.querySelector('.hero-amp');
  if (amp) {
    let taps = [];
    amp.addEventListener('pointerdown', () => {
      const now = Date.now();
      taps = taps.filter(t => now - t < 900).concat(now);
      if (taps.length >= 3) { taps = []; rain(); }
    });
  }
  window.loveRain = rain;
})();
