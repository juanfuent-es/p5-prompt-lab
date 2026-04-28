const MESSAGE = 'VibeCoding';

// Interactivity controls.
const INTERACTION_RADIUS = 300;
const REPULSION_STRENGTH = 2.75;
const RETURN_STRENGTH = 0.05;
const DAMPING = 0.86;
const ROTATION_STRENGTH = 0.65;
const ROTATION_SMOOTHING = 0.16;
const PARTICLE_STEP = 10;
const PARTICLE_SIZE = 5;
const ALPHA_THRESHOLD = 90;

const COLOR_PALETTE = ['#5518D9', '#8777F2', '#222140', '#F2A81D', '#F25252'];

let particles = [];
let textLayer;
let bgColor = "#22214055";
let particlePalette = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    noStroke();
    ///bgColor = random(COLOR_PALETTE);
    particlePalette = COLOR_PALETTE.filter((c) => c !== bgColor);
    buildParticles();
}

function draw() {
    background(bgColor);

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
        strokeWeight(.5);
        stroke(p.color);
        // rect(p.homeX, p.homeY, PARTICLE_SIZE, PARTICLE_SIZE);
        line(p.x, p.y, p.homeX, p.homeY);
        line(p.x + PARTICLE_SIZE, p.y, p.homeX + PARTICLE_SIZE, p.homeY);
        line(p.x, p.y + PARTICLE_SIZE, p.homeX, p.homeY + PARTICLE_SIZE);
        line(p.x + PARTICLE_SIZE, p.y + PARTICLE_SIZE, p.homeX + PARTICLE_SIZE, p.homeY + PARTICLE_SIZE);

        const cx = p.x + PARTICLE_SIZE * 0.5;
        const cy = p.y + PARTICLE_SIZE * 0.5;
        strokeWeight(.1);
        push();
        translate(cx, cy);
        //rotate(p.rotation);
        rectMode(CENTER);
        rect(0, 0, PARTICLE_SIZE, PARTICLE_SIZE);
        pop();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    buildParticles();
}

function buildParticles() {
    particles = [];
    textLayer = createGraphics(width, height);
    textLayer.pixelDensity(1);

    const fontSize = min(width * 0.17, height * 0.28, 220);

    textLayer.clear();
    textLayer.background(0, 0);
    textLayer.fill(255);
    textLayer.noStroke();
    textLayer.textAlign(CENTER, CENTER);
    textLayer.textStyle(BOLD);
    textLayer.textSize(fontSize);
    textLayer.text(MESSAGE, width * 0.5, height * 0.5);

    textLayer.loadPixels();

    for (let y = 0; y < height; y += PARTICLE_STEP) {
        for (let x = 0; x < width; x += PARTICLE_STEP) {
            const index = (x + y * width) * 4;
            const alpha = textLayer.pixels[index + 3];

            if (alpha > ALPHA_THRESHOLD) {
                particles.push({
                    x,
                    y,
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
