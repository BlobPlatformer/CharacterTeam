"use strict";

/* Classes and Libraries */

/* Constants */
const MS_PER_FRAME = 1000/8;

/**
 * @module Enemy
 * A class representing an enemy
 */
module.exports = exports = Enemy;

/**
 * @constructor Enemy
 * Base class for an enemy
 * @param {object} startingPosition, object containing x and y coords
 */
function Enemy(startingPosition) {
  this.state = "idle";
  this.position = startingPosition;
  this.gravity = {x: 0, y: 1};
  this.floor = 16*35;
  // TODO
  this.img = new Image();
  this.img.src = null;
  this.frame = 1; //Frame on X-axis
  this.frameHeight = 0; //Frame on Y-axis
  this.direction = "right";
  this.time = MS_PER_FRAME;
}

/**
 * @function update
 * Updates the enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {object} playerPosition, object containing x and y coords
 */
Enemy.prototype.update = function(elapsedTime, playerPosition) {

}

/**
 * @function render
 * Renders the enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Enemy.prototype.render = function(elapasedTime, ctx) {
  // TODO
  //ctx.drawImage(this.img, IMAGE_SIZE*this.frame, IMAGE_SIZE*this.frameHeight, IMAGE_SIZE, IMAGE_SIZE, this.position.x, this.position.y, 32, 32);
}
