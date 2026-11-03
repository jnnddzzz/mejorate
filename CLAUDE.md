# Proyecto «mejorate»: briefing

Contexto del proyecto para retomarlo en cualquier sesión. Mantener actualizado cuando cambien decisiones.

## Quién
- **Jano Arribas Díaz**, conocido en redes como **jjn.dzz** (TikTok e Instagram, ya con cierta fama).
- Experto en estética masculina: corte de pelo, barba, ropa, colores y estilo. Sabe adaptarse a cualquier altura, peso, estilo y tono de piel.

## Qué
Web de **asesoría de imagen** donde los clientes se informan, confían en Jano y contratan.
- Objetivo a futuro: también un vídeo promocional y, quizá, un curso.

## Público
Hombres de **16 a 40 años**, usuarios de redes sociales, que no saben vestirse o sacarse partido.

## Servicios (decididos)
1. **Llamada de asesoría** 1 a 1 (videollamada).
2. **Asesoría por WhatsApp** en tiempo real.
3. **Plan mensual** (llamada inicial + WhatsApp + seguimiento).
- Precios: **pendientes** (en la web aparecen como «— €»).

## Reservas y pago
- **Calendly / Cal.com** incrustado en la web (pago por adelantado con Stripe si se activa).
- Botones de WhatsApp con `wa.me` y mensaje prellenado.

## Diseño
- **Blanco y negro editorial**, moderno, limpio, minimalista, tipo revista de moda.
- Tipografías: Instrument Serif (titulares) + Inter (texto).
- Tono cercano (tuteo, en primera persona: «Hola, soy Jano»), limpio, dinámico y profesional. Fondo blanco roto, esquinas redondeadas, animaciones suaves.
- Fotos de Jano protagonistas (distintos estilos, looks y colores).
- Marca: se reconoce por **jjn.dzz** y aparece el nombre **Jano Arribas Díaz**.

## Técnica
- HTML/CSS/JS estático sin dependencias: `index.html`, `css/styles.css`, `js/main.js`. Apto para GitHub Pages.
- Repositorio: `jnnddzzz/mejorate` (antes se planeó como «estetica»).
- Configuración editable al principio de `js/main.js` (`CONFIG`): número de WhatsApp, enlace de Calendly y estilos del texto rotatorio.
- Fotos en `img/`. Los huecos son `<figure class="ph … empty">`; para poner una foto, añadir `<img src="img/…" alt="…">` dentro y quitar la clase `empty`.
- Lookbook filtrable por `data-cat` (urbano, elegante, diario).
- Test de 3 preguntas que recomienda un servicio y envía las respuestas por WhatsApp.

## Pendiente
- [ ] Fotos de Jano (hero, sobre mí y 6 estilos del lookbook).
- [ ] Número de WhatsApp real.
- [ ] Enlace de Calendly/Cal.com.
- [ ] Precios de los tres servicios.
- [ ] Testimonios reales de clientes (no inventarlos).
- [ ] Dominio propio (opcional).
- [ ] Guion del vídeo promocional.
