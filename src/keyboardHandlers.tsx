type IKeyboardHandlersOptions = {
  onRightDown: () => void;
  onLeftDown: () => void;
  onUpDown: () => void;
  onRightUp: () => void;
  onLeftUp: () => void;
  onUpUp: () => void;
};

export function keyboardHandlers({
  onRightDown,
  onLeftDown,
  onUpDown,
  onRightUp,
  onLeftUp,
  onUpUp,
}: IKeyboardHandlersOptions) {
  function handleKeyDown(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
      onRightDown();
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
      onLeftDown();
    }
    if (e.key == "Up" || e.key == "ArrowUp") {
      onUpDown();
    }
  }

  function handleKeyUp(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
      onRightUp();
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
      onLeftUp();
    }
    if (e.key == "Up" || e.key == "ArrowUp") {
      onUpUp();
    }
  }

  document.addEventListener("keydown", handleKeyDown, false);
  document.addEventListener("keyup", handleKeyUp, false);
}
