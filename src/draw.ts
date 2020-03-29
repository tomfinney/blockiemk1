import { CANVAS_WIDTH } from "./constants";

type IDrawRectOptions = {
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function drawRect(
  ctx: CanvasRenderingContext2D,
  { x, y, width, height, color }: IDrawRectOptions
) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();

  return {
    x,
    y,
    width,
    height,
  };
}

type IDrawTextOptions = {
  size?: number;
  color: string;
  text: string;
  centeredX?: boolean;
  x?: number;
  y?: number;
};

export function drawText(
  ctx: CanvasRenderingContext2D,
  { x, y, size = 16, color, text, centeredX }: IDrawTextOptions
) {
  ctx.fillStyle = color;
  ctx.font = `${size}px Courier`;

  if (centeredX) {
    x = CANVAS_WIDTH / 2 - Math.round(ctx.measureText(text).width / 2);
  }

  ctx.fillText(text, x, y);

  return {
    x,
    y,
    metrics: ctx.measureText(text),
  };
}

type IDrawButtonOptions = {
  x: number;
  y: number;
  textSize: number;
  textColor: string;
  text: string;
  buttonColor: string;
  centeredX?: boolean;
};

export function drawButton(
  ctx: CanvasRenderingContext2D,
  {
    x,
    y,
    textSize = 16,
    textColor,
    text,
    buttonColor,
    centeredX,
  }: IDrawButtonOptions
) {
  let padding = 6;

  let textBounds = drawText(ctx, {
    x,
    y,
    size: textSize,
    text,
    color: textColor,
    centeredX,
  });

  let buttonBounds = drawRect(ctx, {
    x:
      textBounds.x +
      Math.round(textBounds.metrics.actualBoundingBoxLeft) -
      padding,
    y:
      textBounds.y -
      (Math.round(textBounds.metrics.actualBoundingBoxAscent) +
        Math.round(textBounds.metrics.actualBoundingBoxDescent)) -
      padding,
    width: textBounds.metrics.width + padding * 2,
    height: textSize + padding * 2,
    color: buttonColor,
  });

  drawText(ctx, {
    x,
    y,
    size: textSize,
    text,
    color: textColor,
    centeredX,
  });

  return buttonBounds;
}
