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
const MAX_Y_VELOCITY = 8;
const CANVAS_HEIGHT = 800;

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
 * @param {Object} frame, object containing display properties including width and height
 * of the source frame (real size in the sprite sheet) and width and height of destination
 * frame (how it will be really displayed)
 * @param {Int} walkingRange, distance from which the archer starts moving towards the player
 * @param {Int} walkingSpeed, speed of walking
 * @param {Int} shootingRange, distance from which can archer start shooting
 * @param {Int} shootingSpeed, speed of shooting
 * @param {Int} arrowSpeed, speed of an arrow
 * @param {Int} tiles, checking wheter an archer is standing on the floor
 */
function Archer(startingPosition, image, frame, walkingRange, walkingSpeed, shootingRange, shootingSpeed, arrowSpeed, tiles) {
  this.position = startingPosition;
  this.state = "idle";
  this.direction = LEFT;
  this.image = image;
  this.actualFrame = {
    x: 0,
    maxX: IDLE_FRAME_MAX_X,
    y: WALK_LEFT_FRAME_Y // Y frame is the same for WALK and IDLE state
  };
  this.frame = frame;
  this.walkingRange = walkingRange;
  this.walkingSpeed = walkingSpeed;
  this.shootingRange = shootingRange;
  this.shootingSpeed = shootingSpeed;
  this.arrowsGenerated = 0;
  this.arrowSpeed = arrowSpeed;
  this.time = MS_PER_FRAME;
  // Gravity and other stuff
  this.floor = 16*35; // May be parametrized
  this.gravity = {x: 0, y: .1};
  this.velocity = {x: 0, y: 0};
  this.tiles = tiles;
}

/**
 * @function setFramesAccordingToState
 * Updates the archer frames based on his state
 */
Archer.prototype.setFramesAccordingToState = function() {
  switch (this.state) {
    case "idle":
    case "falling":
      if(this.direction == LEFT) {
        this.actualFrame.y = WALK_LEFT_FRAME_Y;
        this.actualFrame.x = 0;
        this.actualFrame.maxX = IDLE_FRAME_MAX_X;
      } else {
        this.actualFrame.y = WALK_RIGHT_FRAME_Y;
        this.actualFrame.x = 0;
        this.actualFrame.maxX = IDLE_FRAME_MAX_X;
      }
      break;
    case "walking":
      if(this.direction == LEFT) {
        this.actualFrame.y = WALK_LEFT_FRAME_Y;
        this.actualFrame.maxX = WALK_LEFT_FRAME_MAX_X;
      } else {
        this.actualFrame.y = WALK_RIGHT_FRAME_Y;
        this.actualFrame.maxX = WALK_RIGHT_FRAME_MAX_X;
      }
      break;
    case "shooting":
      if(this.direction == LEFT) {
        this.actualFrame.y = SHOOT_LEFT_FRAME_Y;
        this.actualFrame.maxX = SHOOT_LEFT_FRAME_MAX_X;
      } else {
        this.actualFrame.y = SHOOT_RIGHT_FRAME_Y;
        this.actualFrame.maxX = SHOOT_RIGHT_FRAME_MAX_X;
      }
      break;
  }
}

function onFloor() {
  var frame = {width: this.frame.dest_frame_width, height: this.frame.dest_frame_height};

  if (this.tiles.isFloor(this.position, frame)) {
    this.velocity.y = 0;
    this.floor = this.tiles.getFloor(this.position, frame);
  }
  else {
    if(this.velocity.y < MAX_Y_VELOCITY) this.velocity.y += this.gravity.y;
    this.floor = CANVAS_HEIGHT - 32;
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

  // Check if the enemy has landed on the floor
  onFloor.call(this);

  if(this.state == "walking" && this.velocity.x < this.walkingSpeed) this.velocity.x += .1;
  this.position.x += (this.direction == LEFT)? -this.velocity.x : this.velocity.x;
  this.position.y += this.velocity.y;

  if(this.time > 0) return;
  this.actualFrame.x = (this.actualFrame.x + 1) % this.actualFrame.maxX;

  if(this.state == "shooting") this.time = this.shootingSpeed;
  else this.time = MS_PER_FRAME;

  var vector = Vector.subtract(playerPosition, this.position);
  var magnitude = Vector.magnitude(vector);

  if(vector.x <= 0) this.direction = LEFT;
  else this.direction = RIGHT;

  // This if-else statement sets proper animation frames only
  if(magnitude > this.walkingRange || Math.abs(vector.y) > 120) {
    // Player is far away/above/under the archer, stay idle, change frames only
    this.state = "idle";
    this.velocity.x = 0;
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
    this.velocity.x = 0;
    Archer.prototype.setFramesAccordingToState.call(this);

    if(this.actualFrame.x == SHOOTING_FRAME) {
      var arrowVelocity = {x: (this.direction == LEFT)? -this.arrowSpeed : this.arrowSpeed, y: 0}
      entityManager.addParticle(new Arrow({x: this.position.x, y: this.position.y - 12}, arrowVelocity));
      this.arrowsGenerated = this.arrowsGenerated + 1;
    }
  }

}

/**
 * @function render
 * Renders the archer enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Archer.prototype.render = function(elapasedTime, ctx) {
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
