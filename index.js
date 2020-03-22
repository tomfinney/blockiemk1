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
    key: "leftBlock",
    width: 12,
    height: 32,
    x: 350,
    y: canvas.height - 32 - ground.height,
    color: "#0095DD"
  },
  {
    key: "rightBlock",
    width: 12,
    height: 32,
    x: 0,
    y: canvas.height - 32 - ground.height,
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
  player.y += player.dy;

  let playerTop = player.y;
  let playerBottom = player.y + player.height;
  let playerLeft = player.x;
  let playerRight = player.x + player.width;

  for (const geo of geometry) {
    let geoTop = geo.y;
    let geoBottom = geo.y + geo.height;
    let geoLeft = geo.x;
    let geoRight = geo.x + geo.width;

    function playerIsInGeoLeft() {
      return playerRight >= geoLeft && playerRight <= geoLeft + geo.width / 2;
    }
    function playerIsInGeoRight() {
      return geoRight >= playerLeft && playerLeft >= geoRight - geo.width / 2;
    }
    function playerIsInGeoTop() {
      return playerBottom >= geoTop && playerBottom <= geoTop + geo.height / 2;
    }
    function playerIsInGeoBottom() {
      return geoBottom >= playerTop && geoBottom - geo.height / 2 >= playerTop;
    }
    function playerIsAboveGeo() {
      return geoTop >= playerBottom;
    }
    function playerIsBelowGeo() {
      return playerTop >= geoBottom;
    }
    function playerIsLeftOfGeo() {
      return geoLeft >= playerRight;
    }
    function playerIsRightOfGeo() {
      return playerLeft >= geoRight;
    }

    console.log({
      key: geo.key,
      playerIsInGeoLeft,
      playerIsInGeoRight,
      playerIsAboveGeo,
      playerIsBelowGeo
    });

    if (
      playerIsInGeoLeft() &&
      !playerIsAboveGeo() &&
      !playerIsBelowGeo() &&
      !playerIsInGeoTop() &&
      !playerIsInGeoBottom()
    ) {
      player.x = geoLeft - player.width;
      player.dx = 0;
    }

    if (
      playerIsInGeoRight() &&
      !playerIsAboveGeo() &&
      !playerIsBelowGeo() &&
      !playerIsInGeoTop() &&
      !playerIsInGeoBottom()
    ) {
      player.x = geoRight;
      player.dx = 0;
    }

    if (playerIsInGeoTop() && !playerIsLeftOfGeo() && !playerIsRightOfGeo()) {
      player.y = geoTop - player.height;
      player.dy = 0;
    }
  }

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
