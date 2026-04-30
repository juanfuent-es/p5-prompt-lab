const MESSAGE = "OUTLINE";
const FONT_URL = "../css/ArchivoBlack.ttf";

const BG_COLOR = "#0f131d";
const STROKE_COLOR = "#f4f6fb";
const GHOST_COLOR = "#8ba2d9";

const MAX_POINTS_PER_CHAR = 90;
const SAMPLE_FACTOR = 0.2;
const SIMPLIFY_THRESHOLD = 0;

const INTERACTION_RADIUS = 140;
const REPULSION_STRENGTH = 1.9;
const RETURN_STRENGTH = 0.09;
const DAMPING = 0.84;

let letterShapes = [];
let vectorFont;

function preload() {
	vectorFont = loadFont(FONT_URL);
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	textFont(vectorFont);
	buildLetterShapes();
}

function draw() {
	background(0,0,0,50);

	for (const shape of letterShapes) {
		for (const contour of shape.contours) {
			for (const point of contour) {
				applyRepulsion(point);

				point.vx += (point.homeX - point.x) * RETURN_STRENGTH;
				point.vy += (point.homeY - point.y) * RETURN_STRENGTH;

				point.vx *= DAMPING;
				point.vy *= DAMPING;

				point.x += point.vx;
				point.y += point.vy;
			}
		}

		drawLetterShape(shape);
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	buildLetterShapes();
}

function applyRepulsion(point) {
	const dx = point.x - mouseX;
	const dy = point.y - mouseY;
	const distance = sqrt(dx * dx + dy * dy);

	if (distance > 0 && distance < INTERACTION_RADIUS) {
		const force = (1 - distance / INTERACTION_RADIUS) * REPULSION_STRENGTH;
		point.vx += (dx / distance) * force;
		point.vy += (dy / distance) * force;
	}
}

function drawLetterShape(shape) {
	if (!shape.contours || shape.contours.length === 0) {
		return;
	}

	noFill();

	for (const contour of shape.contours) {
		if (contour.length < 3) {
			continue;
		}

		stroke(GHOST_COLOR);
		strokeWeight(0.7);
		/* beginShape();
		for (const point of contour) {
			vertex(point.homeX, point.homeY);
		}
		endShape(CLOSE); */

		stroke(STROKE_COLOR);
		strokeWeight(1.8);
		beginShape();
		for (const point of contour) {
			vertex(point.x, point.y);
		}
		endShape(CLOSE);
	}
}

function buildLetterShapes() {
	letterShapes = [];

	const fontSize = min(width * 0.22, height * 0.34, 280);
	textFont(vectorFont);
	textSize(fontSize);

	const ascent = textAscent();
	const descent = textDescent();

	const widths = [];
	let totalWidth = 0;

	for (const ch of MESSAGE) {
		const charWidth = textWidth(ch);
		widths.push(charWidth);
		totalWidth += charWidth;
	}

	let cursorX = width * 0.5 - totalWidth * 0.5;
	const baselineY = height * 0.5 + (ascent - descent) * 0.5;

	for (let i = 0; i < MESSAGE.length; i += 1) {
		const ch = MESSAGE[i];
		const charWidth = widths[i];

		if (ch.trim().length > 0) {
			const points = vectorFont.textToPoints(ch, cursorX, baselineY, fontSize, {
				sampleFactor: SAMPLE_FACTOR,
				simplifyThreshold: SIMPLIFY_THRESHOLD
			});

			if (points.length > 2) {
				const globalPoints = points.map((p) => ({
					x: p.x,
					y: p.y,
					homeX: p.x,
					homeY: p.y,
					vx: 0,
					vy: 0
				}));

				const reduced = limitPoints(globalPoints, MAX_POINTS_PER_CHAR);
				const contours = splitContoursByGap(reduced, fontSize);
				letterShapes.push({ contours });
			}
		}

		cursorX += charWidth;
	}
}

function splitContoursByGap(points, fontSize) {
	if (points.length < 3) {
		return [];
	}

	const contours = [];
	let current = [points[0]];
	const gapThreshold = max(8, fontSize * 0.055);

	for (let i = 1; i < points.length; i += 1) {
		const prev = points[i - 1];
		const curr = points[i];
		const gap = dist(prev.homeX, prev.homeY, curr.homeX, curr.homeY);

		if (gap > gapThreshold) {
			if (current.length >= 3) {
				contours.push(current);
			}
			current = [curr];
		} else {
			current.push(curr);
		}
	}

	if (current.length >= 3) {
		contours.push(current);
	}

	return contours;
}

function limitPoints(points, maxCount) {
	if (points.length <= maxCount) {
		return points;
	}

	const reduced = [];
	const step = points.length / maxCount;

	for (let i = 0; i < maxCount; i += 1) {
		reduced.push(points[floor(i * step)]);
	}

	return reduced;
}
