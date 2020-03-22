let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
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
  color: "#8eff81"
};

function drawPlayer() {
  ctx.beginPath();
  ctx.rect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.closePath();
}

function handleMovement() {
  if (rightPressed) {
    return (player.x += 5);
  }
  if (leftPressed) {
    return (player.x -= 5);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();
  drawPlayer();

  handleMovement();

  requestAnimationFrame(draw);
}

draw();
