"use strict";

/* Classes and Libraries */
const Archer = require('./archer');


/* Constants */
const WALKING_RANGE_IN_PX = 600;
const WALKING_SPEED_IN_PX = 1;
const SHOOTING_RANGE_IN_PX = 350;
const SHOOTING_SPEED = 1000/13;
const ARROW_SPEED_IN_PX = 5;
const MAXIMUM_ARROWS_GENERATED = 1;
const FRAME = {source_frame_width: 64,
               source_frame_height: 64,
               dest_frame_width: 54,
               dest_frame_height: 54
};

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
function ElfArcher(startingPosition, tiles) {
  var image = new Image();
  image.src = 'assets/img/Sprite_Sheets/archers/elfarcher.png';
  Archer.call(this, startingPosition, image, FRAME, WALKING_RANGE_IN_PX, WALKING_SPEED_IN_PX, SHOOTING_RANGE_IN_PX, SHOOTING_SPEED, ARROW_SPEED_IN_PX, tiles);
}


/**
 * @function update
 * Updates the elf archer enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {object} playerPosition, object containing x and y coords
 */
ElfArcher.prototype.update = function(elapsedTime, playerPosition, entityManager) {
  Archer.prototype.update.call(this, elapsedTime, playerPosition, entityManager);
  this.arrowsGenerated = 0;
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
