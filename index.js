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
  //
  hitTop: false,
  hitBottom: false,
  hitLeft: false,
  hitRight: false,
  // win conditions
  isKill: false,
  isWin: false,

  //
  player: true,
  canDie: true,
};

canvas.addEventListener("click", () => (player.canDie = !player.canDie), false);

let baddie = {
  width: 12,
  height: 18,
  x: 320,
  y: canvas.height - 18 - 12,
  dx: 1,
  dy: 0,
  color: "#dd4900",
  isJumping: false,
  //
  hitTop: false,
  hitBottom: false,
  hitLeft: false,
  hitRight: false,
  //
  player: false,
  kill: true,
};

function drawRect({ x, y, width, height, color }) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fillStyle = color;
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

function drawDebug() {
  ctx.font = "12px Courier";
  ctx.fillStyle = "#333";
  ctx.fillText(
    player.canDie ? "blockie can die" : "blockie cannot die!",
    12,
    60
  );
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

function handleSpeed() {
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

function handleDirection(character) {
  if (character.dx !== 0) {
    return;
  }
  if (character.hitRight) {
    character.dx = -1;
  } else if (character.hitLeft) {
    character.dx = 1;
  }
}

function checkCollisionConditions(character, geo) {
  if (!character.player) {
    return;
  }

  if (geo.kill && character.canDie) {
    character.isKill = true;
  }

  if (geo.win) {
    character.isWin = true;
  }
}

function handleMovement(character) {
  let newCharacterX = character.x + character.dx;
  let newCharacterY = character.y + character.dy;

  character.hitTop = false;
  character.hitBottom = false;
  character.hitLeft = false;
  character.hitRight = false;

  let listOfGeometry = [...geometry];

  if (character.player) {
    listOfGeometry.push(baddie);
  } else {
    listOfGeometry.push(player);
  }

  for (const geo of listOfGeometry) {
    let characterIsAboveGeo = geo.y >= newCharacterY + character.height;

    let characterIsBelowGeo = newCharacterY >= geo.y + geo.height;

    let characterIsLeftOfGeo = geo.x >= newCharacterX + character.width;

    let characterIsRightOfGeo = newCharacterX >= geo.x + geo.width;

    // 1. if the character is NOT before or after the shape, check vert collision
    if (!characterIsLeftOfGeo && !characterIsRightOfGeo) {
      // 1a. if the character WAS above the shape and they are now NOT then dump them on top of it
      if (geo.y >= character.y + character.height) {
        if (newCharacterY + character.height >= geo.y) {
          checkCollisionConditions(character, geo);

          newCharacterY = geo.y - character.height;

          character.dy = 0;
          character.hitTop = true;

          // assume they have landed here so set jumping to false
          character.isJumping = false;
        }
      }
      // 1b. if the character WAS below the shape and they are now NOT then dump them on below it
      if (character.y >= geo.y + geo.height) {
        if (geo.y + geo.height >= newCharacterY) {
          checkCollisionConditions(character, geo);

          newCharacterY = geo.y + geo.height;

          character.dy = 0;
          character.hitBottom = true;
        }
      }
    }

    // 2. if the character is NOT above or below the shape, check horiz collision
    if (!characterIsAboveGeo && !characterIsBelowGeo) {
      // 2a. if the character WAS before the shape and they are now NOT then dump them before it
      if (geo.x >= character.x + character.width) {
        if (newCharacterX + character.width >= geo.x) {
          checkCollisionConditions(character, geo);

          newCharacterX = geo.x - character.width;

          character.dx = 0;
          character.hitRight = true;
        }
      }
      // 2b. if the character WAS after the shape and they are now NOT then dump them after it
      if (character.x >= geo.x + geo.width) {
        if (geo.x + geo.width >= newCharacterX) {
          checkCollisionConditions(character, geo);

          newCharacterX = geo.x + geo.width;

          character.dx = 0;
          character.hitLeft = true;
        }
      }
    }
  }

  character.x = newCharacterX;
  character.y = newCharacterY;

  ////
  ////
  ////

  if (character.x + character.width > canvas.width) {
    character.x = canvas.width - character.width;
    character.dx = 0;
  }

  if (character.x < 0) {
    character.x = 0;
    character.dx = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const geo of geometry) {
    drawRect(geo);
  }

  drawRect(baddie);
  drawRect(player);

  if (player.isKill) {
    drawGameOver();
  } else if (player.isWin) {
    drawWin();
  } else {
    // player
    handleKeyPresses();
    handleDeceleration();
    handleMovement(player);

    // baddie
    handleMovement(baddie);
    handleDirection(baddie);
  }

  drawDebug();

  requestAnimationFrame(draw);
}

draw();
