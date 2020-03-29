type IMouseHandlersOptions = {
  onMouseDown: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseUp: (e: MouseEvent) => void;
  onMouseClick: (e: MouseEvent) => void;
};

export function mouseHandlers(
  canvas: HTMLCanvasElement,
  { onMouseDown, onMouseMove, onMouseUp, onMouseClick }: IMouseHandlersOptions
) {
  function handleMouseDown(e) {
    onMouseDown(e);
  }

  function handleMouseMove(e) {
    onMouseMove(e);
  }

  function handleMouseUp(e) {
    onMouseUp(e);
  }

  function handleMouseClick(e) {
    onMouseClick(e);
  }

  canvas.addEventListener("mousedown", handleMouseDown, false);
  canvas.addEventListener("mouseup", handleMouseUp, false);
  canvas.addEventListener("mousemove", handleMouseMove, false);
  canvas.addEventListener("click", handleMouseClick, false);
}

// mouseCoords.xEnd = e.x;
// mouseCoords.yEnd = e.y;

// let x =
//   mouseCoords.xEnd > mouseCoords.xStart ? mouseCoords.xStart : mouseCoords.xEnd;

// let y =
//   mouseCoords.yEnd > mouseCoords.yStart ? mouseCoords.yStart : mouseCoords.yEnd;

// x = x - (x % 12);
// y = y - (y % 12);

// let width =
//   Math.round(Math.abs(mouseCoords.xEnd - mouseCoords.xStart) / 12) * 12;
// let height =
//   Math.round(Math.abs(mouseCoords.yEnd - mouseCoords.yStart) / 12) * 12;

// tempShapes = [
//   {
//     x,
//     y,
//     width,
//     height,
//     color: THEME.colors.primary,
//   },
// ];

// shapes = [...shapes, ...tempShapes];
// tempShapes = [];
