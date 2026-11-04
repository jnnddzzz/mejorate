// ==== CONFIGURACIÓN: cambia estos valores ====
const CONFIG = {
  whatsapp: "34659506979",   // Número con prefijo de país, sin + ni espacios
  whatsappMsg: "Hola Jano, quiero mejorar mi imagen y me gustaría información sobre la asesoría.",

  // Dónde se guardan las reservas. Pega aquí la URL de tu formulario de Formspree
  // (https://formspree.io/f/xxxxxxx) o de tu Google Apps Script. Vacío = solo WhatsApp.
  formEndpoint: "",

  // Horario de la consulta gratuita (0 = domingo … 6 = sábado). Días sin horas = cerrado.
  horario: {
    1: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
    2: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
    3: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
    4: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
    5: ["17:00", "17:30", "18:00", "18:30", "19:00"],
    6: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"]
  },
  diasVista: 21,             // Cuántos días hacia delante se pueden reservar
  avisoMinimoHoras: 3,       // Antelación mínima para reservar

  estilos: ["streetwear", "clásico", "minimal", "old money", "casual"]
};
// =============================================

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const waLink = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

$$("[data-wa]").forEach(el => {
  el.href = waLink(el.dataset.waMsg || CONFIG.whatsappMsg);
  el.target = "_blank";
  el.rel = "noopener";
});

$("#year").textContent = new Date().getFullYear();

// ---------- Scroll: progress bar, nav, floating buttons ----------
const nav = $("#nav");
const progress = $(".progress");
const waFloat = $(".wa-float");
const mobileCta = $("#mobile-cta");
const booking = $("#reservar");
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  nav.classList.toggle("scrolled", scrollY > 10);
  const r = booking.getBoundingClientRect();
  const atBooking = r.top < innerHeight && r.bottom > 0;
  const past = scrollY > innerHeight * .6;
  waFloat.classList.toggle("show", past);
  mobileCta.classList.toggle("show", past && !atBooking);
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Scroll spy: highlights the current section in the menu and side dots ----------
const spyLinks = $$("[data-spy]");
const dots = $(".dots");
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    spyLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
    dots.classList.toggle("on-dark", e.target.classList.contains("dark"));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

// ---------- Mobile menu ----------
const burger = $("#burger");
const toggleMenu = open => {
  nav.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  document.body.style.overflow = open ? "hidden" : "";
};
burger.addEventListener("click", () => toggleMenu(!nav.classList.contains("open")));
$$("#menu a").forEach(a => a.addEventListener("click", () => toggleMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape") toggleMenu(false); });

// ---------- Rotating style word ----------
const rotator = $("#rotator");
let r = 0;
setInterval(() => {
  rotator.classList.add("out");
  setTimeout(() => {
    r = (r + 1) % CONFIG.estilos.length;
    rotator.textContent = CONFIG.estilos[r];
    rotator.classList.remove("out");
  }, 350);
}, 2400);

// ---------- Reveal on scroll ----------
$$(".pains, .extra-services, .modes, .steps, .lookbook").forEach(group => {
  [...group.children].forEach((el, i) => el.style.setProperty("--d", `${i * 0.08}s`));
});
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  });
}, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
$$(".reveal").forEach(el => io.observe(el));

// ---------- Lookbook filters ----------
$$(".chip").forEach(chip => chip.addEventListener("click", () => {
  $$(".chip").forEach(c => {
    c.classList.toggle("active", c === chip);
    c.setAttribute("aria-pressed", c === chip);
  });
  const f = chip.dataset.filter;
  $$(".look").forEach(look => look.classList.toggle("hide", f !== "all" && look.dataset.cat !== f));
}));

// ---------- Booking ----------
const booker = $("#booker");
const bsteps = $$(".bstep", booker);
const stepTabs = $$(".booker-steps li", booker);
const pick = { date: null, time: null };
let page = 0;

const fmtDay = new Intl.DateTimeFormat("es-ES", { weekday: "short" });
const fmtMonth = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
const fmtLong = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const goStep = i => {
  bsteps.forEach((s, j) => s.classList.toggle("active", j === i));
  stepTabs.forEach((t, j) => t.classList.toggle("on", j <= Math.min(i, 2)));
};

const slotsFor = date => {
  const earliest = Date.now() + CONFIG.avisoMinimoHoras * 3600e3;
  return (CONFIG.horario[date.getDay()] || []).filter(t => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date(date); d.setHours(h, m, 0, 0);
    return d.getTime() >= earliest;
  });
};

const today = new Date(); today.setHours(0, 0, 0, 0);
const allDays = Array.from({ length: CONFIG.diasVista }, (_, i) => {
  const d = new Date(today); d.setDate(d.getDate() + i); return d;
});
const pages = Math.ceil(allDays.length / 7);

const renderDays = () => {
  const days = allDays.slice(page * 7, page * 7 + 7);
  $("#cal-month").textContent = cap(fmtMonth.format(days[0]));
  $("#days").innerHTML = days.map((d, i) => {
    const free = slotsFor(d).length > 0;
    const sel = pick.date && d.getTime() === pick.date.getTime();
    return `<button type="button" class="day${sel ? " sel" : ""}" data-i="${page * 7 + i}" ${free ? "" : "disabled"} role="option" aria-selected="${sel}" aria-label="${fmtLong.format(d)}">
      <small>${fmtDay.format(d).replace(".", "")}</small><strong>${d.getDate()}</strong></button>`;
  }).join("");
  $("#cal-prev").disabled = page === 0;
  $("#cal-next").disabled = page >= pages - 1;
};

$("#cal-prev").addEventListener("click", () => { page--; renderDays(); });
$("#cal-next").addEventListener("click", () => { page++; renderDays(); });

$("#days").addEventListener("click", e => {
  const b = e.target.closest(".day");
  if (!b || b.disabled) return;
  pick.date = allDays[+b.dataset.i];
  pick.time = null;
  renderDays();
  $("#chosen-day").textContent = cap(fmtLong.format(pick.date));
  $("#slots").innerHTML = slotsFor(pick.date)
    .map(t => `<button type="button" class="slot" data-t="${t}" role="option">${t}</button>`).join("");
  goStep(1);
});

$("#slots").addEventListener("click", e => {
  const b = e.target.closest(".slot");
  if (!b) return;
  pick.time = b.dataset.t;
  $("#chosen-slot").textContent = `${cap(fmtLong.format(pick.date))} · ${pick.time}`;
  goStep(2);
  $("#f-nombre").focus({ preventScroll: true });
});

$$("[data-back]", booker).forEach(b => b.addEventListener("click", () => {
  const current = bsteps.findIndex(s => s.classList.contains("active"));
  goStep(current - 1);
}));

// First page with free slots
while (page < pages - 1 && !allDays.slice(page * 7, page * 7 + 7).some(d => slotsFor(d).length)) page++;
renderDays();

// Form
const form = $("#booking-form");
const errorBox = $("#form-error");
const submitBtn = $("#submit");

form.addEventListener("input", e => e.target.classList.remove("invalid"));
$("#f-consent").addEventListener("change", e => e.target.closest(".consent").classList.remove("invalid"));

form.addEventListener("submit", async e => {
  e.preventDefault();
  errorBox.hidden = true;

  const missing = [];
  ["f-nombre", "f-edad", "f-whatsapp", "f-ciudad", "f-problema"].forEach(id => {
    const el = $(`#${id}`);
    let ok = el.value.trim() !== "";
    if (id === "f-whatsapp") ok = el.value.replace(/\D/g, "").length >= 9;
    if (id === "f-edad") ok = +el.value >= 14 && +el.value <= 99;
    el.classList.toggle("invalid", !ok);
    if (!ok) missing.push(el);
  });
  const consent = $("#f-consent");
  consent.closest(".consent").classList.toggle("invalid", !consent.checked);
  if (missing.length || !consent.checked) {
    errorBox.textContent = missing.length
      ? "Revisa los campos marcados en rojo. El WhatsApp necesita al menos 9 cifras."
      : "Marca la casilla para que pueda contactarte.";
    errorBox.hidden = false;
    (missing[0] || consent).focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  const cuando = `${fmtLong.format(pick.date)} a las ${pick.time}`;
  const payload = {
    "Fecha de reserva": new Date().toLocaleString("es-ES"),
    "Día": pick.date.toLocaleDateString("es-ES"),
    "Hora": pick.time,
    "Nombre": data.nombre,
    "Edad": data.edad,
    "WhatsApp": data.whatsapp,
    "Redes": data.redes || "",
    "Modalidad": data.modalidad,
    "Ciudad": data.ciudad,
    "Le ayudo con": data.tema,
    "Su problema": data.problema
  };

  if (CONFIG.formEndpoint) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";
    try {
      const body = new FormData();
      Object.entries(payload).forEach(([k, v]) => body.append(k, v));
      body.append("_subject", `Nueva consulta gratis: ${data.nombre}, ${cap(cuando)}`);
      await fetch(CONFIG.formEndpoint, { method: "POST", body, headers: { Accept: "application/json" } });
    } catch (err) {
      // Si falla el guardado, la reserva sigue llegando por WhatsApp.
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "Reservar consulta gratis";
  }

  const msg = [
    "Hola Jano, acabo de reservar mi consulta gratis en tu web:",
    `📅 ${cap(cuando)}`,
    `👤 ${data.nombre}, ${data.edad} años · ${data.ciudad}`,
    `💬 ${data.modalidad} · ${data.tema}`,
    data.redes ? `📱 ${data.redes}` : "",
    `Mi problema: ${data.problema}`
  ].filter(Boolean).join("\n");

  $("#done-text").textContent = `${data.nombre}, te espero el ${cuando}. Te escribiré al ${data.whatsapp} para confirmarte.`;
  $("#done-wa").href = waLink(msg);
  goStep(3);
  booker.scrollIntoView({ behavior: "smooth", block: "start" });
});
