// UI y orquestación del PRODE Mundial 2026.

var state = { playerName: "", predictions: {} };

var els = {};

document.addEventListener("DOMContentLoaded", function () {
  els.screenWelcome = document.getElementById("screen-welcome");
  els.screenMain = document.getElementById("screen-main");
  els.welcomeForm = document.getElementById("welcome-form");
  els.playerName = document.getElementById("player-name");
  els.playerDisplay = document.getElementById("player-display");
  els.groupsContainer = document.getElementById("groups-container");
  els.knockoutContainer = document.getElementById("knockout-container");
  els.knockoutNotice = document.getElementById("knockout-notice");
  els.btnSave = document.getElementById("btn-save");
  els.btnReset = document.getElementById("btn-reset");
  els.saveFeedback = document.getElementById("save-feedback");

  els.welcomeForm.addEventListener("submit", onWelcomeSubmit);
  els.btnSave.addEventListener("click", onSaveClick);
  els.btnReset.addEventListener("click", onResetClick);

  var saved = loadState();
  if (saved && saved.playerName) {
    state = saved;
    if (!state.predictions) state.predictions = {};
    enterMainScreen();
  }
});

function onWelcomeSubmit(e) {
  e.preventDefault();
  var name = (els.playerName.value || "").trim();
  if (!name) {
    els.playerName.focus();
    return;
  }
  state.playerName = name;
  saveState(state);
  enterMainScreen();
}

function enterMainScreen() {
  els.playerDisplay.textContent = state.playerName;
  els.screenWelcome.classList.remove("active");
  els.screenMain.classList.add("active");
  renderGroups();
  updateStandings();
  renderKnockout();
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
  row.className = "match-row";

  var pred = state.predictions[m.id] || {};

  row.innerHTML =
    '<div class="match-side home">' + teamHTML(m.home) + "</div>" +
    '<div class="score-box">' +
      scoreInputHTML(m.id, "home", pred.home) +
      '<span class="score-sep">-</span>' +
      scoreInputHTML(m.id, "away", pred.away) +
    "</div>" +
    '<div class="match-side away">' + teamHTML(m.away) + "</div>";

  row.querySelectorAll("input").forEach(function (inp) {
    inp.addEventListener("input", onGroupInput);
  });
  return row;
}

function scoreInputHTML(matchId, side, value) {
  var v = (value === 0 || value) ? value : "";
  return '<input type="number" class="score-input" min="0" max="99" inputmode="numeric" ' +
    'data-match="' + matchId + '" data-side="' + side + '" value="' + v + '" aria-label="Goles" />';
}

function onGroupInput(e) {
  var inp = e.target;
  applyScore(inp.dataset.match, inp.dataset.side, inp.value);
  autoSave();
  updateStandings();
  renderKnockout();
}

function applyScore(matchId, side, rawValue) {
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
  card.className = "ko-card";

  var num = def.id.split("-")[1];
  var pred = state.predictions[def.id] || {};
  var bothDefined = info.homeDefined && info.awayDefined;

  var homeLabel = info.home || slotLabel(def.home);
  var awayLabel = info.away || slotLabel(def.away);

  var homeWin = info.complete && info.winner === info.home;
  var awayWin = info.complete && info.winner === info.away;

  var html = '<div class="ko-num">Partido ' + num + "</div>";

  html += '<div class="ko-row ' + (homeWin ? "winner" : "") + '">' +
    koTeamHTML(info.home, homeLabel) +
    (bothDefined ? scoreInputHTML(def.id, "home", pred.home) : "") +
    "</div>";

  html += '<div class="ko-row ' + (awayWin ? "winner" : "") + '">' +
    koTeamHTML(info.away, awayLabel) +
    (bothDefined ? scoreInputHTML(def.id, "away", pred.away) : "") +
    "</div>";

  // Selector de penales: visible si ambos definidos y empate cargado.
  if (bothDefined && isTie(pred)) {
    html += '<div class="penalty">' +
      '<span class="penalty-label">Empate — ¿quién gana por penales?</span>' +
      '<div class="penalty-options">' +
        penaltyBtnHTML(def.id, "home", info.home, pred.penaltyWinner === "home") +
        penaltyBtnHTML(def.id, "away", info.away, pred.penaltyWinner === "away") +
      "</div></div>";
  }

  card.innerHTML = html;

  if (bothDefined) {
    card.querySelectorAll("input.score-input").forEach(function (inp) {
      inp.addEventListener("change", onKnockoutChange);
    });
    card.querySelectorAll("button.penalty-btn").forEach(function (btn) {
      btn.addEventListener("click", onPenaltyClick);
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

function penaltyBtnHTML(matchId, side, team, active) {
  return '<button type="button" class="penalty-btn ' + (active ? "active" : "") +
    '" data-match="' + matchId + '" data-side="' + side + '">' +
    '<span class="flag">' + teamFlag(team) + "</span> " + escapeHTML(team) + " (pen.)</button>";
}

function isTie(pred) {
  return pred && pred.home !== null && pred.home !== undefined &&
    pred.away !== null && pred.away !== undefined &&
    Number(pred.home) === Number(pred.away);
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
  applyScore(inp.dataset.match, inp.dataset.side, inp.value);
  // Si ya no hay empate, limpiar el ganador por penales.
  var pred = state.predictions[inp.dataset.match];
  if (!isTie(pred) && pred) delete pred.penaltyWinner;
  autoSave();
  renderKnockout();
}

function onPenaltyClick(e) {
  var btn = e.currentTarget;
  var matchId = btn.dataset.match;
  var side = btn.dataset.side;
  var pred = state.predictions[matchId];
  if (!pred) return;
  pred.penaltyWinner = (pred.penaltyWinner === side) ? null : side;
  autoSave();
  renderKnockout();
}

// ---------- Acciones globales ----------

function autoSave() {
  saveState(state);
}

function onSaveClick() {
  var ok = saveState(state);
  showFeedback(ok ? "Pronósticos guardados ✓" : "No se pudo guardar", ok);
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
