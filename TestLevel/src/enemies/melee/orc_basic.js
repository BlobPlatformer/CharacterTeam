"use strict";

/* Libraries */
const Melee = require('./melee.js');

/* Constants */

/**
 * @module Orc
 * A class representing an Orc Enemy
 */
module.exports = exports = Orc;

/**
 * @constructor Orc
 * Class for an orc enemy which shoots arrows
 * @param {Object} startingPosition, object containing x and y coords
 */
function Orc(startingPosition, tiles) {
  var image = new Image();
  image.src = 'assets/img/Sprite_Sheets/melee/orc_basic.png';
  Melee.call(this, startingPosition, 0, 9, image, tiles);
}


/**
 * @function update
 * Updates the orc enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {object} playerPosition, object containing x and y coords
 */
Orc.prototype.update = function(elapsedTime, playerPosition, entityManager) {
  Melee.prototype.update.call(this, elapsedTime, playerPosition, entityManager);
}

/**
 * @function render
 * Renders the orc enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Orc.prototype.render = function(elapsedTime, ctx) {
  Melee.prototype.render.call(this, elapsedTime, ctx);
}

Orc.prototype.stab = function() {
  Melee.prototype.stab.call(this);
}
