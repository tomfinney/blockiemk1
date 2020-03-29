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
