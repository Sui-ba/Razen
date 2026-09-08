// ========== CONFIG ==========
// Вставьте свой Discord Webhook URL (самый простой способ получать заявки)
// Создать: Discord → Настройки сервера → Интеграции → Webhooks → Новый
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1546865666903113840/nKp6_ZQe6CY7RFt8C9bdTZueLtQxl1YrEBFLPtnT_Mo1I2D--8Fd4hrpiLeD5jsMf6R2"; // например: "https://discord.com/api/webhooks/..."

// Или Telegram (нужен bot token + chat_id)
// Создать бота: @BotFather → /newbot
// Узнать chat_id: напишите боту, потом https://api.telegram.org/bot<TOKEN>/getUpdates
const TELEGRAM_BOT_TOKEN = "";
const TELEGRAM_CHAT_ID = "";

// Пароль админки (простой, для статического сайта)
const ADMIN_PASS = "ryzen2026";

// ========== Data: Ready Builds ==========
const builds = [
  {
    id: 1,
    title: "Офисный старт",
    category: ["office", "budget"],
    price: "от 28 000 ₽",
    desc: "Документы, браузер, онлайн-уроки, Zoom. Тихая и надёжная система.",
    specs: [
      "Процессор: Intel Core i3 / Ryzen 3",
      "ОЗУ: 16 ГБ DDR4",
      "Накопитель: 512 ГБ SSD",
      "Видео: встроенная графика",
      "Корпус: компактный, тихий"
    ]
  },
  {
    id: 2,
    title: "Учёба + лёгкие игры",
    category: ["office", "budget", "gaming"],
    price: "от 45 000 ₽",
    desc: "Учёба, работа и игры уровня CS2, Valorant, GTA V на средних настройках.",
    specs: [
      "Процессор: Ryzen 5 5500 / i5",
      "ОЗУ: 16 ГБ DDR4",
      "Видеокарта: GTX 1650 / RTX 3050",
      "SSD: 512 ГБ–1 ТБ",
      "БП: 500–550 Вт"
    ]
  },
  {
    id: 3,
    title: "Игровой Full HD",
    category: ["gaming"],
    price: "от 75 000 ₽",
    desc: "Комфортные 60–100+ FPS в современных AAA на Full HD / высоких настройках.",
    specs: [
      "Процессор: Ryzen 5 5600 / i5-12400F",
      "ОЗУ: 16–32 ГБ DDR4",
      "Видеокарта: RTX 3060 / 4060",
      "SSD: 1 ТБ NVMe",
      "Охлаждение: башня / AIO"
    ]
  },
  {
    id: 4,
    title: "Игровой 1440p",
    category: ["gaming"],
    price: "от 110 000 ₽",
    desc: "Высокие/ультра настройки в 1440p, запас на будущее. Стриминг возможен.",
    specs: [
      "Процессор: Ryzen 7 5700X / i5-14600K",
      "ОЗУ: 32 ГБ DDR4/DDR5",
      "Видеокарта: RTX 4070 / 4070 Super",
      "SSD: 1–2 ТБ NVMe",
      "БП: 750 Вт Gold"
    ]
  },
  {
    id: 5,
    title: "Монтаж и стримы",
    category: ["workstation"],
    price: "от 95 000 ₽",
    desc: "Premiere, DaVinci, OBS. Быстрый рендер и стабильный стрим без просадок.",
    specs: [
      "Процессор: Ryzen 7 5700X / 7700",
      "ОЗУ: 32 ГБ",
      "Видеокарта: RTX 3060–4070",
      "SSD: 1 ТБ + HDD под проекты",
      "Хорошее охлаждение"
    ]
  },
  {
    id: 6,
    title: "Максимум / 4K",
    category: ["gaming", "workstation"],
    price: "от 180 000 ₽",
    desc: "Топовые игры в 4K, тяжёлый монтаж, 3D. Конфигурация под ваши задачи.",
    specs: [
      "Процессор: Ryzen 7/9 / i7/i9",
      "ОЗУ: 32–64 ГБ DDR5",
      "Видеокарта: RTX 4070 Ti – 4080",
      "SSD: 2 ТБ+ NVMe",
      "Премиум корпус и БП"
    ]
  }
];

// ========== Render Builds ==========
const buildsGrid = document.getElementById("buildsGrid");

function renderBuilds(filter = "all") {
  if (!buildsGrid) return;
  const filtered = filter === "all"
    ? builds
    : builds.filter(b => b.category.includes(filter));

  buildsGrid.innerHTML = filtered.map(b => `
    <article class="build-card" data-categories="${b.category.join(" ")}">
      <div class="build-card-header">
        <span class="build-tag">${getCategoryLabel(b.category[0])}</span>
        <span class="build-price">${b.price}</span>
      </div>
      <div class="build-card-body">
        <h3>${b.title}</h3>
        <p>${b.desc}</p>
        <ul class="build-specs">
          ${b.specs.map(s => `<li>${s}</li>`).join("")}
        </ul>
      </div>
      <div class="build-card-footer">
        <button class="btn btn-primary" onclick="selectBuild(${b.id})">Выбрать</button>
        <a href="#order" class="btn btn-secondary">Адаптировать</a>
      </div>
    </article>
  `).join("");
}

function getCategoryLabel(cat) {
  const map = {
    office: "Офис",
    gaming: "Игры",
    workstation: "Работа",
    budget: "Бюджет"
  };
  return map[cat] || cat;
}

window.selectBuild = function selectBuild(id) {
  const build = builds.find(b => b.id === id);
  if (!build) return;

  const detailsEl = document.getElementById("details");
  if (detailsEl) {
    detailsEl.value = `Интересует готовая сборка «${build.title}» (${build.price}). Хочу взять как есть или адаптировать под себя.`;
  }

  // Pre-check assembly service
  const assemblyCb = document.querySelector('input[name="service"][value="assembly"]');
  if (assemblyCb) assemblyCb.checked = true;

  document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderBuilds(btn.dataset.filter);
  });
});

// Init builds
renderBuilds();



// ========== State ==========
let currentStep = 1;
let orders = JSON.parse(localStorage.getItem("ryzenhub_orders") || "[]");

// ========== DOM ==========
const orderForm = document.getElementById("orderForm");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");

// ========== Multi-step Form ==========
function showStep(step) {
  currentStep = step;
  document.querySelectorAll(".form-step").forEach(s => {
    s.classList.toggle("active", Number(s.dataset.step) === step);
  });
  document.querySelectorAll(".progress-step").forEach(p => {
    const n = Number(p.dataset.step);
    p.classList.toggle("active", n === step);
    p.classList.toggle("done", n < step);
  });
}

document.querySelectorAll(".next-step").forEach(btn => {
  btn.addEventListener("click", () => {
    const stepEl = btn.closest(".form-step");
    const step = Number(stepEl.dataset.step);

    if (step === 1) {
      const name = document.getElementById("name").value.trim();
      const city = document.getElementById("city").value.trim();
      const phone = document.getElementById("phone").value.trim();
      if (!name || !city || !phone) {
        alert("Пожалуйста, заполните имя, город и телефон.");
        return;
      }
    }
    if (step === 2) {
      const services = document.querySelectorAll('input[name="service"]:checked');
      if (services.length === 0) {
        alert("Выберите хотя бы одну услугу.");
        return;
      }
    }
    showStep(step + 1);
  });
});

document.querySelectorAll(".prev-step").forEach(btn => {
  btn.addEventListener("click", () => {
    const stepEl = btn.closest(".form-step");
    showStep(Number(stepEl.dataset.step) - 1);
  });
});

// ========== Submit ==========
if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const services = [...document.querySelectorAll('input[name="service"]:checked')].map(c => c.value);
    const budgetEl = document.querySelector('input[name="budget"]:checked');

    const serviceLabels = {
      assembly: "Сборка ПК",
      repair: "Ремонт",
      cleaning: "Чистка",
      upgrade: "Апгрейд",
      software: "Установка ПО",
      other: "Другое"
    };

    const order = {
      id: "RH-" + Date.now().toString().slice(-6),
      date: new Date().toLocaleString("ru-RU", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      }),
      name: document.getElementById("name").value.trim(),
      city: document.getElementById("city").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      telegram: document.getElementById("telegram").value.trim() || "—",
      services: services.map(s => serviceLabels[s] || s),
      budget: budgetEl ? budgetEl.value : "не указан",
      details: document.getElementById("details").value.trim() || "—"
    };

    // Save locally
    orders.unshift(order);
    localStorage.setItem("ryzenhub_orders", JSON.stringify(orders));

    // Try send to Discord
    if (DISCORD_WEBHOOK) {
      try {
        await fetch(DISCORD_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: null,
            embeds: [{
              title: "🆕 Новая заявка RyzenHub",
              color: 55551,
              fields: [
                { name: "ID", value: order.id, inline: true },
                { name: "Дата", value: order.date, inline: true },
                { name: "Имя", value: order.name, inline: true },
                { name: "Город", value: order.city, inline: true },
                { name: "Телефон", value: order.phone, inline: true },
                { name: "Telegram/VK", value: order.telegram, inline: true },
                { name: "Услуги", value: order.services.join(", ") },
                { name: "Бюджет", value: order.budget },
                { name: "Детали", value: order.details }
              ]
            }]
          })
        });
      } catch (err) {
        console.warn("Discord send failed", err);
      }
    }

    // Try send to Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const text = `🆕 *Новая заявка RyzenHub*\n\n` +
        `*ID:* ${order.id}\n` +
        `*Дата:* ${order.date}\n` +
        `*Имя:* ${order.name}\n` +
        `*Город:* ${order.city}\n` +
        `*Телефон:* ${order.phone}\n` +
        `*TG/VK:* ${order.telegram}\n` +
        `*Услуги:* ${order.services.join(", ")}\n` +
        `*Бюджет:* ${order.budget}\n` +
        `*Детали:* ${order.details}`;

      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: "Markdown"
          })
        });
      } catch (err) {
        console.warn("Telegram send failed", err);
      }
    }

    document.getElementById("orderId").textContent = order.id;
    showStep(4);
  });
}

document.getElementById("newOrderBtn")?.addEventListener("click", () => {
  orderForm.reset();
  showStep(1);
});

// ========== Mobile Menu ==========
mobileMenuBtn?.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});

mobileMenu?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => mobileMenu.classList.remove("open"));
});

// ========== Phone mask ==========
const phoneInput = document.getElementById("phone");
phoneInput?.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "");
  if (v.startsWith("8")) v = "7" + v.slice(1);
  if (v.startsWith("7")) {
    let formatted = "+7";
    if (v.length > 1) formatted += " (" + v.slice(1, 4);
    if (v.length >= 4) formatted += ") " + v.slice(4, 7);
    if (v.length >= 7) formatted += "-" + v.slice(7, 9);
    if (v.length >= 9) formatted += "-" + v.slice(9, 11);
    e.target.value = formatted;
  }
});

// ========== Admin helpers (shared) ==========
window.RyzenHubAdmin = {
  getOrders: () => JSON.parse(localStorage.getItem("ryzenhub_orders") || "[]"),
  clearOrders: () => {
    localStorage.removeItem("ryzenhub_orders");
  },
  checkPass: (pass) => pass === ADMIN_PASS
};
