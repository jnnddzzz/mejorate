// ==== CONFIGURACIÓN: cambia estos valores ====
const CONFIG = {
  whatsapp: "34600000000",   // Número con prefijo de país, sin + ni espacios
  whatsappMsg: "Hola Jano, quiero mejorar mi imagen y me gustaría información sobre la asesoría.",
  calendly: "",              // p. ej. "https://calendly.com/jjn-dzz/asesoria" (vacío = aviso)
  estilos: ["streetwear", "clásico", "minimal", "old money", "casual"]
};
// =============================================

document.documentElement.classList.add("js");

const waLink = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

document.querySelectorAll("[data-wa]").forEach(el => {
  el.href = waLink(el.dataset.waMsg || CONFIG.whatsappMsg);
  el.target = "_blank";
  el.rel = "noopener";
});

// Calendar
const cal = document.getElementById("calendar");
cal.innerHTML = CONFIG.calendly
  ? `<iframe src="${CONFIG.calendly}?hide_gdpr_banner=1" title="Reservar llamada" loading="lazy"></iframe>`
  : `<div class="pending"><div><strong>Calendario próximamente</strong>Mientras tanto, escríbeme por WhatsApp y reservamos.</div></div>`;

document.getElementById("year").textContent = new Date().getFullYear();

// Nav, progress bar and floating WhatsApp button
const nav = document.getElementById("nav");
const progress = document.querySelector(".progress");
const waFloat = document.querySelector(".wa-float");
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  nav.classList.toggle("scrolled", scrollY > 10);
  waFloat.classList.toggle("show", scrollY > innerHeight * .6);
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
const burger = document.getElementById("burger");
const toggleMenu = open => {
  nav.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  document.body.style.overflow = open ? "hidden" : "";
};
burger.addEventListener("click", () => toggleMenu(!nav.classList.contains("open")));
document.querySelectorAll("#menu a").forEach(a => a.addEventListener("click", () => toggleMenu(false)));

// Rotating style word in the hero
const rotator = document.getElementById("rotator");
let r = 0;
setInterval(() => {
  rotator.classList.add("out");
  setTimeout(() => {
    r = (r + 1) % CONFIG.estilos.length;
    rotator.textContent = CONFIG.estilos[r];
    rotator.classList.remove("out");
  }, 350);
}, 2400);

// Reveal on scroll, staggered within each group
document.querySelectorAll(".pains, .areas, .lookbook, .plans, .steps").forEach(group => {
  [...group.children].forEach((el, i) => el.style.setProperty("--d", `${i * 0.08}s`));
});
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  });
}, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// Lookbook filters
document.querySelectorAll(".chip").forEach(chip => chip.addEventListener("click", () => {
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip));
  const f = chip.dataset.filter;
  document.querySelectorAll(".look").forEach(look => {
    look.classList.toggle("hide", f !== "all" && look.dataset.cat !== f);
  });
}));

// Quiz
const steps = [...document.querySelectorAll(".quiz-step")];
const bar = document.getElementById("quiz-bar");
const answers = [];
const show = i => {
  steps.forEach((s, j) => s.classList.toggle("active", j === i));
  bar.style.width = `${(i / (steps.length - 1)) * 100}%`;
};
const RESULTS = {
  "Resolver algo concreto pronto": ["Consulta por WhatsApp", "Me mandas fotos y te digo qué cambiar, rápido y sin compromiso."],
  "Un plan claro para empezar": ["Llamada de asesoría", "En una sesión te analizo y sales con un plan claro para tu imagen."],
  "Acompañamiento durante el cambio": ["Plan mensual", "Te acompaño todo el mes por WhatsApp mientras haces el cambio."]
};
steps.forEach((step, i) => step.querySelectorAll(".opts button").forEach(btn => btn.addEventListener("click", () => {
  answers[i] = btn.dataset.v;
  if (i === 2) {
    const [title, text] = RESULTS[answers[2]];
    document.getElementById("quiz-title").textContent = title;
    document.getElementById("quiz-text").textContent = text;
    document.getElementById("quiz-wa").href = waLink(
      `Hola Jano, he hecho el test de tu web:\n• Quiero mejorar: ${answers[0]}\n• Estilo: ${answers[1]}\n• Busco: ${answers[2]}\nMe recomienda: ${title}. ¿Hablamos?`
    );
    document.getElementById("quiz-wa").target = "_blank";
  }
  show(i + 1);
})));
document.getElementById("quiz-reset").addEventListener("click", () => show(0));
