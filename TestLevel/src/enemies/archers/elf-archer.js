"use strict";

/* Classes and Libraries */
const Archer = require('./archer');


/* Constants */
const WALKING_RANGE_IN_PX = 600;
const WALKING_SPEED_IN_PX = 5;
const SHOOTING_RANGE_IN_PX = 350;
const SHOOTING_SPEED = 1000/13;

/**
 * @module ElfArcher
 * A class representing an archer enemy
 */
module.exports = exports = ElfArcher;


/**
 * @constructor ElfArcher
 * Class for an elf enemy which shoots arrows
 * @param {Object} startingPosition, object containing x and y coords
 */
function ElfArcher(startingPosition) {
  var image = new Image();
  image.src = 'assets/img/Sprite_Sheets/archers/elfarcher.png';
  Archer.call(this, startingPosition, image, WALKING_RANGE_IN_PX, WALKING_SPEED_IN_PX, SHOOTING_RANGE_IN_PX, SHOOTING_SPEED);
}


/**
 * @function update
 * Updates the elf archer enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {object} playerPosition, object containing x and y coords
 */
ElfArcher.prototype.update = function(elapsedTime, playerPosition, entityManager) {
  Archer.prototype.update.call(this, elapsedTime, playerPosition, entityManager);
}

/**
 * @function render
 * Renders the elf archer enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
ElfArcher.prototype.render = function(elapsedTime, ctx) {
  Archer.prototype.render.call(this, elapsedTime, ctx);
}
