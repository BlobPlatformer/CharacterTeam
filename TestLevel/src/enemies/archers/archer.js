"use strict";

/* Classes and Libraries */
const Vector = require('../../vector');
const Arrow = require('./arrow');

/* Constants */
const MS_PER_FRAME = 1000/12;
const LEFT = "l";
const RIGHT = "r";
const IDLE_FRAME_MAX_X = 1;
const WALK_LEFT_FRAME_Y = 9;
const WALK_LEFT_FRAME_MAX_X = 9;
const WALK_RIGHT_FRAME_Y = 11;
const WALK_RIGHT_FRAME_MAX_X = 9;
const SHOOT_LEFT_FRAME_Y = 17;
const SHOOT_LEFT_FRAME_MAX_X = 12;
const SHOOT_RIGHT_FRAME_Y = 19;
const SHOOT_RIGHT_FRAME_MAX_X = 12;
const SHOOTING_FRAME = 8;

/**
 * @module Archer
 * A class representing an archer enemy
 */
module.exports = exports = Archer;


/**
 * @constructor Archer
 * Base class for enemies which shoot arrows
 * @param {Object} startingPosition, object containing x and y coords
 * @param {Image} image, source spritesheet
 * @param {Int} walkingRange, distance from which the archer starts moving towards the player
 * @param {Int} walkingSpeed, speed of walking
 * @param {Int} shootingRange, distance from which can archer start shooting
 */
function Archer(startingPosition, image, walkingRange, walkingSpeed, shootingRange, shootingSpeed, maximumArrows, arrowSpeed) {
  this.position = startingPosition;
  this.state = "idle";
  this.direction = LEFT;
  this.image = image;
  this.frame = {
    x: 0,
    maxX: IDLE_FRAME_MAX_X,
    y: WALK_LEFT_FRAME_Y // Y frame is the same for WALK and IDLE state
  }
  this.walkingRange = walkingRange;
  this.walkingSpeed = walkingSpeed;
  this.shootingRange = shootingRange;
  this.shootingSpeed = shootingSpeed;
  this.arrowsGenerated = 0;
  this.maximumArrows = maximumArrows;
  this.arrowSpeed = arrowSpeed;
  this.time = MS_PER_FRAME;
}

/**
 * @function setFramesAccordingToState
 * Updates the archer frames based on his state
 */
Archer.prototype.setFramesAccordingToState = function() {
  switch (this.state) {
    case "idle":
      if(this.direction == LEFT) {
        this.frame.y = WALK_LEFT_FRAME_Y;
        this.frame.x = 0;
        this.frame.maxX = IDLE_FRAME_MAX_X;
      } else {
        this.frame.y = WALK_RIGHT_FRAME_Y;
        this.frame.x = 0;
        this.frame.maxX = IDLE_FRAME_MAX_X;
      }
      break;
    case "walking":
      if(this.direction == LEFT) {
        this.frame.y = WALK_LEFT_FRAME_Y;
        this.frame.maxX = WALK_LEFT_FRAME_MAX_X;
      } else {
        this.frame.y = WALK_RIGHT_FRAME_Y;
        this.frame.maxX = WALK_RIGHT_FRAME_MAX_X;
      }
      break;
    case "shooting":
      if(this.direction == LEFT) {
        this.frame.y = SHOOT_LEFT_FRAME_Y;
        this.frame.maxX = SHOOT_LEFT_FRAME_MAX_X;
      } else {
        this.frame.y = SHOOT_RIGHT_FRAME_Y;
        this.frame.maxX = SHOOT_RIGHT_FRAME_MAX_X;
      }
      break;
    default:
      console.log(this.state);
  }
}

/**
 * @function update
 * Updates the archer enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {object} playerPosition, object containing x and y coords
 * @param {object} entityManager, object which maintains all particles
 */
Archer.prototype.update = function(elapsedTime, playerPosition, entityManager) {
  this.time -= elapsedTime;

  if(this.time > 0) return;
  this.frame.x = (this.frame.x + 1) % this.frame.maxX;
  if(this.state == "shooting") this.time = this.shootingSpeed;
  else this.time = MS_PER_FRAME;

  var vector = Vector.subtract(playerPosition, this.position);
  var magnitude = Vector.magnitude(vector);

  if(vector.x <= 0) this.direction = LEFT;
  else this.direction = RIGHT;


  // This if-else statement sets proper animation frames only
  if(magnitude > this.walkingRange || Math.abs(vector.y) > 90) {
    // Player is far away/above/under the archer, stay idle, change frames only
    this.state = "idle";
    Archer.prototype.setFramesAccordingToState.call(this);
  }
  else if (magnitude > this.shootingRange) {
    // Player has reached the walking distance of the archer
    // Archer goes towards the player
    this.state = "walking";
    Archer.prototype.setFramesAccordingToState.call(this);
  } else {
    // Player has reached the shooting distance of the archer
    // Archer starts shooting towards the player
    this.state = "shooting";
    Archer.prototype.setFramesAccordingToState.call(this);
  }

  switch(this.state) {
    case "walking":
      this.position.x += (this.direction == LEFT)? -this.walkingSpeed : this.walkingSpeed;
      break;
    case "shooting":
      var arrowVelocity = {x: (this.direction == LEFT)? -this.arrowSpeed : this.arrowSpeed, y: 0}
      if(this.frame.x == SHOOTING_FRAME) {
        entityManager.addParticle(new Arrow({x: this.position.x, y: this.position.y - 12}, arrowVelocity));
        this.arrowsGenerated = this.arrowsGenerated + 1;
      }
      break;
  }

}

/**
 * @function render
 * Renders the archer enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {object} frame, sets the source and destionation frame properties
 * @param {CanvasRenderingContext2D} ctx
 */
Archer.prototype.render = function(elapasedTime, frame ,ctx) {
  ctx.drawImage(this.image,
                this.frame.x * frame.source_frame_width,
                this.frame.y * frame.source_frame_height,
                frame.source_frame_width,
                frame.source_frame_height,
                this.position.x, this.position.y,
                frame.dest_frame_width,
                frame.dest_frame_height
  );
}
