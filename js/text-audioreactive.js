// ── Audio-Reactive Typography ──────────────────────────────────────────────
// Variables de control
const TEXTO        = 'p5.js Prompt LAB';
const FONT_SIZE    = 80;           // tamaño base en px
const FONT_FAMILY  = 'monospace';  // tipografía
const COLOR_FILL   = '#F25252';    // color del texto
const BG_COLOR     = '#111';       // color de fondo
const NUM_BANDS    = 64;           // bandas FFT (potencia de 2)
const SCALE_AMOUNT = 0.6;         // intensidad del efecto de escala (0–1)

// Estado interno
let sound, fft;
let chars = [];         // array de objetos { char, x, y, bandIndex }
let playing = false;

// ── Preload ──────────────────────────────────────────────────────────────────
function preload() {
  soundFormats('mp3');
  sound = loadSound('./audio/demo.mp3');
}

// ── Setup ────────────────────────────────────────────────────────────────────
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(FONT_FAMILY);
  textSize(FONT_SIZE);
  textAlign(CENTER, CENTER);

  fft = new p5.FFT(0.8, NUM_BANDS);
  fft.setInput(sound);

  buildChars();
}

// Distribuye los caracteres del texto y les asigna una banda FFT
function buildChars() {
  chars = [];
  const words = TEXTO.split(' ');
  const numChars = TEXTO.replace(/ /g, '').length; // sólo letras visibles

  // Asigna una banda FFT a cada letra (distribuida uniformemente)
  let letterIndex = 0;
  let totalLetters = numChars;

  // Calcula posiciones: centrar el texto como bloques de palabras
  // Para mayor control, dibujamos letra a letra
  textSize(FONT_SIZE);

  // Medidas globales para centrar
  const charWidth  = textWidth('M');   // ancho de referencia
  const lineHeight = FONT_SIZE * 1.3;

  // Dividir en dos líneas si el texto es largo (opcional)
  const lines = [words.slice(0, 2).join(' '), words.slice(2).join(' ')];

  let charCounter = 0;
  lines.forEach((line, lineIdx) => {
    const lineW = textWidth(line);
    let cx = width / 2 - lineW / 2;
    const cy = height / 2 + (lineIdx - (lines.length - 1) / 2) * lineHeight;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const cw = textWidth(ch);

      if (ch !== ' ') {
        // Banda FFT asignada proporcionalmente al índice de la letra
        const bandIndex = Math.floor((charCounter / Math.max(totalLetters - 1, 1)) * (NUM_BANDS - 1));
        chars.push({ ch, x: cx + cw / 2, y: cy, bandIndex });
        charCounter++;
      } else {
        // Espacio: no registra carácter pero avanza posición
        chars.push({ ch: ' ', x: cx + cw / 2, y: cy, bandIndex: -1 });
      }
      cx += cw;
    }
  });
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function draw() {
  background(BG_COLOR);

  let spectrum = fft.analyze(); // valores 0–255 por banda

  textFont(FONT_FAMILY);
  textAlign(CENTER, CENTER);
  fill(COLOR_FILL);
  noStroke();

  for (const c of chars) {
    if (c.ch === ' ') continue;

    // Valor de energía normalizado 0–1
    const energy = c.bandIndex >= 0 ? spectrum[c.bandIndex] / 255 : 0;

    // Escala: 1.0 en silencio, hasta (1 + SCALE_AMOUNT) con energía máxima
    const s = 1.0 + energy * SCALE_AMOUNT;

    push();
    translate(c.x, c.y);
    scale(s);
    textSize(FONT_SIZE);
    text(c.ch, 0, 0);
    pop();
  }

  // Indicador de estado
  if (!playing) {
    textSize(14);
    fill(255, 200);
    textAlign(CENTER, BOTTOM);
    text('clic para reproducir', width / 2, height - 20);
  }
}

// ── Interacción ───────────────────────────────────────────────────────────────
function mousePressed() {
  if (!playing) {
    sound.loop();
    playing = true;
  } else {
    sound.pause();
    playing = false;
  }
}

// ── Responsive ───────────────────────────────────────────────────────────────
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildChars();
}
