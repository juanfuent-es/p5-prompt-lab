const MESSAGE = 'Particles';

// Interactivity controls.
const INTERACTION_RADIUS = 150;
const REPULSION_STRENGTH = 2.75;
const RETURN_STRENGTH = 0.085;
const DAMPING = 0.86;
const PARTICLE_STEP = 7;
const PARTICLE_SIZE = 5;
const ALPHA_THRESHOLD = 90;

const BG_COLOR = '#0b0d10';
const PARTICLE_COLOR = '#f4f6f8';

let particles = [];
let textLayer;

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    noStroke();
    buildParticles();
}

function draw() {
    background(BG_COLOR);

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

        stroke(PARTICLE_COLOR);
        strokeWeight(.5);
        noFill();
        rect(p.x, p.y, PARTICLE_SIZE, PARTICLE_SIZE);
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
                    vx: 0,
                    vy: 0
                });
            }
        }
    }
}
