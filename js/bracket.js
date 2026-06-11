// Motor de cálculo: tablas de posiciones, 8 mejores terceros y resolución del cuadro.

// Devuelve true si todos los partidos del grupo tienen marcador cargado.
function isGroupComplete(group, predictions) {
  return group.matches.every(function (m) {
    var p = predictions[m.id];
    return p && p.home !== null && p.home !== undefined && p.away !== null && p.away !== undefined;
  });
}

// Calcula la tabla de posiciones de un grupo a partir de los pronósticos.
// Devuelve un array de filas ordenadas (posición 0 = 1.º).
function computeGroupStandings(group, predictions) {
  var rows = {};
  group.teams.forEach(function (t) {
    rows[t] = { team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
  });

  group.matches.forEach(function (m) {
    var pred = predictions[m.id];
    if (!pred || pred.home === null || pred.home === undefined || pred.away === null || pred.away === undefined) {
      return;
    }
    var h = rows[m.home];
    var a = rows[m.away];
    var hg = Number(pred.home);
    var ag = Number(pred.away);
    h.pj++; a.pj++;
    h.gf += hg; h.gc += ag;
    a.gf += ag; a.gc += hg;
    if (hg > ag) { h.g++; a.p++; h.pts += 3; }
    else if (hg < ag) { a.g++; h.p++; a.pts += 3; }
    else { h.e++; a.e++; h.pts += 1; a.pts += 1; }
  });

  var list = group.teams.map(function (t) {
    var r = rows[t];
    r.dg = r.gf - r.gc;
    return r;
  });

  list.sort(compareStandingRows);
  list.forEach(function (r, i) { r.pos = i + 1; });
  return list;
}

// Criterio de desempate (simplificado): puntos, dif. de goles, goles a favor,
// y como último recurso, orden alfabético del nombre.
function compareStandingRows(a, b) {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.dg !== a.dg) return b.dg - a.dg;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return a.team.localeCompare(b.team, "es");
}

// Calcula standings de todos los grupos. Devuelve { A: [...], B: [...], ... }.
function computeAllStandings(predictions) {
  var out = {};
  GROUPS.forEach(function (g) {
    out[g.id] = computeGroupStandings(g, predictions);
  });
  return out;
}

// Determina los 8 mejores terceros (solo si los 12 grupos están completos).
// Devuelve { qualifiedGroups: ["A",...8], byGroup: { A: row, ... } } o null.
function computeBestThirds(predictions, standings) {
  var allComplete = GROUPS.every(function (g) { return isGroupComplete(g, predictions); });
  if (!allComplete) return null;

  var thirds = GROUPS.map(function (g) {
    var row = standings[g.id][2];
    return { group: g.id, row: row };
  });

  thirds.sort(function (x, y) { return compareStandingRows(x.row, y.row); });
  var best = thirds.slice(0, 8);

  var byGroup = {};
  best.forEach(function (t) { byGroup[t.group] = t.row; });

  return {
    qualifiedGroups: best.map(function (t) { return t.group; }),
    byGroup: byGroup
  };
}

// Resuelve el cuadro eliminatorio completo.
// Devuelve un mapa { matchId: { home, away, homeDefined, awayDefined, winner, loser, complete } }.
// `home`/`away` son nombres de equipo o null si todavía no están definidos.
function resolveBracket(predictions) {
  var standings = computeAllStandings(predictions);
  var thirds = computeBestThirds(predictions, standings);

  // Mapa Anexo C: slotKey ("A","B","D","E","G","I","K","L") -> letra de grupo cuyo 3.º juega ahí.
  var thirdSlotMap = null;
  if (thirds) {
    thirdSlotMap = resolveThirdPlaceSlots(thirds.qualifiedGroups);
  }

  var resolved = {};

  function teamForGroupSlot(slot) {
    // slot: "1A" | "2A" | "3:A"
    if (slot.charAt(0) === "3") {
      // Tercero asignado por Anexo C al slot del ganador del grupo `key`.
      if (!thirds || !thirdSlotMap) return null;
      var key = slot.split(":")[1];
      var sourceGroup = thirdSlotMap[key];
      if (!sourceGroup) return null;
      var row = thirds.byGroup[sourceGroup];
      return row ? row.team : null;
    }
    var pos = Number(slot.charAt(0)); // 1 o 2
    var groupId = slot.charAt(1);
    if (!isGroupComplete(getGroup(groupId), predictions)) return null;
    var st = standings[groupId];
    var r = st[pos - 1];
    return r ? r.team : null;
  }

  function getGroup(id) {
    for (var i = 0; i < GROUPS.length; i++) {
      if (GROUPS[i].id === id) return GROUPS[i];
    }
    return null;
  }

  function resolveRef(ref) {
    if (ref.k) return teamForGroupSlot(ref.k);
    if (ref.w) {
      var rw = resolveMatch(ref.w);
      return rw.winner;
    }
    if (ref.l) {
      var rl = resolveMatch(ref.l);
      return rl.loser;
    }
    return null;
  }

  function resolveMatch(matchId) {
    if (resolved[matchId]) return resolved[matchId];

    // Marcador temporal para evitar recursión infinita (el cuadro es acíclico).
    resolved[matchId] = { home: null, away: null, winner: null, loser: null, complete: false };

    var def = KNOCKOUT_BY_ID[matchId];
    var home = resolveRef(def.home);
    var away = resolveRef(def.away);

    var info = {
      home: home,
      away: away,
      homeDefined: !!home,
      awayDefined: !!away,
      winner: null,
      loser: null,
      complete: false
    };

    var pred = predictions[matchId];
    if (home && away && pred && pred.home !== null && pred.home !== undefined &&
        pred.away !== null && pred.away !== undefined) {
      var hg = Number(pred.home);
      var ag = Number(pred.away);
      if (hg > ag) { info.winner = home; info.loser = away; info.complete = true; }
      else if (ag > hg) { info.winner = away; info.loser = home; info.complete = true; }
      else if (pred.penaltyWinner === "home") { info.winner = home; info.loser = away; info.complete = true; }
      else if (pred.penaltyWinner === "away") { info.winner = away; info.loser = home; info.complete = true; }
    }

    resolved[matchId] = info;
    return info;
  }

  KNOCKOUT.forEach(function (m) { resolveMatch(m.id); });

  return { standings: standings, thirds: thirds, matches: resolved };
}

// Índice rápido por id de partido eliminatorio.
var KNOCKOUT_BY_ID = {};
KNOCKOUT.forEach(function (m) { KNOCKOUT_BY_ID[m.id] = m; });
