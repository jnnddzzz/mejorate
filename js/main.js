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

  estilos: ["streetwear", "baggy", "chándal", "arreglado", "clásico"]
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
$$(".pains, .extra-services, .modes, .steps").forEach(group => {
  [...group.children].forEach((el, i) => el.style.setProperty("--d", `${i * 0.08}s`));
});
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  });
}, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
$$(".reveal").forEach(el => io.observe(el));

// ---------- Photos ----------
// Para añadir una foto: guárdala en img/fotos/ (y una pequeña en img/fotos/thumb/) y añádela aquí.
const CATS = { streetwear: "Streetwear", verano: "Verano", chandal: "Chándal", arreglado: "Arreglado" };
const LOOKS = [
  ["2389", "chandal"], ["1810", "streetwear"], ["6100", "arreglado"], ["2074", "verano"],
  ["4873", "chandal"], ["5430", "streetwear"], ["0412", "arreglado"], ["8663", "verano"],
  ["2329", "streetwear"], ["0204", "arreglado"], ["9260", "chandal"], ["2657", "verano"],
  ["5439", "streetwear"], ["8356", "arreglado"], ["8698", "verano"], ["4436", "chandal"],
  ["3160", "streetwear"], ["0517", "arreglado"], ["9476", "verano"], ["0015", "chandal"],
  ["9048", "streetwear"], ["6512", "arreglado"], ["2749", "verano"], ["5131", "streetwear"],
  ["0518", "arreglado"], ["8130", "verano"], ["8808", "streetwear"], ["9773", "verano"],
  ["2406", "streetwear"], ["0399", "verano"], ["5997", "streetwear"], ["8919", "verano"]
].map(([id, cat]) => ({ id, cat, src: `img/fotos/jano-${id}.jpg`, thumb: `img/fotos/thumb/jano-${id}.jpg` }));

// Lookbook
const lookbook = $("#lookbook");
lookbook.innerHTML = LOOKS.map((l, i) => `
  <button type="button" class="look pop" data-cat="${l.cat}" data-i="${i}" aria-label="Ver look ${CATS[l.cat]} en grande">
    <img src="${l.src}" alt="Jano con un look ${CATS[l.cat].toLowerCase()}" loading="lazy" width="840" height="1400">
    <figcaption>${CATS[l.cat]}</figcaption>
  </button>`).join("");
const looks = $$(".look", lookbook);
looks.forEach((el, i) => { el.style.setProperty("--d", `${(i % 4) * 0.07}s`); io.observe(el); });

$$("#filters .chip").forEach(chip => {
  const f = chip.dataset.filter;
  chip.querySelector("span").textContent = f === "all" ? LOOKS.length : LOOKS.filter(l => l.cat === f).length;
  chip.addEventListener("click", () => {
    $$("#filters .chip").forEach(c => {
      c.classList.toggle("active", c === chip);
      c.setAttribute("aria-pressed", c === chip);
    });
    looks.forEach(el => el.classList.toggle("hide", f !== "all" && el.dataset.cat !== f));
  });
});

// Lightbox
const lb = $("#lightbox");
const lbImg = $("#lb-img");
let lbIndex = 0;
const visibleLooks = () => looks.filter(el => !el.classList.contains("hide")).map(el => +el.dataset.i);
const openLb = i => {
  lbIndex = i;
  const l = LOOKS[i];
  lbImg.src = l.src;
  lbImg.alt = `Jano con un look ${CATS[l.cat].toLowerCase()}`;
  $("#lb-cap").textContent = CATS[l.cat];
  lb.hidden = false;
  document.body.style.overflow = "hidden";
  $("#lb-close").focus();
};
const closeLb = () => {
  lb.hidden = true;
  document.body.style.overflow = "";
  looks[lbIndex].focus({ preventScroll: true });
};
const stepLb = dir => {
  const v = visibleLooks();
  openLb(v[(v.indexOf(lbIndex) + dir + v.length) % v.length]);
};
lookbook.addEventListener("click", e => {
  const b = e.target.closest(".look");
  if (b) openLb(+b.dataset.i);
});
$("#lb-close").addEventListener("click", closeLb);
$("#lb-prev").addEventListener("click", () => stepLb(-1));
$("#lb-next").addEventListener("click", () => stepLb(1));
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") stepLb(-1);
  if (e.key === "ArrowRight") stepLb(1);
});

// Reel: two rows of photos that slide sideways while scrolling
const reelA = $("#reel-a"), reelB = $("#reel-b");
const half = Math.ceil(LOOKS.length / 2);
const reelHTML = list => list.map(l => `<img src="${l.thumb}" alt="" loading="lazy" width="252" height="420">`).join("");
reelA.innerHTML = reelHTML([...LOOKS.slice(0, half), ...LOOKS.slice(0, half)]);
reelB.innerHTML = reelHTML([...LOOKS.slice(half), ...LOOKS.slice(half)]);

// Bubbles: photo capsules at the edges of some sections, appearing and drifting as you scroll
const SPOTS = [
  { side: "left", x: "-1%", y: "8%", w: 118, s: .18 }, { side: "right", x: "-1.5%", y: "14%", w: 140, s: -.14 },
  { side: "left", x: "1%", y: "62%", w: 96, s: -.22 }, { side: "right", x: "1.5%", y: "68%", w: 108, s: .2 }
];
let pool = 0;
const bubbleLayers = $$(".bubbles");
bubbleLayers.forEach(layer => {
  layer.innerHTML = SPOTS.map((p, i) => {
    const l = LOOKS[(pool++ * 7) % LOOKS.length];
    return `<div class="bubble${i % 3 === 1 ? " hex" : ""}" data-s="${p.s}" style="${p.side}:${p.x};top:${p.y};--w:${p.w}px;transition-delay:${i * .12}s"><img src="${l.thumb}" alt="" loading="lazy"></div>`;
  }).join("");
});
const bubbleIo = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) $$(".bubble", e.target).forEach(b => b.classList.add("in"));
}), { threshold: .15 });
bubbleLayers.forEach(l => bubbleIo.observe(l));

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let ticking = false;
const parallax = () => {
  ticking = false;
  const vh = innerHeight;
  [reelA, reelB].forEach(row => {
    const r = row.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const shift = (vh - r.top) * +row.dataset.speed;
    const base = row === reelB ? -row.scrollWidth / 2 + innerWidth : 0;
    row.style.transform = `translate3d(${base + shift}px,0,0)`;
  });
  bubbleLayers.forEach(layer => {
    const r = layer.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const mid = r.top + r.height / 2 - vh / 2;
    $$(".bubble", layer).forEach(b => b.style.setProperty("--y", `${(mid * +b.dataset.s).toFixed(1)}px`));
  });
};
if (!reduceMotion) {
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
  addEventListener("resize", parallax);
}
parallax();

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
