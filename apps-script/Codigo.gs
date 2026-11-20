/**
 * Mejórate · Reservas
 * Pega todo este archivo en la hoja «Mejórate · Reservas» → Extensiones → Apps Script (Código.gs).
 *
 * Cada vez que alguien reserva en la web:
 *  1. Añade la fila a la hoja.
 *  2. Ordena la hoja por día y hora de la cita (la más próxima arriba).
 *  3. Crea la cita en tu Google Calendar con avisos en el móvil antes de la videollamada.
 *  4. Le dice a la web qué horas están ya cogidas, para que nadie más pueda reservarlas
 *     (solo se envían día y hora, nunca nombres ni teléfonos).
 *
 * Para liberar una hora: pon «Cancelada» en la columna Estado.
 */

// ----- Ajustes -----
const DURACION_MIN = 20;          // lo que dura la videollamada
const AVISOS_MIN = [60, 10];      // avisos en el móvil: 1 hora antes y 10 minutos antes
const CREAR_EVENTO = true;        // false si no quieres que se cree en Google Calendar
const COL_CITA = "Cita";          // columna con día y hora juntos (la crea sola)

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const p = e.parameter;
    const sheet = hoja_();
    const cols = prepararColumna_(sheet);
    const cuando = fechaCita_(p["Día"], p["Hora"]);
    if (cuando && ocupadas_().includes(clave_(cuando))) p["Estado"] = "Hora repetida: revisar";
    sheet.appendRow(cols.map(c => c === COL_CITA ? (cuando || "") : (p[c] || "")));
    ordenar_(sheet);
    if (CREAR_EVENTO && cuando) crearEvento_(p, cuando);
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

/** Días y horas futuros ya reservados (sin las canceladas), como «2026-11-23 16:00». */
function ocupadas_() {
  const sheet = hoja_();
  const datos = sheet.getDataRange().getValues();
  const cols = datos.shift();
  const iDia = cols.indexOf("Día"), iHora = cols.indexOf("Hora"), iEstado = cols.indexOf("Estado");
  const ahora = new Date();
  const out = [];
  datos.forEach(f => {
    if (iEstado > -1 && /cancel/i.test(String(f[iEstado]))) return;
    const d = fechaCita_(f[iDia], f[iHora]);
    if (d && d > ahora) out.push(clave_(d));
  });
  return out;
}

function clave_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
}

/** Ejecútala UNA vez a mano (botón ▶ Ejecutar) para preparar la hoja y dar permisos. */
function prepararHoja() {
  const sheet = hoja_();
  prepararColumna_(sheet);
  ordenar_(sheet);
  CalendarApp.getDefaultCalendar(); // pide el permiso de Calendar ahora y no en la primera reserva
}

/** Opcional: pasa a tu Calendar las citas futuras que ya estaban en la hoja. */
function pasarCitasAlCalendario() {
  const sheet = hoja_();
  const cols = prepararColumna_(sheet);
  const filas = sheet.getDataRange().getValues().slice(1);
  const ahora = new Date();
  filas.forEach(f => {
    const fila = {};
    cols.forEach((c, i) => fila[c] = f[i]);
    const cuando = fila[COL_CITA];
    if (cuando instanceof Date && cuando > ahora && fila["Estado"] !== "Cancelada") crearEvento_(fila, cuando);
  });
}

// ----- Funciones internas -----

function hoja_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

/** Se asegura de que existe la columna «Cita» (la primera) y la rellena en las filas antiguas. */
function prepararColumna_(sheet) {
  let cols = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (!cols.includes(COL_CITA)) {
    sheet.insertColumnBefore(1);
    sheet.getRange(1, 1).setValue(COL_CITA).setFontWeight("bold");
    cols = [COL_CITA].concat(cols);
    const n = sheet.getLastRow() - 1;
    if (n > 0) {
      const iDia = cols.indexOf("Día"), iHora = cols.indexOf("Hora");
      const datos = sheet.getRange(2, 1, n, cols.length).getValues();
      sheet.getRange(2, 1, n, 1).setValues(datos.map(f => [fechaCita_(f[iDia], f[iHora]) || ""]));
    }
  }
  const col = cols.indexOf(COL_CITA) + 1;
  sheet.getRange(2, col, Math.max(sheet.getMaxRows() - 1, 1), 1).setNumberFormat("ddd dd/mm/yyyy · HH:mm");
  sheet.setFrozenRows(1);
  return cols;
}

/** Ordena por la columna «Cita»: la cita más próxima arriba. */
function ordenar_(sheet) {
  const n = sheet.getLastRow() - 1;
  if (n < 2) return;
  const cols = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(2, 1, n, cols.length).sort({ column: cols.indexOf(COL_CITA) + 1, ascending: true });
}

/** «19/11/2026» (o una fecha) + «15:30» → fecha con hora. */
function fechaCita_(dia, hora) {
  if (!dia || !hora) return null;
  let d;
  if (dia instanceof Date) {
    d = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
  } else {
    const m = String(dia).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!m) return null;
    d = new Date(+m[3], +m[2] - 1, +m[1]);
  }
  let h, min;
  if (hora instanceof Date) { h = hora.getHours(); min = hora.getMinutes(); }
  else {
    const t = String(hora).match(/(\d{1,2}):(\d{2})/);
    if (!t) return null;
    h = +t[1]; min = +t[2];
  }
  d.setHours(h, min, 0, 0);
  return d;
}

function crearEvento_(p, inicio) {
  const fin = new Date(inicio.getTime() + DURACION_MIN * 60000);
  const nombre = p["Nombre"] || "Cliente";
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
  ].filter(l => l !== null).join("\n");
  const ev = CalendarApp.getDefaultCalendar().createEvent("Videollamada · " + nombre, inicio, fin, { description: descripcion });
  ev.removeAllReminders();
  AVISOS_MIN.forEach(m => ev.addPopupReminder(m));
  ev.setColor(CalendarApp.EventColor.MAUVE);
}
