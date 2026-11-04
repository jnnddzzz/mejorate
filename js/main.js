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
// Para añadir una foto: guárdala en img/fotos/ (y una pequeña en img/fotos/thumb/) y añádela aquí
// con su categoría y su ancho (todas miden 1400 px de alto).
const CATS = { streetwear: "Streetwear", verano: "Verano", chandal: "Chándal", arreglado: "Arreglado" };
const LOOKS = [
  ["1810", "streetwear", 840], ["2389", "chandal", 716], ["2074", "verano", 840], ["1676", "arreglado", 716],
  ["6100", "arreglado", 840], ["5430", "streetwear", 840], ["4873", "chandal", 840], ["8663", "verano", 840],
  ["2329", "streetwear", 840], ["0204", "arreglado", 598], ["9260", "chandal", 840], ["2657", "verano", 785],
  ["5439", "streetwear", 840], ["8356", "arreglado", 840], ["8698", "verano", 840], ["4436", "chandal", 840],
  ["3160", "streetwear", 840], ["0412", "arreglado", 840], ["9476", "verano", 840], ["0015", "chandal", 971],
  ["9048", "streetwear", 840], ["6512", "arreglado", 840], ["2749", "verano", 762], ["5131", "streetwear", 840],
  ["0517", "arreglado", 812], ["8130", "verano", 840], ["8808", "streetwear", 840], ["9773", "verano", 840],
  ["0518", "arreglado", 840], ["2406", "streetwear", 840], ["0399", "verano", 840], ["5997", "streetwear", 840],
  ["8919", "verano", 840]
].map(([id, cat, w]) => ({ id, cat, w, src: `img/fotos/jano-${id}.jpg`, thumb: `img/fotos/thumb/jano-${id}.jpg` }));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Stage: full-body photo behind the whole site; it changes as you scroll and on its own every few seconds
const stage = $("#stage");
const layers = $$(".stage-layer", stage);
const hudN = $("#hud-n"), hudCat = $("#hud-cat"), hudBar = $("#hud-bar");
$("#hud-t").textContent = String(LOOKS.length).padStart(2, "0");
let stageIdx = -1, stageLayer = 0, scrollIdx = 0, autoOffset = 0, lastScrollAt = 0;
const preload = i => { const im = new Image(); im.src = LOOKS[i % LOOKS.length].src; };
const showStage = i => {
  i = ((i % LOOKS.length) + LOOKS.length) % LOOKS.length;
  if (i === stageIdx) return;
  stageIdx = i;
  const l = LOOKS[i];
  stageLayer = 1 - stageLayer;
  const next = layers[stageLayer], prev = layers[1 - stageLayer];
  const photo = $(".stage-photo", next), blur = $(".stage-blur", next);
  const swap = () => { next.classList.add("on"); prev.classList.remove("on"); };
  blur.src = l.thumb;
  photo.onload = swap;
  photo.src = l.src;
  if (photo.complete) swap();
  hudN.textContent = String(i + 1).padStart(2, "0");
  hudCat.textContent = CATS[l.cat];
  preload(i + 1);
};
const STEP = () => Math.max(420, innerHeight * .7);
showStage(0);
if (!reduceMotion) {
  setInterval(() => {
    if (document.hidden || performance.now() - lastScrollAt < 2500) return;
    autoOffset++;
    showStage(scrollIdx + autoOffset);
  }, 3800);
}

// 3D ring in the hero
const ring = $("#ring");
const RING = LOOKS.filter(l => l.w === 840).slice(0, 10);
const ringH = () => (innerWidth < 900 ? Math.min(190, innerWidth * .42) : Math.min(260, innerHeight * .3));
const buildRing = () => {
  const h = ringH(), w = h * .6, n = RING.length;
  const r = Math.round((w + 14) / (2 * Math.tan(Math.PI / n)));
  ring.innerHTML = RING.map((l, i) => `<div class="ring-card" style="--h:${h}px;transform:translate(-50%,-50%) rotateY(${(360 / n) * i}deg) translateZ(${r}px)"><img src="${l.thumb}" alt="" width="${Math.round(h * .6)}" height="${h}"></div>`).join("");
};
buildRing();
let ringAngle = 0, ringVel = 0, prevY = scrollY, heroVisible = true;
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe($(".hero"));
const spin = () => {
  if (heroVisible) {
    const dy = scrollY - prevY; prevY = scrollY;
    ringVel += dy * .03;
    ringVel *= .92;
    ringAngle += .12 + ringVel;
    ring.style.transform = `rotateX(-8deg) rotateY(${ringAngle}deg)`;
  } else prevY = scrollY;
  requestAnimationFrame(spin);
};
if (reduceMotion) ring.style.transform = "rotateX(-8deg) rotateY(15deg)"; else requestAnimationFrame(spin);

// Cursor glow (desktop)
const glow = $("#cursor-glow");
if (matchMedia("(hover: hover)").matches && !reduceMotion) {
  addEventListener("pointermove", e => {
    glow.classList.add("on");
    glow.style.transform = `translate3d(${e.clientX - 260}px, ${e.clientY - 260}px, 0)`;
  }, { passive: true });
  document.addEventListener("pointerleave", () => glow.classList.remove("on"));
}

// Lookbook
const lookbook = $("#lookbook");
lookbook.innerHTML = LOOKS.map((l, i) => `
  <button type="button" class="look pop" data-cat="${l.cat}" data-i="${i}" aria-label="Ver look ${CATS[l.cat]} en grande">
    <img src="${l.src}" alt="Jano con un look ${CATS[l.cat].toLowerCase()}" loading="lazy" width="${l.w}" height="1400">
    <figcaption>${CATS[l.cat]}</figcaption>
  </button>`).join("");
const looks = $$(".look", lookbook);
looks.forEach((el, i) => { el.style.setProperty("--d", `${(i % 4) * 0.08}s`); io.observe(el); });

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

// Hovering a look also puts it on the stage behind the page
lookbook.addEventListener("pointerover", e => {
  const b = e.target.closest(".look");
  if (b) { autoOffset = +b.dataset.i - scrollIdx; showStage(+b.dataset.i); }
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
  $("#lb-cap").textContent = `${CATS[l.cat]} · ${String(i + 1).padStart(2, "0")}/${LOOKS.length}`;
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
const reelHTML = list => list.map(l => `<img src="${l.thumb}" alt="" loading="lazy" width="${Math.round(l.w / 1400 * 480)}" height="480">`).join("");
reelA.innerHTML = reelHTML([...LOOKS.slice(0, half), ...LOOKS.slice(0, half)]);
reelB.innerHTML = reelHTML([...LOOKS.slice(half), ...LOOKS.slice(half)]);

// Bubbles: full-body capsules at the edges of some sections, appearing and drifting as you scroll
const SPOTS = [
  { side: "left", x: "-1%", y: "6%", h: 210, s: .18 }, { side: "right", x: "-1%", y: "12%", h: 250, s: -.14 },
  { side: "left", x: "1.5%", y: "60%", h: 170, s: -.22 }, { side: "right", x: "2%", y: "66%", h: 190, s: .2 }
];
let pool = 3;
const bubbleLayers = $$(".bubbles");
bubbleLayers.forEach(layer => {
  layer.innerHTML = SPOTS.map((p, i) => {
    const l = LOOKS[(pool++ * 7) % LOOKS.length];
    return `<div class="bubble" data-s="${p.s}" style="${p.side}:${p.x};top:${p.y};--h:${p.h}px;transition-delay:${i * .12}s"><img src="${l.thumb}" alt="" loading="lazy"></div>`;
  }).join("");
});
const bubbleIo = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) $$(".bubble", e.target).forEach(b => b.classList.add("in"));
}), { threshold: .15 });
bubbleLayers.forEach(l => bubbleIo.observe(l));

let ticking = false;
const onFrame = () => {
  ticking = false;
  const vh = innerHeight;
  // stage follows the scroll
  const max = document.documentElement.scrollHeight - vh;
  hudBar.style.height = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  const idx = Math.floor(scrollY / STEP());
  if (idx !== scrollIdx) { scrollIdx = idx; autoOffset = 0; showStage(scrollIdx); }
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
addEventListener("scroll", () => {
  lastScrollAt = performance.now();
  if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
}, { passive: true });
addEventListener("resize", () => { buildRing(); onFrame(); });
onFrame();

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
