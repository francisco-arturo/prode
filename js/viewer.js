// Render de solo-lectura: muestra el pronóstico de cualquier participante
// (grupos + tablas + cuadro eliminatorio) sin campos editables.
// Reutiliza helpers globales de app.js (teamFlag, escapeHTML) y el motor bracket.js.

function renderReadOnlyPredictions(container, predictions) {
  predictions = predictions || {};
  var html = "";

  // --- Fase de grupos ---
  html += '<h3 class="viewer-section-title">Fase de Grupos</h3>';
  html += '<div class="groups-grid">';

  var allStandings = computeAllStandings(predictions);
  var thirds = computeBestThirds(predictions, allStandings);
  var qualifiedThirdSet = {};
  if (thirds) {
    thirds.qualifiedGroups.forEach(function (g) { qualifiedThirdSet[g] = true; });
  }

  GROUPS.forEach(function (group) {
    html += '<div class="group-card">';
    html += '<h3 class="group-title">Grupo ' + group.id + "</h3>";
    html += '<div class="group-matches">';

    group.matches.forEach(function (m) {
      var pred = predictions[m.id] || {};
      var score = formatScore(pred);
      html += '<div class="match-row ro">' +
        '<div class="match-side home">' + roTeamHTML(m.home) + "</div>" +
        '<div class="score-chip">' + score + "</div>" +
        '<div class="match-side away">' + roTeamHTML(m.away) + "</div></div>";
    });
    html += "</div>";

    // Tabla de posiciones
    html += renderReadOnlyStandings(group, allStandings[group.id], thirds, qualifiedThirdSet);
    html += "</div>";
  });
  html += "</div>";

  // --- Fase eliminatoria ---
  var result = resolveBracket(predictions);
  var allComplete = GROUPS.every(function (g) { return isGroupComplete(g, predictions); });

  html += '<h3 class="viewer-section-title">Fase Eliminatoria</h3>';
  if (!allComplete) {
    html += '<p class="notice visible">Este participante todavía no completó los 12 grupos, ' +
      'así que el cuadro eliminatorio está incompleto.</p>';
  }

  html += '<div class="knockout-rounds">';
  KNOCKOUT_ROUNDS.forEach(function (roundName) {
    var matches = KNOCKOUT.filter(function (m) { return m.round === roundName; });
    html += '<div class="round-col"><h3 class="round-title">' + roundName + "</h3>";
    matches.forEach(function (def) {
      html += renderReadOnlyKnockoutCard(def, result.matches[def.id], predictions[def.id] || {});
    });
    html += "</div>";
  });
  html += "</div>";

  container.innerHTML = html;
}

function roTeamHTML(name) {
  if (!name) return '<span class="team undefined">Por definir</span>';
  return '<span class="team"><span class="flag">' + teamFlag(name) +
    '</span><span class="team-name">' + escapeHTML(name) + "</span></span>";
}

function formatScore(pred) {
  if (pred && pred.home !== null && pred.home !== undefined &&
      pred.away !== null && pred.away !== undefined) {
    return pred.home + " - " + pred.away;
  }
  return "–";
}

function renderReadOnlyStandings(group, rows, thirds, qualifiedThirdSet) {
  var html = '<div class="standings"><table class="standings-table">' +
    "<thead><tr><th class=\"st-team\">Equipo</th><th>PJ</th><th>G</th><th>E</th>" +
    "<th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr></thead><tbody>";

  rows.forEach(function (r) {
    var cls = "";
    if (r.pos <= 2) cls = "q-direct";
    else if (r.pos === 3) cls = thirds ? (qualifiedThirdSet[group.id] ? "q-third" : "elim") : "q-maybe";
    else cls = "elim";

    html += '<tr class="' + cls + '">' +
      '<td class="st-team"><span class="flag">' + teamFlag(r.team) + "</span>" +
      '<span class="team-name">' + escapeHTML(r.team) + "</span></td>" +
      "<td>" + r.pj + "</td><td>" + r.g + "</td><td>" + r.e + "</td><td>" + r.p + "</td>" +
      "<td>" + r.gf + "</td><td>" + r.gc + "</td><td>" + (r.dg > 0 ? "+" + r.dg : r.dg) + "</td>" +
      "<td class=\"st-pts\">" + r.pts + "</td></tr>";
  });

  html += "</tbody></table></div>";
  return html;
}

function renderReadOnlyKnockoutCard(def, info, pred) {
  var num = def.id.split("-")[1];
  var homeWin = info.complete && info.winner === info.home;
  var awayWin = info.complete && info.winner === info.away;
  var bothDefined = info.homeDefined && info.awayDefined;

  var homeScore = bothDefined ? formatSide(pred, "home") : "";
  var awayScore = bothDefined ? formatSide(pred, "away") : "";

  var html = '<div class="ko-card"><div class="ko-num">Partido ' + num + "</div>";

  html += '<div class="ko-row ro ' + (homeWin ? "winner" : "") + '">' +
    roKoTeam(info.home, def.home) +
    '<span class="ko-score">' + homeScore + "</span></div>";

  html += '<div class="ko-row ro ' + (awayWin ? "winner" : "") + '">' +
    roKoTeam(info.away, def.away) +
    '<span class="ko-score">' + awayScore + "</span></div>";

  if (bothDefined && pred.home !== null && pred.home !== undefined &&
      Number(pred.home) === Number(pred.away) && pred.penaltyWinner) {
    var penTeam = pred.penaltyWinner === "home" ? info.home : info.away;
    html += '<div class="penalty-note">Gana por penales: ' + escapeHTML(penTeam || "") + "</div>";
  }

  html += "</div>";
  return html;
}

function formatSide(pred, side) {
  var v = pred[side];
  return (v === 0 || v) ? String(v) : "–";
}

function roKoTeam(team, ref) {
  if (team) {
    return '<span class="team"><span class="flag">' + teamFlag(team) +
      '</span><span class="team-name">' + escapeHTML(team) + "</span></span>";
  }
  return '<span class="team undefined">' + escapeHTML(slotLabel(ref)) + "</span>";
}
