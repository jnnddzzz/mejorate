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
const PORTADA = {            // Tarjetas de la portada: sus fotos van rotando
  streetwear: ["1810", "3160", "5430"],
  verano: ["8663", "2074", "9773"],
  chandal: ["4873", "9260"],
  arreglado: ["0412", "6100", "8356"]
};
const GALERIA = [
  ["2329", "streetwear", 840], ["9048", "streetwear", 840], ["5131", "streetwear", 840],
  ["8808", "streetwear", 840], ["2406", "streetwear", 840], ["5997", "streetwear", 840],
  ["2657", "verano", 785], ["9476", "verano", 840], ["2749", "verano", 762],
  ["8130", "verano", 840], ["0399", "verano", 840], ["8919", "verano", 840],
  ["2389", "chandal", 716], ["4436", "chandal", 840], ["0015", "chandal", 971],
  ["0204", "arreglado", 598], ["0517", "arreglado", 812], ["0518", "arreglado", 840], ["1676", "arreglado", 716]
].map(([id, cat, w]) => ({ id, cat, w, src: `img/fotos/jano-${id}.jpg` }));
const SOBRE_MI = ["9547", "8698", "5439", "6512"];
// =============================================

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
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

// Pain sentences: each word lights up with the scroll
const litLines = $$(".lit");
litLines.forEach(p => {
  p.innerHTML = p.textContent.split(" ").map(w => `<span class="lw">${w}</span>`).join(" ");
});

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
  const first = Object.values(PORTADA).map(l => photo(l[0]));
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

// ---------- Hero deck ----------
const heroPin = $("#hero-pin");
const stage = $("#hero-stage");
const heroIntro = $("#hero-intro");
const heroPick = $("#hero-pick");
const hint = $("#scroll-hint");
const deck = $("#deck");
const DECK = Object.entries(PORTADA);
deck.innerHTML = DECK.map(([cat, ids], i) => `
  <a class="card" href="#estilos" data-cat="${cat}" data-cursor="Ver looks" aria-label="Ver mis looks ${CATS[cat]}" style="z-index:${DECK.length - i}">
    <span class="card-media">${ids.map((id, j) => `<img src="${photo(id)}" alt="" ${j ? 'loading="lazy"' : ""} class="${j ? "" : "on"}" width="840" height="1400">`).join("")}</span>
    <span class="card-count">${ids.map((_, j) => `<i class="${j ? "" : "on"}"></i>`).join("")}</span>
    <span class="card-info"><span class="card-name">${CATS[cat]}<small>${ids.length + GALERIA.filter(l => l.cat === cat).length} looks</small></span><span class="card-go" aria-hidden="true">→</span></span>
  </a>`).join("");
const cards = $$(".card", deck);
let geo = [];
let heroP = 0;

const layoutDeck = () => {
  const W = stage.clientWidth, H = stage.clientHeight;
  const mobile = W < 760;
  const gutter = Math.max(16, W * .04);
  const top0 = heroPick.offsetTop + heroPick.offsetHeight + (mobile ? 16 : 24);
  const bottomPad = mobile ? 96 : 40;                     // keep clear of the quick-actions bar
  const avail = Math.min(1400, W - gutter * 2);
  const cols = mobile ? 2 : 4, gap = mobile ? 12 : 18, rows = mobile ? 2 : 1;
  const areaH = H - top0 - bottomPad;
  const byW = ((avail - gap * (cols - 1)) / cols) / .6;
  const byH = (areaH - gap * (rows - 1)) / rows;
  const ch = Math.max(150, Math.min(byW, byH)), cw = ch * .6;
  const total = cols * cw + (cols - 1) * gap;
  const x0 = (W - total) / 2;
  const y0 = top0 + Math.max(0, (areaH - (rows * ch + (rows - 1) * gap)) / 2);
  // where the fanned stack sits before you scroll
  const s0 = mobile ? .78 : Math.min(1.25, (H * .64) / ch);
  const introBottom = $(".hero-intro .actions").getBoundingClientRect().bottom - stage.getBoundingClientRect().top;
  const wrapRight = (W + Math.min(1200, W)) / 2 - gutter;
  const Sx = mobile ? W / 2 : wrapRight - cw * s0 * .62;
  const Sy = mobile ? Math.max(introBottom + ch * s0 * .5 + 30, H * .82) : H * .55;
  const rot = [-10, -3.5, 3.5, 10], off = [-46, -15, 15, 46];
  geo = cards.map((c, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const fx = x0 + col * (cw + gap), fy = y0 + row * (ch + gap);
    c.style.setProperty("--cw", `${cw}px`);
    c.style.setProperty("--ch", `${ch}px`);
    c.style.left = `${fx}px`;
    c.style.top = `${fy}px`;
    return { dx: Sx + off[i] * (mobile ? .6 : 1) - (fx + cw / 2), dy: Sy - (fy + ch / 2), rot: rot[i], s0 };
  });
  heroPin.style.height = `${H * (mobile ? 2.1 : 2.3)}px`;
};

let tFloat = 0;
const renderHero = now => {
  const travel = heroPin.offsetHeight - stage.clientHeight;
  heroP = travel > 0 ? clamp(-heroPin.getBoundingClientRect().top / travel) : 1;
  const e = ease(clamp((heroP - .04) / .62));
  const float = reduceMotion ? 0 : (1 - e);
  tFloat = now / 1000;
  cards.forEach((c, i) => {
    const g = geo[i];
    if (!g) return;
    const wob = Math.sin(tFloat * 1.1 + i * 1.3) * 6 * float;
    const tx = g.dx * (1 - e) + Math.sin(tFloat * .8 + i) * 4 * float;
    const ty = g.dy * (1 - e) + wob;
    const r = g.rot * (1 - e) + Math.sin(tFloat * .9 + i * 2) * 1.2 * float;
    const s = lerp(g.s0, 1, e);
    c.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`;
    c.style.setProperty("--info", clamp((heroP - .55) / .25).toFixed(3));
  });
  const fade = clamp(heroP / .32);
  heroIntro.style.opacity = (1 - fade).toFixed(3);
  heroIntro.style.transform = `translate3d(0,${(-fade * 70).toFixed(1)}px,0)`;
  heroIntro.style.visibility = fade >= 1 ? "hidden" : "visible";
  const pk = clamp((heroP - .42) / .25);
  heroPick.style.opacity = pk.toFixed(3);
  heroPick.style.transform = `translate3d(0,${((1 - pk) * 30).toFixed(1)}px,0)`;
  heroPick.classList.toggle("live", pk > .5);
  hint.style.opacity = (1 - clamp(heroP * 6)).toFixed(3);
  deck.classList.toggle("spread", e > .97);
};
let heroVisible = true;
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(heroPin);
const heroLoop = now => {
  if (heroVisible) renderHero(now);
  requestAnimationFrame(heroLoop);
};
layoutDeck();
requestAnimationFrame(heroLoop);

// Each card cycles through its own photos
let cyc = 0;
if (!reduceMotion) setInterval(() => {
  if (document.hidden || !heroVisible) return;
  const c = cards[cyc % cards.length];
  const imgs = $$(".card-media img", c), bars = $$(".card-count i", c);
  if (imgs.length > 1) {
    const k = imgs.findIndex(im => im.classList.contains("on"));
    const n = (k + 1) % imgs.length;
    imgs[k].classList.remove("on"); imgs[n].classList.add("on");
    bars[k].classList.remove("on"); bars[n].classList.add("on");
  }
  cyc++;
}, 900);

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
cards.forEach(c => addTilt(c, $(".card-media", c), 7));
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

// ---------- Styles gallery: pinned, photos glide sideways ----------
const pin = $("#styles-pin");
const gallery = $("#gallery");
const track = $("#gallery-track");
const filters = $("#filters");
const galBar = $("#gallery-bar");
const pinned = !reduceMotion;
if (!pinned) document.documentElement.classList.add("no-pin");
let activeCat = "streetwear";
let galItems = [], looksEls = [], travel = 0;

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
  if (r.bottom < 0 || r.top > innerHeight) return;
  const p = travel > 0 ? clamp(-r.top / travel) : 0;
  // a style with few photos sits centred; a long one glides with the scroll
  const shift = travel > 0 ? -p * travel : Math.max(0, (innerWidth - track.scrollWidth) / 2);
  track.style.transform = `translate3d(${shift.toFixed(1)}px,0,0)`;
  galBar.style.width = `${travel > 0 ? p * 100 : 100}%`;
  $("#gal-prev").disabled = p <= .001;
  $("#gal-next").disabled = p >= .999 || travel === 0;
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
    <button type="button" class="look" data-i="${i}" data-cursor="Ampliar" style="aspect-ratio:${l.w}/1400" aria-label="Ver look ${i + 1} en grande">
      <img src="${l.src}" alt="Jano con un look ${CATS[l.cat].toLowerCase()}" loading="lazy" width="${l.w}" height="1400">
      <figcaption>${String(i + 1).padStart(2, "0")}</figcaption>
    </button>`).join("");
  looksEls = $$(".look", track);
  $("#gallery-count").textContent = `${CATS[activeCat].toUpperCase()} · ${galItems.length} LOOKS`;
  gallery.scrollLeft = 0;
  layoutGallery();
};

const selectCat = cat => {
  if (cat === activeCat) return;
  activeCat = cat;
  $$(".chip", filters).forEach(b => b.setAttribute("aria-selected", b.dataset.cat === cat));
  renderGallery();
};
filters.addEventListener("click", e => {
  const c = e.target.closest(".chip");
  if (!c || c.dataset.cat === activeCat) return;
  selectCat(c.dataset.cat);
  if (pinned) scrollTo({ top: pin.getBoundingClientRect().top + scrollY, behavior: "smooth" });
});
// Hero cards open their style in the gallery
deck.addEventListener("click", e => {
  const c = e.target.closest(".card");
  if (!c) return;
  e.preventDefault();
  selectCat(c.dataset.cat);
  const target = pinned ? pin.getBoundingClientRect().top + scrollY : $("#estilos").getBoundingClientRect().top + scrollY - 72;
  scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
});

const cardStep = () => (looksEls[0]?.offsetWidth || 300) + 20;
const moveGallery = dir => {
  if (!pinned) return gallery.scrollBy({ left: dir * cardStep(), behavior: "smooth" });
  scrollBy({ top: dir * cardStep(), behavior: "smooth" });
};
$("#gal-prev").addEventListener("click", () => moveGallery(-1));
$("#gal-next").addEventListener("click", () => moveGallery(1));
gallery.addEventListener("scroll", updateGallery, { passive: true });
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
  document.body.classList.add("locked");
  $("#lb-close").focus();
};
const closeLb = () => {
  lb.hidden = true;
  document.body.classList.remove("locked");
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
  updateGallery();
  const vh = innerHeight;
  litLines.forEach(line => {
    const r = line.getBoundingClientRect();
    if (r.bottom < -50 || r.top > vh + 50) return;
    const p = clamp((vh * .88 - r.top) / (vh * .42));
    const words = line.children, n = words.length;
    for (let i = 0; i < n; i++) words[i].style.opacity = Math.max(.14, clamp(p * n - i)).toFixed(3);
  });
};
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }, { passive: true });
let resizeT;
addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { layoutDeck(); layoutGallery(); onFrame(); }, 120); });
addEventListener("load", () => { layoutDeck(); layoutGallery(); onFrame(); });
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
