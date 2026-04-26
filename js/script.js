const DISPLAY_SECONDS = .065;
const CROSSFADE_SECONDS = 0.025;
const ENTER_SCALE = 0.2;
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
let logoWidth = 0, logoHeight = 0, logoX = 0, logoY = 0;

let sequenceTimeline;
let hoverTween;
let logoZoomTween;
let isHovered = false;
let displayState = { imagesAlpha: 0 };
let logoRenderState = { scale: 1 };
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
    background(0, 0, 0);

    if (!logoImage || bgImages.length === 0) {
        return;
    }

    checkHover();
    renderMaskedLogo();
    const scaledLogoWidth = logoWidth * logoRenderState.scale;
    const scaledLogoHeight = logoHeight * logoRenderState.scale;
    const scaledLogoX = logoX + (logoWidth - scaledLogoWidth) * 0.5;
    const scaledLogoY = logoY + (logoHeight - scaledLogoHeight) * 0.5;
    image(logoBuffer, scaledLogoX, scaledLogoY, scaledLogoWidth, scaledLogoHeight);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    updateLayout();
}

function updateLayout() {
    if (!logoImage || !logoImage.width || !logoImage.height) {
        return;
    }

    const isMobile = width <= 768;
    const screenRatio = isMobile ? 0.9 : 0.5;
    const logoMaxWidth = min(width * screenRatio, 640);
    const logoMaxHeight = height * screenRatio;
    const scaleFactor = min(logoMaxWidth / logoImage.width, logoMaxHeight / logoImage.height);

    logoWidth = max(1, floor(logoImage.width * scaleFactor));
    logoHeight = max(1, floor(logoImage.height * scaleFactor));
    logoX = floor((width - logoWidth) * 0.5);
    logoY = floor((height - logoHeight) * 0.5);

    logoBuffer = createGraphics(logoWidth, logoHeight);
}

function renderMaskedLogo() {
    if (!logoBuffer) {
        return;
    }

    logoBuffer.clear();
    logoBuffer.drawingContext.imageSmoothingEnabled = true;

    // Estado base: silueta blanca del logo
    const whiteFill = 255 * (1 - displayState.imagesAlpha);
    if (whiteFill > 0) {
        logoBuffer.push();
        logoBuffer.noStroke();
        logoBuffer.fill(255, whiteFill);
        logoBuffer.rect(0, 0, logoBuffer.width, logoBuffer.height);
        logoBuffer.pop();
    }

    // Imágenes animadas en hover
    if (displayState.imagesAlpha > 0) {
        drawSequentialBackground(logoBuffer, displayState.imagesAlpha);
    }

    const ctx = logoBuffer.drawingContext;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    logoBuffer.image(logoImage, 0, 0, logoWidth, logoHeight);
    ctx.restore();
}

function drawSequentialBackground(gfx, masterAlpha = 1) {
    const total = bgImages.length;
    if (!total) {
        return;
    }

    const currentImg = bgImages[animationState.index % total];
    const nextImg = bgImages[animationState.nextIndex % total];

    drawImageFullLogoWidth(gfx, currentImg, 255 * masterAlpha, 1);

    if (total > 1 && animationState.nextAlpha > 0) {
        drawImageFullLogoWidth(gfx, nextImg, 255 * masterAlpha * animationState.nextAlpha, animationState.nextScale);
    }
}

function initSequenceAnimation() {
    const total = bgImages.length;

    sequenceTimeline = gsap.timeline({ repeat: -1, defaults: { ease: 'none' }, paused: true });

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
            duration: DISPLAY_SECONDS,
            nextAlpha: 0,
            nextScale: ENTER_SCALE
        });

        sequenceTimeline.to(animationState, {
            duration: CROSSFADE_SECONDS,
            nextAlpha: 1,
            nextScale: 1,
        });
    }
}

function checkHover() {
    const over = mouseX >= logoX && mouseX <= logoX + logoWidth &&
                 mouseY >= logoY && mouseY <= logoY + logoHeight;

    if (over && !isHovered) {
        isHovered = true;
        if (hoverTween) hoverTween.kill();
        if (logoZoomTween) logoZoomTween.kill();
        if (sequenceTimeline) sequenceTimeline.resume();
        hoverTween = gsap.to(displayState, {
            duration: 0.4,
            imagesAlpha: 1
        });
        logoZoomTween = gsap.to(logoRenderState, {
            duration: 0.35,
            scale: 1.05,
            ease: 'power2.out'
        });
        document.body.style.cursor = 'pointer';
    } else if (!over && isHovered) {
        isHovered = false;
        if (hoverTween) hoverTween.kill();
        if (logoZoomTween) logoZoomTween.kill();
        hoverTween = gsap.to(displayState, {
            duration: 0.4,
            imagesAlpha: 0,
            onComplete: () => { if (sequenceTimeline) sequenceTimeline.pause(); }
        });
        logoZoomTween = gsap.to(logoRenderState, {
            duration: 0.35,
            scale: 1,
            ease: 'power2.out'
        });
        document.body.style.cursor = 'default';
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
    const drawable = img.canvas || img.elt || img;
    const alpha = constrain(alphaValue / 255, 0, 1);

    const ctx = gfx.drawingContext;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(drawable, x, y, scaledW, scaledH);
    ctx.restore();
}