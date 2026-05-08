// ════════════════════════════════════════════════════
//  Load Sahyog — Main Script
//  Depends on: firebaseconfig.js (loaded first)
//  Chatbot is handled separately by: chatbot.js
// ════════════════════════════════════════════════════

// ── Flask Backend URL ─────────────────────────────────
const BACKEND_URL = "http://localhost:5000";

// ── Scroll Reveal ─────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Navbar shadow on scroll ───────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.boxShadow =
    window.scrollY > 20 ? '0 4px 24px rgba(0,0,0,.08)' : '';
});

// ── Smooth scroll for nav links ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── Hamburger menu ────────────────────────────────────
document.getElementById('ham').addEventListener('click', function () {
  const links = document.querySelector('.nav-links');
  if (links.style.display === 'flex') {
    links.style.display = '';
  } else {
    Object.assign(links.style, {
      display: 'flex', flexDirection: 'column', position: 'absolute',
      top: '70px', left: '0', right: '0', background: 'white',
      padding: '16px 24px', borderBottom: '1px solid #e5e7eb',
      zIndex: '998', boxShadow: '0 8px 24px rgba(0,0,0,.08)'
    });
  }
});

// ── Toast helper ──────────────────────────────────────
function showToast(icon, title, msg) {
  const t = document.getElementById('toast');
  t.querySelector('.toast-icon').textContent = icon;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMsg').textContent = msg || '';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4500);
}

// ── Role switcher (Client / Truck Owner) ─────────────
window.switchRole = function switchRole(role) {
  const clientForm = document.getElementById('clientForm');
  const truckForm  = document.getElementById('truckForm');
  const btnClient  = document.getElementById('roleClient');
  const btnTruck   = document.getElementById('roleTruck');
  if (role === 'client') {
    clientForm.style.display = '';
    truckForm.style.display  = 'none';
    btnClient.classList.add('active');
    btnTruck.classList.remove('active');
  } else {
    clientForm.style.display = 'none';
    truckForm.style.display  = '';
    btnTruck.classList.add('active');
    btnClient.classList.remove('active');
  }
}

// ── Contact Form (Client) ─────────────────────────────
document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name     = document.getElementById('name').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const email    = document.getElementById('email').value.trim();
  const company  = document.getElementById('company').value.trim();
  const pickup   = document.getElementById('pickup').value.trim();
  const delivery = document.getElementById('delivery').value.trim();
  const cargo    = document.getElementById('cargo').value;
  const weight   = document.getElementById('weight').value;
  const message  = document.getElementById('message').value.trim();

  if (!name || !phone || !email || !pickup || !delivery) {
    alert('Please fill in all required fields.');
    return;
  }

  const btnText   = document.getElementById('btnText');
  const submitBtn = document.getElementById('submitBtn');
  btnText.textContent = '⏳ Sending...';
  submitBtn.disabled  = true;

  const data = { userType: 'client', name, phone, email, company, pickup, delivery, cargo, weight, message };

  // ── Save to Firestore via FirestoreService (from firebaseconfig.js) ──
  try {
    const result = await window.firestoreService.addDocument(window.COLLECTIONS.ENQUIRIES, data);
    if (result.success) data.firebaseId = result.id;
  } catch (err) {
    console.warn('Firestore error:', err);
  }

  // ── Send to Flask backend for email notification ──
  try {
    const res = await fetch(`${BACKEND_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.status === 'success') {
      showToast('✅', 'Enquiry Sent!', "We'll contact you within 2 hours.");
    } else {
      throw new Error(result.message);
    }
  } catch (err) {
    console.warn('Backend error:', err);
    showToast('✅', 'Enquiry Received!', "We'll get back to you soon.");
  }

  document.getElementById('contactForm').reset();
  btnText.textContent = '🚀 Send Enquiry & Get Quote';
  submitBtn.disabled  = false;
});

// ── Truck Owner Registration Form ─────────────────────
document.getElementById('truckOwnerForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const tBtn = document.getElementById('truckSubmitBtn');
  const tTxt = document.getElementById('truckBtnText');
  tTxt.textContent = '⏳ Submitting...';
  tBtn.disabled    = true;

  const data = {
    userType:     'truck_owner',
    name:         document.getElementById('t-name').value.trim(),
    phone:        document.getElementById('t-phone').value.trim(),
    email:        document.getElementById('t-email').value.trim(),
    baseLocation: document.getElementById('t-base').value.trim(),
    truckType:    document.getElementById('t-trucktype').value,
    numTrucks:    document.getElementById('t-numtrucks').value,
    regNo:        document.getElementById('t-regno').value.trim(),
    dlNo:         document.getElementById('t-dlno').value.trim(),
    routes:       document.getElementById('t-routes').value.trim(),
    experience:   document.getElementById('t-exp').value,
    message:      document.getElementById('t-message').value.trim()
  };

  // Save to TRUCKS collection via FirestoreService
  try {
    await window.firestoreService.addDocument(window.COLLECTIONS.TRUCKS, data);
  } catch (err) {
    console.warn('Firestore error:', err);
  }

  // Also notify Flask backend
  try {
    await fetch(`${BACKEND_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn('Backend error:', err);
  }

  showToast('🚛', 'Registration Received!', 'Our team will call you within 24 hours.');
  document.getElementById('truckOwnerForm').reset();
  tTxt.textContent = '🚛 Register as Truck Partner';
  tBtn.disabled    = false;
});

// ── Star Rating (Overall) ─────────────────────────────
let overallRating = 0;
const ratingLabels = ['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent 🤩'];

document.querySelectorAll('#starRating .star').forEach(star => {
  star.addEventListener('click', function () {
    overallRating = +this.dataset.val;
    document.querySelectorAll('#starRating .star').forEach((s, i) => {
      s.classList.toggle('active', i < overallRating);
    });
    document.getElementById('ratingHint').textContent = ratingLabels[overallRating];
  });
  star.addEventListener('mouseenter', function () {
    const v = +this.dataset.val;
    document.querySelectorAll('#starRating .star').forEach((s, i) => s.classList.toggle('hover', i < v));
  });
  star.addEventListener('mouseleave', function () {
    document.querySelectorAll('#starRating .star').forEach(s => s.classList.remove('hover'));
  });
});

// ── Mini Stars (Category Ratings) ────────────────────
document.querySelectorAll('.mini-stars').forEach(container => {
  for (let i = 1; i <= 5; i++) {
    (function (val) {
      const s = document.createElement('span');
      s.className = 'mini-star'; s.textContent = '★'; s.dataset.val = val;
      s.addEventListener('click', function () {
        container.querySelectorAll('.mini-star').forEach((st, idx) => st.classList.toggle('active', idx < val));
      });
      s.addEventListener('mouseenter', function () {
        container.querySelectorAll('.mini-star').forEach((st, idx) => st.classList.toggle('hover', idx < val));
      });
      s.addEventListener('mouseleave', function () {
        container.querySelectorAll('.mini-star').forEach(st => st.classList.remove('hover'));
      });
      container.appendChild(s);
    })(i);
  }
});

// ── Recommend Buttons ─────────────────────────────────
let recommendVal = '';
window.selectRecommend = function selectRecommend(btn, val) {
  recommendVal = val;
  document.querySelectorAll('.rec-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

// ── Feedback Form ─────────────────────────────────────
document.getElementById('feedbackForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const fbBtn = document.querySelector('#feedbackForm .submit-btn');
  const fbTxt = document.getElementById('fbBtnText');
  fbTxt.textContent = '⏳ Submitting...';
  fbBtn.disabled    = true;

  const data = {
    name:      document.getElementById('fb-name').value.trim(),
    contact:   document.getElementById('fb-contact').value.trim(),
    role:      document.getElementById('fb-role').value,
    service:   document.getElementById('fb-service').value,
    message:   document.getElementById('fb-message').value.trim(),
    rating:    overallRating,
    recommend: recommendVal
  };

  // Save to FEEDBACKS collection via FirestoreService
  try {
    await window.firestoreService.addDocument(window.COLLECTIONS.FEEDBACKS, data);
  } catch (err) {
    console.warn('Firestore error:', err);
  }

  // Notify Flask backend
  try {
    await fetch(`${BACKEND_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn('Backend error:', err);
  }

  showToast('🎉', 'Feedback Received!', 'Thank you for helping us improve.');
  document.getElementById('feedbackForm').reset();
  overallRating = 0;
  document.querySelectorAll('#starRating .star').forEach(s => s.classList.remove('active'));
  document.getElementById('ratingHint').textContent = 'Click to rate';
  document.querySelectorAll('.mini-star').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.rec-btn').forEach(b => b.classList.remove('selected'));
  fbTxt.textContent = '📤 Submit Feedback';
  fbBtn.disabled    = false;
});
