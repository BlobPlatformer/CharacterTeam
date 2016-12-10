"use strict";

/* Libraries */
const Melee = require('./melee.js');

/* Constants */

/**
 * @module Skelly
 * A class representing an Orc Enemy
 */
module.exports = exports = Skeleton;

/**
 * @constructor Orc
 * Class for an orc enemy which shoots arrows
 * @param {Object} startingPosition, object containing x and y coords
 */
function Skeleton(startingPosition, tiles) {
  var image = new Image();
  image.src = 'assets/img/Sprite_Sheets/melee/skeleton_dagger_walk.png';
  var image2 = new Image();
  image2.src = 'assets/img/Sprite_Sheets/melee/skeleton_dagger_swing.png';
  Melee.call(this, startingPosition, 0, 9, image, image2, tiles, 80, 80, {x: 8, y: 22}, "skeleton_basic", 3);
}


/**
 * @function update
 * Updates the skeleton enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {object} playerPosition, object containing x and y coords
 */
Skeleton.prototype.update = function(elapsedTime, playerPosition, entityManager) {
  Melee.prototype.update.call(this, elapsedTime, playerPosition, entityManager);
}

/**
 * @function render
 * Renders the orc enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Skeleton.prototype.render = function(elapsedTime, ctx) {
  Melee.prototype.render.call(this, elapsedTime, ctx, 75, 75);
}

Skeleton.prototype.swing = function() {
  Melee.prototype.swing.call(this);
}
