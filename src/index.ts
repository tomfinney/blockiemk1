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
type IScreen = "mainMenu" | "game" | "editor";
let screen: IScreen = "mainMenu";
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

  checkMouseOverClickables();

  if (mouseOverClickableKey) {
    canvas.style.cursor = "pointer";
  } else {
    canvas.style.cursor = "default";
  }

  requestAnimationFrame(init);
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

  let startGameBtnKey = "startGameBtn";

  let startButtonBounds = drawButton(ctx, {
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
    key: startGameBtnKey,
    x: startButtonBounds.x,
    y: startButtonBounds.y,
    width: startButtonBounds.width,
    height: startButtonBounds.height,
    onClick: () => {
      changeScreen("game");
    },
  });

  let editorBtnKey = "editorBtn";

  let editorButtonBounds = drawButton(ctx, {
    y: 180,
    x: 0,
    textSize: 16,
    textColor: THEME.colors.white,
    buttonColor:
      mouseOverClickableKey === editorBtnKey
        ? THEME.colors.primaryLight
        : THEME.colors.primary,
    text: "level editor",
    centeredX: true,
  });

  addOrUpdateClickable({
    key: editorBtnKey,
    x: editorButtonBounds.x,
    y: editorButtonBounds.y,
    width: editorButtonBounds.width,
    height: editorButtonBounds.height,
    onClick: () => {
      changeScreen("editor");
    },
  });
}

function editorFrame() {
  drawText(ctx, {
    y: 48,
    x: 48,
    size: 24,
    color: THEME.colors.primary,
    text: "this isn't done :/",
  });

  let mainMenuBtnKey = "mainMenuBtn";

  let mainMenuButtonBounds = drawButton(ctx, {
    y: 144,
    x: 48,
    textSize: 16,
    textColor: THEME.colors.white,
    buttonColor:
      mouseOverClickableKey === mainMenuBtnKey
        ? THEME.colors.primaryLight
        : THEME.colors.primary,
    text: "take me back pls",
  });

  addOrUpdateClickable({
    key: mainMenuBtnKey,
    x: mainMenuButtonBounds.x,
    y: mainMenuButtonBounds.y,
    width: mainMenuButtonBounds.width,
    height: mainMenuButtonBounds.height,
    onClick: () => {
      changeScreen("mainMenu");
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
