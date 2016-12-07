"use strict";

/* Constants */
const ORIG_FRAME_SIZE = 64;
const DEST_FRAME_SIZE = 54;
const ARROW_LEFT = 0; // Frame position
const ARROW_RIGHT = 1; // Frame position

/* Classes and Libraries */
const Particle = require('../../particle');

/**
 * @module Arrow
 * A class representing an arrow
 */
module.exports = exports = Arrow;

/**
 * @constructor ElfArcher
 * Class for an elf enemy which shoots arrows
 * @param {Object} startingPosition, object containing x and y coords
 */
function Arrow(position, velocity) {
  var image =  new Image();
  image.src = 'assets/img/Sprite_Sheets/archers/arrow.png';

  var frame = (velocity.x < 0)? ARROW_LEFT : ARROW_RIGHT;

  Particle.call(this, position, velocity, image, ORIG_FRAME_SIZE, frame, 0, DEST_FRAME_SIZE);
}

/**
 * @function update
 * Updates the arrow based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 */
Arrow.prototype.update = function(elapsedTime) {
  Particle.prototype.update.call(this, elapsedTime);
}

/**
 * @function render
 * Renders the arrow in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Arrow.prototype.render = function(elapsedTime, ctx) {
  Particle.prototype.render.call(this, elapsedTime, ctx);
}
