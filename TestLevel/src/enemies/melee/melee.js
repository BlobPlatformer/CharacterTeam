"use strict";

/* Classes and Libraries */

/* Constants */
const CANVAS_WIDTH = 1120;
const CANVAS_HEIGHT = 800;
const IMAGE_SIZE = 64;
const MS_PER_FRAME = 1000/8;

const LEFT = "left";
const RIGHT = "right";
const WALKING = "walking";
const STABBING = "stabbing";
const SWINGING = "swinging";

const WALKING_LEFT_Y = 9;                                                       // the row in orc_basic.png that the class should reference for walking left
const WALKING_RIGHT_Y = 11;                                                     // row for walking right
const STABBING_LEFT_Y = 5;                                                      // row for stabbing left
const STABBING_RIGHT_Y = 7;                                                     // row for stabbing right

const WALKING_MAX_FRAME = 8;                                                    // the number of frames in the complete walking animation
const STABBING_MAX_FRAME = 7;                                                   // the number of frames in the complete stabbing animation

const SWINGING_LEFT_Y = 13;
const SWINGING_RIGHT_Y = 15;
const SWINGING_MAX_FRAME = 5;




/**
 * @module Enemy
 * A class representing an enemy
 */
module.exports = exports = Melee;

/**
 * @constructor Enemy
 * Base class for an enemy
 * @param {object} startingPosition, object containing x and y coords
 */
function Melee(startingPosition, frameX, frameY, img, img2, tiles, height, width, hitboxDiff, type) {

  this.state = WALKING;                                                         // state
  this.position = startingPosition;                                             // position
  this.gravity = {x: 0, y: .5};                                                 // gravity that affects the melee unit
  this.velocity = {x: 0, y: 0};                                                 // the unit's x and y velocity
  this.floor = 16*35;                                                           // the tile that this unit is standing on
  this.frame = {x: frameX, y: frameY};                                          // tells where to look in orc_basic.png
  this.direction = LEFT;                                                        // direction
  this.time = 0;                                                                // elapsed time since last update
  this.img = img;                                                               // the image used to display the unit
  this.img2 = img2;                                                             // a secondary image used in displaying certain enemies
  this.tiles = tiles;                                                           // tile map used for walking on the ground
  this.height = height;                                                         // the height of the enemy
  this.width = width;                                                           // the width of the enemy
  this.hitboxDiff = hitboxDiff;                                                 // an {x,y} value saying how far off of the position the hitbox should start
  this.walkingSpeed = 1;
  this.type = type;
  if (this.type == "orc_basic") this.walkingSpeed = 2.5;
  if (this.type == "skeleton_basic") this.walkingSpeed = 1.25;
  this.feet;

}

/**
 * @function update
 * Updates the enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {object} playerPosition, object containing x and y coords
 */
Melee.prototype.update = function(elapsedTime, playerPosition, entityManager) {
    if (this.velocity.y >= 0) onFloor(this);
    if (this.position.x < -80) { this.direction = RIGHT; }
    if (this.position.x > CANVAS_WIDTH) this.direction = LEFT;
    switch (this.state) {
      // this handles the walking case
      case WALKING:
        this.time += elapsedTime;
        // walking left
        if (this.direction == LEFT) {
          this.frame.y = WALKING_LEFT_Y;
          if (this.time >= MS_PER_FRAME) { this.frame.x++; this.time = 0; }
          if (this.frame.x > WALKING_MAX_FRAME) this.frame.x = 0;
          this.velocity.x -= .1;
          if (this.velocity.x <= -this.walkingSpeed) this.velocity.x = -this.walkingSpeed;
        }
        // walking right
        else {
          this.frame.y = WALKING_RIGHT_Y;
          if (this.time >= MS_PER_FRAME) { this.frame.x++; this.time = 0; }
          if (this.frame.x > WALKING_MAX_FRAME) this.frame.x = 0;
          this.velocity.x += .1;
          if (this.velocity.x >= this.walkingSpeed) this.velocity.x = this.walkingSpeed;
        }
        break;
      // this handles the stabbing case
      case STABBING:
        this.time += elapsedTime;
        // stabbing left
        if (this.direction == LEFT) {
          this.frame.y = STABBING_LEFT_Y;
          if (this.time >= MS_PER_FRAME) { this.frame.x++; this.time = 0; }
          if (this.frame.x > STABBING_MAX_FRAME) { this.state = WALKING; this.frame.x = 0; this.frame.y = WALKING_LEFT_Y; }
          this.velocity.x = 0;
          if (this.position >= playerPosition.y + 100) {
            this.state = WALKING;
            this.frame.x = 0; }
        }
        // stabbing right
        else {
          this.frame.y = STABBING_RIGHT_Y;
          if (this.time >= MS_PER_FRAME) { this.frame.x++; this.time = 0; }
          if (this.frame.x > STABBING_MAX_FRAME) { this.state = WALKING; this.frame.x = 0; this.frame.y = WALKING_RIGHT_Y; }
          this.velocity.x = 0;
          if (this.position <= playerPosition.y + 100) {
            this.state = WALKING;
            this.frame.x = 0; }
        }
        break;
      case SWINGING:
        this.time += elapsedTime;
        // swinging left
        if (this.direction == LEFT) {
          this.frame.y = SWINGING_LEFT_Y;
          // switch frames.. might have to change images
          if (this.time >= MS_PER_FRAME) {
            this.frame.x++; this.time = 0; }
          if (this.frame.x > SWINGING_MAX_FRAME) { this.state = WALKING; this.frame.x = 0; this.frame.y = WALKING_LEFT_Y; }
          this.velocity.x = 0;
          if (this.position >= playerPosition.y + 100) {
            this.state = WALKING;
            this.frame.x = 0; }
        }
        // swinging right
        if (this.direction == RIGHT) {
          this.frame.y = SWINGING_RIGHT_Y;
          // switch frames.. might have to change images
          if (this.time >= MS_PER_FRAME) {
            this.frame.x++; this.time = 0; }
          if (this.frame.x > SWINGING_MAX_FRAME) { this.state = WALKING; this.frame.x = 0; this.frame.y = WALKING_RIGHT_Y; }
          this.velocity.x = 0;
          if (this.position <= playerPosition.y + 100) {
            this.state = WALKING;
            this.frame.x = 0; }
        }
        break;
  }

  // move the player
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  if(this.velocity.y < 14 && this.position.x > 0 && this.position.x < CANVAS_WIDTH)
  {
   this.velocity.x += this.gravity.x;
   this.velocity.y += this.gravity.y;
  }

}

/**
 * @function render
 * Renders the enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Melee.prototype.render = function(elapasedTime, ctx, drawWidth, drawHeight) {
  ctx.drawImage(this.img, IMAGE_SIZE*this.frame.x, IMAGE_SIZE*this.frame.y, IMAGE_SIZE, IMAGE_SIZE, this.position.x, this.position.y, drawWidth, drawHeight);
  //ctx.rect(this.position.x + 2.5, this.position.y + 20, 75, 60);
  //ctx.stroke();

}

// stabs
Melee.prototype.stab = function() {
  this.state = STABBING;
  this.frame.x = 0;
  this.time = 0;
}

// swings
Melee.prototype.swing = function() {
  this.state = SWINGING;
  this.frame.x = 0;
  this.time = 0;
}

function onFloor(melee) {
  if (melee.type == "orc_basic") melee.feet = 48;
  if (melee.type == "skeleton_basic") melee.feet = 42;
  if (melee.tiles.isFloor({x:melee.position.x, y:melee.position.y + melee.feet})) {
    melee.velocity.y = 0;
    melee.floor = (Math.floor((melee.position.y+32)/16) * 16) - 32;
    melee.position.y = melee.floor + (52-melee.feet);
  }
  else {
    melee.floor = CANVAS_HEIGHT - 32;
  }
}
