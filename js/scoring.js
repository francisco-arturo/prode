// Sistema de puntos del PRODE (lógica pura, sin DOM).
//
// Reglas (grupos y eliminatorias, suman entre sí):
//   - Ganador o empate correcto ........................ +1
//   - Marcador exacto (goles de ambos equipos) ......... +3
//   Máximo por partido: 4 (1 + 3)
//
// Solo se comparan los goles del partido (home/away).

function hasResult(r) {
  return r && r.home !== null && r.home !== undefined &&
    r.away !== null && r.away !== undefined;
}

function outcomeOf(h, a) {
  if (h > a) return "H";
  if (h < a) return "A";
  return "D";
}

function emptyScore() {
  return { points: 0, outcome: false, exactScore: false };
}

function scoreMatch(pred, actual) {
  if (!hasResult(actual)) return null;
  if (!hasResult(pred)) return emptyScore();

  var ph = Number(pred.home), pa = Number(pred.away);
  var ah = Number(actual.home), aa = Number(actual.away);

  var outcome = outcomeOf(ph, pa) === outcomeOf(ah, aa);
  var exactScore = ph === ah && pa === aa;
  var points = (outcome ? 1 : 0) + (exactScore ? 3 : 0);

  return { points: points, outcome: outcome, exactScore: exactScore };
}

function formatMatchPoints(sc) {
  if (!sc || !sc.points) return "0";
  var parts = [];
  if (sc.outcome) parts.push("+1");
  if (sc.exactScore) parts.push("+3");
  return parts.join(" ");
}

function scorePlayer(predictions, official) {
  predictions = predictions || {};
  official = official || {};
  var total = 0, played = 0;
  var outcomeHits = 0, exactScoreHits = 0;
  var byMatch = {};

  Object.keys(official).forEach(function (mid) {
    var actual = official[mid];
    if (!hasResult(actual)) return;
    played++;
    var s = scoreMatch(predictions[mid], actual);
    byMatch[mid] = s;
    total += s.points;
    if (s.outcome) outcomeHits++;
    if (s.exactScore) exactScoreHits++;
  });

  return {
    total: total,
    played: played,
    outcomeHits: outcomeHits,
    exactScoreHits: exactScoreHits,
    byMatch: byMatch
  };
}

function buildLeaderboard(players, official) {
  var rows = (players || []).map(function (p) {
    var s = scorePlayer(p.data, official);
    return {
      name: p.name,
      total: s.total,
      outcomeHits: s.outcomeHits,
      exactScoreHits: s.exactScoreHits,
      played: s.played
    };
  });

  rows.sort(function (a, b) {
    if (b.total !== a.total) return b.total - a.total;
    if (b.exactScoreHits !== a.exactScoreHits) return b.exactScoreHits - a.exactScoreHits;
    if (b.outcomeHits !== a.outcomeHits) return b.outcomeHits - a.outcomeHits;
    return a.name.localeCompare(b.name, "es");
  });

  var rank = 0, prevTotal = null;
  rows.forEach(function (r, i) {
    if (prevTotal === null || r.total !== prevTotal) {
      rank = i + 1;
      prevTotal = r.total;
    }
    r.rank = rank;
  });

  return rows;
}

function countOfficialPlayed(official) {
  official = official || {};
  return Object.keys(official).filter(function (mid) {
    return hasResult(official[mid]);
  }).length;
}

function formatPlayerStats(s) {
  return s.outcomeHits + " resultados (+1) · " +
    s.exactScoreHits + " marcadores exactos (+3)";
}

// True si el admin ya cargó resultado oficial para este partido.
function isMatchOfficiallySet(official, matchId) {
  return hasResult((official || {})[matchId]);
}
