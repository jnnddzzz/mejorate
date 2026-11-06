// ==== CONFIGURACIÓN: cambia estos valores ====
const CONFIG = {
  telefono: "34659506979",   // Número con prefijo de país, sin + ni espacios (para llamar y WhatsApp)
  whatsappMsg: "Hola Jano, quiero información sobre la asesoría de imagen.",

  // Dónde se guardan las reservas. Pega aquí la URL de tu formulario de Formspree
  // (https://formspree.io/f/xxxxxxx) o de tu Google Apps Script. Vacío = solo WhatsApp.
  formEndpoint: "",

  // Horario de citas: días (1 = lunes … 5 = viernes, 6 = sábado, 0 = domingo), franja y duración.
  horario: { dias: [1, 2, 3, 4, 5], inicio: "16:30", fin: "21:30", minutos: 20 },
  diasVista: 45,             // Cuántos días hacia delante se puede reservar
  avisoMinimoHoras: 3        // Antelación mínima para reservar
};

// ==== FOTOS ====
// Cada foto aparece una sola vez en toda la web. Todas miden 1400 px de alto; el número es su ancho.
// Para añadir una: guárdala en img/fotos/ (y una pequeña en img/fotos/thumb/) y añádela a una lista.
const CATS = { streetwear: "Streetwear", verano: "Verano", chandal: "Chándal", arreglado: "Arreglado" };
const FORMALES = [          // Retrato de la portada: looks arreglados, van pasando
  ["1676", "Cuero negro y recto"],
  ["8356", "Vaquero oscuro"],
  ["0412", "Cuero y estampado"],
  ["6512", "Cuero y cruces"]
];
const PORTADA = {            // Tarjetas de «Estilos»: sus fotos van rotando
  streetwear: ["1810", "3160", "5430"],
  verano: ["8663", "2074", "9773"],
  chandal: ["4873", "9260"],
  arreglado: ["0518", "6100"]
};
const GALERIA = [
  ["2329", "streetwear", 840], ["9048", "streetwear", 840], ["5131", "streetwear", 840],
  ["8808", "streetwear", 840], ["2406", "streetwear", 840], ["5997", "streetwear", 840],
  ["2657", "verano", 785], ["9476", "verano", 840], ["2749", "verano", 762],
  ["8130", "verano", 840], ["0399", "verano", 840], ["8919", "verano", 840],
  ["2389", "chandal", 716], ["4436", "chandal", 840], ["0015", "chandal", 971],
  ["0204", "arreglado", 598], ["0517", "arreglado", 812]
].map(([id, cat, w]) => ({ id, cat, w, src: `img/fotos/jano-${id}.jpg` }));
const SOBRE_MI = ["9547", "8698", "5439"];
// =============================================

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const photo = id => `img/fotos/jano-${id}.jpg`;
const waLink = msg => `https://wa.me/${CONFIG.telefono}?text=${encodeURIComponent(msg)}`;

$$("[data-wa]").forEach(el => {
  el.href = waLink(el.dataset.waMsg || CONFIG.whatsappMsg);
  el.target = "_blank";
  el.rel = "noopener";
});
$$("[data-call]").forEach(el => { el.href = `tel:+${CONFIG.telefono}`; });
$("#phone-text").textContent = CONFIG.telefono.replace(/^34/, "").replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
$("#year").textContent = new Date().getFullYear();

// ---------- Split headings into words that rise into place ----------
const splitWords = el => {
  let i = 0;
  const wrap = text => text.split(/(\s+)/).map(part => {
    if (!part.trim()) return part;
    return `<span class="wm"><span class="w" style="--d:${(i++ * .06).toFixed(2)}s">${part}</span></span>`;
  }).join("");
  el.innerHTML = [...el.childNodes].map(n => n.nodeType === 3 ? wrap(n.textContent)
    : `<${n.tagName.toLowerCase()}>${wrap(n.textContent)}</${n.tagName.toLowerCase()}>`).join("");
};
$$(".split").forEach(splitWords);

// Pain sentences slide in from alternating sides (see onFrame)
const litLines = $$(".lit");

// ---------- Reveal on scroll ----------
$$(".steps, .modes").forEach(g => [...g.children].forEach((el, i) => el.style.setProperty("--d", `${i * .1}s`)));
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .15, rootMargin: "0px 0px -40px 0px" });
$$(".reveal, .split").filter(el => !el.closest(".hero")).forEach(el => io.observe(el));

// ---------- Intro ----------
const intro = $("#intro");
const heroTitle = $(".hero h1");
const startHero = () => requestAnimationFrame(() => heroTitle.classList.add("in"));
const skipIntro = (() => { try { return reduceMotion || sessionStorage.getItem("introSeen") === "1"; } catch { return reduceMotion; } })();
if (skipIntro) {
  document.documentElement.classList.add("no-intro");
  startHero();
} else {
  document.body.classList.add("locked");
  const first = [`img/fotos/retrato/jano-${FORMALES[0][0]}.jpg`, ...Object.values(PORTADA).map(l => photo(l[0]))];
  let loaded = 0;
  const bar = $("#intro-bar");
  const t0 = performance.now();
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    const wait = Math.max(0, 1300 - (performance.now() - t0));
    setTimeout(() => {
      bar.style.width = "100%";
      intro.classList.add("out");
      document.body.classList.remove("locked");
      setTimeout(startHero, 250);
      setTimeout(() => intro.remove(), 1100);
      try { sessionStorage.setItem("introSeen", "1"); } catch { /* private mode */ }
    }, wait);
  };
  first.forEach(src => {
    const im = new Image();
    im.onload = im.onerror = () => { loaded++; bar.style.width = `${(loaded / first.length) * 90}%`; if (loaded === first.length) finish(); };
    im.src = src;
  });
  setTimeout(finish, 2600);
}

// ---------- Nav, progress, quick actions ----------
const nav = $("#nav");
const progress = $(".progress");
const quick = $("#quick");
const booking = $("#reservar");
const onScrollUI = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  nav.classList.toggle("scrolled", scrollY > 10);
  const r = booking.getBoundingClientRect();
  const atBooking = r.top < innerHeight * .6 && r.bottom > innerHeight * .4;
  quick.classList.toggle("show", scrollY > innerHeight * .4 && !atBooking);
};

const spyLinks = $$("[data-spy]");
const spy = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) spyLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

const burger = $("#burger");
const toggleMenu = open => {
  nav.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  document.body.classList.toggle("locked", open);
};
burger.addEventListener("click", () => toggleMenu(!nav.classList.contains("open")));
$$("#menu a").forEach(a => a.addEventListener("click", () => toggleMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape") toggleMenu(false); });

// ---------- Hero stage: the formal looks, one at a time, story style ----------
const stageWrap = $("#stage-wrap");
const stageEl = $("#stage");
const retrato = id => `img/fotos/retrato/jano-${id}.jpg`;
$("#stage-frame").innerHTML = FORMALES.map(([id, name], i) => `
  <div class="st-slide${i ? "" : " on"}">
    <img class="bg" src="${retrato(id)}" alt="" ${i ? 'loading="lazy"' : ""}>
    <img class="fg" src="${retrato(id)}" alt="Jano: ${name.toLowerCase()}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
  </div>`).join("");
$("#stage-bars").innerHTML = FORMALES.map(() => "<span><i></i></span>").join("");
const stSlides = $$(".st-slide", stageEl), stBars = $$("#stage-bars span");
let stIdx = 0;
const showStage = i => {
  stIdx = (i + FORMALES.length) % FORMALES.length;
  stSlides.forEach((sl, j) => sl.classList.toggle("on", j === stIdx));
  stBars.forEach((b, j) => {
    b.className = j < stIdx ? "done" : "";
    const fill = b.firstElementChild;
    fill.style.animation = "none"; void fill.offsetWidth; fill.style.animation = "";
  });
  if (!reduceMotion) stBars[stIdx].className = "run";
  $("#sc-index").textContent = `${String(stIdx + 1).padStart(2, "0")}/${String(FORMALES.length).padStart(2, "0")}`;
  $("#sc-name").textContent = FORMALES[stIdx][1];
};
stBars.forEach(b => b.firstElementChild.addEventListener("animationend", () => showStage(stIdx + 1)));
$("#stage-prev").addEventListener("click", () => showStage(stIdx - 1));
$("#stage-next").addEventListener("click", () => showStage(stIdx + 1));
stageEl.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") stageEl.classList.add("paused"); });
stageEl.addEventListener("pointerleave", () => stageEl.classList.remove("paused"));
document.addEventListener("visibilitychange", () => stageEl.classList.toggle("paused", document.hidden));
showStage(0);

// 3D tilt + light that follows the pointer
const addTilt = (el, target = el, max = 8) => {
  if (!finePointer || reduceMotion) return;
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    target.style.setProperty("--ry", `${((x - .5) * max * 2).toFixed(2)}deg`);
    target.style.setProperty("--rx", `${((.5 - y) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
    target.style.setProperty("--hs", "1.04");
  });
  el.addEventListener("pointerleave", () => {
    target.style.setProperty("--ry", "0deg"); target.style.setProperty("--rx", "0deg"); target.style.setProperty("--hs", "1");
  });
};
addTilt(stageEl, stageEl, 5);
$$(".tilt").forEach(el => addTilt(el, el, 4));

// ---------- Custom cursor and magnetic buttons ----------
if (finePointer && !reduceMotion) {
  const cur = $("#cursor"), label = $("#cursor-label");
  let mx = -100, my = -100, cx = -100, cy = -100;
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; cur.classList.add("on"); }, { passive: true });
  document.addEventListener("pointerleave", () => cur.classList.remove("on"));
  const follow = () => {
    cx += (mx - cx) * .2; cy += (my - cy) * .2;
    cur.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
  document.addEventListener("pointerover", e => {
    const t = e.target.closest("[data-cursor]");
    cur.classList.toggle("big", !!t);
    label.textContent = t ? t.dataset.cursor : "";
  });
  $$(".magnetic").forEach(b => {
    b.addEventListener("pointermove", e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate3d(${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .35).toFixed(1)}px,0)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)"; b.style.transform = ""; setTimeout(() => { b.style.transition = ""; }, 600); });
  });
}

// ---------- Styles: one card per style; tap opens every look of that style ----------
const grid = $("#style-grid");
const lookList = cat => [
  ...PORTADA[cat].map(id => ({ id, cat, src: photo(id) })),
  ...GALERIA.filter(l => l.cat === cat)
];
grid.innerHTML = Object.entries(PORTADA).map(([cat, ids], i) => `
  <button type="button" class="style-tile pop" data-cat="${cat}" data-cursor="Ver looks" style="--d:${(i * .08).toFixed(2)}s" aria-label="Ver mis looks ${CATS[cat]}">
    ${ids.map((id, j) => `<img src="${photo(id)}" alt="" loading="lazy" class="${j ? "" : "on"}">`).join("")}
    <span class="st-bars">${ids.map((_, j) => `<i class="${j ? "" : "on"}"></i>`).join("")}</span>
    <span class="st-info"><span class="st-name">${CATS[cat]}<small>${lookList(cat).length} looks</small></span><span class="st-go" aria-hidden="true">→</span></span>
  </button>`).join("");
const tiles = $$(".style-tile", grid);
tiles.forEach(t => io.observe(t));
let gridVisible = false, cyc = 0;
new IntersectionObserver(([e]) => { gridVisible = e.isIntersecting; }).observe(grid);
if (!reduceMotion) setInterval(() => {
  if (document.hidden || !gridVisible) return;
  const t = tiles[cyc++ % tiles.length];
  const imgs = $$("img", t), bars = $$(".st-bars i", t);
  if (imgs.length < 2) return;
  const k = imgs.findIndex(im => im.classList.contains("on")), n = (k + 1) % imgs.length;
  imgs[k].classList.remove("on"); imgs[n].classList.add("on");
  bars[k].classList.remove("on"); bars[n].classList.add("on");
}, 1100);

// Lightbox: every look of the chosen style, swipe or arrows
const lb = $("#lightbox");
const lbImg = $("#lb-img");
let galItems = [], lbIndex = 0, lbOpener = null;
const showLb = i => {
  lbIndex = (i + galItems.length) % galItems.length;
  const l = galItems[lbIndex];
  lbImg.src = l.src;
  lbImg.alt = `Jano con un look ${CATS[l.cat].toLowerCase()}`;
  $("#lb-cap").textContent = `${CATS[l.cat]} · ${String(lbIndex + 1).padStart(2, "0")}/${String(galItems.length).padStart(2, "0")}`;
  new Image().src = galItems[(lbIndex + 1) % galItems.length].src;
};
const openStyle = (cat, opener) => {
  galItems = lookList(cat);
  lbOpener = opener;
  showLb(0);
  lb.hidden = false;
  document.body.classList.add("locked");
  $("#lb-close").focus();
};
const closeLb = () => {
  lb.hidden = true;
  document.body.classList.remove("locked");
  lbOpener?.focus({ preventScroll: true });
};
grid.addEventListener("click", e => {
  const t = e.target.closest(".style-tile");
  if (t) openStyle(t.dataset.cat, t);
});
$("#lb-close").addEventListener("click", closeLb);
$("#lb-prev").addEventListener("click", () => showLb(lbIndex - 1));
$("#lb-next").addEventListener("click", () => showLb(lbIndex + 1));
$("#lb-cta").addEventListener("click", closeLb);
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
let touchX = null;
lb.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) showLb(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});
addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") showLb(lbIndex - 1);
  if (e.key === "ArrowRight") showLb(lbIndex + 1);
});

// ---------- About: photos rotate with a wipe ----------
const aboutFrame = $("#about-frame");
const aboutDots = $("#about-dots");
aboutFrame.innerHTML = SOBRE_MI.map((id, i) => `<img src="${photo(id)}" alt="${i ? "" : "Jano Arribas Díaz"}" ${i ? 'loading="lazy"' : ""} class="${i ? "" : "on"}">`).join("");
aboutDots.innerHTML = SOBRE_MI.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("");
const aboutImgs = $$("img", aboutFrame), aboutBars = $$("i", aboutDots);
let aboutIdx = 0, aboutVisible = false;
new IntersectionObserver(([e]) => { aboutVisible = e.isIntersecting; }).observe(aboutFrame);
if (!reduceMotion) setInterval(() => {
  if (document.hidden || !aboutVisible) return;
  const prev = aboutIdx;
  aboutIdx = (aboutIdx + 1) % aboutImgs.length;
  aboutImgs.forEach(im => im.classList.remove("prev"));
  aboutImgs[prev].classList.replace("on", "prev");
  aboutImgs[aboutIdx].classList.add("on");
  aboutBars.forEach((b, i) => b.classList.toggle("on", i === aboutIdx));
}, 3200);

// ---------- One scroll handler for everything scroll-driven ----------
let ticking = false;
const onFrame = () => {
  ticking = false;
  onScrollUI();
  if (reduceMotion) return;
  const vh = innerHeight;
  // hero stage eases back as you leave the first screen
  const hr = stageWrap.getBoundingClientRect();
  if (hr.bottom > 0) {
    const p = clamp(scrollY / (vh * .8));
    stageWrap.style.transform = `translate3d(0,${(p * 50).toFixed(1)}px,0) scale(${(1 - p * .08).toFixed(3)})`;
    stageWrap.style.opacity = (1 - p * .7).toFixed(3);
  }
  // pain sentences: each slides in from its own side, sharp at the centre of the screen
  litLines.forEach((line, i) => {
    const r = line.getBoundingClientRect();
    if (r.bottom < -100 || r.top > vh + 100) return;
    const p = ease(clamp((vh * .92 - r.top) / (vh * .38)));
    const dir = i % 2 ? 1 : -1;
    line.style.transform = `translate3d(${((1 - p) * dir * 80).toFixed(1)}px,${((1 - p) * 30).toFixed(1)}px,0)`;
    line.style.opacity = (.08 + p * .92).toFixed(3);
    line.style.filter = p > .99 ? "none" : `blur(${((1 - p) * 10).toFixed(1)}px)`;
  });
};
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }, { passive: true });
addEventListener("resize", onFrame);
onFrame();

// ---------- Booking: large month calendar + times ----------
const booker = $("#booker");
const bsteps = $$(".bstep", booker);
const stepTabs = $$(".booker-steps li", booker);
const pick = { date: null, time: null };

const fmtMonth = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
const fmtLong = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const goStep = i => {
  bsteps.forEach((s, j) => s.classList.toggle("active", j === i));
  stepTabs.forEach((t, j) => t.classList.toggle("on", j <= i));
};

const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const ALL_SLOTS = (() => {
  const out = [];
  for (let m = toMin(CONFIG.horario.inicio); m + CONFIG.horario.minutos <= toMin(CONFIG.horario.fin); m += CONFIG.horario.minutos)
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  return out;
})();
const today = new Date(); today.setHours(0, 0, 0, 0);
const lastDay = new Date(today); lastDay.setDate(lastDay.getDate() + CONFIG.diasVista);
const slotsFor = date => {
  if (date < today || date > lastDay || !CONFIG.horario.dias.includes(date.getDay())) return [];
  const earliest = Date.now() + CONFIG.avisoMinimoHoras * 3600e3;
  return ALL_SLOTS.filter(t => { const d = new Date(date); d.setHours(0, toMin(t), 0, 0); return d.getTime() >= earliest; });
};

let viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const renderMonth = () => {
  $("#cal-month").textContent = cap(fmtMonth.format(viewMonth));
  const y = viewMonth.getFullYear(), m = viewMonth.getMonth();
  const blanks = (new Date(y, m, 1).getDay() + 6) % 7;
  const n = new Date(y, m + 1, 0).getDate();
  let html = "<span class='day blank'></span>".repeat(blanks);
  for (let d = 1; d <= n; d++) {
    const date = new Date(y, m, d);
    const free = slotsFor(date).length > 0;
    const sel = pick.date && date.getTime() === pick.date.getTime();
    const cls = ["day", free && "free", sel && "sel", date.getTime() === today.getTime() && "today"].filter(Boolean).join(" ");
    html += `<button type="button" class="${cls}" data-d="${d}" ${free ? "" : "disabled"} aria-label="${fmtLong.format(date)}${free ? "" : ", sin horas libres"}" aria-pressed="${!!sel}">${d}</button>`;
  }
  $("#days").innerHTML = html;
  $("#cal-prev").disabled = viewMonth <= new Date(today.getFullYear(), today.getMonth(), 1);
  $("#cal-next").disabled = viewMonth >= new Date(lastDay.getFullYear(), lastDay.getMonth(), 1);
};
const renderTimes = () => {
  const list = slotsFor(pick.date);
  $("#times-empty").hidden = true;
  $("#times-list").hidden = false;
  $("#chosen-day").textContent = cap(fmtLong.format(pick.date));
  $("#times-count").textContent = `${list.length} ${list.length === 1 ? "hora libre" : "horas libres"} · citas de ${CONFIG.horario.minutos} min`;
  $("#slots").innerHTML = list.map((t, i) => `<button type="button" class="slot" data-t="${t}" role="option" style="--d:${(i * .025).toFixed(3)}s">${t}</button>`).join("");
};
const chooseDay = date => { pick.date = date; pick.time = null; renderMonth(); renderTimes(); };

$("#cal-prev").addEventListener("click", () => { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1); renderMonth(); });
$("#cal-next").addEventListener("click", () => { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1); renderMonth(); });
$("#days").addEventListener("click", e => {
  const b = e.target.closest(".day.free");
  if (!b) return;
  chooseDay(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), +b.dataset.d));
  if (innerWidth < 860) $("#times").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("#slots").addEventListener("click", e => {
  const b = e.target.closest(".slot");
  if (!b) return;
  pick.time = b.dataset.t;
  $("#chosen-slot").textContent = `${cap(fmtLong.format(pick.date))} · ${pick.time}`;
  goStep(1);
  booker.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => $("#f-nombre").focus({ preventScroll: true }), 400);
});
$$("[data-back]", booker).forEach(b => b.addEventListener("click", () => goStep(0)));

// Hero shortcut: the next free time, one tap to the form
const fmtShort = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric" });
const nextSlot = (() => {
  for (let d = new Date(today); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const list = slotsFor(d);
    if (list.length) return { date: new Date(d), time: list[0] };
  }
  return null;
})();
if (nextSlot) {
  const isToday = nextSlot.date.getTime() === today.getTime();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const when = isToday ? "hoy" : nextSlot.date.getTime() === tomorrow.getTime() ? "mañana" : fmtShort.format(nextSlot.date);
  $("#next-slot-text").textContent = `${when} a las ${nextSlot.time}`;
  $("#next-slot").hidden = false;
  $("#next-slot").addEventListener("click", () => {
    viewMonth = new Date(nextSlot.date.getFullYear(), nextSlot.date.getMonth(), 1);
    chooseDay(new Date(nextSlot.date));
    pick.time = nextSlot.time;
    $("#chosen-slot").textContent = `${cap(fmtLong.format(pick.date))} · ${pick.time}`;
    goStep(1);
    scrollTo({ top: booker.getBoundingClientRect().top + scrollY - 90, behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => $("#f-nombre").focus({ preventScroll: true }), 900);
  });
}

// open on the first day with free times
(() => {
  for (let d = new Date(today); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if (slotsFor(d).length) {
      viewMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      chooseDay(new Date(d));
      return;
    }
  }
  renderMonth();
})();

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
  goStep(2);
  booker.scrollIntoView({ behavior: "smooth", block: "start" });
});
