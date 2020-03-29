import { CANVAS_HEIGHT, CANVAS_WIDTH, THEME } from "./constants";
import { levels } from "./levels";
import { keyboardHandlers } from "./keyboardHandlers";
import {
  handleDecelerationAndGravity,
  handleDirectionChange,
  handleVelocity,
} from "./speed";
import { handleMovementAndCollisions } from "./movement";
import { drawText, drawRect, drawButton } from "./draw";
import { mouseHandlers } from "./mouseHandlers";

// Setup
let canvas = document.getElementById("blockie") as HTMLCanvasElement;
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;

let ctx = canvas.getContext("2d");

// General game state
let screen: "menu" | "game" = "menu";
let time = Date.now();

// Game playing state
let level = 1;
let currentLevel = levels[level];
let { geometry, enemies, player } = currentLevel;
let shapes = [];
let clickables: IClickable[] = [];

// Input state
let rightPressed = false;
let leftPressed = false;
let upPressed = false;

let mouseDown = false;
let mouseCoords = {
  xStart: 0,
  yStart: 0,
  xCurrent: 0,
  yCurrent: 0,
  xEnd: 0,
  yEnd: 0,
};
let mouseOverClickableKey = "";

keyboardHandlers({
  onRightDown: () => (rightPressed = true),
  onLeftDown: () => (leftPressed = true),
  onUpDown: () => (upPressed = true),
  onRightUp: () => (rightPressed = false),
  onLeftUp: () => (leftPressed = false),
  onUpUp: () => (upPressed = false),
});

mouseHandlers(canvas, {
  onMouseDown: e => {
    mouseDown = true;
    mouseCoords.xStart = e.offsetX;
    mouseCoords.yStart = e.offsetY;
  },
  onMouseUp: e => {
    mouseDown = false;
    mouseCoords.xEnd = e.offsetX;
    mouseCoords.yEnd = e.offsetY;
  },
  onMouseMove: e => {
    mouseCoords.xCurrent = e.offsetX;
    mouseCoords.yCurrent = e.offsetY;
  },
  onMouseClick: e => {
    if (mouseOverClickableKey) {
      let clickable = clickables.find(c => c.key === mouseOverClickableKey);
      clickable.onClick();
    }
  },
});

type IClickable = {
  x: number;
  y: number;
  width: number;
  height: number;
  key: string;
  onClick: () => void;
};

function addOrUpdateClickable(clickable: IClickable) {
  let clickableIndex = clickables.findIndex(c => c.key === clickable.key);

  if (clickableIndex < 0) {
    clickables.push(clickable);
  } else {
    clickables[clickableIndex] = clickable;
  }
}

function checkMouseOverClickables() {
  let newMouseOverClickableKey = "";
  for (let clickable of clickables) {
    let cursorIsInX =
      mouseCoords.xCurrent >= clickable.x &&
      clickable.x + clickable.width >= mouseCoords.xCurrent;
    let cursorIsInY =
      mouseCoords.yCurrent >= clickable.y &&
      clickable.y + clickable.height >= mouseCoords.yCurrent;

    if (cursorIsInX && cursorIsInY) {
      newMouseOverClickableKey = clickable.key;
    }
  }
  mouseOverClickableKey = newMouseOverClickableKey;
}

export function init() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  let frame;
  clickables = [];

  if (screen === "menu") {
    frame = menuFrame;
  }

  if (screen === "game") {
    frame = gameFrame;
  }

  frame();

  checkMouseOverClickables();

  if (mouseOverClickableKey) {
    canvas.style.cursor = "pointer";
  } else {
    canvas.style.cursor = "default";
  }

  requestAnimationFrame(init);
}

function menuFrame() {
  drawText(ctx, {
    y: 48,
    x: 0,
    size: 24,
    color: THEME.colors.primary,
    text: "BLOCKIE",
    centeredX: true,
  });
  drawText(ctx, {
    y: 72,
    x: 0,
    size: 16,
    color: THEME.colors.primary,
    text: "the game",
    centeredX: true,
  });

  let startGameBtnKey = "startGameBtn";

  let buttonBounds = drawButton(ctx, {
    y: 144,
    x: 0,
    textSize: 16,
    textColor: THEME.colors.white,
    buttonColor:
      mouseOverClickableKey === startGameBtnKey
        ? THEME.colors.primaryLight
        : THEME.colors.primary,
    text: "play",
    centeredX: true,
  });

  addOrUpdateClickable({
    key: "startGameBtn",
    x: buttonBounds.x,
    y: buttonBounds.y,
    width: buttonBounds.width,
    height: buttonBounds.height,
    onClick: () => {
      screen = "game";
    },
  });
}

function gameFrame() {
  // random mob spawner for lols
  if (enemies.length < 6 && Date.now() - time >= 3000) {
    time = Date.now();
    enemies.push({ ...enemies[0], x: 320 });
  }

  for (const shape of shapes) {
    drawRect(ctx, shape);
  }

  // for (const shape of tempShapes) {
  //   drawRect(ctx, shape);
  // }

  for (const geo of geometry) {
    drawRect(ctx, geo);
  }

  for (const enemy of enemies) {
    drawRect(ctx, enemy);
  }

  drawRect(ctx, player);

  // if (player.isKill) {
  //   drawGameOver();
  // } else if (player.isWin) {
  //   drawWin();
  // } else {
  for (const enemy of enemies) {
    handleDecelerationAndGravity(enemy, { friction: false });
    handleMovementAndCollisions(enemy, [
      ...geometry,
      ...enemies.filter(e => e !== enemy),
      ...shapes,
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
  handleMovementAndCollisions(player, [...geometry, ...enemies, ...shapes]);
  // }
}
