"use strict";

/* Classes and Libraries */

/* Constants */
const CANVAS_WIDTH = 1120;
const CANVAS_HEIGHT = 800;
const IMAGE_SIZE = 64;
const MS_PER_FRAME = 1000/8;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Player(x,y) {
  this.state = "idle";
  this.position = {x: x, y: y};
  this.velocity = {x: 0, y: 0};
  this.gravity = {x: 0, y: 2};
  this.floor = 16*35;
  // TODO
  this.img = new Image()
  this.img.src = 'assets/img/Sprite_Sheets/animations.png';
  this.frame = 1;
  this.frameHeight = 0;
  this.direction = "right";
  this.time = MS_PER_FRAME;

  // testing something
  this.storedFH = 0;
  this.storedF = 0;
  this.previousState = "moving";

}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Player.prototype.update = function(elapsedTime, input) {
  switch (this.state) {
    case "idle":
      this.time += elapsedTime;
      // landing
      if (this.previousState == "falling") {
        if (this.time <= MS_PER_FRAME) {
          this.frameHeight = 3;
          this.frame = 3;
        }
        else if (this.time <= 2*MS_PER_FRAME) {
          this.frameHeight = 3;
          this.frame = 2;
        }
        else if (this.time <= 3*MS_PER_FRAME) {
          this.frameHeight = 3;
          this.frame = 1;
        }
        else if (this.time <= 4*MS_PER_FRAME) {
          this.frameHeight = 3;
          this.frame = 0;
        }
        else {
          this.frameHeight = this.storedFH;
          this.frame = this.storedF;
        }
      }
      else if (this.previousState == "moving") {
        if (this.time <= MS_PER_FRAME) {
          this.frameHeight = this.storedF+1; //bit of a hack here, i can explain in class
          this.frame = 0;
        }
        else {
          this.frameHeight = this.storedFH;
          this.frame = this.storedF;
        }
      }


      // set the velocity
      //this.velocity.x = 0;
      if(input.left) {
        this.direction = "left";
        this.frameHeight = 1;
        this.frame = 0;
        this.time = 0;
        this.state = "moving";
      }
      else if(input.right) {
        this.direction = "right";
        this.frameHeight = 2;
        this.frame = 0;
        this.time = 0;
        this.state = "moving";
      }
      else {
        this.velocity.x = 0;
      }
      break;
    case "moving":
      // set the velocity
      //this.velocity.x = 0;
      this.time += elapsedTime;
      if(input.left) {
        this.frameHeight = 1;
        if(this.velocity.x > -6) {
          this.velocity.x -= .5;
        }
        if (this.time >= MS_PER_FRAME && this.time <= 2*MS_PER_FRAME) { this.frame = 0;}
        if (this.time >= 2*MS_PER_FRAME) { this.frame = 1; }
      }
      else if(input.right) {
        this.frameHeight = 2;
        if(this.velocity.x < 6) {
          this.velocity.x += .5;
        }
        if (this.time >= MS_PER_FRAME && this.time <= 2*MS_PER_FRAME) { this.frame = 0;}
        if (this.time >= 2*MS_PER_FRAME) { this.frame = 1; }
      }
      else {
        this.time = 0;
        this.storedFH = 0;
        this.previousState = "moving";
        if (this.direction == "right") { this.storedF = 1;}
        else this.storedF = 0;
        this.state = "idle";
      }
      break;
    case "falling":
      // set the velocity
      //this.velocity.x = 0;
      if (this.position.y == this.floor) {
        this.storedFH = 0;
        if (this.direction == "left") this.storedF = 0;
        else this.storedF = 1;
        this.time = 0;
        this.state = "idle";
      }
      else if(input.left) {
        if(this.velocity.x > -6) {
          this.velocity.x -= .5;
        }
      }
      else if(input.right) {
        if(this.velocity.x < 6) {
          this.velocity.x += .5;
        }
      }
      else {
        this.velocity.x = 0;
      }
      break;
    case "jump":
      this.time += elapsedTime;
      if (this.time <= MS_PER_FRAME) {
        this.frameHeight = 3;
        this.frame = 0;
      }
      else if (this.time <= 2*MS_PER_FRAME) {
        this.frameHeight = 3;
        this.frame = 1;
      }
      else if (this.time <= 3*MS_PER_FRAME) {
        this.frameHeight = 3;
        this.frame = 2;
      }
      else if (this.time <= 4*MS_PER_FRAME) {
        this.frameHeight = 3;
        this.frame = 3;
      }
      else {
        this.frameHeight = 3;
        this.frame = 4;
      }

      if (this.velocity.y > 0) {
        this.frameHeight = 3;
        this.frame = 4;
        this.state = "falling";
      }
      else if(input.left) {
        if(this.velocity.x > -6) {
          this.velocity.x -= .5;
        }
      }
      else if(input.right) {
        if(this.velocity.x < 6) {
          this.velocity.x += .5;
        }
      }
      else {
        this.velocity.x = 0;
      }
      break;
    }


  // move the player
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  if(this.velocity.y < 14)
  {
    this.velocity.x += this.gravity.x;
    this.velocity.y += this.gravity.y;
  }
  // keep player on screen
  if(this.position.x < 0) this.position.x = 0;
  if(this.position.x > CANVAS_WIDTH-32) this.position.x = CANVAS_WIDTH-32;
  if(this.position.y < 0) this.position.y = 0;
  if(this.position.y > this.floor) this.position.y = this.floor;
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Player.prototype.render = function(elapasedTime, ctx) {
  ctx.drawImage(this.img, IMAGE_SIZE*this.frame, IMAGE_SIZE*this.frameHeight, IMAGE_SIZE, IMAGE_SIZE, this.position.x, this.position.y, 32, 32);
}

Player.prototype.jump = function() {
  if (this.position.y == this.floor) {
    this.time = 0;
    this.state = "jump";
    this.velocity.y = -20;
  }
}
