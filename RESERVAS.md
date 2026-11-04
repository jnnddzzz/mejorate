# Cómo guardar las reservas

La web tiene su propio calendario. Cuando alguien reserva la consulta gratis:

1. **Siempre:** se le abre un botón para mandarte la reserva por WhatsApp con todos sus datos.
2. **Si configuras un destino** (`formEndpoint` en `js/main.js`), los datos además se guardan solos, aunque la persona no pulse el botón de WhatsApp.

Datos que se guardan: fecha de la reserva, día, hora, nombre, edad, sexo, teléfono, con qué quiere ayuda y modalidad (online o en persona en Cádiz).

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

## Opción B: Google Sheets (gratis e ilimitado)

Requiere tener espacio libre en Google Drive.

1. Crea una hoja de cálculo nueva en Google Sheets llamada «Mejórate · Reservas».
2. Menú **Extensiones → Apps Script**, borra lo que haya y pega esto:
   ```js
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     const p = e.parameter;
     const cols = ["Fecha de reserva", "Día", "Hora", "Nombre", "Edad", "Sexo", "Teléfono",
                   "Le ayudo con", "Modalidad"];
     if (sheet.getLastRow() === 0) sheet.appendRow(cols);
     sheet.appendRow(cols.map(c => p[c] || ""));
     return ContentService.createTextOutput(JSON.stringify({ ok: true }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
3. Pulsa **Implementar → Nueva implementación → Aplicación web**. En «Quién tiene acceso» elige **Cualquier usuario** e implementa.
4. Copia la URL que termina en `/exec` y ponla en `formEndpoint`.

## Cambiar el horario

En `js/main.js`, bloque `horario`: cada número es un día (0 = domingo, 1 = lunes … 6 = sábado) con sus horas libres. Para cerrar un día, bórralo de la lista. `diasVista` marca cuántos días hacia delante se puede reservar y `avisoMinimoHoras` la antelación mínima.

Ten en cuenta que el calendario no sabe qué horas ya están reservadas: dos personas podrían elegir la misma. Por eso confirmas tú cada cita por WhatsApp.
