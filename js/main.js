// ==== CONFIGURACIÓN: cambia estos valores ====
const CONFIG = {
  telefono: "34659506979",   // Número con prefijo de país, sin + ni espacios (para llamar y WhatsApp)
  whatsappMsg: "Hola Jano, quiero información sobre la asesoría de imagen.",

  // Dónde se guardan las reservas. Pega aquí la URL de tu formulario de Formspree
  // (https://formspree.io/f/xxxxxxx) o de tu Google Apps Script. Vacío = solo WhatsApp.
  formEndpoint: "",

  // Horario de las citas (0 = domingo … 6 = sábado). Días sin horas = cerrado.
  horario: {
    1: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
    2: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
    3: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
    4: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
    5: ["17:00", "17:30", "18:00", "18:30", "19:00"],
    6: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"]
  },
  diasVista: 21,             // Cuántos días hacia delante se puede reservar
  avisoMinimoHoras: 3,       // Antelación mínima para reservar
  segundosPorFoto: 4.5       // Tiempo de cada foto en el visor de la portada
};

// ==== FOTOS ====
// Cada foto aparece una sola vez en la web. Todas miden 1400 px de alto; el número es su ancho.
// Para añadir una: guárdala en img/fotos/ (y una pequeña en img/fotos/thumb/) y añádela aquí.
const CATS = { streetwear: "Streetwear", verano: "Verano", chandal: "Chándal", arreglado: "Arreglado" };
const PORTADA = [            // Visor de la portada: un look de cada estilo
  ["1810", "streetwear"], ["4873", "chandal"], ["0412", "arreglado"], ["8663", "verano"], ["3160", "streetwear"]
];
const GALERIA = [
  ["2329", "streetwear", 840], ["5430", "streetwear", 840], ["5439", "streetwear", 840], ["9048", "streetwear", 840],
  ["5131", "streetwear", 840], ["8808", "streetwear", 840], ["2406", "streetwear", 840], ["5997", "streetwear", 840],
  ["2074", "verano", 840], ["2657", "verano", 785], ["8698", "verano", 840], ["9476", "verano", 840], ["2749", "verano", 762],
  ["8130", "verano", 840], ["9773", "verano", 840], ["0399", "verano", 840], ["8919", "verano", 840],
  ["2389", "chandal", 716], ["9260", "chandal", 840], ["4436", "chandal", 840], ["0015", "chandal", 971],
  ["6100", "arreglado", 840], ["8356", "arreglado", 840], ["0204", "arreglado", 598], ["6512", "arreglado", 840],
  ["0517", "arreglado", 812], ["0518", "arreglado", 840], ["1676", "arreglado", 716]
].map(([id, cat, w]) => ({ id, cat, w, src: `img/fotos/jano-${id}.jpg` }));
// =============================================

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const waLink = msg => `https://wa.me/${CONFIG.telefono}?text=${encodeURIComponent(msg)}`;
const telLink = `tel:+${CONFIG.telefono}`;

$$("[data-wa]").forEach(el => {
  el.href = waLink(el.dataset.waMsg || CONFIG.whatsappMsg);
  el.target = "_blank";
  el.rel = "noopener";
});
$$("[data-call]").forEach(el => { el.href = telLink; });
$("#phone-text").textContent = CONFIG.telefono.replace(/^34/, "").replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
$("#year").textContent = new Date().getFullYear();

// ---------- Scroll: progress, nav, quick actions ----------
const nav = $("#nav");
const progress = $(".progress");
const quick = $("#quick");
const booking = $("#reservar");
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  nav.classList.toggle("scrolled", scrollY > 10);
  const r = booking.getBoundingClientRect();
  const atBooking = r.top < innerHeight * .6 && r.bottom > innerHeight * .4;
  quick.classList.toggle("show", scrollY > innerHeight * .5 && !atBooking);
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Scroll spy for the menu
const spyLinks = $$("[data-spy]");
const spy = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) spyLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

// Mobile menu
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

// Reveal on scroll
$$(".steps, .modes").forEach(g => [...g.children].forEach((el, i) => el.style.setProperty("--d", `${i * .1}s`)));
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
$$(".reveal").forEach(el => io.observe(el));

// ---------- Hero viewer: one look at a time, story style ----------
const viewer = $("#viewer");
const frame = $("#viewer-frame");
const bars = $("#viewer-bars");
frame.innerHTML = PORTADA.map(([id, cat], i) => `
  <div class="viewer-slide${i === 0 ? " on" : ""}">
    <img class="bg" src="img/fotos/thumb/jano-${id}.jpg" alt="">
    <img class="ph" src="img/fotos/jano-${id}.jpg" alt="Jano con un look ${CATS[cat].toLowerCase()}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
  </div>`).join("");
bars.innerHTML = PORTADA.map(() => "<span><i></i></span>").join("");
bars.style.setProperty("--t", `${CONFIG.segundosPorFoto}s`);
const slides = $$(".viewer-slide", frame);
const barEls = $$("span", bars);
let cur = 0;
const show = i => {
  cur = (i + PORTADA.length) % PORTADA.length;
  slides.forEach((s, j) => s.classList.toggle("on", j === cur));
  barEls.forEach((b, j) => {
    b.className = j < cur ? "done" : "";
    const fill = b.firstElementChild;
    fill.style.animation = "none"; void fill.offsetWidth; fill.style.animation = "";
  });
  if (!reduceMotion) barEls[cur].className = "run";
  $("#viewer-tag").textContent = CATS[PORTADA[cur][1]];
  $("#viewer-count").textContent = `${String(cur + 1).padStart(2, "0")} / ${String(PORTADA.length).padStart(2, "0")}`;
};
barEls.forEach(b => b.firstElementChild.addEventListener("animationend", () => show(cur + 1)));
$("#viewer-prev").addEventListener("click", () => show(cur - 1));
$("#viewer-next").addEventListener("click", () => show(cur + 1));
viewer.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") viewer.classList.add("paused"); });
viewer.addEventListener("pointerleave", () => viewer.classList.remove("paused"));
document.addEventListener("visibilitychange", () => viewer.classList.toggle("paused", document.hidden));
show(0);

// ---------- Styles gallery: pinned section, the photos glide sideways as you scroll ----------
const pin = $("#styles-pin");
const gallery = $("#gallery");
const track = $("#gallery-track");
const filters = $("#filters");
const galBar = $("#gallery-bar");
const pinned = !reduceMotion;
if (!pinned) document.documentElement.classList.add("no-pin");
let activeCat = "streetwear";
let galItems = [];
let looksEls = [];
let travel = 0;            // how far the track moves sideways, in px
let galProgress = 0;

filters.innerHTML = Object.entries(CATS).map(([k, v]) =>
  `<button type="button" class="chip" role="tab" data-cat="${k}" aria-selected="${k === activeCat}">${v}</button>`).join("");

const updateGallery = () => {
  if (!pinned) {
    const max = gallery.scrollWidth - gallery.clientWidth - 4;
    $("#gal-prev").disabled = gallery.scrollLeft <= 4;
    $("#gal-next").disabled = gallery.scrollLeft >= max;
    galBar.style.width = `${max > 0 ? (gallery.scrollLeft / max) * 100 : 100}%`;
    return;
  }
  const r = pin.getBoundingClientRect();
  galProgress = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
  track.style.transform = `translate3d(${-galProgress * travel}px,0,0)`;
  galBar.style.width = `${travel > 0 ? galProgress * 100 : 100}%`;
  $("#gal-prev").disabled = galProgress <= .001;
  $("#gal-next").disabled = galProgress >= .999;
  // depth: the photo nearest the centre is full size, the rest step back
  const mid = innerWidth / 2;
  let best = null, bestD = Infinity;
  looksEls.forEach(el => {
    const b = el.getBoundingClientRect();
    const off = (b.left + b.width / 2 - mid) / innerWidth;
    const k = Math.min(1, Math.abs(off) * 1.6);
    el.style.transform = `perspective(1200px) rotateY(${(off * -10).toFixed(2)}deg) scale(${(1 - k * .14).toFixed(3)})`;
    el.style.opacity = (1 - k * .55).toFixed(3);
    el.style.filter = `brightness(${(1 - k * .35).toFixed(3)})`;
    if (Math.abs(off) < bestD) { bestD = Math.abs(off); best = el; }
  });
  looksEls.forEach(el => el.classList.toggle("center", el === best));
};

const layoutGallery = () => {
  if (!pinned) return updateGallery();
  travel = Math.max(0, track.scrollWidth - innerWidth);
  pin.style.height = `${innerHeight + travel}px`;
  updateGallery();
};

const renderGallery = () => {
  galItems = GALERIA.filter(l => l.cat === activeCat);
  track.innerHTML = galItems.map((l, i) => `
    <button type="button" class="look" data-i="${i}" style="aspect-ratio:${l.w}/1400" aria-label="Ver look ${i + 1} en grande">
      <img src="${l.src}" alt="Jano con un look ${CATS[l.cat].toLowerCase()}" loading="lazy" width="${l.w}" height="1400">
      <figcaption>${String(i + 1).padStart(2, "0")}</figcaption>
    </button>`).join("");
  looksEls = $$(".look", track);
  $("#gallery-count").textContent = `${CATS[activeCat].toUpperCase()} · ${galItems.length} LOOKS`;
  gallery.scrollLeft = 0;
  layoutGallery();
};

filters.addEventListener("click", e => {
  const c = e.target.closest(".chip");
  if (!c || c.dataset.cat === activeCat) return;
  activeCat = c.dataset.cat;
  $$(".chip", filters).forEach(b => b.setAttribute("aria-selected", b === c));
  renderGallery();
  // start the new style from its first photo
  if (pinned) scrollTo({ top: pin.getBoundingClientRect().top + scrollY, behavior: "smooth" });
});

const cardStep = () => (looksEls[0]?.offsetWidth || 300) + 20;
const moveGallery = dir => {
  if (!pinned) return gallery.scrollBy({ left: dir * cardStep(), behavior: "smooth" });
  // inside the pinned section, sideways distance maps 1:1 to scroll distance
  scrollBy({ top: dir * cardStep(), behavior: "smooth" });
};
$("#gal-prev").addEventListener("click", () => moveGallery(-1));
$("#gal-next").addEventListener("click", () => moveGallery(1));
gallery.addEventListener("scroll", updateGallery, { passive: true });
let galTick = false;
addEventListener("scroll", () => {
  if (galTick) return;
  galTick = true;
  requestAnimationFrame(() => { galTick = false; updateGallery(); });
}, { passive: true });
addEventListener("resize", layoutGallery);
addEventListener("load", layoutGallery);
renderGallery();

// Lightbox
const lb = $("#lightbox");
const lbImg = $("#lb-img");
let lbIndex = 0;
const openLb = i => {
  lbIndex = (i + galItems.length) % galItems.length;
  const l = galItems[lbIndex];
  lbImg.src = l.src;
  lbImg.alt = `Jano con un look ${CATS[l.cat].toLowerCase()}`;
  $("#lb-cap").textContent = `${CATS[l.cat]} · ${String(lbIndex + 1).padStart(2, "0")}/${galItems.length}`;
  lb.hidden = false;
  document.body.style.overflow = "hidden";
  $("#lb-close").focus();
};
const closeLb = () => {
  lb.hidden = true;
  document.body.style.overflow = "";
  track.querySelector(`[data-i="${lbIndex}"]`)?.focus({ preventScroll: true });
};
gallery.addEventListener("click", e => {
  const b = e.target.closest(".look");
  if (b) openLb(+b.dataset.i);
});
$("#lb-close").addEventListener("click", closeLb);
$("#lb-prev").addEventListener("click", () => openLb(lbIndex - 1));
$("#lb-next").addEventListener("click", () => openLb(lbIndex + 1));
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") openLb(lbIndex - 1);
  if (e.key === "ArrowRight") openLb(lbIndex + 1);
});

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
  goStep(bsteps.findIndex(s => s.classList.contains("active")) - 1);
}));

while (page < pages - 1 && !allDays.slice(page * 7, page * 7 + 7).some(d => slotsFor(d).length)) page++;
renderDays();

const form = $("#booking-form");
const errorBox = $("#form-error");
const submitBtn = $("#submit");
form.addEventListener("input", e => e.target.classList.remove("invalid"));
form.addEventListener("change", e => e.target.classList.remove("invalid"));
$("#f-consent").addEventListener("change", e => e.target.closest(".consent").classList.remove("invalid"));

form.addEventListener("submit", async e => {
  e.preventDefault();
  errorBox.hidden = true;

  const missing = [];
  ["f-nombre", "f-edad", "f-sexo", "f-telefono"].forEach(id => {
    const el = $(`#${id}`);
    let ok = el.value.trim() !== "";
    if (id === "f-telefono") ok = el.value.replace(/\D/g, "").length >= 9;
    if (id === "f-edad") ok = +el.value >= 14 && +el.value <= 99;
    el.classList.toggle("invalid", !ok);
    if (!ok) missing.push(el);
  });
  const consent = $("#f-consent");
  consent.closest(".consent").classList.toggle("invalid", !consent.checked);
  if (missing.length || !consent.checked) {
    errorBox.textContent = missing.length
      ? "Revisa los campos marcados en rojo. El teléfono necesita al menos 9 cifras."
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
    "Sexo": data.sexo,
    "Teléfono": data.telefono,
    "Le ayudo con": data.tema,
    "Modalidad": data.modalidad
  };

  if (CONFIG.formEndpoint) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";
    try {
      const body = new FormData();
      Object.entries(payload).forEach(([k, v]) => body.append(k, v));
      body.append("_subject", `Nueva cita: ${data.nombre}, ${cap(cuando)}`);
      await fetch(CONFIG.formEndpoint, { method: "POST", body, headers: { Accept: "application/json" } });
    } catch (err) {
      // Si falla el guardado, la reserva sigue llegando por WhatsApp.
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "Reservar cita gratis";
  }

  const msg = [
    "Hola Jano, acabo de reservar mi consulta gratis en tu web:",
    `📅 ${cap(cuando)}`,
    `👤 ${data.nombre}, ${data.edad} años (${data.sexo})`,
    `📞 ${data.telefono}`,
    `💬 ${data.tema} · ${data.modalidad}`
  ].join("\n");

  $("#done-text").textContent = `${data.nombre}, te espero el ${cuando}. Te escribiré al ${data.telefono} para confirmarte.`;
  $("#done-wa").href = waLink(msg);
  goStep(3);
  booker.scrollIntoView({ behavior: "smooth", block: "start" });
});
