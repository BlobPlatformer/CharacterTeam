"use strict";

/* Classes and Libraries */

/* Constants */
const MS_PER_FRAME = 1000/8;
const IMAGE_WIDTH = 927;
const IMAGE_HEIGHT = 633;
const ABSOLUTE_VELOCITY = 5;

/**
 * @module Enemy
 * A class representing an enemy
 */
module.exports = exports = Diver;

/**
 * @constructor Enemy
 * Base class for an enemy
 * @param {object} startingPosition, object containing x and y coords
 */
function Diver(startingPosition, startendposition) {
  this.state = "right";
  this.position = startingPosition;
  this.flyingHeight = this.position.y;
  this.start = startendposition.start;
  this.end = startendposition.end - 40;
  this.gravity = {x: 0, y: 1};
  this.floor = 17*35;
  this.velocity ={ x:ABSOLUTE_VELOCITY, y:0};
  this.img = new Image();
  this.img.src = 'assets/img/Sprite_Sheets/diver.png';
  this.frame = 0; //Frame on X-axis
  this.frameHeight = 0; //Frame on Y-axis
  this.time = 0;
  this.dive_time = 0;
  this.playerDivePosition;
  this.diving = false;
  this.going_up = false;
  this.width = 40;
  this.height = 32;
}

/**
 * @function update
 * Updates the enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {object} playerPosition, object containing x and y coords
 */
Diver.prototype.update = function(elapsedTime, playerPosition) {
  this.dive_time += elapsedTime;
  if(this.dive_time >= 6000 && !this.diving && playerPosition.x < this.end && playerPosition.x > this.start){
    this.diving = true;
    this.playerDivePosition = playerPosition;
    if(this.position.x >= this.playerDivePosition.x) this.state = "left_dive";
    else this.state = "right_dive";
    this.getDivingVelocity();
  }
  var self = this;
  console.log(this.state);
  switch(this.state){
    case "right":
      this.frameHeight = 0;
      this.time += elapsedTime;
      if(this.time >= MS_PER_FRAME){
        this.frame ++;
        this.time = 0;
      }
      if(this.position.x >= this.end){
        this.state = "left";
        this.frame = 0;
      }
      else{
        this.position.x += this.velocity.x;
        if(this.frame >= 8) this.frame = 0;
      }
      break;
    case "left":
      this.frameHeight = 1;
      this.time += elapsedTime;
      if(this.time >= MS_PER_FRAME){
        this.frame ++;
        this.time = 0;
      }
      if(this.position.x <= this.start){
        this.state = "right";
        this.frame = 0;
      }
      else{
        this.position.x -= this.velocity.x;
        if(this.frame >= 8) this.frame = 0;
      }
      break;
    case "right_dive":
      this.frameHeight = 0;
      this.time += elapsedTime;
      if(this.time >= MS_PER_FRAME){
        this.frame ++;
        this.time = 0;
      }
      console.log(this.position,playerPosition);
      if(this.position.y >= playerPosition.y){
        this.velocity.x = 0;
        this.velocity.y = ABSOLUTE_VELOCITY;
        this.going_up = true;
      }
      this.position.x += this.velocity.x;
      if(this.going_up) this.position.y -= this.velocity.y;
      else this.position.y += this.velocity.y;
      if(this.frame >= 8) this.frame = 0;
      console.log(this.position,playerPosition);
      if(this.position.y <= this.flyingHeight){
        this.velocity.x = ABSOLUTE_VELOCITY;
        this.velocity.y = 0;
        this.position.y = this.flyingHeight;
        this.state = "right";
        this.dive_time = 0;
        this.diving = false;
        this.going_up = false;
      }
      break;
    case "left_dive":
      this.frameHeight = 1;
      this.time += elapsedTime;
      if(this.time >= MS_PER_FRAME){
        this.frame ++;
        this.time = 0;
      }
      if(this.position.y >= playerPosition.y){
        this.velocity.x = 0;
        this.velocity.y = ABSOLUTE_VELOCITY;
      }
      this.position.x -= this.velocity.x;
      this.position.y -= this.velocity.y;
      if(this.frame >= 8) this.frame = 0;
      if(this.position.y <= this.flyingHeight){
        this.velocity.x = ABSOLUTE_VELOCITY;
        this.velocity.y = 0;
        this.position.y = this.flyingHeight;
        this.state = "left";
        this.dive_time = 0;
        this.diving = false;
      }
      break;
  }
}

/**
 * @function render
 * Renders the enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Diver.prototype.render = function(elapasedTime, ctx) {
  ctx.drawImage(this.img, IMAGE_WIDTH*this.frame, IMAGE_HEIGHT*this.frameHeight, IMAGE_WIDTH, IMAGE_HEIGHT, this.position.x, this.position.y, 40, 32);
}

Diver.prototype.getDivingVelocity = function(){
  var x = this.position.x - this.playerDivePosition.x;
  var y = this.position.y - this.playerDivePosition.y;
  //var distance = Math.sqrt(Math.pow(x, 2 ) + Math.pow(y, 2 ));
  var rad = Math.atan(y/x);
  this.velocity.x = Math.cos(rad) * ABSOLUTE_VELOCITY * 4;
  this.velocity.y = Math.sin(rad) * ABSOLUTE_VELOCITY * 4;
}
