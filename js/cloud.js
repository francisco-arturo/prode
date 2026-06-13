// Capa de sincronización con Supabase (base compartida de pronósticos).
// Si Supabase no está disponible/configurado, la app sigue funcionando local.

var TABLE = "predictions";
// Nombre reservado: los resultados oficiales se guardan como una fila más
// de la tabla predictions, bajo esta clave (se filtra de participantes/leaderboard).
var OFFICIAL_KEY = "__OFICIAL__";
var supabaseClient = null;

function initCloud() {
  try {
    if (window.supabase && typeof SUPABASE_URL !== "undefined" && SUPABASE_ANON_KEY) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch (e) {
    console.warn("No se pudo inicializar Supabase:", e);
    supabaseClient = null;
  }
  return supabaseClient;
}

function cloudReady() {
  return !!supabaseClient;
}

// Sube (o actualiza) el pronóstico del jugador. Devuelve { ok, error }.
async function cloudSave(playerName, predictions) {
  if (!supabaseClient) return { ok: false, error: "sin conexión" };
  try {
    var row = {
      player_name: playerName,
      data: predictions,
      updated_at: new Date().toISOString()
    };
    var res = await supabaseClient
      .from(TABLE)
      .upsert(row, { onConflict: "player_name" });
    if (res.error) return { ok: false, error: res.error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// Lista los participantes (nombre + última actualización). Devuelve { ok, players, error }.
async function cloudListPlayers() {
  if (!supabaseClient) return { ok: false, players: [], error: "sin conexión" };
  try {
    var res = await supabaseClient
      .from(TABLE)
      .select("player_name, updated_at")
      .neq("player_name", OFFICIAL_KEY)
      .order("updated_at", { ascending: false });
    if (res.error) return { ok: false, players: [], error: res.error.message };
    return { ok: true, players: res.data || [] };
  } catch (e) {
    return { ok: false, players: [], error: String(e) };
  }
}

// Trae el pronóstico completo de un jugador. Devuelve { ok, data, error }.
async function cloudGetPlayer(playerName) {
  if (!supabaseClient) return { ok: false, data: null, error: "sin conexión" };
  try {
    var res = await supabaseClient
      .from(TABLE)
      .select("player_name, data, updated_at")
      .eq("player_name", playerName)
      .maybeSingle();
    if (res.error) return { ok: false, data: null, error: res.error.message };
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, data: null, error: String(e) };
  }
}

// Trae los resultados oficiales. Devuelve { ok, data } con el objeto de resultados.
async function cloudGetOfficial() {
  if (!supabaseClient) return { ok: false, data: {}, error: "sin conexión" };
  try {
    var res = await supabaseClient
      .from(TABLE)
      .select("data")
      .eq("player_name", OFFICIAL_KEY)
      .maybeSingle();
    if (res.error) return { ok: false, data: {}, error: res.error.message };
    return { ok: true, data: (res.data && res.data.data) || {} };
  } catch (e) {
    return { ok: false, data: {}, error: String(e) };
  }
}

// Guarda (o actualiza) los resultados oficiales. Solo lo usa el admin.
async function cloudSaveOfficial(results) {
  return cloudSave(OFFICIAL_KEY, results);
}

// Trae todos los pronósticos (para el leaderboard), excluyendo la fila oficial.
async function cloudGetAllPredictions() {
  if (!supabaseClient) return { ok: false, players: [], error: "sin conexión" };
  try {
    var res = await supabaseClient
      .from(TABLE)
      .select("player_name, data, updated_at")
      .neq("player_name", OFFICIAL_KEY);
    if (res.error) return { ok: false, players: [], error: res.error.message };
    var players = (res.data || []).map(function (r) {
      return { name: r.player_name, data: r.data || {}, updated_at: r.updated_at };
    });
    return { ok: true, players: players };
  } catch (e) {
    return { ok: false, players: [], error: String(e) };
  }
}
