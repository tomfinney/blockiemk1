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
let arbitraryClickEvents: IArbitraryClickEvent[] = [];

// Input states
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
    for (const clickEvent of arbitraryClickEvents) {
      clickEvent.onClick();
    }
  },
});

function changeScreen(newScreen: IScreen) {
  screen = newScreen;

  clickables = [];
  arbitraryClickEvents = [];
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

type IArbitraryClickEvent = {
  key: string;
  onClick: () => void;
};

function addOrUpdateClickable(clickable: IClickable) {
  let index = clickables.findIndex(c => c.key === clickable.key);

  if (index < 0) {
    clickables.push(clickable);
  } else {
    clickables[index] = clickable;
  }
}

function addOrUpdateArbitraryClickEvent(clickEvent: IArbitraryClickEvent) {
  let index = arbitraryClickEvents.findIndex(c => c.key === clickEvent.key);

  if (index < 0) {
    arbitraryClickEvents.push(clickEvent);
  } else {
    arbitraryClickEvents[index] = clickEvent;
  }
}

function removeArbitraryClickEvent(key: string) {
  let index = arbitraryClickEvents.findIndex(c => c.key === key);

  if (index > -1) {
    arbitraryClickEvents.splice(index, 1);
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

//////////////
//////////////
//////////////

let dragging = false;
let editorPlaying = false;
let editorPlacing: "player" | "block" | "lava" | "win" | "enemy" | null = null;
let editorPlayerPlaced = false;

let editorGeometry = [];

let newGeo = {
  color: THEME.colors.primary,
};

let baseEditorCharacter = {
  width: 12,
  height: 12,
  x: 326,
  y: 18 + 12,
  dx: 0,
  dy: 0,

  hitTop: false,
  hitBottom: false,
  hitLeft: false,
  hitRight: false,
};

let editorPlayer = {
  ...baseEditorCharacter,
  color: THEME.colors.good,
  isJumping: false,
  player: true,
};

let clonedEditorPlayer = { ...editorPlayer };

let editorEnemies = [];
let clonedEditorEnemies = [];

let editorEnemy = {
  ...baseEditorCharacter,
  color: THEME.colors.bad,
  dx: 1,
};

function setEditorClones() {
  clonedEditorPlayer = { ...editorPlayer };
  clonedEditorEnemies = editorEnemies.map(enemy => ({ ...enemy }));
}

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

  if (
    editorPlacing === "block" ||
    editorPlacing === "lava" ||
    editorPlacing === "win"
  ) {
    let width = Math.round(Math.abs(xEnd - x) / 12) * 12;
    let height = Math.round(Math.abs(yEnd - y) / 12) * 12;

    newGeo.x = x;
    newGeo.y = y;
    newGeo.width = width;
    newGeo.height = height;

    if (editorPlacing === "lava") {
      newGeo.color = THEME.colors.bad;
      newGeo.kill = true;
      newGeo.win = false;
    } else if (editorPlacing === "win") {
      newGeo.color = THEME.colors.gold;
      newGeo.win = true;
      newGeo.kill = false;
    } else {
      newGeo.color = THEME.colors.primary;
      newGeo.win = false;
      newGeo.kill = false;
    }

    if (!mouseDown && dragging) {
      dragging = false;

      editorGeometry.push(newGeo);
      newGeo = {
        color: THEME.colors.primary,
      };
    }
  }

  /////////////
  /////////////

  if (editorPlacing === "player") {
    editorPlayer.x = mouseCoords.xCurrent - (mouseCoords.xCurrent % 12);
    editorPlayer.y = mouseCoords.yCurrent - (mouseCoords.yCurrent % 12);

    drawRect(ctx, editorPlayer);

    addOrUpdateArbitraryClickEvent({
      key: "setEditorPlayerCoords",
      onClick: () => {
        removeArbitraryClickEvent("setEditorPlayerCoords");
        editorPlayerPlaced = true;
        editorPlacing = null;
      },
    });
  }

  if (editorPlacing === "player") {
    editorPlayer.x = mouseCoords.xCurrent - (mouseCoords.xCurrent % 12);
    editorPlayer.y = mouseCoords.yCurrent - (mouseCoords.yCurrent % 12);

    drawRect(ctx, editorPlayer);

    addOrUpdateArbitraryClickEvent({
      key: "setEditorPlayerCoords",
      onClick: () => {
        removeArbitraryClickEvent("setEditorPlayerCoords");
        editorPlayerPlaced = true;
        editorPlacing = null;
        setEditorClones();
      },
    });
  }

  if (editorPlacing === "enemy") {
    editorEnemy.x = mouseCoords.xCurrent - (mouseCoords.xCurrent % 12);
    editorEnemy.y = mouseCoords.yCurrent - (mouseCoords.yCurrent % 12);

    drawRect(ctx, editorEnemy);

    addOrUpdateArbitraryClickEvent({
      key: "setEditorEnemyCoords",
      onClick: () => {
        removeArbitraryClickEvent("setEditorEnemyCoords");
        editorPlacing = null;
        editorEnemies.push({ ...editorEnemy });
        setEditorClones();
      },
    });
  }

  /////////////
  /////////////

  if (newGeo.x || newGeo.y || newGeo.height || newGeo.width) {
    drawRect(ctx, newGeo);
  }

  for (const geo of editorGeometry) {
    drawRect(ctx, geo);
  }

  if (!editorPlaying) {
    for (const enemy of editorEnemies) {
      drawRect(ctx, enemy);
    }

    if (editorPlayerPlaced) {
      drawRect(ctx, editorPlayer);
    }
  }

  /////////////
  /////////////

  if (editorPlaying) {
    for (const enemy of clonedEditorEnemies) {
      drawRect(ctx, enemy);
      handleDecelerationAndGravity(enemy, { friction: false });
      handleMovementAndCollisions(enemy, [
        ...editorGeometry,
        ...clonedEditorEnemies.filter(e => e !== enemy),
        clonedEditorPlayer,
      ]);
      handleDirectionChange(enemy);
    }

    drawRect(ctx, clonedEditorPlayer);
    handleDecelerationAndGravity(clonedEditorPlayer, { friction: true });
    handleVelocity(clonedEditorPlayer, {
      rightPressed,
      leftPressed,
      upPressed,
    });
    handleMovementAndCollisions(clonedEditorPlayer, [
      ...editorGeometry,
      ...clonedEditorEnemies,
    ]);
  }

  /////////////
  /////////////

  drawClickable({
    key: "mainMenu",
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
      editorEnemies = [];
      editorPlaying = false;

      setEditorClones();
    },
  });
  drawClickable({
    key: "editorPlay",
    y: 12,
    x: 96,
    textSize: 12,
    text: "play level",
    buttonColor: editorPlaying ? THEME.colors.primaryDark : undefined,
    onClick: () => {
      setEditorClones();
      editorPlaying = !editorPlaying;
    },
  });
  drawClickable({
    key: "editorPlacePlayer",
    y: 12,
    x: 192,
    textSize: 12,
    text: "set player",
    buttonColor:
      editorPlacing === "player" ? THEME.colors.primaryDark : undefined,
    onClick: () => {
      editorPlacing = "player";
      editorPlaying = false;
      editorPlayerPlaced = false;
    },
  });
  drawClickable({
    key: "editorPlaceBlock",
    y: 12,
    x: 282,
    textSize: 12,
    text: "place block",
    buttonColor:
      editorPlacing === "block" ? THEME.colors.primaryDark : undefined,
    onClick: () => {
      editorPlacing = "block";
      editorPlaying = false;
    },
  });
  drawClickable({
    key: "editorPlaceLava",
    y: 12,
    x: 384,
    textSize: 12,
    text: "place lava",
    buttonColor:
      editorPlacing === "lava" ? THEME.colors.primaryDark : undefined,
    onClick: () => {
      editorPlacing = "lava";
    },
  });
  drawClickable({
    key: "editorPlaceWin",
    y: 12,
    x: 480,
    textSize: 12,
    text: "place win",
    buttonColor: editorPlacing === "win" ? THEME.colors.primaryDark : undefined,
    onClick: () => {
      editorPlacing = "win";
    },
  });
  drawClickable({
    key: "editorPlaceEnemy",
    y: 39,
    x: 282,
    textSize: 12,
    text: "place enemy",
    buttonColor:
      editorPlacing === "enemy" ? THEME.colors.primaryDark : undefined,
    onClick: () => {
      editorPlacing = "enemy";
    },
  });
}

//////////////
//////////////
//////////////

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
    key: "mainMenu",
    y: 12,
    x: 12,
    textSize: 12,
    text: "x",
    onClick: () => {
      changeScreen("mainMenu");
    },
  });
}
