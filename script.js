// ── COMPTE À REBOURS ──
function updateCountdown() {
  const target = new Date('2027-06-26T15:00:00');
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) {
    document.getElementById('cd-j').textContent = '0';
    document.getElementById('cd-h').textContent = '0';
    document.getElementById('cd-m').textContent = '0';
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  document.getElementById('cd-j').textContent = days;
  document.getElementById('cd-h').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-m').textContent = String(mins).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 30000);

// ── RSVP ──
function submitRSVP() {
  const prenom = document.getElementById('rsvp-prenom').value.trim();
  const nom = document.getElementById('rsvp-nom').value.trim();
  const email = document.getElementById('rsvp-email').value.trim();
  const presence = document.getElementById('rsvp-presence').value;
  if (!prenom || !nom || !email || !presence) {
    alert('Merci de remplir tous les champs obligatoires.');
    return;
  }
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('rsvpSuccess').style.display = 'block';
}

// ── PHOTO ──
function loadPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById('photoPreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
    document.getElementById('photoPlaceholder').style.display = 'none';
    document.getElementById('photoRemove').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function removePhoto(event) {
  event.stopPropagation();
  document.getElementById('photoPreview').style.display = 'none';
  document.getElementById('photoPreview').src = '';
  document.getElementById('photoPlaceholder').style.display = 'flex';
  document.getElementById('photoRemove').style.display = 'none';
  document.getElementById('photoInput').value = '';
}

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
