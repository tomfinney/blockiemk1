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

let geometry = [
  {
    width: canvas.width,
    height: 12,
    x: 0,
    y: canvas.height - 12,
    color: "#0095DD",
  },
  {
    width: 12,
    height: 12,
    x: 64,
    y: canvas.height - 12 - 12,
    color: "#0095DD",
  },
  {
    width: 12,
    height: 12,
    x: 112,
    y: canvas.height - 30 - 12,
    color: "#0095DD",
  },
  {
    width: 12,
    height: 12,
    x: 160,
    y: canvas.height - 42 - 12,
    color: "#0095DD",
  },
  {
    width: 12,
    height: 12,
    x: 204,
    y: canvas.height - 54 - 12,
    color: "#0095DD",
  },
  {
    width: 48,
    height: 12,
    x: 252,
    y: canvas.height - 54 - 12,
    color: "#0095DD",
  },
  {
    width: 48,
    height: 12,
    x: 342,
    y: canvas.height - 54 - 12,
    color: "#0095DD",
  },
  {
    width: 12,
    height: 54,
    x: 432,
    y: canvas.height - 54 - 12,
    color: "#0095DD",
  },
  {
    width: 12,
    height: 54,
    x: 514,
    y: canvas.height - 54 - 12,
    color: "#0095DD",
  },
  {
    width: 70,
    height: 24,
    x: 444,
    y: canvas.height - 24 - 12,
    color: "#dd4900",
    kill: true,
  },
  {
    width: 12,
    height: 12,
    x: 577,
    y: canvas.height - 30 - 12,
    color: "#ddcd00",
    win: true,
  },
];

let player = {
  width: 12,
  height: 18,
  x: 12,
  y: canvas.height - 18 - 12,
  dx: 0,
  dy: 0,
  color: "#8eff81",
  isJumping: false,
  isKill: false,
  isWin: false,
};

function drawRect({ x, y, width, height, color }) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawPlayer() {
  ctx.beginPath();
  ctx.rect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.closePath();
}

function drawGameOver() {
  ctx.font = "24px Courier";
  ctx.fillStyle = "#dd4900";
  ctx.fillText("blockie has died :(", 12, 24);
}

function drawWin() {
  ctx.font = "24px Courier";
  ctx.fillStyle = "#ddcd00";
  ctx.fillText("blockie has won :)", 12, 24);
}

function handleKeyPresses() {
  if (rightPressed) {
    player.dx = 4;
  } else if (leftPressed) {
    player.dx = -4;
  }
  if (upPressed && !player.isJumping) {
    player.isJumping = true;
    player.dy = -10;
  }
}

function handleDeceleration() {
  if (player.dx > 0) {
    player.dx -= 1;
  } else if (player.dx < 0) {
    player.dx += 1;
  }

  // just always try to increase gravity until it's 8p/s
  if (player.dy <= 8) {
    player.dy += 1;
  }
}

function handleMovement() {
  let newPlayerX = player.x + player.dx;
  let newPlayerY = player.y + player.dy;

  for (const geo of geometry) {
    let playerIsAboveGeo = geo.y >= player.y + player.height;

    let playerIsBelowGeo = player.y >= geo.y + geo.height;

    let playerIsLeftOfGeo = geo.x >= player.x + player.width;

    let playerIsRightOfGeo = player.x >= geo.x + geo.width;

    // 1. if the player is NOT before or after the shape, check vert collision
    if (!playerIsLeftOfGeo && !playerIsRightOfGeo) {
      // 1a. if the player WAS above the shape and they are now NOT then dump them on top of it
      if (geo.y >= player.y + player.height) {
        if (newPlayerY + player.height >= geo.y) {
          if (geo.kill) {
            player.isKill = true;
          }

          if (geo.win) {
            player.isWin = true;
          }

          newPlayerY = geo.y - player.height;
          player.dy = 0;

          // assume they have landed here so set jumping to false
          player.isJumping = false;
        }
      }
      // 1b. if the player WAS below the shape and they are now NOT then dump them on below it
      if (player.y >= geo.y + geo.height) {
        if (geo.y + geo.height >= newPlayerY) {
          newPlayerY = geo.y + geo.height;
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

  for (const geo of geometry) {
    drawRect(geo);
  }

  drawPlayer();

  if (player.isKill) {
    drawGameOver();
  } else if (player.isWin) {
    drawWin();
  } else {
    handleKeyPresses();
    handleDeceleration();
    handleMovement();
  }

  requestAnimationFrame(draw);
}

draw();
