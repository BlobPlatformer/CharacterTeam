"use strict";

/* Classes and Libraries */

/* Constants */
const MS_PER_FRAME = 1000/8;

/**
 * @module Particle
 * A class representing a particle
 */
module.exports = exports = Particle;

/**
 * @constructor Particle
 * Base class for a particle (Arrow, Spell, etc.)
 * @param {object} startingPosition, object containing x and y coords
  * @param {object} velocity, object containing x and y coords
 */
function Particle(startingPosition, velocity, image) {
  this.position = startingPosition;
  this.velocity = velocity;
  // TODO
  this.img = new Image();
  this.img.src = image;
  this.frame = 1; //Frame on X-axis
  this.frameHeight = 0; //Frame on Y-axis
  this.time = MS_PER_FRAME;
}

/**
 * @function update
 * Updates the particle based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 */
Particle.prototype.update = function(elapsedTime) {
  this.time -= elapsedTime;

  if (this.time > 0) return;
  else this.time = MS_PER_FRAME;

  // Move the particle
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
}

/**
 * @function render
 * Renders the particle in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Particle.prototype.render = function(elapasedTime, ctx) {
  // TODO
  //ctx.drawImage(this.img, IMAGE_SIZE*this.frame, IMAGE_SIZE*this.frameHeight, IMAGE_SIZE, IMAGE_SIZE, this.position.x, this.position.y, 32, 32);
}
