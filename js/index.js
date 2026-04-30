// Interactivity controls.
const INTERACTION_RADIUS = 1000;
const REPULSION_STRENGTH = 2.75;
const RETURN_STRENGTH = 0.05;
const DAMPING = 0.86;
const ROTATION_STRENGTH = 0.65;
const ROTATION_SMOOTHING = 0.16;
const PARTICLE_STEP = 9;
const PARTICLE_SIZE = 9;
const ALPHA_THRESHOLD = 90;

const COLOR_PALETTE = ['#5518D9', '#8777F2', '#222140', '#F2A81D', '#F25252'];

let canvas, container = document.getElementById('sketch');
let particles = [];
let textLayer;
let particlePalette = [];
let titleElement;
let titleText = '';
let titleLines = [];
let titleFontFamily = 'Space Mono, monospace';
let titleFontSize = 96;
let titleFontWeight = '400';

function setup() {
    titleElement = document.querySelector('#sketch h1');
    syncTitleFromCSS();

    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent(container);
    pixelDensity(1);
    noStroke();
    particlePalette = COLOR_PALETTE;
    buildParticles();
}

function draw() {
    clear();
    for (const p of particles) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distance = sqrt(dx * dx + dy * dy);

        if (distance > 0 && distance < INTERACTION_RADIUS) {
            const force = (1 - distance / INTERACTION_RADIUS) * REPULSION_STRENGTH;
            p.vx += (dx / distance) * force;
            p.vy += (dy / distance) * force;
        }

        // Spring motion to bring each particle back to its original position.
        p.vx += (p.homeX - p.x) * RETURN_STRENGTH;
        p.vy += (p.homeY - p.y) * RETURN_STRENGTH;

        p.vx *= DAMPING;
        p.vy *= DAMPING;

        p.x += p.vx;
        p.y += p.vy;

        const mouseAngle = atan2(mouseY - p.y, mouseX - p.x);
        const proximity = distance < INTERACTION_RADIUS
            ? 1 - distance / INTERACTION_RADIUS
            : 0;
        const targetRotation = mouseAngle * proximity * ROTATION_STRENGTH;
        p.rotation = lerp(p.rotation, targetRotation, ROTATION_SMOOTHING);

        noFill();
        strokeWeight(p.weight);
        stroke(0, abs(sin(frameCount * 0.05 - p.homeX * 0.1 + p.homeY * 0.1)) * 255);
        line(p.x, p.y, p.homeX, p.homeY);
        line(p.x + PARTICLE_SIZE, p.y, p.homeX + PARTICLE_SIZE, p.homeY);
        line(p.x, p.y + PARTICLE_SIZE, p.homeX, p.homeY + PARTICLE_SIZE);
        line(p.x + PARTICLE_SIZE, p.y + PARTICLE_SIZE, p.homeX + PARTICLE_SIZE, p.homeY + PARTICLE_SIZE);
        const cx = p.x + PARTICLE_SIZE * 0.5;
        const cy = p.y + PARTICLE_SIZE * 0.5;

        fill(0);
        noStroke();
        push();
        translate(cx, cy);
        rotate(p.rotation);
        rectMode(CENTER);
        rect(0, 0, PARTICLE_SIZE, PARTICLE_SIZE);
        pop();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    syncTitleFromCSS();
    buildParticles();
}

function syncTitleFromCSS() {
    if (!titleElement) {
        return;
    }

    const computed = window.getComputedStyle(titleElement);
    titleText = titleElement.textContent.trim();
    titleLines = [titleText];
    titleFontFamily = computed.fontFamily;
    titleFontSize = parseFloat(computed.fontSize) || 96;
    titleFontWeight = computed.fontWeight;

    // Keep semantics/SEO while replacing the visual rendering with canvas.
    titleElement.style.visibility = 'hidden';
}

function buildParticles() {
    particles = [];
    textLayer = createGraphics(width, height);
    textLayer.pixelDensity(1);

    textLayer.clear();
    textLayer.background(0, 0);
    textLayer.fill(255);
    textLayer.noStroke();
    textLayer.textAlign(CENTER, CENTER);
    textLayer.textStyle(String(titleFontWeight) === '700' ? BOLD : NORMAL);
    textLayer.textFont(titleFontFamily);
    textLayer.textSize(titleFontSize);

    const lineHeight = titleFontSize * .85;
    const blockHeight = lineHeight * (titleLines.length - 1);
    const startY = height * 0.5 - blockHeight * 0.5;
    for (let i = 0; i < titleLines.length; i += 1) {
        textLayer.text(titleLines[i], width * 0.5, startY + i * lineHeight);
    }

    textLayer.loadPixels();

    for (let y = 0; y < height; y += PARTICLE_STEP) {
        for (let x = 0; x < width; x += PARTICLE_STEP) {
            const index = (x + y * width) * 4;
            const alpha = textLayer.pixels[index + 3];

            if (alpha > ALPHA_THRESHOLD) {
                particles.push({
                    x,
                    y,
                    weight: random(0, 1),
                    homeX: x,
                    homeY: y,
                    color: random(particlePalette),
                    rotation: 0,
                    vx: 0,
                    vy: 0
                });
            }
        }
    }
}
