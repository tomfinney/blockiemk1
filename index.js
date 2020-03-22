let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let rightPressed = false;
let leftPressed = false;
let upPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
  if (e.key == "Up" || e.key == "ArrowUp") {
    upPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
  if (e.key == "Up" || e.key == "ArrowUp") {
    upPressed = false;
  }
}

let ground = {
  width: canvas.width,
  height: 16,
  x: 0,
  y: canvas.height - 16,
  color: "#0095DD"
};

function drawGround() {
  ctx.beginPath();
  ctx.rect(ground.x, ground.y, ground.width, ground.height);
  ctx.fillStyle = ground.color;
  ctx.fill();
  ctx.closePath();
}

let player = {
  width: 12,
  height: 18,
  x: 0,
  y: canvas.height - 18 - ground.height,
  dx: 0,
  dy: 0,
  color: "#8eff81"
};

function drawPlayer() {
  ctx.beginPath();
  ctx.rect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.closePath();
}

function handleKeyPresses() {
  if (rightPressed) {
    player.dx = 5;
  } else if (leftPressed) {
    player.dx = -5;
  }
  if (upPressed && !playerIsJumping()) {
    player.dy = -12;
  }
}

function handleDeceleration() {
  if (player.dx > 0) {
    player.dx -= 1;
  } else if (player.dx < 0) {
    player.dx += 1;
  }
  if (player.dy < 0) {
    player.dy += 1;
  } else if (player.dy >= 0 && player.dy <= 8 && playerIsJumping()) {
    player.dy += 1;
  }
}

function playerIsJumping() {
  return ground.y > player.y + player.height;
}

function handleMovement() {
  player.x += player.dx;

  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
    player.dx = 0;
  }

  if (player.x < 0) {
    player.x = 0;
    player.dx = 0;
  }

  player.y += player.dy;

  if (player.y + player.height > ground.y) {
    player.dy = 0;
    player.y = ground.y - player.height;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();
  drawPlayer();

  handleKeyPresses();
  handleDeceleration();
  handleMovement();

  requestAnimationFrame(draw);
}

draw();
