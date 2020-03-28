import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import { levels } from "./levels";
import { inputHandlers } from "./inputHandlers";
import {
  handleDecelerationAndGravity,
  handleDirectionChange,
  handleVelocity,
} from "./speed";
import { handleMovementAndCollisions } from "./movement";

// Setup
let canvas = document.getElementById("blockie") as HTMLCanvasElement;
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;

let ctx = canvas.getContext("2d");

// General game state
let level = 1;
let currentLevel = levels[level];
let { geometry, enemies, player } = currentLevel;

let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let time = Date.now();

// canvas.addEventListener("click", () => (player.canDie = !player.canDie), false);

inputHandlers({
  onRightDown: () => (rightPressed = true),
  onLeftDown: () => (leftPressed = true),
  onUpDown: () => (upPressed = true),
  onRightUp: () => (rightPressed = false),
  onLeftUp: () => (leftPressed = false),
  onUpUp: () => (upPressed = false),
});

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

export function frame() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // random mob spawner for lols
  if (enemies.length < 6 && Date.now() - time >= 3000) {
    time = Date.now();
    enemies.push({ ...enemies[0], x: 320 });
  }

  for (const geo of geometry) {
    drawRect(geo);
  }

  for (const enemy of enemies) {
    drawRect(enemy);
  }

  drawRect(player);

  if (player.isKill) {
    drawGameOver();
  } else if (player.isWin) {
    drawWin();
  } else {
    for (const enemy of enemies) {
      handleDecelerationAndGravity(enemy, { friction: false });
      handleMovementAndCollisions(enemy, [
        ...geometry,
        ...enemies.filter(e => e !== enemy),
        player,
      ]);
      handleDirectionChange(enemy);
    }

    handleDecelerationAndGravity(player, { friction: true });
    handleVelocity(player, {
      rightPressed,
      leftPressed,
      upPressed,
    });
    handleMovementAndCollisions(player, [...geometry, ...enemies]);
  }

  requestAnimationFrame(frame);
}
