# PRODE Mundial 2026

Aplicación web simple (HTML + CSS + JavaScript vanilla, sin frameworks ni backend) para
pronosticar la **fase de grupos** y toda la **fase eliminatoria** del Mundial 2026.

## Características

- Sin registro ni base de datos: solo ingresás tu nombre al inicio.
- **Fase de grupos:** 12 grupos (A–L), 4 equipos por grupo, 6 partidos por grupo (72 en total).
  - Empates permitidos (suman 1 punto a cada equipo).
  - Tabla de posiciones en vivo por grupo (PJ, G, E, P, GF, GC, DG, Pts).
- **Clasificación automática** según el formato oficial FIFA: 1.º y 2.º de cada grupo + los
  **8 mejores terceros**. El cruce de cada tercero se resuelve con las 495 combinaciones del
  Anexo C del reglamento.
- **Fase eliminatoria** con equipos reales derivados de tus pronósticos:
  Dieciseisavos → Octavos → Cuartos → Semifinales → Tercer puesto → Final.
  - Los ganadores avanzan automáticamente al siguiente cruce.
  - En eliminatorias, si hay empate en los 90 minutos, elegís el **ganador por penales**
    (no se carga el marcador exacto de la tanda).
- Banderas de cada país con emojis Unicode.
- Persistencia local con `localStorage`: tus pronósticos no se pierden al recargar.
- Botón para guardar y opción para empezar de nuevo.

> Nota: por ahora no hay cálculo de puntos contra resultados reales; solo se registran y
> muestran tus pronósticos.

## Cómo usarla

Abrí `index.html` directamente en cualquier navegador moderno, o serví la carpeta:

```bash
cd /home/francisco/git/prode
python3 -m http.server 8000
# luego abrí http://localhost:8000
```

## Estructura

```
prode/
├── index.html          # Pantallas (bienvenida + pronósticos)
├── css/
│   └── styles.css      # Estilos responsive
└── js/
    ├── data.js         # Equipos, banderas, partidos de grupo y cuadro eliminatorio
    ├── annex-c.js      # 495 combinaciones del Anexo C (terceros → dieciseisavos)
    ├── bracket.js      # Tablas de posiciones, mejores terceros, resolución del cuadro
    ├── storage.js      # Persistencia en localStorage
    └── app.js          # UI y orquestación
```

## Formato oficial (referencia)

- 48 equipos · 12 grupos × 4 · 3 partidos por equipo.
- Clasifican 32: 24 (1.º y 2.º) + 8 mejores terceros.
- Eliminación directa desde dieciseisavos; empates se definen por penales.
