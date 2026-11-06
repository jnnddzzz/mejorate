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
- Enfoque: sacar el máximo partido a la forma de cuerpo y la cara de cada cliente. «La moda no tiene reglas». Jano rechazó la frase «vestir como el hombre que quieres ser» por sonar sexista: evitar mensajes de ese tipo.
- **Primera consulta gratis** (20 min). Es el CTA principal.
- Modalidades: **online** (videollamada + WhatsApp) y **en persona solo en Cádiz** (ir de compras juntos, revisar armario).
- Objetivo de la web: **portal para reservar cita o llamar**, sencillo, claro y sin distracciones. Él hace el trabajo después.
- Sin precios públicos por ahora.

## Reservas
- Calendario propio en la web (sección `#reservar`): día → hora → datos → confirmación por WhatsApp.
- Datos que se piden (formulario corto, a petición de Jano): nombre, edad, sexo, teléfono, con qué te ayudo y modalidad. **No** se pide el problema (lo cuentan en la cita).
- Botones de llamar (`tel:`) y WhatsApp siempre visibles (barra flotante `.quick`).
- Horario real: **lunes a viernes de 16:30 a 21:30, citas de 20 min** (`CONFIG.horario` en `js/main.js`). Calendario de mes completo, grande, con las horas al lado.
- Los datos se guardan si `CONFIG.formEndpoint` apunta a Formspree o a un Google Apps Script (ver `RESERVAS.md`). El Google Drive de Jano estaba lleno, por eso no se creó la hoja.
- Botones de WhatsApp con `wa.me` y mensaje prellenado.

## Diseño
- Experiencia **inusual, inmersiva y «dopamínica» pero intuitiva**, minimalista, sin saturar. Nivel de estudio de animación.
- Jano rechazó: fondo de fotos que cambiaban, anillo 3D, burbujas, carrusel de fotos repetidas, y un visor de historias pequeño en la portada.
- Entrada breve con la marca (1,6 s, solo la primera vez por sesión) y titular que entra palabra a palabra.
- Portada: retrato editorial grande (marco fino, pie de foto, barras) con **looks arreglados/formales** que van pasando (`FORMALES`). Al hacer scroll se transforma en 4 tarjetas de estilo (fila en ordenador, 2×2 en móvil) que rotan fotos y enlazan a la galería. En móvil: texto → el retrato sube → tarjetas.
- CTA de portada muy visible: botón grande «Reserva tu cita gratis» con brillo y pulso, botones Llámame y WhatsApp, y atajo «Próximo hueco libre: hoy a las 16:30» que abre el formulario con esa hora. Gancho: «¿Sabes que puedes verte mejor pero no sabes por dónde empezar? En 20 minutos te digo qué te favorece. Gratis.»
- Frases de puntos de dolor que se iluminan palabra a palabra. **Nunca sexistas**: «la moda no tiene reglas», cualquier altura, cuerpo, piel o estilo.
- **Ninguna foto parada ni repetida** en toda la web. Cada foto se usa una sola vez (portada, galería o «Sobre mí»).
- Cursor propio con etiqueta («Ver looks», «Ampliar») y botones magnéticos en ordenador.
- Oscuro, paneles de cristal ahumado, acento degradado cromado en los titulares en cursiva.
- Tipografías: Instrument Serif (titulares) + Inter (texto) + JetBrains Mono (etiquetas).
- Tono cercano (tuteo, «Hola, soy Jano»). Textos claros sobre qué hace, sin información que despiste.
- Marca: se reconoce por **jjn.dzz** y aparece el nombre **Jano Arribas Díaz**.

## Técnica
- HTML/CSS/JS estático sin dependencias: `index.html`, `css/styles.css`, `js/main.js`. Apto para GitHub Pages.
- Repositorio: `jnnddzzz/mejorate` (antes se planeó como «estetica»).
- Configuración editable al principio de `js/main.js` (`CONFIG`): teléfono (llamadas y WhatsApp), `formEndpoint`, horario y días de antelación.
- Fotos en `img/fotos/jano-XXXX.jpg` (1400 px) y `img/fotos/thumb/` (420 px). Salen de Google Drive, carpeta «mis fotos» y su subcarpeta «chandalesç».
- Reglas de fotos (pedidas por Jano): Jano centrado, **nunca cortar cabeza ni zapatos**, y **solo una foto por outfit**. El centrado se hace con detección de persona (YOLO): los recortes solo quitan laterales, centrados en la caja de la persona (máx. 3:5). Nunca usar `object-fit: cover` con fotos de Jano en marcos de otra proporción.
- Fotos repartidas sin repetir en `js/main.js`: `FORMALES` (retrato de portada), `PORTADA` (fotos de cada tarjeta, todas de 840 px de ancho para que encajen en 3:5 sin recorte), `GALERIA` y `SOBRE_MI` (rotan en «Sobre mí»). Categorías: streetwear, verano, chandal, arreglado. Al añadir fotos clásicas, crear «clásico» en `CATS` y `PORTADA`.
- Descartadas por outfit repetido: 0629, 5327, 9421, 9738, 8057, 2241. Por calidad: 9065. No descargada (8 MB, demasiado grande para el conector): IMG_0870.JPG.
- Efectos: abanico de la portada (`#hero-pin`, `#deck`), frases iluminadas (`.lit`), galería fijada al scroll con la foto central destacada (`#styles-pin`, `#gallery-track`), fotos de «Sobre mí» con barrido (`#about-frame`), calendario de mes (`#days`, `#slots`), lightbox, títulos palabra a palabra (`.split`) y scroll spy.
- Vista previa privada: https://claude.ai/artifact/2FYycAd2ZJYSmznCAxgCzx

## Pendiente
- [x] Fotos de Jano de Drive (34 looks).
- [ ] Fotos de estilo clásico (Jano las subirá).
- [x] Número de WhatsApp real (+34 659 50 69 79).
- [ ] Activar guardado de reservas (`formEndpoint`, ver `RESERVAS.md`).
- [x] Horario real: L–V 16:30–21:30, citas de 20 min.
- [x] Zona para el servicio en persona: Cádiz.
- [x] GitHub Pages activo: https://jnnddzzz.github.io/mejorate/
- [ ] Testimonios reales de clientes (no inventarlos).
- [ ] Dominio propio (opcional).
- [ ] Guion del vídeo promocional.
