// Persistencia en localStorage para el PRODE.

var STORAGE_KEY = "prode-mundial-2026";

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    var data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    if (!data.predictions) data.predictions = {};
    return data;
  } catch (e) {
    console.warn("No se pudo leer el estado guardado:", e);
    return null;
  }
}

function saveState(state) {
  try {
    var payload = {
      playerName: state.playerName || "",
      predictions: state.predictions || {},
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error("No se pudo guardar el estado:", e);
    return false;
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("No se pudo limpiar el estado:", e);
  }
}
