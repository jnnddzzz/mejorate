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

## Google Sheets (hoja «Mejórate · Reservas» en tu Drive)

La hoja ya existe en tu Drive con las columnas puestas. Para conectarla:

1. Abre la hoja **Mejórate · Reservas** en Google Drive (desde el ordenador es más fácil).
2. Menú **Extensiones → Apps Script**. Borra lo que haya y pega esto:
   ```js
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     const cols = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
     sheet.appendRow(cols.map(c => e.parameter[c] || ""));
     return ContentService.createTextOutput("ok");
   }
   ```
3. Pulsa el icono de guardar (💾).
4. Arriba a la derecha: **Implementar → Nueva implementación**. En el engranaje elige **Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
5. Pulsa **Implementar**, acepta los permisos (Google avisará de que la app no está verificada: «Configuración avanzada» → «Ir a … (no seguro)», es tu propio script).
6. Copia la **URL de la aplicación web** (termina en `/exec`) y ponla en `sheetsEndpoint` de `js/main.js`.

Cada reserva añade una fila con Estado «Pendiente». Cuando confirmes la cita, cámbialo a «Confirmada».

## Cambiar el horario

En `js/main.js`, bloque `horario`: cada número es un día (0 = domingo, 1 = lunes … 6 = sábado) con sus horas libres. Para cerrar un día, bórralo de la lista. `diasVista` marca cuántos días hacia delante se puede reservar y `avisoMinimoHoras` la antelación mínima.

Ten en cuenta que el calendario no sabe qué horas ya están reservadas: dos personas podrían elegir la misma. Por eso confirmas tú cada cita por WhatsApp.
