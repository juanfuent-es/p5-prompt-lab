// Timing for each image state in the GSAP sequence.
const DISPLAY_SECONDS = .065;
const CROSSFADE_SECONDS = 0.025;
const ENTER_SCALE = 0.2;
const LOGO_PATH = './img/juanfuent.es-logo.svg';

// Source images that will be shown inside the logo mask.
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

// Animation and interaction state.
let sequenceTimeline;
let hoverTween;
let logoZoomTween;
let isHovered = false;
let displayState = { imagesAlpha: 0 };
let logoRenderState = { scale: 1 };
let imageTracks = [];

function preload() {
    // Load logo and background assets before setup starts.
    logoImage = loadImage(LOGO_PATH);
    bgImages = BG_PATHS.map((imgPath) => loadImage(imgPath));
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CORNER);
    smooth();
    updateLayout();
    initSequenceTimeline();
}

function draw() {
    background(0, 0, 0);

    if (!logoImage || bgImages.length === 0) {
        return;
    }

    // Draw the masked composition and then apply global logo zoom.
    renderMaskedLogo();
    const scaledLogoWidth = logoWidth * logoRenderState.scale;
    const scaledLogoHeight = logoHeight * logoRenderState.scale;
    const scaledLogoX = logoX + (logoWidth - scaledLogoWidth) * 0.5;
    const scaledLogoY = logoY + (logoHeight - scaledLogoHeight) * 0.5;
    image(logoBuffer, scaledLogoX, scaledLogoY, scaledLogoWidth, scaledLogoHeight);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Recompute logo bounds and hover state on resize.
    updateLayout();
    updateHoverState();
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

    // Cache logo placement so drawing and hover checks share the same bounds.
    logoWidth = max(1, floor(logoImage.width * scaleFactor));
    logoHeight = max(1, floor(logoImage.height * scaleFactor));
    logoX = floor((width - logoWidth) * 0.5);
    logoY = floor((height - logoHeight) * 0.5);

    // Offscreen buffer where background + mask are composed.
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

    // Keep only the pixels inside the logo silhouette.
    const ctx = logoBuffer.drawingContext;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    logoBuffer.image(logoImage, 0, 0, logoWidth, logoHeight);
    ctx.restore();
}

function drawSequentialBackground(gfx, masterAlpha = 1) {
    // Draw all tracks with alpha > 0 so crossfades can overlap.
    if (!bgImages.length || !imageTracks.length) {
        return;
    }

    for (let i = 0; i < bgImages.length; i += 1) {
        const track = imageTracks[i];
        if (!track || track.alpha <= 0.001) {
            continue;
        }
        drawImageFullLogoWidth(gfx, bgImages[i], 255 * masterAlpha * track.alpha, track.scale);
    }
}

function initSequenceTimeline() {
    const total = bgImages.length;

    // Per-image animated properties driven by GSAP.
    imageTracks = bgImages.map((_, index) => ({
        alpha: index === 0 ? 1 : 0,
        scale: index === 0 ? 1 : ENTER_SCALE
    }));

    if (sequenceTimeline) {
        sequenceTimeline.kill();
        sequenceTimeline = null;
    }

    if (typeof gsap === 'undefined' || total < 2) {
        return;
    }

    // Build one full loop: hold current image, then crossfade/scale to next.
    sequenceTimeline = gsap.timeline({ repeat: -1, defaults: { ease: 'none' }, paused: true });

    for (let i = 0; i < total; i += 1) {
        const currentTrack = imageTracks[i];
        const nextTrack = imageTracks[(i + 1) % total];

        sequenceTimeline.to({}, {
            duration: DISPLAY_SECONDS,
        });

        sequenceTimeline.fromTo(nextTrack, {
            alpha: 0,
            scale: ENTER_SCALE
        }, {
            duration: CROSSFADE_SECONDS,
            alpha: 1,
            scale: 1,
            ease: 'power2.out'
        }, '<');

        sequenceTimeline.to(currentTrack, {
            duration: CROSSFADE_SECONDS,
            alpha: 0,
            ease: 'power1.inOut'
        }, '<');
    }
}

function updateHoverState() {
    // Hover is checked against the logo bounding box.
    const over = mouseX >= logoX && mouseX <= logoX + logoWidth &&
                 mouseY >= logoY && mouseY <= logoY + logoHeight;

    if (over) {
        handleLogoMouseEnter();
    } else {
        handleLogoMouseLeave();
    }
}

function handleLogoMouseEnter() {
    if (isHovered) {
        return;
    }

    isHovered = true;
    if (hoverTween) hoverTween.kill();
    if (logoZoomTween) logoZoomTween.kill();

    if (sequenceTimeline) {
        // Resume image sequence only while hovered.
        sequenceTimeline.play();
    }

    // Fade from white logo to image-filled logo.
    hoverTween = gsap.to(displayState, {
        duration: 0.4,
        imagesAlpha: 1
    });
    // Slight logo zoom on hover.
    logoZoomTween = gsap.to(logoRenderState, {
        duration: 0.35,
        scale: 1.05,
        ease: 'power2.out'
    });
    document.body.style.cursor = 'pointer';
}

function handleLogoMouseLeave() {
    if (!isHovered) {
        return;
    }

    isHovered = false;
    if (hoverTween) hoverTween.kill();
    if (logoZoomTween) logoZoomTween.kill();

    // Fade out images and then pause the sequence where it ended.
    hoverTween = gsap.to(displayState, {
        duration: 0.4,
        imagesAlpha: 0,
        onComplete: () => {
            if (sequenceTimeline) {
                sequenceTimeline.pause();
            }
        }
    });
    // Return logo to base scale.
    logoZoomTween = gsap.to(logoRenderState, {
        duration: 0.35,
        scale: 1,
        ease: 'power2.out'
    });
    document.body.style.cursor = 'default';
}

function mouseMoved() {
    updateHoverState();
}

function mouseDragged() {
    updateHoverState();
}

function mouseOut() {
    handleLogoMouseLeave();
}

function drawImageFullLogoWidth(gfx, img, alphaValue, scaleValue = 1) {
    if (!img || !img.width || !img.height) {
        return;
    }

    // Fit each image to logo width and preserve aspect ratio.
    const targetW = gfx.width;
    const targetH = targetW * (img.height / img.width);
    const safeScale = max(0.01, scaleValue);
    const scaledW = targetW * safeScale;
    const scaledH = targetH * safeScale;
    const x = (gfx.width - scaledW) * 0.5;
    const y = (gfx.height - scaledH) * 0.5;
    const drawable = img.canvas || img.elt || img;
    const alpha = constrain(alphaValue / 255, 0, 1);

    // Draw via Canvas2D alpha to avoid heavier p5 tint code paths.
    const ctx = gfx.drawingContext;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(drawable, x, y, scaledW, scaledH);
    ctx.restore();
}