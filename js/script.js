const DISPLAY_SECONDS = 1;
const CROSSFADE_SECONDS = 0.25;
const ENTER_SCALE = 0.9;
const LOGO_PATH = './img/juanfuent.es-logo.svg';

const BG_PATHS = [
    './img/bg/bienal-intro.jpg',
    './img/bg/bienal-jurado.jpg',
    './img/bg/bienal-pajaros.jpg',
    './img/bg/ibero-carrera.jpg',
    './img/bg/ibero-escuela.jpg',
    './img/bg/molotov-handshake.jpg',
    './img/bg/molotov-money.jpg',
    './img/bg/pictoline-bacon.jpg',
    './img/bg/pictoline-projects.jpg',
    './img/bg/spaceboy-coca.jpg',
    './img/bg/spaceboy-cortometraje.jpg',
    './img/bg/tci-hero.jpg',
    './img/bg/tci-kit.jpg'
];

let logoImage, logoBuffer, bgImages = [];
let drawW = 0, drawH = 0, drawX = 0, drawY = 0;

let sequenceTimeline;
let animationState = {
    index: 0,
    nextIndex: 0,
    nextAlpha: 0,
    nextScale: 1
};

function preload() {
    logoImage = loadImage(LOGO_PATH);
    bgImages = BG_PATHS.map((imgPath) => loadImage(imgPath));
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CORNER);
    smooth();
    updateLayout();
    initSequenceAnimation();
}

function draw() {
    background(0, 0, 255);

    if (!logoImage || bgImages.length === 0) {
        return;
    }

    renderMaskedLogo();
    image(logoBuffer, drawX, drawY);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    updateLayout();
}

function updateLayout() {
    if (!logoImage || !logoImage.width || !logoImage.height) {
        return;
    }

    const maxW = width * 0.8;
    const maxH = height * 0.8;
    const scaleFactor = min(maxW / logoImage.width, maxH / logoImage.height);

    drawW = max(1, floor(logoImage.width * scaleFactor));
    drawH = max(1, floor(logoImage.height * scaleFactor));
    drawX = floor((width - drawW) * 0.5);
    drawY = floor((height - drawH) * 0.5);

    logoBuffer = createGraphics(drawW, drawH);
}

function renderMaskedLogo() {
    if (!logoBuffer) {
        return;
    }

    logoBuffer.clear();
    logoBuffer.drawingContext.imageSmoothingEnabled = true;
    drawSequentialBackground(logoBuffer);

    const ctx = logoBuffer.drawingContext;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    logoBuffer.image(logoImage, 0, 0, drawW, drawH);
    ctx.restore();
}

function drawSequentialBackground(gfx) {
    const total = bgImages.length;
    if (!total) {
        return;
    }

    const currentImg = bgImages[animationState.index % total];
    const nextImg = bgImages[animationState.nextIndex % total];

    drawImageFullLogoWidth(gfx, currentImg, 255, 1);

    if (total > 1 && animationState.nextAlpha > 0) {
        drawImageFullLogoWidth(gfx, nextImg, 255 * animationState.nextAlpha, animationState.nextScale);
    }
}

function initSequenceAnimation() {
    const total = bgImages.length;

    if (!total) {
        return;
    }

    if (sequenceTimeline) {
        sequenceTimeline.kill();
        sequenceTimeline = null;
    }

    animationState.index = 0;
    animationState.nextIndex = total > 1 ? 1 : 0;
    animationState.nextAlpha = 0;
    animationState.nextScale = ENTER_SCALE;

    if (typeof gsap === 'undefined' || total < 2) {
        return;
    }

    sequenceTimeline = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } });

    for (let i = 0; i < total; i += 1) {
        const current = i;
        const next = (i + 1) % total;

        sequenceTimeline.call(() => {
            animationState.index = current;
            animationState.nextIndex = next;
            animationState.nextAlpha = 0;
            animationState.nextScale = ENTER_SCALE;
        });

        sequenceTimeline.to(animationState, {
            ease: 'power2.inOut',
            duration: DISPLAY_SECONDS,
            nextAlpha: 0,
            nextScale: ENTER_SCALE
        });

        sequenceTimeline.to(animationState, {
            ease: 'power2.inOut',
            duration: CROSSFADE_SECONDS,
            nextAlpha: 1,
            nextScale: 1,
            ease: 'power1.inOut'
        });
    }
}

function drawImageFullLogoWidth(gfx, img, alphaValue, scaleValue = 1) {
    if (!img || !img.width || !img.height) {
        return;
    }

    const targetW = gfx.width;
    const targetH = targetW * (img.height / img.width);
    const safeScale = max(0.01, scaleValue);
    const scaledW = targetW * safeScale;
    const scaledH = targetH * safeScale;
    const x = (gfx.width - scaledW) * 0.5;
    const y = (gfx.height - scaledH) * 0.5;

    gfx.push();
    gfx.tint(255, constrain(alphaValue, 0, 255));
    gfx.image(img, x, y, scaledW, scaledH);
    gfx.pop();
}