let bgColor;
const message = "Discover me";

function setup() {
	createCanvas(windowWidth, windowHeight);
	textAlign(LEFT, CENTER);
	textFont("discovery");
	bgColor = color(22, 26, 35);
}

function draw() {
	background(bgColor);

	textSize(min(width, height) * 0.13);
	noStroke();

	const centerX = width / 2;
	const centerY = height / 2;
	const maxInfluence = min(width, height) * 0.25;
	const lightColor = color(245, 248, 255);
	const totalWidth = textWidth(message);
	let cursorX = centerX - totalWidth / 2;

	for (const ch of message) {
		const charWidth = textWidth(ch);
		const charCenterX = cursorX + charWidth * 0.5;
		const d = dist(mouseX, mouseY, charCenterX, centerY);
		const proximity = 1 - constrain(d / maxInfluence, 0, 1);
		const charColor = lerpColor(bgColor, lightColor, proximity);

		fill(charColor);
		text(ch, cursorX, centerY);
		cursorX += charWidth;
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
