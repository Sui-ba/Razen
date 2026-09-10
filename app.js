// ========== CONFIG ==========
// Discord Webhook (рекомендуется)
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1546865666903113840/nKp6_ZQe6CY7RFt8C9bdTZueLtQxl1YrEBFLPtnT_Mo1I2D--8Fd4hrpiLeD5jsMf6R2";

// Telegram (опционально)
const TELEGRAM_BOT_TOKEN = "";
const TELEGRAM_CHAT_ID = "";

// Пароль админки — ЗАДАЙТЕ СВОЙ (хранится только здесь, в README его нет)
const ADMIN_PASS = "CHANGE_ME_TO_YOUR_STRONG_PASSWORD";

// ========== Helpers ==========
const STORAGE_ORDERS = "ryzenhub_orders_v2";
const STORAGE_USERS = "ryzenhub_users_v2";
const STORAGE_SESSION = "ryzenhub_session";

async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function genPassword(len = 10) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let p = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) p += chars[arr[i] % chars.length];
  return p;
}

function genId() {
  return "RH-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function nowStr() {
  return new Date().toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function normalizePhone(p) {
  return (p || "").replace(/\D/g, "").replace(/^8/, "7");
}

function normalizeLogin(login) {
  login = (login || "").trim().toLowerCase();
  if (login.includes("@")) return login;
  return normalizePhone(login);
}

// ========== Data: Ready Builds ==========
const builds = [
  {
    id: 1,
    title: "Офисный старт",
    category: ["office", "budget"],
    price: "от 28 000 ₽",
    desc: "Документы, браузер, онлайн-уроки, Zoom. Тихая и надёжная система.",
    specs: ["Процессор: Intel Core i3 / Ryzen 3", "ОЗУ: 16 ГБ DDR4", "Накопитель: 512 ГБ SSD", "Видео: встроенная графика", "Корпус: компактный, тихий"]
  },
  {
    id: 2,
    title: "Учёба + лёгкие игры",
    category: ["office", "budget", "gaming"],
    price: "от 45 000 ₽",
    desc: "Учёба, работа и игры уровня CS2, Valorant, GTA V на средних настройках.",
    specs: ["Процессор: Ryzen 5 5500 / i5", "ОЗУ: 16 ГБ DDR4", "Видеокарта: GTX 1650 / RTX 3050", "SSD: 512 ГБ–1 ТБ", "БП: 500–550 Вт"]
  },
  {
    id: 3,
    title: "Игровой Full HD",
    category: ["gaming"],
    price: "от 75 000 ₽",
    desc: "Комфортные 60–100+ FPS в современных AAA на Full HD / высоких настройках.",
    specs: ["Процессор: Ryzen 5 5600 / i5-12400F", "ОЗУ: 16–32 ГБ DDR4", "Видеокарта: RTX 3060 / 4060", "SSD: 1 ТБ NVMe", "БП: 650 Вт 80+ Bronze"]
  },
  {
    id: 4,
    title: "Игровой 1440p / стрим",
    category: ["gaming", "work"],
    price: "от 110 000 ₽",
    desc: "Игры в 1440p + стрим / монтаж. Мощный запас на будущее.",
    specs: ["Процессор: Ryzen 7 5700X / i7", "ОЗУ: 32 ГБ DDR4/DDR5", "Видеокарта: RTX 4070", "SSD: 1–2 ТБ NVMe", "БП: 750 Вт 80+ Gold"]
  },
  {
    id: 5,
    title: "Монтаж / 3D / работа",
    category: ["work"],
    price: "от 95 000 ₽",
    desc: "Premiere, After Effects, Blender, CAD. Быстрый рендер и много ядер.",
    specs: ["Процессор: Ryzen 9 / i7–i9", "ОЗУ: 32–64 ГБ", "Видеокарта: RTX 4060–4070 Ti", "SSD: 2 ТБ NVMe", "Охлаждение: хорошее"]
  },
  {
    id: 6,
    title: "Максимальный / 4K",
    category: ["gaming", "work"],
    price: "от 160 000 ₽",
    desc: "4K-гейминг, тяжёлый монтаж, максимальный комфорт на годы вперёд.",
    specs: ["Процессор: Ryzen 9 7900X / i9", "ОЗУ: 64 ГБ DDR5", "Видеокарта: RTX 4080 / 4090", "SSD: 2–4 ТБ NVMe", "БП: 850–1000 Вт Platinum"]
  }
];

const STATUSES = [
  { id: "new", label: "Новая", color: "#00d4ff" },
  { id: "review", label: "На рассмотрении", color: "#a78bfa" },
  { id: "in_progress", label: "В работе", color: "#fbbf24" },
  { id: "waiting_parts", label: "Ждём запчасти", color: "#fb923c" },
  { id: "ready", label: "Готово к выдаче", color: "#34d399" },
  { id: "done", label: "Завершена", color: "#30d158" },
  { id: "cancelled", label: "Отменена", color: "#f87171" }
];

// ========== Storage layer ==========
function getOrders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_ORDERS) || "[]"); } catch { return []; }
}
function saveOrders(list) {
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(list));
}
function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_USERS) || "{}"); } catch { return {}; }
}
function saveUsers(obj) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(obj));
}

// ========== Builds UI ==========
function renderBuilds(filter = "all") {
  const grid = document.getElementById("buildsGrid");
  if (!grid) return;
  const filtered = filter === "all" ? builds : builds.filter(b => b.category.includes(filter));
  grid.innerHTML = filtered.map(b => `
    <article class="build-card" data-id="${b.id}">
      <div class="build-price">${b.price}</div>
      <h3>${b.title}</h3>
      <p class="build-desc">${b.desc}</p>
      <ul class="build-specs">${b.specs.map(s => `<li>${s}</li>`).join("")}</ul>
      <button class="btn btn-primary btn-block build-order-btn" data-title="${b.title}">Заказать эту сборку</button>
    </article>
  `).join("");
  grid.querySelectorAll(".build-order-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
      const details = document.getElementById("details");
      if (details) details.value = "Интересует готовая сборка: " + btn.dataset.title;
    });
  });
}

// ========== Order form multi-step ==========
function showStep(n) {
  document.querySelectorAll(".order-step").forEach(el => el.classList.remove("active"));
  document.getElementById("step" + n)?.classList.add("active");
  document.querySelectorAll(".step-indicator span").forEach((s, i) => {
    s.classList.toggle("done", i + 1 < n);
    s.classList.toggle("current", i + 1 === n);
  });
}

async function submitOrder() {
  const name = document.getElementById("name")?.value.trim();
  const city = document.getElementById("city")?.value.trim() || "Томск";
  const phone = document.getElementById("phone")?.value.trim();
  const email = document.getElementById("email")?.value.trim() || "";
  const telegram = document.getElementById("telegram")?.value.trim() || "—";
  const budget = document.getElementById("budget")?.value || "—";
  const details = document.getElementById("details")?.value.trim() || "—";
  const services = Array.from(document.querySelectorAll('input[name="service"]:checked')).map(c => c.value);

  if (!name || !phone) {
    alert("Пожалуйста, заполните имя и телефон.");
    return;
  }
  if (services.length === 0) {
    alert("Выберите хотя бы одну услугу.");
    return;
  }

  const order = {
    id: genId(),
    date: nowStr(),
    name, city, phone, email, telegram,
    services, budget, details,
    status: "new",
    statusHistory: [{ status: "new", at: nowStr(), note: "Заявка создана" }],
    messages: []
  };

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  const loginKey = normalizeLogin(email || phone);
  const users = getUsers();
  let tempPass = null;
  let isNewUser = false;

  if (!users[loginKey]) {
    isNewUser = true;
    tempPass = genPassword(10);
    const hash = await sha256(tempPass);
    users[loginKey] = {
      login: loginKey,
      phone: normalizePhone(phone),
      email: email || null,
      name,
      passwordHash: hash,
      mustChangePassword: true,
      createdAt: nowStr(),
      orderIds: [order.id]
    };
  } else {
    if (!users[loginKey].orderIds.includes(order.id)) {
      users[loginKey].orderIds.push(order.id);
    }
  }
  saveUsers(users);

  if (DISCORD_WEBHOOK) {
    try {
      await fetch(DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "🆕 Новая заявка RyzenHub",
            color: 55551,
            fields: [
              { name: "ID", value: order.id, inline: true },
              { name: "Дата", value: order.date, inline: true },
              { name: "Имя", value: order.name, inline: true },
              { name: "Город", value: order.city, inline: true },
              { name: "Телефон", value: order.phone, inline: true },
              { name: "Email", value: order.email || "—", inline: true },
              { name: "Telegram/VK", value: order.telegram, inline: true },
              { name: "Услуги", value: order.services.join(", ") },
              { name: "Бюджет", value: order.budget },
              { name: "Детали", value: order.details }
            ]
          }]
        })
      });
    } catch (e) { console.warn("Discord failed", e); }
  }
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const text = `🆕 *Новая заявка RyzenHub*\nID: ${order.id}\nИмя: ${order.name}\nТел: ${order.phone}\nУслуги: ${order.services.join(", ")}\nБюджет: ${order.budget}`;
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "Markdown" })
      });
    } catch (e) { console.warn("TG failed", e); }
  }

  document.getElementById("orderId").textContent = order.id;
  const credBox = document.getElementById("credBox");
  if (isNewUser && tempPass && credBox) {
    credBox.style.display = "block";
    document.getElementById("credLogin").textContent = email || phone;
    document.getElementById("credPass").textContent = tempPass;
  } else if (credBox) {
    credBox.style.display = "none";
  }
  showStep(4);
}

// ========== Cabinet auth ==========
async function loginUser(login, password) {
  const key = normalizeLogin(login);
  const users = getUsers();
  const user = users[key];
  if (!user) return { ok: false, msg: "Пользователь не найден. Оставьте заявку — аккаунт создастся автоматически." };
  const hash = await sha256(password);
  if (hash !== user.passwordHash) return { ok: false, msg: "Неверный пароль" };
  sessionStorage.setItem(STORAGE_SESSION, JSON.stringify({ login: key, at: Date.now() }));
  return { ok: true, user, mustChange: !!user.mustChangePassword };
}

function logoutUser() {
  sessionStorage.removeItem(STORAGE_SESSION);
}

function getSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(STORAGE_SESSION) || "null");
    if (!s || !s.login) return null;
    if (Date.now() - s.at > 7 * 24 * 60 * 60 * 1000) {
      logoutUser();
      return null;
    }
    return s;
  } catch { return null; }
}

async function changePassword(login, oldPass, newPass) {
  const key = normalizeLogin(login);
  const users = getUsers();
  const user = users[key];
  if (!user) return false;
  const oldHash = await sha256(oldPass);
  if (oldHash !== user.passwordHash) return false;
  user.passwordHash = await sha256(newPass);
  user.mustChangePassword = false;
  saveUsers(users);
  return true;
}

// ========== Admin helpers ==========
window.RyzenHubAdmin = {
  getOrders,
  saveOrders,
  getUsers,
  STATUSES,
  checkPass: async (pass) => {
    const attempts = parseInt(sessionStorage.getItem("admin_attempts") || "0", 10);
    if (attempts > 8) {
      alert("Слишком много попыток. Подождите немного.");
      return false;
    }
    const ok = pass === ADMIN_PASS;
    if (!ok) sessionStorage.setItem("admin_attempts", String(attempts + 1));
    else sessionStorage.removeItem("admin_attempts");
    return ok;
  },
  setStatus: (orderId, status, note = "") => {
    const orders = getOrders();
    const o = orders.find(x => x.id === orderId);
    if (!o) return false;
    o.status = status;
    if (!o.statusHistory) o.statusHistory = [];
    o.statusHistory.push({ status, at: nowStr(), note });
    saveOrders(orders);
    return true;
  },
  addMessage: (orderId, text, from = "admin") => {
    const orders = getOrders();
    const o = orders.find(x => x.id === orderId);
    if (!o) return false;
    if (!o.messages) o.messages = [];
    o.messages.push({ from, text, at: nowStr() });
    saveOrders(orders);
    return true;
  }
};

// ========== Init ==========
document.addEventListener("DOMContentLoaded", () => {
  renderBuilds();
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderBuilds(btn.dataset.filter);
    });
  });

  document.getElementById("toStep2")?.addEventListener("click", () => {
    const name = document.getElementById("name")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    if (!name || !phone) { alert("Заполните имя и телефон"); return; }
    showStep(2);
  });
  document.getElementById("toStep3")?.addEventListener("click", () => {
    const checked = document.querySelectorAll('input[name="service"]:checked');
    if (checked.length === 0) { alert("Выберите хотя бы одну услугу"); return; }
    showStep(3);
  });
  document.getElementById("backTo1")?.addEventListener("click", () => showStep(1));
  document.getElementById("backTo2")?.addEventListener("click", () => showStep(2));
  document.getElementById("submitOrder")?.addEventListener("click", (e) => {
    e.preventDefault();
    submitOrder();
  });
  document.getElementById("newOrderBtn")?.addEventListener("click", () => {
    document.getElementById("orderForm")?.reset();
    showStep(1);
  });

  const phoneInput = document.getElementById("phone");
  phoneInput?.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.startsWith("8")) v = "7" + v.slice(1);
    if (v.startsWith("7")) {
      let f = "+7";
      if (v.length > 1) f += " (" + v.slice(1, 4);
      if (v.length >= 4) f += ") " + v.slice(4, 7);
      if (v.length >= 7) f += "-" + v.slice(7, 9);
      if (v.length >= 9) f += "-" + v.slice(9, 11);
      e.target.value = f;
    }
  });

  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  mobileMenuBtn?.addEventListener("click", () => mobileMenu?.classList.toggle("open"));
  mobileMenu?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mobileMenu.classList.remove("open")));
});
