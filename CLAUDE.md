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

## Servicio (lo que vende Jano: su tiempo)
- Especialidad principal: **vestimenta**. También: colorimetría, corte de pelo y barba, cejas según la cara, facciones.
- Solo trabaja con **hombres** (es lo que domina); la web debe dejarlo claro.
- **Primera consulta gratis** (20 min) para que el cliente cuente su problema y por qué necesita ayuda. Es el CTA principal.
- Modalidades: **online** (videollamada + WhatsApp) y **en persona** si vive en su zona (personal shopper: ir de compras juntos, revisar armario).
- Objetivo de la web: que contacten con él, de forma sencilla e intuitiva. Él hace el trabajo después.
- Sin precios públicos por ahora.

## Reservas
- Calendario propio en la web (sección `#reservar`): día → hora → datos → confirmación por WhatsApp.
- Horario editable en `CONFIG.horario` de `js/main.js`.
- Los datos se guardan si `CONFIG.formEndpoint` apunta a Formspree o a un Google Apps Script (ver `RESERVAS.md`). El Google Drive de Jano estaba lleno, por eso no se creó la hoja.
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
- Configuración editable al principio de `js/main.js` (`CONFIG`): WhatsApp, `formEndpoint`, horario y estilos del texto rotatorio.
- Fotos en `img/fotos/jano-XXXX.jpg` (1400 px) y `img/fotos/thumb/` (420 px). Salen de Google Drive, carpeta «mis fotos» y su subcarpeta «chandalesç».
- Reglas de fotos (pedidas por Jano): Jano centrado, **nunca cortar cabeza ni zapatos**, y **solo una foto por outfit**. Los recortes solo quitan laterales (proporción 3:5).
- Portada: `jano-1676`. Sobre mí: `jano-9547`. El resto está en el array `LOOKS` de `js/main.js` con su categoría: streetwear, verano, chandal, arreglado. Al añadir fotos clásicas, crear la categoría «clásico».
- Descartadas por outfit repetido: 0629, 5327, 9421, 9738, 8057, 2241. Por calidad: 9065. No descargada (8 MB, demasiado grande para el conector): IMG_0870.JPG.
- Efectos: carrusel de cápsulas que se desliza con el scroll (`.reel`), burbujas con fotos que aparecen con parallax en los laterales (`.bubbles`) y visor a pantalla completa (lightbox).
- Navegación con scroll spy (menú y puntos laterales marcan la sección actual) y barra fija «Consulta gratis» en móvil.
- Vista previa privada: https://claude.ai/artifact/2FYycAd2ZJYSmznCAxgCzx

## Pendiente
- [x] Fotos de Jano de Drive (34 looks).
- [ ] Fotos de estilo clásico (Jano las subirá).
- [x] Número de WhatsApp real (+34 659 50 69 79).
- [ ] Activar guardado de reservas (`formEndpoint`, ver `RESERVAS.md`).
- [ ] Confirmar horario real de consultas.
- [ ] Indicar su zona/ciudad para el servicio en persona.
- [ ] Activar GitHub Pages.
- [ ] Testimonios reales de clientes (no inventarlos).
- [ ] Dominio propio (opcional).
- [ ] Guion del vídeo promocional.
