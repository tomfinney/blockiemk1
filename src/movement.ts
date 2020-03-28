import { CANVAS_WIDTH } from "./constants";

function checkCollisionConditions(character, geo) {
  if (!character.player) {
    return;
  }

  if (geo.kill && character.canDie) {
    character.isKill = true;
  }

  if (geo.win) {
    character.isWin = true;
  }
}

export function handleMovementAndCollisions(character, geometry) {
  let newCharacterX = character.x + character.dx;
  let newCharacterY = character.y + character.dy;

  character.hitTop = false;
  character.hitBottom = false;
  character.hitLeft = false;
  character.hitRight = false;

  for (const geo of geometry) {
    let characterIsAboveGeo = geo.y >= newCharacterY + character.height;

    let characterIsBelowGeo = newCharacterY >= geo.y + geo.height;

    let characterIsLeftOfGeo = geo.x >= newCharacterX + character.width;

    let characterIsRightOfGeo = newCharacterX >= geo.x + geo.width;

    // 1. if the character is NOT before or after the shape, check vert collision
    if (!characterIsLeftOfGeo && !characterIsRightOfGeo) {
      // 1a. if the character WAS above the shape and they are now NOT then dump them on top of it
      if (geo.y >= character.y + character.height) {
        if (newCharacterY + character.height >= geo.y) {
          checkCollisionConditions(character, geo);

          newCharacterY = geo.y - character.height;

          character.dy = 0;
          character.hitTop = true;

          // assume they have landed here so set jumping to false
          character.isJumping = false;
        }
      }
      // 1b. if the character WAS below the shape and they are now NOT then dump them on below it
      if (character.y >= geo.y + geo.height) {
        if (geo.y + geo.height >= newCharacterY) {
          checkCollisionConditions(character, geo);

          newCharacterY = geo.y + geo.height;

          character.dy = 0;
          character.hitBottom = true;
        }
      }
    }

    // 2. if the character is NOT above or below the shape, check horiz collision
    if (!characterIsAboveGeo && !characterIsBelowGeo) {
      // 2a. if the character WAS before the shape and they are now NOT then dump them before it
      if (geo.x >= character.x + character.width) {
        if (newCharacterX + character.width >= geo.x) {
          checkCollisionConditions(character, geo);

          newCharacterX = geo.x - character.width;

          character.dx = 0;
          character.hitRight = true;
        }
      }
      // 2b. if the character WAS after the shape and they are now NOT then dump them after it
      if (character.x >= geo.x + geo.width) {
        if (geo.x + geo.width >= newCharacterX) {
          checkCollisionConditions(character, geo);

          newCharacterX = geo.x + geo.width;

          character.dx = 0;
          character.hitLeft = true;
        }
      }
    }
  }

  character.x = newCharacterX;
  character.y = newCharacterY;

  ////
  //// Horizontal bounds checking
  ////

  if (character.x + character.width > CANVAS_WIDTH) {
    character.x = CANVAS_WIDTH - character.width;
    character.dx = 0;
  }

  if (character.x < 0) {
    character.x = 0;
    character.dx = 0;
  }
}
