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
        x: 72,
        y: CANVAS_HEIGHT - 12 - 12,
        color: "#0095DD",
      },
      {
        width: 12,
        height: 12,
        x: 108,
        y: CANVAS_HEIGHT - 36 - 12,
        color: "#0095DD",
      },
      {
        width: 12,
        height: 12,
        x: 154,
        y: CANVAS_HEIGHT - 48 - 12,
        color: "#0095DD",
      },
      {
        width: 12,
        height: 12,
        x: 204,
        y: CANVAS_HEIGHT - 60 - 12,
        color: "#0095DD",
      },
      {
        width: 48,
        height: 12,
        x: 252,
        y: CANVAS_HEIGHT - 60 - 12,
        color: "#0095DD",
      },
      {
        width: 48,
        height: 12,
        x: 336,
        y: CANVAS_HEIGHT - 60 - 12,
        color: "#0095DD",
      },
      {
        width: 12,
        height: 60,
        x: 432,
        y: CANVAS_HEIGHT - 60 - 12,
        color: "#0095DD",
      },
      {
        width: 12,
        height: 60,
        x: 516,
        y: CANVAS_HEIGHT - 60 - 12,
        color: "#0095DD",
      },
      {
        width: 72,
        height: 24,
        x: 444,
        y: CANVAS_HEIGHT - 24 - 12,
        color: "#dd4900",
        kill: true,
      },
      {
        width: 12,
        height: 12,
        x: 576,
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
