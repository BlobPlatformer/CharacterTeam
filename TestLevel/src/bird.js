"use strict";

/* Classes and Libraries */
const Bullets = require('./bullet_pool');

/* Constants */
const MS_PER_FRAME = 1000/8;
const IMAGE_WIDTH = 706;
const IMAGE_HEIGHT = 576;

/**
 * @module Enemy
 * A class representing an enemy
 */
module.exports = exports = Bird;

/**
 * @constructor Enemy
 * Base class for an enemy
 * @param {object} startingPosition, object containing x and y coords
 */
function Bird(startingPosition,startendposition) {
  this.state = "idle";
  this.position = startingPosition;
  this.start = startendposition.start;
  this.end = startendposition.end - 40;
  this.gravity = {x: 0, y: 1};
  this.bulletpool = new Bullets(10);
  this.floor = 17*35;
  this.velocity = 4;
  this.img = new Image();
  this.img.src = 'assets/img/Sprite_Sheets/greenbird.png';
  this.frame = 0; //Frame on X-axis
  this.frameHeight = 0; //Frame on Y-axis
  this.direction = "right";
  this.time = 0;
  this.bullet_time = 0;
}

/**
 * @function update
 * Updates the enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {object} playerPosition, object containing x and y coords
 */
Bird.prototype.update = function(elapsedTime) {
  this.bullet_time += elapsedTime;
  var self = this;
  if(this.bullet_time >= 2000){
    this.bulletpool.add(this.position, {x: 0, y:6});
    this.bullet_time = 0;
  }
  this.bulletpool.update(elapsedTime, function(bullet){
    if(bullet.y >= self.floor) return true;
    return false;
  });
  switch(this.direction){
    case "right":
      this.frameHeight = 0;
      this.time += elapsedTime;
      if(this.time >= MS_PER_FRAME){
        this.frame ++;
        this.time = 0;
      }
      if(this.position.x >= this.end){
        this.direction = "left";
        this.frame = 0;
        console.log("goes left", this.position);
      }
      else{
        this.position.x += this.velocity;
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
        this.direction = "right";
        this.frame = 0;
        console.log("goes right", this.position);
      }
      else{
        this.position.x -= this.velocity;
        if(this.frame >= 8) this.frame = 0;
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
Bird.prototype.render = function(elapasedTime, ctx) {
  this.bulletpool.render(elapasedTime, ctx);
  ctx.drawImage(this.img, IMAGE_WIDTH*this.frame, IMAGE_HEIGHT*this.frameHeight, IMAGE_WIDTH, IMAGE_HEIGHT, this.position.x, this.position.y, 40, 32);
}
