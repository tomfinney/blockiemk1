import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";

export const levels = { 1: level1() };

function level1() {
  return {
    geometry: [
      {
        width: CANVAS_WIDTH,
        height: 12,
        x: 0,
        y: CANVAS_HEIGHT - 12,
        color: "#0095DD",
      },
      {
        width: 12,
        height: 12,
        x: 64,
        y: CANVAS_HEIGHT - 12 - 12,
        color: "#0095DD",
      },
      {
        width: 12,
        height: 12,
        x: 112,
        y: CANVAS_HEIGHT - 30 - 12,
        color: "#0095DD",
      },
      {
        width: 12,
        height: 12,
        x: 160,
        y: CANVAS_HEIGHT - 42 - 12,
        color: "#0095DD",
      },
      {
        width: 12,
        height: 12,
        x: 204,
        y: CANVAS_HEIGHT - 54 - 12,
        color: "#0095DD",
      },
      {
        width: 48,
        height: 12,
        x: 252,
        y: CANVAS_HEIGHT - 54 - 12,
        color: "#0095DD",
      },
      {
        width: 48,
        height: 12,
        x: 342,
        y: CANVAS_HEIGHT - 54 - 12,
        color: "#0095DD",
      },
      {
        width: 12,
        height: 54,
        x: 432,
        y: CANVAS_HEIGHT - 54 - 12,
        color: "#0095DD",
      },
      {
        width: 12,
        height: 54,
        x: 514,
        y: CANVAS_HEIGHT - 54 - 12,
        color: "#0095DD",
      },
      {
        width: 70,
        height: 24,
        x: 444,
        y: CANVAS_HEIGHT - 24 - 12,
        color: "#dd4900",
        kill: true,
      },
      {
        width: 12,
        height: 12,
        x: 577,
        y: CANVAS_HEIGHT - 30 - 12,
        color: "#ddcd00",
        win: true,
      },
    ],

    player: {
      width: 12,
      height: 18,
      x: 12,
      y: CANVAS_HEIGHT - 18 - 12,
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
    },
    enemies: [
      {
        width: 12,
        height: 18,
        x: 320,
        y: CANVAS_HEIGHT - 18 - 12,
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
      },
    ],
  };
}
