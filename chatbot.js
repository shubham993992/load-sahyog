// ════════════════════════════════════════════════════
//  Load Sahyog — Chatbot
//  All events wired via DOMContentLoaded (no inline onclick)
// ════════════════════════════════════════════════════

let chatOpen    = false;
let chatHistory = [];

// ── Toggle open/close ─────────────────────────────────
function toggleChat() {
  chatOpen = !chatOpen;
  const win   = document.getElementById('chatWindow');
  const icon  = document.getElementById('chatFabIcon');
  const badge = document.getElementById('chatBadge');

  if (chatOpen) {
    win.classList.add('open');
    icon.textContent        = '✕';
    badge.style.display     = 'none';
    if (chatHistory.length === 0) addBotGreeting();
  } else {
    win.classList.remove('open');
    icon.textContent = '💬';
  }
}

// ── Opening greeting ──────────────────────────────────
function addBotGreeting() {
  addMsg('bot', "👋 Hello! Welcome to Load Sahyog. I'm your transport assistant. Ask me about pricing, tracking, services, or anything else!");
}

// ── Add a message bubble ──────────────────────────────
function addMsg(role, text) {
  const box = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;

  if (role === 'bot') {
    div.innerHTML = `<div class="chat-msg-avatar">🚛</div><div class="chat-bubble">${text}</div>`;
  } else {
    div.innerHTML = `<div class="chat-bubble">${text}</div>`;
  }

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  chatHistory.push({ role: role === 'bot' ? 'assistant' : 'user', content: text });
}

// ── Typing indicator ──────────────────────────────────
function showTyping() {
  const box = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'typingIndicator';
  div.innerHTML = `<div class="chat-msg-avatar">🚛</div>
    <div class="chat-bubble chat-typing">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

// ── Keyword-based fallback responses (original logic) ─
function getBotResponse(userMsg) {
  const msg = userMsg.toLowerCase();

  if (msg.includes('price') || msg.includes('cost') || msg.includes('rate') || msg.includes('quote')) {
    return "💰 Pricing depends on distance, cargo type, and weight. For a quick estimate, please fill our contact form or call +91 98765 43210. Typical rates: ₹8-12 per km for full truck load.";
  }
  if (msg.includes('track') || msg.includes('location') || msg.includes('where is')) {
    return "📍 You can track your shipment in real-time! After booking, we provide a unique tracking link and live GPS updates every 10 minutes. Contact our support for active tracking details.";
  }
  if (msg.includes('service') || msg.includes('what do you offer')) {
    return "🚚 We offer Full Truck Load (FTL), Part Load (LTL), Cold Chain, Industrial Cargo, Express Delivery, and Warehouse Storage. Whatever your cargo needs, we've got you covered!";
  }
  if (msg.includes('cover') || msg.includes('city') || msg.includes('state')) {
    return "🇮🇳 Load Sahyog operates in 28 states and 500+ cities across India including Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad, and more.";
  }
  if (msg.includes('insurance') || msg.includes('safe') || msg.includes('damage')) {
    return "🛡️ Yes! All shipments are covered with transit insurance up to ₹25 lakh. We also verify every truck owner and provide GPS tracking for maximum security.";
  }
  if (msg.includes('how long') || msg.includes('delivery time') || msg.includes('fast')) {
    return "⏱️ Delivery time varies by distance. Typically, metro-to-metro deliveries take 2-4 days. Express delivery options available for time-critical shipments.";
  }
  if (msg.includes('contact') || msg.includes('call') || msg.includes('reach')) {
    return "📞 You can reach us at +91 98765 43210 (Mon-Sat, 8 AM-9 PM) or email info@loadsahyog.in. Fill the contact form and we'll respond within 2 hours!";
  }
  if (msg.includes('feedback') || msg.includes('suggest')) {
    return "⭐ We'd love your feedback! Please scroll to the 'Feedback' section on our website and share your experience. Every review helps us improve!";
  }
  if (msg.includes('driver') || msg.includes('truck owner') || msg.includes('register') || msg.includes('join')) {
    return "🚛 Want to join our network? Scroll to the Contact section, switch to 'Truck Owner / Driver' tab, and fill in the registration form. Our team will call you within 24 hours!";
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('namaste')) {
    return "👋 Hello! Welcome to Load Sahyog. I'm your transport assistant. Ask me about pricing, tracking, services, or anything else!";
  }
  return "🤔 Thanks for your question! For specific details, please call our support at +91 98765 43210 or fill out the contact form. I'm here to help with general inquiries about transport, pricing, and services!";
}

// ── Send message (AI-powered with keyword fallback) ───
async function sendChat() {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text) return;

  input.value = '';
  addMsg('user', text);

  const quickBtns = document.getElementById('quickBtns');
  if (quickBtns) quickBtns.style.display = 'none';

  showTyping();

  const systemPrompt = `You are Sahyog Assistant, a friendly customer support AI for Load Sahyog — India's trusted goods transport network.
Key facts:
- Connects shippers with verified truck owners across 28 Indian states and 500+ cities.
- Services: Full Truck Load (FTL), Part Load (LTL), Cold Chain, Express Delivery, Industrial Cargo, Warehousing.
- Contact: +91 98765 43210 | info@loadsahyog.in | Mon-Sat 8AM-9PM
- 500+ verified trucks, 10,000+ deliveries, cargo insurance up to ₹25 lakh included.
- GPS tracking every 10 minutes on every shipment.
- Head Office: Plot 12, Transport Nagar, Nagpur - 440013.
- Pricing: ₹8-12 per km for FTL. Final price depends on cargo type, weight, distance.
- Metro-to-metro delivery: typically 2-4 days. Express options available.
When asked for quotes, ask: pickup city, delivery city, cargo type, weight.
Be helpful, concise, friendly. Use occasional emojis. Keep replies to 2-4 sentences.
If someone wants to book, direct them to the contact form on the page or call +91 98765 43210.`;

  const messages = chatHistory.slice(-10).map(m => ({ role: m.role, content: m.content }));

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system:     systemPrompt,
        messages:   messages
      })
    });

    const data  = await res.json();
    removeTyping();
    const reply = (data.content && data.content[0])
      ? data.content[0].text
      : getBotResponse(text);
    addMsg('bot', reply);

  } catch (err) {
    removeTyping();
    // Graceful fallback to keyword bot
    setTimeout(() => addMsg('bot', getBotResponse(text)), 300);
  }
}

// ── Quick-reply button handler ────────────────────────
function sendQuick(btn) {
  const label = btn.textContent.trim().replace(/^.{1,3}\s/, '');
  document.getElementById('chatInput').value = label;
  sendChat();
}

// ── Wire ALL events after DOM is ready ───────────────
document.addEventListener('DOMContentLoaded', function () {
  // FAB open/close
  const fab = document.getElementById('chatFab');
  if (fab) fab.addEventListener('click', toggleChat);

  // Close button inside window
  const closeBtn = document.getElementById('chatClose');
  if (closeBtn) closeBtn.addEventListener('click', toggleChat);

  // Send button
  const sendBtn = document.getElementById('chatSendBtn');
  if (sendBtn) sendBtn.addEventListener('click', sendChat);

  // Enter key on input
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendChat();
    });
  }

  // Quick reply buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', function () { sendQuick(this); });
  });
});
