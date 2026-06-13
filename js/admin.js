// Panel de administración: carga y corrección de resultados oficiales.
// Usa la variable global `officialResults` (declarada en app.js) y helpers
// globales (teamFlag, escapeHTML, slotLabel, scoreInputHTML,
// resolveBracket, GROUPS, KNOCKOUT, KNOCKOUT_ROUNDS).

function openAdmin() {
  showOverlay();
  els.viewerTitle.textContent = "Resultados oficiales";
  setViewerBack(null);

  if (!cloudReady()) {
    els.viewerBody.innerHTML = '<p class="notice visible">La nube no está disponible; ' +
      "no se pueden cargar resultados oficiales.</p>";
    return;
  }

  els.viewerBody.innerHTML = '<p class="viewer-loading">Cargando resultados oficiales…</p>';
  refreshOfficial().then(function () {
    renderAdmin();
  });
}

function renderAdmin() {
  var html = '<div class="admin-bar">' +
    '<p class="admin-help">Cargá el marcador real de cada partido jugado. Los partidos ' +
    "sin cargar no suman puntos. Podés corregir un resultado cuando quieras.</p>" +
    '<div class="admin-bar-actions">' +
    '<button type="button" id="admin-save" class="btn btn-primary">Guardar resultados</button>' +
    '<span id="admin-feedback" class="save-feedback"></span>' +
    "</div></div>";

  // --- Grupos ---
  html += '<h3 class="viewer-section-title">Fase de Grupos</h3>';
  html += '<div class="groups-grid">';
  GROUPS.forEach(function (group) {
    html += '<div class="group-card"><h3 class="group-title">Grupo ' + group.id + "</h3>";
    html += '<div class="group-matches">';
    group.matches.forEach(function (m) {
      var r = officialResults[m.id] || {};
      html += '<div class="match-row">' +
        '<div class="match-side home">' + adminTeamHTML(m.home) + "</div>" +
        '<div class="score-box">' +
          adminScoreInput(m.id, "home", r.home) +
          '<span class="score-sep">-</span>' +
          adminScoreInput(m.id, "away", r.away) +
        "</div>" +
        '<div class="match-side away">' + adminTeamHTML(m.away) + "</div></div>";
    });
    html += "</div></div>";
  });
  html += "</div>";

  // --- Eliminatorias (las llaves dependen de los propios resultados oficiales) ---
  var bracket = resolveBracket(officialResults);
  html += '<h3 class="viewer-section-title">Fase Eliminatoria</h3>';
  var allGroupsDone = GROUPS.every(function (g) { return isGroupComplete(g, officialResults); });
  if (!allGroupsDone) {
    html += '<p class="notice visible">Completá los 12 grupos para habilitar el cuadro ' +
      "eliminatorio con los equipos reales.</p>";
  }

  html += '<div class="knockout-rounds">';
  KNOCKOUT_ROUNDS.forEach(function (roundName) {
    var matches = KNOCKOUT.filter(function (m) { return m.round === roundName; });
    html += '<div class="round-col"><h3 class="round-title">' + roundName + "</h3>";
    matches.forEach(function (def) {
      html += adminKnockoutCard(def, bracket.matches[def.id]);
    });
    html += "</div>";
  });
  html += "</div>";

  els.viewerBody.innerHTML = html;
  attachAdminListeners();
}

function adminTeamHTML(name) {
  if (!name) return '<span class="team undefined">Por definir</span>';
  return '<span class="team"><span class="flag">' + teamFlag(name) +
    '</span><span class="team-name">' + escapeHTML(name) + "</span></span>";
}

function adminScoreInput(matchId, side, value) {
  var v = (value === 0 || value) ? value : "";
  return '<input type="number" class="score-input admin-input" min="0" max="99" inputmode="numeric" ' +
    'data-match="' + matchId + '" data-side="' + side + '" value="' + v + '" aria-label="Goles" />';
}

function adminKnockoutCard(def, info) {
  var num = def.id.split("-")[1];
  var r = officialResults[def.id] || {};
  var bothDefined = info.homeDefined && info.awayDefined;
  var homeWin = info.complete && info.winner === info.home;
  var awayWin = info.complete && info.winner === info.away;

  var html = '<div class="ko-card"><div class="ko-num">Partido ' + num + "</div>";

  html += '<div class="ko-row ' + (homeWin ? "winner" : "") + '">' +
    adminKoTeam(info.home, def.home) +
    (bothDefined ? adminScoreInput(def.id, "home", r.home) : "") + "</div>";

  html += '<div class="ko-row ' + (awayWin ? "winner" : "") + '">' +
    adminKoTeam(info.away, def.away) +
    (bothDefined ? adminScoreInput(def.id, "away", r.away) : "") + "</div>";

  html += "</div>";
  return html;
}

function adminKoTeam(team, ref) {
  if (team) {
    return '<span class="team"><span class="flag">' + teamFlag(team) +
      '</span><span class="team-name">' + escapeHTML(team) + "</span></span>";
  }
  return '<span class="team undefined">' + escapeHTML(slotLabel(ref)) + "</span>";
}

function attachAdminListeners() {
  els.viewerBody.querySelectorAll("input.admin-input").forEach(function (inp) {
    inp.addEventListener("change", onAdminScore);
  });
  var saveBtn = document.getElementById("admin-save");
  if (saveBtn) saveBtn.addEventListener("click", onAdminSave);
}

function onAdminScore(e) {
  var inp = e.target;
  var mid = inp.dataset.match;
  if (!officialResults[mid]) officialResults[mid] = { home: null, away: null };
  var val = inp.value === "" ? null : Math.max(0, parseInt(inp.value, 10));
  if (isNaN(val)) val = null;
  officialResults[mid][inp.dataset.side] = val;
  renderAdmin(); // re-render para recalcular llaves reales
}

function onAdminSave() {
  var btn = document.getElementById("admin-save");
  var fb = document.getElementById("admin-feedback");
  btn.disabled = true;
  var prev = btn.textContent;
  btn.textContent = "Guardando…";
  cloudSaveOfficial(officialResults).then(function (res) {
    btn.disabled = false;
    btn.textContent = prev;
    if (!fb) return;
    if (res.ok) {
      fb.textContent = "Resultados guardados ✓";
      fb.className = "save-feedback visible ok";
      refreshMainAfterOfficial();
    } else {
      fb.textContent = "Error: " + res.error;
      fb.className = "save-feedback visible error";
    }
    setTimeout(function () { if (fb) fb.className = "save-feedback"; }, 2500);
  });
}
