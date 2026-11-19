/**
 * Mejórate · Reservas
 * Pega todo este archivo en la hoja «Mejórate · Reservas» → Extensiones → Apps Script (Código.gs).
 *
 * Cada vez que alguien reserva en la web:
 *  1. Añade la fila a la hoja.
 *  2. Ordena la hoja por día y hora de la cita (la más próxima arriba).
 *  3. Crea la cita en tu Google Calendar con avisos en el móvil antes de la videollamada.
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
    sheet.appendRow(cols.map(c => c === COL_CITA ? (cuando || "") : (p[c] || "")));
    ordenar_(sheet);
    if (CREAR_EVENTO && cuando) crearEvento_(p, cuando);
    return ContentService.createTextOutput("ok");
  } finally {
    lock.releaseLock();
  }
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
