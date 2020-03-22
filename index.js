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
  key: "ground",
  width: canvas.width,
  height: 12,
  x: 0,
  y: canvas.height - 12,
  color: "#0095DD"
};

let geometry = [
  ground,
  {
    key: "plat",
    width: 100,
    height: 12,
    x: 80,
    y: canvas.height - 74,
    color: "#0095DD"
  },
  {
    key: "left",
    width: 12,
    height: 32,
    x: 350,
    y: canvas.height - 32 - ground.height,
    color: "#0095DD"
  },
  {
    key: "right",
    width: 12,
    height: 64,
    x: 400,
    y: canvas.height - 64 - ground.height,
    color: "#0095DD"
  }
];

function drawRect({ x, y, width, height, color }) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawGeometry() {
  for (const geo of geometry) {
    drawRect(geo);
  }
}

let player = {
  width: 12,
  height: 18,
  x: 48,
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
  if (upPressed && player.dy === 0) {
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
  } else if (player.dy >= 0 && player.dy <= 8) {
    player.dy += 1;
  }
}

function handleMovement() {
  let newPlayerX = player.x + player.dx;
  let newPlayerY = player.y + player.dy;

  for (const geo of geometry) {
    let playerIsInGeoLeft =
      player.x + player.width >= geo.x &&
      player.x + player.width < geo.x + geo.width / 2;

    let playerIsInGeoRight =
      geo.x + geo.width >= player.x &&
      player.x > geo.x + geo.width - geo.width / 2;

    let playerIsInGeoTop =
      player.y + player.height >= geo.y &&
      player.y + player.height < geo.y + geo.height / 2;

    let playerIsInGeoBottom =
      geo.y + geo.height >= player.y &&
      player.y > geo.y + geo.height - geo.height / 2;

    let playerIsAboveGeo = geo.y >= player.y + player.height;

    let playerIsBelowGeo = player.y >= geo.y + geo.height;

    let playerIsLeftOfGeo = geo.x >= player.x + player.width;

    let playerIsRightOfGeo = player.x >= geo.x + geo.width;

    // 1. if the player is NOT before or after the shape, check vert collision
    if (!playerIsLeftOfGeo && !playerIsRightOfGeo) {
      // 1a. if the player WAS above the shape and they are now NOT then dump them on top of it
      if (geo.y >= player.y + player.height) {
        if (newPlayerY + player.height >= geo.y) {
          newPlayerY = geo.y - player.height;
          player.dy = 0;
        }
      }
    }

    // 2. if the player is NOT above or below the shape, check horiz collision
    if (!playerIsAboveGeo && !playerIsBelowGeo) {
      // 2a. if the player WAS before the shape and they are now NOT then dump them before it
      if (geo.x >= player.x + player.width) {
        if (newPlayerX + player.width >= geo.x) {
          newPlayerX = geo.x - player.width;
          player.dx = 0;
        }
      }
      // 2b. if the player WAS after the shape and they are now NOT then dump them after it
      if (player.x >= geo.x + geo.width) {
        if (geo.x + geo.width >= newPlayerX) {
          newPlayerX = geo.x + geo.width;
          player.dx = 0;
        }
      }
    }
  }

  player.x = newPlayerX;
  player.y = newPlayerY;

  ////
  ////
  ////

  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
    player.dx = 0;
  }

  if (player.x < 0) {
    player.x = 0;
    player.dx = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGeometry();
  drawPlayer();

  handleKeyPresses();
  handleDeceleration();
  handleMovement();

  requestAnimationFrame(draw);
}

draw();
