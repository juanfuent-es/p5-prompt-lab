let labelText = "Rótulo";
let shadowPos;

function setup() {
  createCanvas(windowWidth, windowHeight);
  shadowPos = createVector(width / 2, height / 2);
  textFont("amador");
  textAlign(CENTER, CENTER);
  noStroke();
}

function draw() {
  background("#d8d3c2");

  // Cursor offset relative to center; clamped to keep the composition clean.
  const maxOffset = min(width, height) * 0.12;
  const dx = constrain(mouseX - width / 2, -maxOffset, maxOffset);
  const dy = constrain(mouseY - height / 2, -maxOffset, maxOffset);

  const targetX = width / 2 + dx * 0.1;
  const targetY = height / 2 + dy * 0.1;

  // Smooth lag so the shadow follows with a subtle delay.
  shadowPos.x = lerp(shadowPos.x, targetX, 0.12);
  shadowPos.y = lerp(shadowPos.y, targetY, 0.12);

  const txtSize = min(width, height) * 0.24;
  textSize(txtSize);

  noStroke();
  fill("#f8b800");
  text(labelText, shadowPos.x, shadowPos.y);
  
  stroke("#d8d3c2");
  strokeWeight(5);
  fill("#ea1a27");
  text(labelText, width / 2, height / 2);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
