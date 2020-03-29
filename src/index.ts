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

// General state
type IScreen = "mainMenu" | "game" | "editor";
let screen: IScreen = "mainMenu";
let time = Date.now();

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

function changeScreen(newScreen: IScreen) {
  screen = newScreen;

  clickables = [];
  mouseOverClickableKey = "";
}

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

  checkMouseOverClickables();

  if (mouseOverClickableKey) {
    canvas.style.cursor = "pointer";
  } else {
    canvas.style.cursor = "default";
  }

  let frame;

  if (screen === "mainMenu") {
    frame = mainMenuFrame;
  }

  if (screen === "game") {
    frame = gameFrame;
  }

  if (screen === "editor") {
    frame = editorFrame;
  }

  frame();

  requestAnimationFrame(init);
}

function drawClickable({
  key,
  x,
  y,
  textSize = 16,
  textColor = THEME.colors.white,
  buttonColor = THEME.colors.primary,
  buttonColorActive = THEME.colors.primaryLight,
  text,
  centeredX = false,
  onClick,
}) {
  let bounds = drawButton(ctx, {
    y,
    x,
    textSize,
    textColor,
    buttonColor:
      mouseOverClickableKey === key ? buttonColorActive : buttonColor,
    text,
    centeredX,
  });

  addOrUpdateClickable({
    key,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    onClick,
  });
}

function mainMenuFrame() {
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

  drawClickable({
    key: "startGameBtn",
    y: 144,
    x: 0,
    text: "play",
    centeredX: true,
    onClick: () => {
      changeScreen("game");
    },
  });
  drawClickable({
    key: "editorBtn",
    y: 180,
    x: 0,
    text: "level editor",
    centeredX: true,
    onClick: () => {
      changeScreen("editor");
    },
  });
}

let editorGeometry = [];
let dragging = false;
let newGeo = {
  color: THEME.colors.primary,
};
let editorPlayer = {
  width: 12,
  height: 18,
  x: 326,
  y: 18 + 12,
  dx: 0,
  dy: 0,
  color: "#8eff81",
  isJumping: false,

  hitTop: false,
  hitBottom: false,
  hitLeft: false,
  hitRight: false,

  player: true,
};

let clonedEditorPlayer = { ...editorPlayer };

let editorPlaying = false;

function editorFrame() {
  if (mouseDown) {
    dragging = true;
  }

  let x = mouseCoords.xStart;
  let y = mouseCoords.yStart;
  let xEnd = mouseCoords.xEnd;
  let yEnd = mouseCoords.yEnd;

  if (dragging) {
    xEnd = mouseCoords.xCurrent;
    yEnd = mouseCoords.yCurrent;
  }

  let tempX;
  let tempY;

  if (x > xEnd) {
    tempX = x;
    x = xEnd;
    xEnd = tempX;
  }

  if (y > yEnd) {
    tempY = y;
    y = yEnd;
    yEnd = tempY;
  }

  x = xEnd > x ? x : xEnd;
  y = yEnd > y ? y : yEnd;

  x = x - (x % 12);
  y = y - (y % 12);

  let width = Math.round(Math.abs(xEnd - x) / 12) * 12;
  let height = Math.round(Math.abs(yEnd - y) / 12) * 12;

  newGeo.x = x;
  newGeo.y = y;
  newGeo.width = width;
  newGeo.height = height;

  if (!mouseDown && dragging) {
    dragging = false;

    editorGeometry.push(newGeo);
    newGeo = {
      color: THEME.colors.primary,
    };
  }

  for (const geo of editorGeometry) {
    drawRect(ctx, geo);
  }

  if (newGeo.x || newGeo.y || newGeo.height || newGeo.width) {
    drawRect(ctx, newGeo);
  }

  if (editorPlaying) {
    drawRect(ctx, clonedEditorPlayer);
    handleDecelerationAndGravity(clonedEditorPlayer, { friction: true });
    handleVelocity(clonedEditorPlayer, {
      rightPressed,
      leftPressed,
      upPressed,
    });
    handleMovementAndCollisions(clonedEditorPlayer, editorGeometry);
  }

  /////////////
  /////////////
  /////////////
  drawClickable({
    key: "mainMenuBtn",
    y: 12,
    x: 12,
    textSize: 12,
    text: "x",
    onClick: () => {
      changeScreen("mainMenu");
    },
  });
  drawClickable({
    key: "clearEditor",
    y: 12,
    x: 42,
    textSize: 12,
    text: "clear",
    onClick: () => {
      editorGeometry = [];
      newGeo = {};
    },
  });
  drawClickable({
    key: "spawnPlayer",
    y: 12,
    x: 96,
    textSize: 12,
    text: "spawn blockie",
    onClick: () => {
      editorPlaying = true;
      clonedEditorPlayer = { ...editorPlayer };
    },
  });
}

// Game playing state
let level = 1;
let currentLevel = levels[level];
let { geometry, enemies, player } = currentLevel;

let clonedPlayer = { ...player };
let clonedEnemies = [...enemies];

function gameFrame() {
  // random mob spawner for lols
  if (clonedEnemies.length < 6 && Date.now() - time >= 3000) {
    time = Date.now();
    clonedEnemies.push({ ...clonedEnemies[0], x: 320 });
  }

  for (const geo of geometry) {
    drawRect(ctx, geo);
  }

  for (const enemy of clonedEnemies) {
    drawRect(ctx, enemy);
  }

  drawRect(ctx, clonedPlayer);

  if (clonedPlayer.isKill) {
    drawText(ctx, {
      x: 12,
      y: 72,
      color: THEME.colors.bad,
      text: "you have died :(",
    });
    drawClickable({
      key: "restartBtn",
      y: 108,
      x: 12,
      textSize: 12,
      text: "retry?",
      onClick: () => {
        clickables = [];
        clonedPlayer = { ...player };
        clonedEnemies = [...enemies];
      },
    });
  } else if (clonedPlayer.isWin) {
    drawText(ctx, {
      x: 12,
      y: 72,
      color: THEME.colors.gold,
      text: "you have won!!! :)",
    });
    drawClickable({
      key: "restartBtn",
      y: 108,
      x: 12,
      textSize: 12,
      text: "replay?",
      onClick: () => {
        clickables = [];
        clonedPlayer = { ...player };
        clonedEnemies = [...enemies];
      },
    });
  } else {
    for (const enemy of clonedEnemies) {
      handleDecelerationAndGravity(enemy, { friction: false });
      handleMovementAndCollisions(enemy, [
        ...geometry,
        ...clonedEnemies.filter(e => e !== enemy),
        clonedPlayer,
      ]);
      handleDirectionChange(enemy);
    }

    handleDecelerationAndGravity(clonedPlayer, { friction: true });
    handleVelocity(clonedPlayer, {
      rightPressed,
      leftPressed,
      upPressed,
    });
    handleMovementAndCollisions(clonedPlayer, [...geometry, ...clonedEnemies]);
  }

  /////////////
  /////////////
  /////////////

  drawClickable({
    key: "mainMenuBtn",
    y: 12,
    x: 12,
    textSize: 12,
    text: "x",
    onClick: () => {
      changeScreen("mainMenu");
    },
  });
}
