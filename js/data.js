// Equipos, banderas, partidos de grupo y cuadro eliminatorio del Mundial 2026.

const TEAMS = {
  "México": { flag: "🇲🇽", code: "MEX" },
  "Sudáfrica": { flag: "🇿🇦", code: "RSA" },
  "Corea del Sur": { flag: "🇰🇷", code: "KOR" },
  "República Checa": { flag: "🇨🇿", code: "CZE" },
  "Canadá": { flag: "🇨🇦", code: "CAN" },
  "Bosnia y Herzegovina": { flag: "🇧🇦", code: "BIH" },
  "Catar": { flag: "🇶🇦", code: "QAT" },
  "Suiza": { flag: "🇨🇭", code: "SUI" },
  "Brasil": { flag: "🇧🇷", code: "BRA" },
  "Marruecos": { flag: "🇲🇦", code: "MAR" },
  "Haití": { flag: "🇭🇹", code: "HAI" },
  "Escocia": { flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", code: "SCO" },
  "Estados Unidos": { flag: "🇺🇸", code: "USA" },
  "Paraguay": { flag: "🇵🇾", code: "PAR" },
  "Turquía": { flag: "🇹🇷", code: "TUR" },
  "Australia": { flag: "🇦🇺", code: "AUS" },
  "Alemania": { flag: "🇩🇪", code: "GER" },
  "Curazao": { flag: "🇨🇼", code: "CUW" },
  "Costa de Marfil": { flag: "🇨🇮", code: "CIV" },
  "Ecuador": { flag: "🇪🇨", code: "ECU" },
  "Países Bajos": { flag: "🇳🇱", code: "NED" },
  "Japón": { flag: "🇯🇵", code: "JPN" },
  "Suecia": { flag: "🇸🇪", code: "SWE" },
  "Túnez": { flag: "🇹🇳", code: "TUN" },
  "Bélgica": { flag: "🇧🇪", code: "BEL" },
  "Egipto": { flag: "🇪🇬", code: "EGY" },
  "Irán": { flag: "🇮🇷", code: "IRN" },
  "Nueva Zelanda": { flag: "🇳🇿", code: "NZL" },
  "España": { flag: "🇪🇸", code: "ESP" },
  "Cabo Verde": { flag: "🇨🇻", code: "CPV" },
  "Arabia Saudita": { flag: "🇸🇦", code: "KSA" },
  "Uruguay": { flag: "🇺🇾", code: "URU" },
  "Francia": { flag: "🇫🇷", code: "FRA" },
  "Senegal": { flag: "🇸🇳", code: "SEN" },
  "Irak": { flag: "🇮🇶", code: "IRQ" },
  "Noruega": { flag: "🇳🇴", code: "NOR" },
  "Argentina": { flag: "🇦🇷", code: "ARG" },
  "Argelia": { flag: "🇩🇿", code: "ALG" },
  "Austria": { flag: "🇦🇹", code: "AUT" },
  "Jordania": { flag: "🇯🇴", code: "JOR" },
  "Portugal": { flag: "🇵🇹", code: "POR" },
  "RD Congo": { flag: "🇨🇩", code: "COD" },
  "Uzbekistán": { flag: "🇺🇿", code: "UZB" },
  "Colombia": { flag: "🇨🇴", code: "COL" },
  "Inglaterra": { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG" },
  "Croacia": { flag: "🇭🇷", code: "CRO" },
  "Panamá": { flag: "🇵🇦", code: "PAN" },
  "Ghana": { flag: "🇬🇭", code: "GHA" }
};

// Grupos A-L: 4 equipos, 6 partidos cada uno (lista oficial del sorteo FIFA 2026).
const GROUPS = [
  {
    id: "A",
    teams: ["México", "Sudáfrica", "Corea del Sur", "República Checa"],
    matches: [
      { home: "México", away: "Sudáfrica" },
      { home: "Corea del Sur", away: "República Checa" },
      { home: "México", away: "Corea del Sur" },
      { home: "República Checa", away: "Sudáfrica" },
      { home: "México", away: "República Checa" },
      { home: "Sudáfrica", away: "Corea del Sur" }
    ]
  },
  {
    id: "B",
    teams: ["Canadá", "Bosnia y Herzegovina", "Catar", "Suiza"],
    matches: [
      { home: "Canadá", away: "Bosnia y Herzegovina" },
      { home: "Catar", away: "Suiza" },
      { home: "Canadá", away: "Catar" },
      { home: "Bosnia y Herzegovina", away: "Suiza" },
      { home: "Canadá", away: "Suiza" },
      { home: "Bosnia y Herzegovina", away: "Catar" }
    ]
  },
  {
    id: "C",
    teams: ["Brasil", "Marruecos", "Haití", "Escocia"],
    matches: [
      { home: "Brasil", away: "Marruecos" },
      { home: "Haití", away: "Escocia" },
      { home: "Brasil", away: "Haití" },
      { home: "Marruecos", away: "Escocia" },
      { home: "Brasil", away: "Escocia" },
      { home: "Marruecos", away: "Haití" }
    ]
  },
  {
    id: "D",
    teams: ["Estados Unidos", "Paraguay", "Turquía", "Australia"],
    matches: [
      { home: "Estados Unidos", away: "Paraguay" },
      { home: "Turquía", away: "Australia" },
      { home: "Paraguay", away: "Turquía" },
      { home: "Estados Unidos", away: "Australia" },
      { home: "Paraguay", away: "Australia" },
      { home: "Estados Unidos", away: "Turquía" }
    ]
  },
  {
    id: "E",
    teams: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
    matches: [
      { home: "Alemania", away: "Curazao" },
      { home: "Costa de Marfil", away: "Ecuador" },
      { home: "Costa de Marfil", away: "Alemania" },
      { home: "Ecuador", away: "Curazao" },
      { home: "Ecuador", away: "Alemania" },
      { home: "Curazao", away: "Costa de Marfil" }
    ]
  },
  {
    id: "F",
    teams: ["Países Bajos", "Japón", "Suecia", "Túnez"],
    matches: [
      { home: "Países Bajos", away: "Japón" },
      { home: "Suecia", away: "Túnez" },
      { home: "Países Bajos", away: "Suecia" },
      { home: "Japón", away: "Túnez" },
      { home: "Japón", away: "Suecia" },
      { home: "Países Bajos", away: "Túnez" }
    ]
  },
  {
    id: "G",
    teams: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
    matches: [
      { home: "Bélgica", away: "Egipto" },
      { home: "Irán", away: "Nueva Zelanda" },
      { home: "Bélgica", away: "Irán" },
      { home: "Egipto", away: "Nueva Zelanda" },
      { home: "Bélgica", away: "Nueva Zelanda" },
      { home: "Egipto", away: "Irán" }
    ]
  },
  {
    id: "H",
    teams: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"],
    matches: [
      { home: "España", away: "Cabo Verde" },
      { home: "Uruguay", away: "Arabia Saudita" },
      { home: "España", away: "Arabia Saudita" },
      { home: "Cabo Verde", away: "Uruguay" },
      { home: "Arabia Saudita", away: "Cabo Verde" },
      { home: "España", away: "Uruguay" }
    ]
  },
  {
    id: "I",
    teams: ["Francia", "Senegal", "Irak", "Noruega"],
    matches: [
      { home: "Francia", away: "Senegal" },
      { home: "Irak", away: "Noruega" },
      { home: "Francia", away: "Irak" },
      { home: "Senegal", away: "Noruega" },
      { home: "Francia", away: "Noruega" },
      { home: "Senegal", away: "Irak" }
    ]
  },
  {
    id: "J",
    teams: ["Argentina", "Argelia", "Austria", "Jordania"],
    matches: [
      { home: "Argentina", away: "Argelia" },
      { home: "Austria", away: "Jordania" },
      { home: "Argentina", away: "Austria" },
      { home: "Argelia", away: "Jordania" },
      { home: "Argentina", away: "Jordania" },
      { home: "Argelia", away: "Austria" }
    ]
  },
  {
    id: "K",
    teams: ["Portugal", "RD Congo", "Uzbekistán", "Colombia"],
    matches: [
      { home: "Portugal", away: "RD Congo" },
      { home: "Uzbekistán", away: "Colombia" },
      { home: "Portugal", away: "Uzbekistán" },
      { home: "Colombia", away: "RD Congo" },
      { home: "RD Congo", away: "Uzbekistán" },
      { home: "Portugal", away: "Colombia" }
    ]
  },
  {
    id: "L",
    teams: ["Inglaterra", "Croacia", "Panamá", "Ghana"],
    matches: [
      { home: "Inglaterra", away: "Croacia" },
      { home: "Panamá", away: "Ghana" },
      { home: "Inglaterra", away: "Ghana" },
      { home: "Croacia", away: "Panamá" },
      { home: "Inglaterra", away: "Panamá" },
      { home: "Croacia", away: "Ghana" }
    ]
  }
];

// Identificadores estables de partido de grupo: A-1 ... L-6
GROUPS.forEach(function (g) {
  g.matches.forEach(function (m, i) {
    m.id = g.id + "-" + (i + 1);
  });
});

// Referencias de slot para el cuadro eliminatorio:
//   { k: "1A" }   -> 1.º del grupo A
//   { k: "2A" }   -> 2.º del grupo A
//   { k: "3:A" }  -> 3.º asignado al slot del ganador del grupo A (Anexo C)
//   { w: "id" }   -> ganador del partido eliminatorio "id"
//   { l: "id" }   -> perdedor del partido eliminatorio "id"
const KNOCKOUT = [
  // Dieciseisavos de final (32 equipos)
  { id: "R32-73", round: "Dieciseisavos de Final", home: { k: "2A" }, away: { k: "2B" } },
  { id: "R32-74", round: "Dieciseisavos de Final", home: { k: "1E" }, away: { k: "3:E" } },
  { id: "R32-75", round: "Dieciseisavos de Final", home: { k: "1F" }, away: { k: "2C" } },
  { id: "R32-76", round: "Dieciseisavos de Final", home: { k: "1C" }, away: { k: "2F" } },
  { id: "R32-77", round: "Dieciseisavos de Final", home: { k: "1I" }, away: { k: "3:I" } },
  { id: "R32-78", round: "Dieciseisavos de Final", home: { k: "2E" }, away: { k: "2I" } },
  { id: "R32-79", round: "Dieciseisavos de Final", home: { k: "1A" }, away: { k: "3:A" } },
  { id: "R32-80", round: "Dieciseisavos de Final", home: { k: "1L" }, away: { k: "3:L" } },
  { id: "R32-81", round: "Dieciseisavos de Final", home: { k: "1D" }, away: { k: "3:D" } },
  { id: "R32-82", round: "Dieciseisavos de Final", home: { k: "1G" }, away: { k: "3:G" } },
  { id: "R32-83", round: "Dieciseisavos de Final", home: { k: "2K" }, away: { k: "2L" } },
  { id: "R32-84", round: "Dieciseisavos de Final", home: { k: "1H" }, away: { k: "2J" } },
  { id: "R32-85", round: "Dieciseisavos de Final", home: { k: "1B" }, away: { k: "3:B" } },
  { id: "R32-86", round: "Dieciseisavos de Final", home: { k: "1J" }, away: { k: "2H" } },
  { id: "R32-87", round: "Dieciseisavos de Final", home: { k: "1K" }, away: { k: "3:K" } },
  { id: "R32-88", round: "Dieciseisavos de Final", home: { k: "2D" }, away: { k: "2G" } },

  // Octavos de final (16 equipos)
  { id: "R16-89", round: "Octavos de Final", home: { w: "R32-74" }, away: { w: "R32-77" } },
  { id: "R16-90", round: "Octavos de Final", home: { w: "R32-73" }, away: { w: "R32-75" } },
  { id: "R16-91", round: "Octavos de Final", home: { w: "R32-76" }, away: { w: "R32-78" } },
  { id: "R16-92", round: "Octavos de Final", home: { w: "R32-79" }, away: { w: "R32-80" } },
  { id: "R16-93", round: "Octavos de Final", home: { w: "R32-83" }, away: { w: "R32-84" } },
  { id: "R16-94", round: "Octavos de Final", home: { w: "R32-81" }, away: { w: "R32-82" } },
  { id: "R16-95", round: "Octavos de Final", home: { w: "R32-86" }, away: { w: "R32-88" } },
  { id: "R16-96", round: "Octavos de Final", home: { w: "R32-85" }, away: { w: "R32-87" } },

  // Cuartos de final (8 equipos)
  { id: "QF-97", round: "Cuartos de Final", home: { w: "R16-89" }, away: { w: "R16-90" } },
  { id: "QF-98", round: "Cuartos de Final", home: { w: "R16-93" }, away: { w: "R16-94" } },
  { id: "QF-99", round: "Cuartos de Final", home: { w: "R16-91" }, away: { w: "R16-92" } },
  { id: "QF-100", round: "Cuartos de Final", home: { w: "R16-95" }, away: { w: "R16-96" } },

  // Semifinales (4 equipos)
  { id: "SF-101", round: "Semifinales", home: { w: "QF-97" }, away: { w: "QF-98" } },
  { id: "SF-102", round: "Semifinales", home: { w: "QF-99" }, away: { w: "QF-100" } },

  // Tercer puesto y final
  { id: "3P-103", round: "Tercer y Cuarto Puesto", home: { l: "SF-101" }, away: { l: "SF-102" } },
  { id: "F-104", round: "Final", home: { w: "SF-101" }, away: { w: "SF-102" } }
];

// Orden de rondas para el render del cuadro.
const KNOCKOUT_ROUNDS = [
  "Dieciseisavos de Final",
  "Octavos de Final",
  "Cuartos de Final",
  "Semifinales",
  "Tercer y Cuarto Puesto",
  "Final"
];
