# Cómo guardar las reservas

La web tiene su propio calendario. Cuando alguien reserva la consulta gratis:

1. **Siempre:** se le abre un botón para mandarte la reserva por WhatsApp con todos sus datos.
2. **Si configuras un destino** (`formEndpoint` en `js/main.js`), los datos además se guardan solos, aunque la persona no pulse el botón de WhatsApp.

Datos que se guardan: fecha de la reserva, día, hora, nombre, edad, sexo, teléfono, con qué quiere ayuda, estilo que quiere transmitir, presupuesto, asesoría después (online o en persona en Cádiz) y primera cita.

## Opción A: Formspree (la más fácil, 5 minutos)

Guarda cada reserva en un panel online y te manda un email con cada una. Gratis hasta 50 reservas al mes.

1. Entra en https://formspree.io y crea una cuenta con tu email.
2. Pulsa **New Form**, ponle de nombre «Reservas Mejórate» y créalo.
3. Copia la URL que te da, del tipo `https://formspree.io/f/abcdwxyz`.
4. Pásamela, o pégala tú en `js/main.js`:
   ```js
   formEndpoint: "https://formspree.io/f/abcdwxyz",
   ```
5. Haz una reserva de prueba y confirma el email que te manda Formspree.

Puedes ver todas las reservas en tu panel de Formspree y exportarlas a Excel (CSV).

## Google Sheets + Google Calendar (hoja «Mejórate · Reservas»)

Con el código de `apps-script/Codigo.gs`, cada reserva:
1. Se añade a la hoja.
2. La hoja se ordena sola por **día y hora de la cita** (columna «Cita», la más próxima arriba).
3. Se crea la cita en tu **Google Calendar** («Videollamada · Nombre», con sus datos y un enlace a su WhatsApp) y te avisa en el móvil **1 hora y 10 minutos antes**.
4. **Bloquea esa hora en la web**: nadie más puede elegirla. Si alguien la coge mientras otra persona rellena sus datos, a esa persona se le avisa y elige otra hora. Para liberar una hora, pon «Cancelada» en Estado. A la web solo le llegan días y horas, nunca nombres ni teléfonos.

### Instalarlo o actualizarlo (desde el ordenador, 5 minutos)

1. Abre la hoja **Mejórate · Reservas** → menú **Extensiones → Apps Script**.
2. Borra todo lo que hay en `Código.gs` y pega el contenido entero de `apps-script/Codigo.gs`. Pulsa guardar (💾).
3. **Configuración del proyecto** (engranaje ⚙️ a la izquierda) → Zona horaria: **(GMT+01:00) Madrid**.
4. Vuelve al editor, elige la función **prepararHoja** en el desplegable de arriba y pulsa **▶ Ejecutar**. Acepta los permisos (hoja y Calendar). Si Google avisa de que la app no está verificada: «Configuración avanzada» → «Ir a … (no seguro)», es tu propio script. Esto crea (o recalcula) la columna «Cita» y ordena las reservas que ya tenías. En «Registro de ejecución» verás las horas ocupadas que va a bloquear la web.
5. Ejecuta **rehacerCalendario**: borra de tu Calendar las videollamadas futuras creadas por el código y las vuelve a crear desde la hoja con la hora correcta. Puedes ejecutarla siempre que quieras.
6. **Muy importante:** **Implementar → Gestionar implementaciones** → lápiz ✏️ → Versión: **Nueva versión** → **Implementar**. Así la URL `/exec` sigue siendo la misma y la web no hay que tocarla. (Si haces «Nueva implementación» sale otra URL y habría que cambiar `sheetsEndpoint` en `js/main.js`.)

### Primera instalación (si no existiera aún la implementación)

**Implementar → Nueva implementación** → tipo **Aplicación web** · Ejecutar como: **Yo** · Acceso: **Cualquier usuario**. Copia la URL `/exec` y ponla en `sheetsEndpoint` de `js/main.js`.

### Avisos

- **En cuanto alguien reserva:** te llega el email de Formspree (y, si activas las notificaciones de Google Calendar en el móvil, la cita aparece en tu calendario al momento).
- **Antes de cada cita:** aviso de Google Calendar 1 h y 10 min antes (se cambia en `AVISOS_MIN`).
- En la hoja, cambia **Estado** a «Confirmada» o «Cancelada». Si cancelas, borra también el evento del Calendar.

## Cambiar el horario

En `js/main.js`, bloque `horario`: cada número es un día (0 = domingo, 1 = lunes … 6 = sábado) con sus horas libres. Para cerrar un día, bórralo de la lista. `diasVista` marca cuántos días hacia delante se puede reservar y `avisoMinimoHoras` la antelación mínima.

Las horas ya reservadas en la hoja se bloquean solas en la web (función `doGet` de `apps-script/Codigo.gs`). Si el código de la hoja no está actualizado, la web sigue funcionando pero sin bloquear horas.
