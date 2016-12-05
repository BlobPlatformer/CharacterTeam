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
 * @param {Image} image, object created by calling new Image()
 * @param {int} imageSize, frame size of the original image
 * @param {int} frame, x-position of the frame in the source image
 * @param {int} frameHeight, y-position of the frame in the source image
 * @param {int} frameSize, size (width & height) of the destionation frame
 */
function Particle(startingPosition, velocity, image, imageSize, frame, frameHeight, frameSize) {
  this.position = startingPosition;
  this.velocity = velocity;
  // TODO
  this.image = image;
  this.imageSize = imageSize;
  this.frame = frame; //Frame on X-axis
  this.frameHeight = frameHeight; //Frame on Y-axis
  this.frameSize = frameSize;
  //this.time = MS_PER_FRAME;
}

/**
 * @function update
 * Updates the particle based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 */
Particle.prototype.update = function(elapsedTime) {
  //this.time -= elapsedTime;

  //if (this.time > 0) return;
  //else this.time = MS_PER_FRAME;

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
  ctx.drawImage(this.image, this.frame * this.frameSize, this.frameHeight * this.frameSize,
    this.imageSize, this.imageSize, this.position.x, this.position.y, this.frameSize, this.frameSize);
}
