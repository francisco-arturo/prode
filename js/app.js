// UI y orquestación del PRODE Mundial 2026.

var state = { playerName: "", predictions: {}, isAdmin: false };

// Resultados oficiales cargados desde la nube (los usa el leaderboard y el admin).
var officialResults = {};

// Handler dinámico del botón "← Volver" del overlay.
var viewerBackHandler = null;

var els = {};
var appInitialized = false;

document.addEventListener("DOMContentLoaded", function () {
  showAdThenInit();
});

function showAdThenInit() {
  els.adOverlay = document.getElementById("ad-overlay");
  els.adClose = document.getElementById("ad-close");

  function closeAd() {
    if (els.adOverlay) {
      els.adOverlay.classList.remove("open");
      els.adOverlay.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("ad-open");
    initApp();
  }

  if (!els.adOverlay || !els.adClose) {
    initApp();
    return;
  }

  els.adOverlay.classList.add("open");
  els.adOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("ad-open");
  els.adClose.addEventListener("click", closeAd);
  els.adOverlay.addEventListener("click", function (e) {
    if (e.target === els.adOverlay) closeAd();
  });
}

function initApp() {
  if (appInitialized) return;
  appInitialized = true;
  els.screenWelcome = document.getElementById("screen-welcome");
  els.screenMain = document.getElementById("screen-main");
  els.welcomeForm = document.getElementById("welcome-form");
  els.playerName = document.getElementById("player-name");
  els.playerDisplay = document.getElementById("player-display");
  els.groupsContainer = document.getElementById("groups-container");
  els.knockoutContainer = document.getElementById("knockout-container");
  els.knockoutNotice = document.getElementById("knockout-notice");
  els.btnSave = document.getElementById("btn-save");
  els.btnLeaderboard = document.getElementById("btn-leaderboard");
  els.btnParticipants = document.getElementById("btn-participants");
  els.btnAdmin = document.getElementById("btn-admin");
  els.btnReset = document.getElementById("btn-reset");
  els.saveFeedback = document.getElementById("save-feedback");

  els.overlay = document.getElementById("viewer-overlay");
  els.viewerTitle = document.getElementById("viewer-title");
  els.viewerBody = document.getElementById("viewer-body");
  els.viewerBack = document.getElementById("viewer-back");
  els.viewerClose = document.getElementById("viewer-close");

  els.welcomeForm.addEventListener("submit", onWelcomeSubmit);
  els.btnSave.addEventListener("click", onSaveClick);
  els.btnLeaderboard.addEventListener("click", openLeaderboard);
  els.btnParticipants.addEventListener("click", openParticipants);
  els.btnAdmin.addEventListener("click", openAdmin);
  els.btnReset.addEventListener("click", onResetClick);
  els.viewerBack.addEventListener("click", function () {
    if (viewerBackHandler) viewerBackHandler();
  });
  els.viewerClose.addEventListener("click", closeViewer);
  els.overlay.addEventListener("click", function (e) {
    if (e.target === els.overlay) closeViewer();
  });

  initCloud();

  var saved = loadState();
  if (saved && saved.playerName) {
    state = saved;
    if (!state.predictions) state.predictions = {};
    enterMainScreen();
  }
}


function onWelcomeSubmit(e) {
  e.preventDefault();
  if (!appInitialized) initApp();

  var name = (els.playerName.value || "").trim();
  if (!name) {
    els.playerName.focus();
    return;
  }

  if (name.toLowerCase() === ADMIN_NAME.toLowerCase()) {
    askAdminPin().then(function (ok) {
      if (!ok) return;
      state.playerName = ADMIN_NAME;
      state.isAdmin = true;
      saveState(state);
      enterMainScreen();
    });
    return;
  }

  state.playerName = name;
  state.isAdmin = false;
  saveState(state);
  enterMainScreen();
}

// Modal PIN en lugar de window.prompt (bloqueado en muchos navegadores).
function askAdminPin() {
  return new Promise(function (resolve) {
    var overlay = document.getElementById("pin-overlay");
    var input = document.getElementById("pin-input");
    var errorEl = document.getElementById("pin-error");
    var btnOk = document.getElementById("pin-confirm");
    var btnCancel = document.getElementById("pin-cancel");

    if (!overlay || !input || !btnOk || !btnCancel) {
      resolve(false);
      return;
    }

    function cleanup() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      btnOk.removeEventListener("click", onConfirm);
      btnCancel.removeEventListener("click", onCancel);
      input.removeEventListener("keydown", onKey);
      overlay.removeEventListener("click", onBackdrop);
    }

    function onCancel() {
      cleanup();
      resolve(false);
    }

    function onConfirm() {
      if (input.value.trim() !== ADMIN_PIN) {
        errorEl.hidden = false;
        input.value = "";
        input.focus();
        return;
      }
      cleanup();
      resolve(true);
    }

    function onKey(ev) {
      if (ev.key === "Enter") onConfirm();
      if (ev.key === "Escape") onCancel();
    }

    function onBackdrop(ev) {
      if (ev.target === overlay) onCancel();
    }

    errorEl.hidden = true;
    input.value = "";
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    setTimeout(function () { input.focus(); }, 50);

    btnOk.addEventListener("click", onConfirm);
    btnCancel.addEventListener("click", onCancel);
    input.addEventListener("keydown", onKey);
    overlay.addEventListener("click", onBackdrop);
  });
}

function enterMainScreen() {
  els.playerDisplay.textContent = state.playerName;
  els.btnAdmin.hidden = !state.isAdmin;
  els.screenWelcome.classList.remove("active");
  els.screenMain.classList.add("active");
  refreshOfficial()
    .then(syncPredictionsFromCloud)
    .then(function () {
      renderGroups();
      updateStandings();
      renderKnockout();
    });
}

function refreshMainAfterOfficial() {
  if (!els.screenMain || !els.screenMain.classList.contains("active")) return;
  refreshOfficial()
    .then(syncPredictionsFromCloud)
    .then(function () {
      renderGroups();
      updateStandings();
      renderKnockout();
    });
}

function syncPredictionsFromCloud() {
  if (!cloudReady() || !state.playerName) return Promise.resolve();
  return cloudGetPlayer(state.playerName).then(function (res) {
    if (!res.ok || !res.data || !res.data.data) return;
    mergeCloudPredictions(res.data.data);
    saveState(state);
  });
}

function mergeCloudPredictions(cloudData) {
  Object.keys(cloudData).forEach(function (mid) {
    var cp = cloudData[mid];
    if (!cp || typeof cp !== "object") return;
    if (!state.predictions[mid]) {
      state.predictions[mid] = { home: cp.home, away: cp.away };
      return;
    }
    var lp = state.predictions[mid];
    if (lp.home === null || lp.home === undefined) {
      if (cp.home !== null && cp.home !== undefined) lp.home = cp.home;
    }
    if (lp.away === null || lp.away === undefined) {
      if (cp.away !== null && cp.away !== undefined) lp.away = cp.away;
    }
  });
}

function isMatchLocked(matchId) {
  return isMatchOfficiallySet(officialResults, matchId);
}

// En partidos bloqueados mostramos el resultado oficial; si no, el pronóstico del jugador.
function scoresForMatchDisplay(matchId, locked) {
  if (locked) {
    var official = officialResults[matchId] || {};
    return { home: official.home, away: official.away };
  }
  var pred = state.predictions[matchId] || {};
  return { home: pred.home, away: pred.away };
}

// ---------- Helpers de equipo ----------

function teamFlag(name) {
  var t = TEAMS[name];
  return t ? t.flag : "🏳️";
}

function teamHTML(name) {
  if (!name) return '<span class="team undefined">Por definir</span>';
  return '<span class="team"><span class="flag">' + teamFlag(name) +
    '</span><span class="team-name">' + escapeHTML(name) + "</span></span>";
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// ---------- Fase de grupos ----------

function renderGroups() {
  els.groupsContainer.innerHTML = "";
  GROUPS.forEach(function (group) {
    var card = document.createElement("div");
    card.className = "group-card";

    var head = document.createElement("h3");
    head.className = "group-title";
    head.textContent = "Grupo " + group.id;
    card.appendChild(head);

    var matchesWrap = document.createElement("div");
    matchesWrap.className = "group-matches";

    group.matches.forEach(function (m) {
      matchesWrap.appendChild(buildGroupMatchRow(m));
    });
    card.appendChild(matchesWrap);

    var standings = document.createElement("div");
    standings.className = "standings";
    standings.id = "standings-" + group.id;
    card.appendChild(standings);

    els.groupsContainer.appendChild(card);
  });
}

function buildGroupMatchRow(m) {
  var row = document.createElement("div");
  var locked = isMatchLocked(m.id);
  row.className = "match-row" + (locked ? " locked" : "");

  var scores = scoresForMatchDisplay(m.id, locked);

  row.innerHTML =
    '<div class="match-side home">' + teamHTML(m.home) + "</div>" +
    '<div class="score-box">' +
      scoreFieldHTML(m.id, "home", scores.home, locked) +
      '<span class="score-sep">-</span>' +
      scoreFieldHTML(m.id, "away", scores.away, locked) +
      (locked ? '<span class="match-lock" title="Resultado oficial">🔒</span>' : "") +
    "</div>" +
    '<div class="match-side away">' + teamHTML(m.away) + "</div>";

  if (!locked) {
    row.querySelectorAll("input").forEach(function (inp) {
      inp.addEventListener("input", onGroupInput);
    });
  }
  return row;
}

function scoreInputHTML(matchId, side, value) {
  var v = (value === 0 || value) ? value : "";
  return '<input type="number" class="score-input" min="0" max="99" inputmode="numeric" ' +
    'data-match="' + matchId + '" data-side="' + side + '" value="' + v + '" aria-label="Goles" />';
}

function scoreDisplayHTML(value, official) {
  var v = (value === 0 || value) ? String(value) : "–";
  var cls = "score-display" + (official ? " score-official" : "");
  return '<span class="' + cls + '" aria-label="Goles">' + escapeHTML(v) + "</span>";
}

function scoreFieldHTML(matchId, side, value, locked) {
  return locked ? scoreDisplayHTML(value, true) : scoreInputHTML(matchId, side, value);
}

function onGroupInput(e) {
  var inp = e.target;
  if (isMatchLocked(inp.dataset.match)) return;
  applyScore(inp.dataset.match, inp.dataset.side, inp.value);
  autoSave();
  updateStandings();
  renderKnockout();
}

function applyScore(matchId, side, rawValue) {
  if (isMatchLocked(matchId)) return;
  if (!state.predictions[matchId]) state.predictions[matchId] = { home: null, away: null };
  var p = state.predictions[matchId];
  var val = rawValue === "" ? null : Math.max(0, parseInt(rawValue, 10));
  if (isNaN(val)) val = null;
  p[side] = val;
}

function updateStandings() {
  var allStandings = computeAllStandings(state.predictions);
  var thirds = computeBestThirds(state.predictions, allStandings);
  var qualifiedThirdSet = {};
  if (thirds) {
    thirds.qualifiedGroups.forEach(function (g) { qualifiedThirdSet[g] = true; });
  }

  GROUPS.forEach(function (group) {
    var rows = allStandings[group.id];
    var container = document.getElementById("standings-" + group.id);
    if (!container) return;
    var complete = isGroupComplete(group, state.predictions);

    var html = '<table class="standings-table">' +
      "<thead><tr>" +
      "<th class=\"st-team\">Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th>" +
      "<th>GF</th><th>GC</th><th>DG</th><th>Pts</th>" +
      "</tr></thead><tbody>";

    rows.forEach(function (r) {
      var cls = "";
      if (r.pos <= 2) cls = "q-direct";
      else if (r.pos === 3) {
        if (thirds) cls = qualifiedThirdSet[group.id] ? "q-third" : "elim";
        else cls = "q-maybe";
      } else cls = "elim";

      html += '<tr class="' + cls + '">' +
        '<td class="st-team"><span class="flag">' + teamFlag(r.team) + "</span>" +
        '<span class="team-name">' + escapeHTML(r.team) + "</span></td>" +
        "<td>" + r.pj + "</td><td>" + r.g + "</td><td>" + r.e + "</td><td>" + r.p + "</td>" +
        "<td>" + r.gf + "</td><td>" + r.gc + "</td><td>" + fmtDG(r.dg) + "</td>" +
        "<td class=\"st-pts\">" + r.pts + "</td></tr>";
    });

    html += "</tbody></table>";
    if (!complete) {
      html += '<p class="standings-hint">Cargá los 6 partidos para definir la clasificación.</p>';
    }
    container.innerHTML = html;
  });
}

function fmtDG(dg) {
  return dg > 0 ? "+" + dg : String(dg);
}

// ---------- Fase eliminatoria ----------

function renderKnockout() {
  var result = resolveBracket(state.predictions);
  var allComplete = GROUPS.every(function (g) { return isGroupComplete(g, state.predictions); });

  if (!allComplete) {
    els.knockoutNotice.textContent =
      "Completá los 12 grupos para ver los clasificados y armar el cuadro eliminatorio.";
    els.knockoutNotice.classList.add("visible");
  } else {
    els.knockoutNotice.textContent = "";
    els.knockoutNotice.classList.remove("visible");
  }

  els.knockoutContainer.innerHTML = "";

  KNOCKOUT_ROUNDS.forEach(function (roundName) {
    var matches = KNOCKOUT.filter(function (m) { return m.round === roundName; });
    var col = document.createElement("div");
    col.className = "round-col";

    var title = document.createElement("h3");
    title.className = "round-title";
    title.textContent = roundName;
    col.appendChild(title);

    matches.forEach(function (def) {
      col.appendChild(buildKnockoutCard(def, result.matches[def.id]));
    });

    els.knockoutContainer.appendChild(col);
  });
}

function buildKnockoutCard(def, info) {
  var card = document.createElement("div");
  var locked = isMatchLocked(def.id);
  card.className = "ko-card" + (locked ? " locked" : "");

  var num = def.id.split("-")[1];
  var scores = scoresForMatchDisplay(def.id, locked);
  var bothDefined = info.homeDefined && info.awayDefined;

  var homeLabel = info.home || slotLabel(def.home);
  var awayLabel = info.away || slotLabel(def.away);

  var homeWin = info.complete && info.winner === info.home;
  var awayWin = info.complete && info.winner === info.away;

  var html = '<div class="ko-num">Partido ' + num + (locked ? ' 🔒' : '') + "</div>";

  html += '<div class="ko-row ' + (homeWin ? "winner" : "") + '">' +
    koTeamHTML(info.home, homeLabel) +
    (bothDefined ? scoreFieldHTML(def.id, "home", scores.home, locked) : "") +
    "</div>";

  html += '<div class="ko-row ' + (awayWin ? "winner" : "") + '">' +
    koTeamHTML(info.away, awayLabel) +
    (bothDefined ? scoreFieldHTML(def.id, "away", scores.away, locked) : "") +
    "</div>";

  card.innerHTML = html;

  if (bothDefined && !locked) {
    card.querySelectorAll("input.score-input").forEach(function (inp) {
      inp.addEventListener("change", onKnockoutChange);
    });
  }
  return card;
}

function koTeamHTML(team, label) {
  if (team) {
    return '<span class="team"><span class="flag">' + teamFlag(team) +
      '</span><span class="team-name">' + escapeHTML(team) + "</span></span>";
  }
  return '<span class="team undefined">' + escapeHTML(label) + "</span>";
}

function slotLabel(ref) {
  if (ref.k) {
    var slot = ref.k;
    if (slot.charAt(0) === "3") return "3.º clasificado";
    var pos = slot.charAt(0) === "1" ? "1.º" : "2.º";
    return pos + " Grupo " + slot.charAt(1);
  }
  if (ref.w) return "Ganador P" + ref.w.split("-")[1];
  if (ref.l) return "Perdedor P" + ref.l.split("-")[1];
  return "Por definir";
}

function onKnockoutChange(e) {
  var inp = e.target;
  if (isMatchLocked(inp.dataset.match)) return;
  applyScore(inp.dataset.match, inp.dataset.side, inp.value);
  autoSave();
  renderKnockout();
}

// ---------- Acciones globales ----------

function autoSave() {
  saveState(state);
}

function onSaveClick() {
  var localOk = saveState(state);
  if (!localOk) {
    showFeedback("No se pudo guardar localmente", false);
    return;
  }
  if (!cloudReady()) {
    showFeedback("Guardado local ✓ (nube no disponible)", true);
    return;
  }
  els.btnSave.disabled = true;
  var prev = els.btnSave.textContent;
  els.btnSave.textContent = "Guardando…";
  cloudSave(state.playerName, state.predictions).then(function (res) {
    els.btnSave.disabled = false;
    els.btnSave.textContent = prev;
    if (res.ok) {
      showFeedback("Pronósticos guardados y compartidos ✓", true);
    } else {
      showFeedback("Guardado local ✓, pero falló la nube: " + res.error, false);
    }
  });
}

// ---------- Participantes (visor de pronósticos compartidos) ----------

function openParticipants() {
  showOverlay();
  els.viewerTitle.textContent = "Participantes";
  setViewerBack(null);

  if (!cloudReady()) {
    els.viewerBody.innerHTML = '<p class="notice visible">La conexión con la nube no está ' +
      "disponible. Revisá la configuración de Supabase.</p>";
    return;
  }

  els.viewerBody.innerHTML = '<p class="viewer-loading">Cargando participantes…</p>';
  cloudListPlayers().then(function (res) {
    if (!res.ok) {
      els.viewerBody.innerHTML = '<p class="notice visible">No se pudo cargar la lista: ' +
        escapeHTML(res.error) + "</p>";
      return;
    }
    if (!res.players.length) {
      els.viewerBody.innerHTML = '<p class="viewer-empty">Todavía no hay pronósticos guardados. ' +
        "¡Sé el primero en tocar “Guardar pronósticos”!</p>";
      return;
    }
    renderParticipantsList(res.players);
  });
}

function renderParticipantsList(players) {
  var html = '<ul class="participants-list">';
  players.forEach(function (p) {
    var isMe = p.player_name === state.playerName;
    html += '<li><button type="button" class="participant-item" data-name="' +
      escapeHTML(p.player_name) + '">' +
      '<span class="participant-name">' + escapeHTML(p.player_name) +
      (isMe ? ' <span class="you-badge">vos</span>' : "") + "</span>" +
      '<span class="participant-date">' + formatDate(p.updated_at) + "</span>" +
      "</button></li>";
  });
  html += "</ul>";
  els.viewerBody.innerHTML = html;

  els.viewerBody.querySelectorAll(".participant-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      viewParticipant(btn.dataset.name);
    });
  });
}

function viewParticipant(name) {
  els.viewerTitle.textContent = name;
  setViewerBack(openParticipants);
  els.viewerBody.innerHTML = '<p class="viewer-loading">Cargando pronóstico de ' +
    escapeHTML(name) + "…</p>";

  cloudGetPlayer(name).then(function (res) {
    if (!res.ok || !res.data) {
      els.viewerBody.innerHTML = '<p class="notice visible">No se pudo cargar el pronóstico: ' +
        escapeHTML(res.error || "sin datos") + "</p>";
      return;
    }
    renderReadOnlyPredictions(els.viewerBody, res.data.data || {});
  });
}

function showOverlay() {
  els.overlay.classList.add("open");
  els.overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
}

function closeViewer() {
  els.overlay.classList.remove("open");
  els.overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overlay-open");
  if (els.screenMain.classList.contains("active")) {
    refreshOfficial()
      .then(syncPredictionsFromCloud)
      .then(function () {
        renderGroups();
        updateStandings();
        renderKnockout();
      });
  }
}

function setViewerBack(handler) {
  viewerBackHandler = handler || null;
  els.viewerBack.hidden = !handler;
}

// ---------- Puntos: resultados oficiales, banner y tabla ----------

function refreshOfficial() {
  if (!cloudReady()) {
    officialResults = {};
    return Promise.resolve(officialResults);
  }
  return cloudGetOfficial().then(function (res) {
    officialResults = (res && res.ok) ? (res.data || {}) : {};
    return officialResults;
  });
}

function openLeaderboard() {
  showOverlay();
  els.viewerTitle.textContent = "Tabla de puntos";
  setViewerBack(null);

  if (!cloudReady()) {
    els.viewerBody.innerHTML = '<p class="notice visible">La nube no está disponible; ' +
      "no se puede calcular la tabla de puntos.</p>";
    return;
  }

  els.viewerBody.innerHTML = '<p class="viewer-loading">Calculando puntos…</p>';
  Promise.all([cloudGetAllPredictions(), refreshOfficial()]).then(function (vals) {
    var pl = vals[0];
    if (!pl.ok) {
      els.viewerBody.innerHTML = '<p class="notice visible">No se pudo cargar: ' +
        escapeHTML(pl.error) + "</p>";
      return;
    }
    renderLeaderboard(pl.players);
  });
}

function renderLeaderboard(players) {
  var played = countOfficialPlayed(officialResults);
  var board = buildLeaderboard(players, officialResults);
  var playersByName = {};
  players.forEach(function (p) { playersByName[p.name] = p; });

  var html = "";
  if (!played) {
    html += '<p class="notice visible">Todavía no se cargaron resultados oficiales, ' +
      "así que todos están en 0. Cuando el admin cargue resultados, acá vas a ver el ranking.</p>";
  } else {
    html += '<p class="lb-meta">Sobre ' + played + " partido(s) con resultado oficial.</p>";
  }

  if (!board.length) {
    html += '<p class="viewer-empty">Todavía no hay participantes.</p>';
    els.viewerBody.innerHTML = html;
    return;
  }

  html += '<table class="leaderboard"><thead><tr>' +
    "<th>#</th><th class=\"lb-name\">Jugador</th><th>Pts</th><th>+1</th><th>Exactos</th>" +
    "</tr></thead><tbody>";
  board.forEach(function (r) {
    var isMe = r.name === state.playerName;
    html += '<tr class="' + (isMe ? "lb-me" : "") + '" data-name="' + escapeHTML(r.name) + '">' +
      '<td class="lb-rank">' + r.rank + "</td>" +
      '<td class="lb-name">' + escapeHTML(r.name) +
      (isMe ? ' <span class="you-badge">vos</span>' : "") + "</td>" +
      '<td class="lb-pts">' + r.total + "</td>" +
      "<td>" + r.outcomeHits + "</td>" +
      "<td>" + r.exactScoreHits + "</td></tr>";
  });
  html += "</tbody></table>";
  html += '<p class="lb-hint">+1 = resultado correcto · +3 = marcador exacto (ambos goles). ' +
    "Tocá un jugador para el detalle.</p>";

  els.viewerBody.innerHTML = html;

  els.viewerBody.querySelectorAll("tr[data-name]").forEach(function (tr) {
    tr.addEventListener("click", function () {
      var p = playersByName[tr.dataset.name];
      if (p) viewPlayerBreakdown(p);
    });
  });
}

function viewPlayerBreakdown(player) {
  els.viewerTitle.textContent = "Puntos de " + player.name;
  setViewerBack(openLeaderboard);

  var s = scorePlayer(player.data, officialResults);
  var bracket = resolveBracket(officialResults);

  var html = '<div class="bd-summary"><span class="pb-total">' + s.total + ' pts</span>' +
    '<span class="pb-detail">' + formatPlayerStats(s) + ' · ' + s.played + ' partidos</span></div>';

  // Recorremos todos los partidos (grupos + eliminatorias) que tengan resultado oficial.
  var allMatches = [];
  GROUPS.forEach(function (g) {
    g.matches.forEach(function (m) {
      allMatches.push({ id: m.id, home: m.home, away: m.away, phase: "Grupo " + g.id });
    });
  });
  KNOCKOUT.forEach(function (m) {
    var info = bracket.matches[m.id];
    allMatches.push({ id: m.id, home: info.home, away: info.away, phase: m.round });
  });

  var rows = allMatches.filter(function (mm) {
    return officialResults[mm.id] && hasResult(officialResults[mm.id]);
  });

  if (!rows.length) {
    html += '<p class="viewer-empty">Sin resultados oficiales cargados aún.</p>';
    els.viewerBody.innerHTML = html;
    return;
  }

  html += '<table class="breakdown"><thead><tr>' +
    "<th class=\"bd-match\">Partido</th><th>Tu pick</th><th>Real</th><th>Desglose</th><th>Pts</th>" +
    "</tr></thead><tbody>";
  rows.forEach(function (mm) {
    var pred = (player.data || {})[mm.id];
    var actual = officialResults[mm.id];
    var sc = scoreMatch(pred, actual);
    var ptcls = sc.exactScore ? "pt-exact" : (sc.outcome ? "pt-result" : "pt-none");
    var label = (mm.home || "?") + " vs " + (mm.away || "?");
    html += "<tr>" +
      '<td class="bd-match"><span class="bd-phase">' + escapeHTML(mm.phase) + "</span>" +
      '<span class="bd-teams">' + escapeHTML(label) + "</span></td>" +
      "<td>" + pickStr(pred) + "</td>" +
      "<td>" + pickStr(actual) + "</td>" +
      '<td class="bd-breakdown">' + formatMatchPoints(sc) + "</td>" +
      '<td class="bd-pts ' + ptcls + '">' + sc.points + "</td></tr>";
  });
  html += "</tbody></table>";
  els.viewerBody.innerHTML = html;
}

function pickStr(p) {
  if (p && p.home !== null && p.home !== undefined && p.away !== null && p.away !== undefined) {
    return p.home + "-" + p.away;
  }
  return "–";
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    var d = new Date(iso);
    return d.toLocaleDateString("es", { day: "2-digit", month: "short" }) + " " +
      d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
}

function showFeedback(msg, ok) {
  els.saveFeedback.textContent = msg;
  els.saveFeedback.className = "save-feedback visible " + (ok ? "ok" : "error");
  clearTimeout(showFeedback._t);
  showFeedback._t = setTimeout(function () {
    els.saveFeedback.className = "save-feedback";
  }, 2200);
}

function onResetClick() {
  var ok = window.confirm("¿Seguro que querés empezar de nuevo? Se borrarán todos tus pronósticos.");
  if (!ok) return;
  clearState();
  state = { playerName: "", predictions: {} };
  els.playerName.value = "";
  els.screenMain.classList.remove("active");
  els.screenWelcome.classList.add("active");
  els.playerName.focus();
}
