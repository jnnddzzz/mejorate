/**
 * Mejórate · Reservas
 * Pega todo este archivo en la hoja «Mejórate · Reservas» → Extensiones → Apps Script (Código.gs).
 *
 * Cada vez que alguien reserva en la web:
 *  1. Guarda en la hoja TODOS los datos del cliente.
 *  2. Ordena la hoja por día y hora de la cita (la más próxima arriba).
 *  3. Crea la cita en tu Google Calendar con avisos en el móvil antes de la videollamada.
 *  4. Le dice a la web qué horas están ya cogidas, para que nadie más pueda reservarlas
 *     (a la web solo le llegan día y hora, nunca nombres ni teléfonos).
 *
 * Para liberar una hora: pon «Cancelada» en la columna Estado.
 *
 * Las fechas se leen tal y como se ven en la hoja (16/11/2026 y 16:30),
 * así que da igual la zona horaria de la hoja.
 */

// ----- Ajustes -----
const DURACION_MIN = 20;          // lo que dura la videollamada
const AVISOS_MIN = [60, 10];      // avisos en el móvil: 1 hora antes y 10 minutos antes
const CREAR_EVENTO = true;        // false si no quieres que se cree en Google Calendar
const COL_CITA = "Cita";          // columna con día y hora juntos (la crea sola)
const TITULO_EVENTO = "Videollamada · ";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const p = Object.assign({}, e.parameter);
    const sheet = hoja_();
    const cols = prepararColumna_(sheet);
    const cita = leerCita_(p["Día"], p["Hora"]);
    if (cita && ocupadas_().includes(cita.clave)) p["Estado"] = "Hora repetida: revisar";
    sheet.appendRow(cols.map(c => c === COL_CITA ? (cita ? cita.texto : "") : (p[c] || "")));
    ordenar_(sheet);
    if (CREAR_EVENTO && cita) crearEvento_(p, cita.fecha);
    return ContentService.createTextOutput("ok");
  } finally {
    lock.releaseLock();
  }
}

/** La web pregunta aquí qué horas están ocupadas. */
function doGet(e) {
  const out = JSON.stringify({ ocupadas: ocupadas_() });
  const cb = String((e && e.parameter && e.parameter.callback) || "");
  if (/^[A-Za-z_$][\w$]*$/.test(cb)) {
    return ContentService.createTextOutput(cb + "(" + out + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

/** Ejecútala a mano (▶ Ejecutar): crea/recalcula la columna «Cita», ordena y pide permisos. */
function prepararHoja() {
  const sheet = hoja_();
  prepararColumna_(sheet, true);
  ordenar_(sheet);
  CalendarApp.getDefaultCalendar(); // pide el permiso de Calendar ahora y no en la primera reserva
  Logger.log("Horas ocupadas que verá la web: " + ocupadas_().join(", "));
}

/**
 * Borra de tu Calendar las videollamadas futuras creadas por este código
 * y las vuelve a crear desde la hoja (con la hora buena). Puedes ejecutarla cuando quieras.
 */
function rehacerCalendario() {
  const cal = CalendarApp.getDefaultCalendar();
  const ahora = new Date();
  const hasta = new Date(ahora.getTime() + 400 * 864e5);
  const desde = new Date(ahora.getTime() - 7 * 864e5);
  cal.getEvents(desde, hasta).forEach(ev => { if (ev.getTitle().indexOf(TITULO_EVENTO) === 0) ev.deleteEvent(); });
  filas_().forEach(f => {
    if (f.cita && f.cita.fecha > ahora && !cancelada_(f.datos["Estado"])) crearEvento_(f.datos, f.cita.fecha);
  });
}

// ----- Funciones internas -----

function hoja_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function cancelada_(estado) {
  return /cancel/i.test(String(estado || ""));
}

/** Todas las filas como texto (tal y como se ven) con su cita ya calculada. */
function filas_() {
  const sheet = hoja_();
  const vals = sheet.getDataRange().getDisplayValues();
  const cols = vals.shift();
  return vals.map(f => {
    const datos = {};
    cols.forEach((c, i) => datos[c] = f[i]);
    return { datos: datos, cita: leerCita_(datos["Día"], datos["Hora"]) };
  });
}

/** Se asegura de que existe la columna «Cita» (la primera). Con rehacer=true la recalcula entera. */
function prepararColumna_(sheet, rehacer) {
  let cols = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let nueva = false;
  if (!cols.includes(COL_CITA)) {
    sheet.insertColumnBefore(1);
    sheet.getRange(1, 1).setValue(COL_CITA).setFontWeight("bold");
    cols = [COL_CITA].concat(cols);
    nueva = true;
  }
  const col = cols.indexOf(COL_CITA) + 1;
  sheet.getRange(1, col, sheet.getMaxRows(), 1).setNumberFormat("@"); // texto: no lo toca la zona horaria
  const n = sheet.getLastRow() - 1;
  if ((nueva || rehacer) && n > 0) {
    const vals = sheet.getRange(2, 1, n, cols.length).getDisplayValues();
    const iDia = cols.indexOf("Día"), iHora = cols.indexOf("Hora");
    sheet.getRange(2, col, n, 1).setValues(vals.map(f => {
      const c = leerCita_(f[iDia], f[iHora]);
      return [c ? c.texto : ""];
    }));
  }
  sheet.setFrozenRows(1);
  return cols;
}

/** Ordena por la columna «Cita» (texto «2026-11-23 16:00 · lun»): la cita más próxima arriba. */
function ordenar_(sheet) {
  const n = sheet.getLastRow() - 1;
  if (n < 2) return;
  const cols = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(2, 1, n, cols.length).sort({ column: cols.indexOf(COL_CITA) + 1, ascending: true });
}

/** Días y horas futuros ya reservados (sin las canceladas), como «2026-11-23 16:00». */
function ocupadas_() {
  const ahora = new Date();
  const out = [];
  filas_().forEach(f => {
    if (!f.cita || cancelada_(f.datos["Estado"])) return;
    if (f.cita.fecha > ahora && out.indexOf(f.cita.clave) === -1) out.push(f.cita.clave);
  });
  return out;
}

/**
 * «23/11/2026» + «16:00» →
 *   clave «2026-11-23 16:00» (la que usa la web),
 *   texto «2026-11-23 16:00 · lun» (columna Cita, se ordena bien),
 *   fecha (para Calendar, en la zona horaria del script: Madrid).
 */
function leerCita_(dia, hora) {
  const m = String(dia || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const t = String(hora || "").match(/(\d{1,2}):(\d{2})/);
  if (!m || !t) return null;
  const p2 = n => ("0" + n).slice(-2);
  const clave = m[3] + "-" + p2(m[2]) + "-" + p2(m[1]) + " " + p2(t[1]) + ":" + t[2];
  const fecha = Utilities.parseDate(clave, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  const dias = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const diaSemana = dias[new Date(+m[3], +m[2] - 1, +m[1]).getDay()];
  return { clave: clave, texto: clave + " · " + diaSemana, fecha: fecha };
}

function crearEvento_(p, inicio) {
  const fin = new Date(inicio.getTime() + DURACION_MIN * 60000);
  const nombre = String(p["Nombre"] || "Cliente").trim();
  const tel = String(p["Teléfono"] || "").replace(/\D/g, "");
  const wa = tel ? "https://wa.me/" + (tel.length === 9 ? "34" + tel : tel) : "";
  const descripcion = [
    "Videollamada gratis de " + DURACION_MIN + " min (reserva desde la web)",
    "",
    "Nombre: " + nombre + (p["Edad"] ? ", " + p["Edad"] + " años" : "") + (p["Sexo"] ? " (" + p["Sexo"] + ")" : ""),
    "Teléfono: " + (p["Teléfono"] || ""),
    wa ? "WhatsApp: " + wa : "",
    "Le ayudo con: " + (p["Le ayudo con"] || ""),
    "Estilo: " + (p["Estilo que quiere transmitir"] || ""),
    "Presupuesto: " + (p["Presupuesto"] || ""),
    "Después: " + (p["Asesoría después"] || "")
  ].join("\n");
  const ev = CalendarApp.getDefaultCalendar().createEvent(TITULO_EVENTO + nombre, inicio, fin, { description: descripcion });
  ev.removeAllReminders();
  AVISOS_MIN.forEach(m => ev.addPopupReminder(m));
  ev.setColor(CalendarApp.EventColor.MAUVE);
}
