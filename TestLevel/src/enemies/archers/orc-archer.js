"use strict";

/* Classes and Libraries */
const Archer = require('./archer');


/* Constants */
const WALKING_RANGE_IN_PX = 800;
const WALKING_SPEED_IN_PX = 1.7;
const SHOOTING_RANGE_IN_PX = 500;
const SHOOTING_SPEED = 1000/20;
const ARROW_SPEED_IN_PX = 6.5;
const ARROW_SHIFT_IN_PX = 29; //Num of pixel to shift the arrow down
const MAXIMUM_ARROWS_GENERATED = 3;
const DEST_FRAME_SIZE = 64;
const FRAME = {source_frame_width: 64,
               source_frame_height: 64,
               dest_frame_width: 64,
               dest_frame_height: 64
};
const PAUSE = 1000;

/**
 * @module OrcArcher
 * A class representing an archer enemy
 */
module.exports = exports = OrcArcher;


/**
 * @constructor OrcArcher
 * Class for an orc enemy which shoots arrows
 * @param {Object} startingPosition, object containing x and y coords
 */
function OrcArcher(startingPosition, tiles) {
  var image = new Image();
  image.src = 'assets/img/Sprite_Sheets/archers/orcarcher.png';
  var arrow = {speed: ARROW_SPEED_IN_PX, shift: ARROW_SHIFT_IN_PX};
  Archer.call(this, startingPosition, image, FRAME, WALKING_RANGE_IN_PX, WALKING_SPEED_IN_PX, SHOOTING_RANGE_IN_PX, SHOOTING_SPEED, arrow, tiles);
  this.pauseTime = 0;
}


/**
 * @function update
 * Updates the orc archer enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {object} playerPosition, object containing x and y coords
 */
OrcArcher.prototype.update = function(elapsedTime, playerPosition, entityManager) {
  Archer.prototype.update.call(this, elapsedTime, playerPosition, entityManager);

  if(this.arrowsGenerated == MAXIMUM_ARROWS_GENERATED) {
    this.actualFrame.x = (this.actualFrame.x + 1) % this.actualFrame.maxX;    
    this.time = PAUSE;
    this.arrowsGenerated = 0;
  }
}

/**
 * @function render
 * Renders the orc archer enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
OrcArcher.prototype.render = function(elapsedTime, ctx) {
  Archer.prototype.render.call(this, elapsedTime, ctx);
}
