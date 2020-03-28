export function handleVelocity(
  character,
  { rightPressed, leftPressed, upPressed }
) {
  if (rightPressed) {
    character.dx = 4;
  } else if (leftPressed) {
    character.dx = -4;
  }
  if (upPressed && !character.isJumping) {
    character.isJumping = true;
    character.dy = -10;
  }
}

export function handleDecelerationAndGravity(character, { friction }) {
  if (friction) {
    if (character.dx > 0) {
      character.dx -= 1;
    } else if (character.dx < 0) {
      character.dx += 1;
    }
  }
  // just always try to increase gravity until it's 8p/s
  if (character.dy <= 8) {
    character.dy += 1;
  }
}

export function handleDirectionChange(character) {
  if (character.dx !== 0) {
    return;
  }
  if (character.hitRight) {
    character.dx = -1;
  } else if (character.hitLeft) {
    character.dx = 1;
  }
}
