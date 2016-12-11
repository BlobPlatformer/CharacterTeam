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
function Particle(startingPosition, velocity, image, actualFrame, frame) {
  this.position = startingPosition;
  this.velocity = velocity;
  // TODO
  this.image = image;
  this.frame = frame;
  this.actualFrame = actualFrame;
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
  ctx.drawImage(this.image,
                this.actualFrame.x * this.frame.source_frame_width,
                this.actualFrame.y * this.frame.source_frame_height,
                this.frame.source_frame_width,
                this.frame.source_frame_height,
                this.position.x,
                this.position.y,
                this.frame.dest_frame_width,
                this.frame.dest_frame_height
  );
}
