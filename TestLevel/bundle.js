(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Game = require('./game');
const Player = require('./player');
const Tiles = require('./tiles');
const EntityManager = require('./entity-manager');
const ElfArcher = require('./enemies/archers/elf-archer');
const EnemyBird = require('./enemies/flying/bird');
const Diver = require('./enemies/flying/diver');
const OrcArcher = require('./enemies/archers/orc-archer');
const Orc = require('./enemies/melee/orc_basic.js');
const Skeleton = require('./enemies/melee/skeleton_basic.js');



/* Global variables */
var tiles = new Tiles();
var map = tiles.getMap();
var blocks = tiles.getBlocks();

var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x:0,y:16*35}, tiles);

var spritesheet = new Image();
spritesheet.src = 'assets/basicTiles.jpg'


var bird = new EnemyBird({x:1, y: 100}, {start:0 , end:canvas.width });
var diver = new Diver({x:1, y: 100}, {start:0 , end:canvas.width });
var orc = new Orc({x: 600, y: 200}, tiles);
var skelly = new Skeleton({x: 800, y: 200}, tiles);
var entityManager = new EntityManager(player);

var input = {
  up: false,
  down: false,
  left: false,
  right: false
}
var groundHit = false;

// Dummy enemy
var elfarcher = new ElfArcher({x: 780, y: 100}, tiles);
var orcarcher = new OrcArcher({x: 520, y: 100}, tiles);
entityManager.addEnemy(elfarcher);
entityManager.addEnemy(orcarcher);
entityManager.addEnemy(bird);
//entityManager.addEnemy(orc);
//entityManager.addEnemy(skelly);




/**
 * @function onkeydown
 * Handles keydown events
 */
window.onkeydown = function(event) {
  //event.preventDefault();
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = true;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = true;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = true;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = true;
      event.preventDefault();
      break;
  }
}

/**
 * @function onkeyup
 * Handles keydown events
 */
window.onkeyup = function(event) {
  //event.preventDefault();
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = false;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = false;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = false;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = false;
      event.preventDefault();
      break;
  }
}

window.onkeypress = function(event) {
  event.preventDefault();
  if(event.keyCode == 32 || event.keyCode == 31 || event.key == " ") {
    player.jump();
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
	player.update(elapsedTime, input);
  entityManager.update(elapsedTime);
}


/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  //tilemap level background
  var row;
  var col;
  for(var i=0; i<map.length; i++) {
    row = i%tiles.getWidth();
    col = Math.floor(i/tiles.getWidth());
    ctx.drawImage(
		spritesheet,
        (map[i]-1)*16,0,16,16,
        row*16,col*16,16,16
	  );
  }

  //player
  entityManager.render(elapsedTime, ctx);
  player.render(elapsedTime, ctx);
}

},{"./enemies/archers/elf-archer":4,"./enemies/archers/orc-archer":5,"./enemies/flying/bird":6,"./enemies/flying/diver":8,"./enemies/melee/orc_basic.js":10,"./enemies/melee/skeleton_basic.js":11,"./entity-manager":12,"./game":13,"./player":15,"./tiles":16}],2:[function(require,module,exports){
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

},{"../../vector":17,"./arrow":3}],3:[function(require,module,exports){
"use strict";

/* Constants */
const ORIG_FRAME_SIZE = 64;
const DEST_FRAME_SIZE = 54;
const ARROW_LEFT = 0; // Frame position
const ARROW_RIGHT = 1; // Frame position

/* Classes and Libraries */
const Particle = require('../../particle');

/**
 * @module Arrow
 * A class representing an arrow
 */
module.exports = exports = Arrow;

/**
 * @constructor ElfArcher
 * Class for an elf enemy which shoots arrows
 * @param {Object} startingPosition, object containing x and y coords
 */
function Arrow(position, velocity) {
  var image =  new Image();
  image.src = 'assets/img/Sprite_Sheets/archers/arrow.png';

  var frame = (velocity.x < 0)? ARROW_LEFT : ARROW_RIGHT;

  Particle.call(this, position, velocity, image, ORIG_FRAME_SIZE, frame, 0, DEST_FRAME_SIZE);
}

/**
 * @function update
 * Updates the arrow based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 */
Arrow.prototype.update = function(elapsedTime) {
  Particle.prototype.update.call(this, elapsedTime);
}

/**
 * @function render
 * Renders the arrow in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Arrow.prototype.render = function(elapsedTime, ctx) {
  Particle.prototype.render.call(this, elapsedTime, ctx);
}

},{"../../particle":14}],4:[function(require,module,exports){
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

},{"./archer":2}],5:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Archer = require('./archer');


/* Constants */
const WALKING_RANGE_IN_PX = 800;
const WALKING_SPEED_IN_PX = 1.7;
const SHOOTING_RANGE_IN_PX = 500;
const SHOOTING_SPEED = 1000/20;
const ARROW_SPEED_IN_PX = 6.5;
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
  Archer.call(this, startingPosition, image, FRAME, WALKING_RANGE_IN_PX, WALKING_SPEED_IN_PX, SHOOTING_RANGE_IN_PX, SHOOTING_SPEED, ARROW_SPEED_IN_PX, tiles);
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
    this.frame.x = (this.frame.x + 1) % this.frame.maxX;
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

},{"./archer":2}],6:[function(require,module,exports){
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

},{"./bullet_pool":7}],7:[function(require,module,exports){
"use strict";

/**
 * @module BulletPool
 * A class for managing bullets in-game
 * We use a Float32Array to hold our bullet info,
 * as this creates a single memory buffer we can
 * iterate over, minimizing cache misses.
 * Values stored are: positionX, positionY, velocityX,
 * velocityY in that order.
 */
module.exports = exports = BulletPool;

/**
 * @constructor BulletPool
 * Creates a BulletPool of the specified size
 * @param {uint} size the maximum number of bullets to exits concurrently
 */
function BulletPool(maxSize) {
  this.pool = new Float32Array(4 * maxSize);
  this.end = 0;
  this.max = maxSize;
  this.bulletRadius = 4;
}

/**
 * @function add
 * Adds a new bullet to the end of the BulletPool.
 * If there is no room left, no bullet is created.
 * @param {Vector} position where the bullet begins
 * @param {Vector} velocity the bullet's velocity
*/
BulletPool.prototype.add = function(position, velocity) {
  if(this.end < this.max) {
    this.pool[4*this.end] = position.x + 27;
    this.pool[4*this.end+1] = position.y + 10.5;
    this.pool[4*this.end+2] = velocity.x;
    this.pool[4*this.end+3] = velocity.y;
    this.end++;
  }
}

/**
 * @function update
 * Updates the bullet using its stored velocity, and
 * calls the callback function passing the transformed
 * bullet.  If the callback returns true, the bullet is
 * removed from the pool.
 * Removed bullets are replaced with the last bullet's values
 * and the size of the bullet array is reduced, keeping
 * all live bullets at the front of the array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {function} callback called with the bullet's position,
 * if the return value is true, the bullet is removed from the pool
 */
BulletPool.prototype.update = function(elapsedTime, callback) {
  for(var i = 0; i < this.end; i++){
    // Move the bullet
    this.pool[4*i] += this.pool[4*i+2];
    this.pool[4*i+1] += this.pool[4*i+3];
    // If a callback was supplied, call it
    if(callback && callback({
      x: this.pool[4*i],
      y: this.pool[4*i+1]
    })) {
      // Swap the current and last bullet if we
      // need to remove the current bullet
      this.pool[4*i] = this.pool[4*(this.end-1)];
      this.pool[4*i+1] = this.pool[4*(this.end-1)+1];
      this.pool[4*i+2] = this.pool[4*(this.end-1)+2];
      this.pool[4*i+3] = this.pool[4*(this.end-1)+3];
      // Reduce the total number of bullets by 1
      this.end--;
      // Reduce our iterator by 1 so that we update the
      // freshly swapped bullet.
      i--;
    }
  }
}

/**
 * @function render
 * Renders all bullets in our array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
BulletPool.prototype.render = function(elapsedTime, ctx) {
  // Render the bullets as a single path
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = "black";
  for(var i = 0; i < this.end; i++) {
    ctx.moveTo(this.pool[4*i], this.pool[4*i+1]);
    ctx.arc(this.pool[4*i], this.pool[4*i+1], this.bulletRadius, 0, 2*Math.PI);
  }
  ctx.fill();
  ctx.restore();
}

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
"use strict";

/* Classes and Libraries */

/* Constants */
const CANVAS_WIDTH = 1120;
const CANVAS_HEIGHT = 800;
const IMAGE_SIZE = 64;
const MS_PER_FRAME = 1000/8;

const LEFT = "left";
const RIGHT = "right";
const WALKING = "walking";
const STABBING = "stabbing";
const SWINGING = "swinging";

const WALKING_LEFT_Y = 9;                                                       // the row in orc_basic.png that the class should reference for walking left
const WALKING_RIGHT_Y = 11;                                                     // row for walking right
const STABBING_LEFT_Y = 5;                                                      // row for stabbing left
const STABBING_RIGHT_Y = 7;                                                     // row for stabbing right

const WALKING_MAX_FRAME = 8;                                                    // the number of frames in the complete walking animation
const STABBING_MAX_FRAME = 7;                                                   // the number of frames in the complete stabbing animation

const SWINGING_LEFT_Y = 13;
const SWINGING_RIGHT_Y = 15;
const SWINGING_MAX_FRAME = 5;




/**
 * @module Enemy
 * A class representing an enemy
 */
module.exports = exports = Melee;

/**
 * @constructor Enemy
 * Base class for an enemy
 * @param {object} startingPosition, object containing x and y coords
 */
function Melee(startingPosition, frameX, frameY, img, img2, tiles, height, width, hitboxDiff, type) {

  this.state = WALKING;                                                         // state
  this.position = startingPosition;                                             // position
  this.gravity = {x: 0, y: .5};                                                 // gravity that affects the melee unit
  this.velocity = {x: 0, y: 0};                                                 // the unit's x and y velocity
  this.floor = 16*35;                                                           // the tile that this unit is standing on
  this.frame = {x: frameX, y: frameY};                                          // tells where to look in orc_basic.png
  this.direction = LEFT;                                                        // direction
  this.time = 0;                                                                // elapsed time since last update
  this.img = img;                                                               // the image used to display the unit
  this.img2 = img2;                                                             // a secondary image used in displaying certain enemies
  this.tiles = tiles;                                                           // tile map used for walking on the ground
  this.height = height;                                                         // the height of the enemy
  this.width = width;                                                           // the width of the enemy
  this.hitboxDiff = hitboxDiff;                                                 // an {x,y} value saying how far off of the position the hitbox should start
  this.walkingSpeed = 1;
  this.type = type;
  if (this.type == "orc_basic") this.walkingSpeed = 2.5;
  if (this.type == "skeleton_basic") this.walkingSpeed = 1.25;
  this.feet;

}

/**
 * @function update
 * Updates the enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {object} playerPosition, object containing x and y coords
 */
Melee.prototype.update = function(elapsedTime, playerPosition, entityManager) {
    if (this.velocity.y >= 0) onFloor(this);
    if (this.position.x < -80) { this.direction = RIGHT; }
    if (this.position.x > CANVAS_WIDTH) this.direction = LEFT;
    switch (this.state) {
      // this handles the walking case
      case WALKING:
        this.time += elapsedTime;
        // walking left
        if (this.direction == LEFT) {
          this.frame.y = WALKING_LEFT_Y;
          if (this.time >= MS_PER_FRAME) { this.frame.x++; this.time = 0; }
          if (this.frame.x > WALKING_MAX_FRAME) this.frame.x = 0;
          this.velocity.x -= .1;
          if (this.velocity.x <= -this.walkingSpeed) this.velocity.x = -this.walkingSpeed;
        }
        // walking right
        else {
          this.frame.y = WALKING_RIGHT_Y;
          if (this.time >= MS_PER_FRAME) { this.frame.x++; this.time = 0; }
          if (this.frame.x > WALKING_MAX_FRAME) this.frame.x = 0;
          this.velocity.x += .1;
          if (this.velocity.x >= this.walkingSpeed) this.velocity.x = this.walkingSpeed;
        }
        break;
      // this handles the stabbing case
      case STABBING:
        this.time += elapsedTime;
        // stabbing left
        if (this.direction == LEFT) {
          this.frame.y = STABBING_LEFT_Y;
          if (this.time >= MS_PER_FRAME) { this.frame.x++; this.time = 0; }
          if (this.frame.x > STABBING_MAX_FRAME) { this.state = WALKING; this.frame.x = 0; this.frame.y = WALKING_LEFT_Y; }
          this.velocity.x = 0;
          if (this.position >= playerPosition.y + 100) {
            this.state = WALKING;
            this.frame.x = 0; }
        }
        // stabbing right
        else {
          this.frame.y = STABBING_RIGHT_Y;
          if (this.time >= MS_PER_FRAME) { this.frame.x++; this.time = 0; }
          if (this.frame.x > STABBING_MAX_FRAME) { this.state = WALKING; this.frame.x = 0; this.frame.y = WALKING_RIGHT_Y; }
          this.velocity.x = 0;
          if (this.position <= playerPosition.y + 100) {
            this.state = WALKING;
            this.frame.x = 0; }
        }
        break;
      case SWINGING:
        this.time += elapsedTime;
        // swinging left
        if (this.direction == LEFT) {
          this.frame.y = SWINGING_LEFT_Y;
          // switch frames.. might have to change images
          if (this.time >= MS_PER_FRAME) {
            this.frame.x++; this.time = 0; }
          if (this.frame.x > SWINGING_MAX_FRAME) { this.state = WALKING; this.frame.x = 0; this.frame.y = WALKING_LEFT_Y; }
          this.velocity.x = 0;
          if (this.position >= playerPosition.y + 100) {
            this.state = WALKING;
            this.frame.x = 0; }
        }
        // swinging right
        if (this.direction == RIGHT) {
          this.frame.y = SWINGING_RIGHT_Y;
          // switch frames.. might have to change images
          if (this.time >= MS_PER_FRAME) {
            this.frame.x++; this.time = 0; }
          if (this.frame.x > SWINGING_MAX_FRAME) { this.state = WALKING; this.frame.x = 0; this.frame.y = WALKING_RIGHT_Y; }
          this.velocity.x = 0;
          if (this.position <= playerPosition.y + 100) {
            this.state = WALKING;
            this.frame.x = 0; }
        }
        break;
  }

  // move the player
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  if(this.velocity.y < 14 && this.position.x > 0 && this.position.x < CANVAS_WIDTH)
  {
   this.velocity.x += this.gravity.x;
   this.velocity.y += this.gravity.y;
  }

}

/**
 * @function render
 * Renders the enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Melee.prototype.render = function(elapasedTime, ctx, drawWidth, drawHeight) {
  ctx.drawImage(this.img, IMAGE_SIZE*this.frame.x, IMAGE_SIZE*this.frame.y, IMAGE_SIZE, IMAGE_SIZE, this.position.x, this.position.y, drawWidth, drawHeight);
  //ctx.rect(this.position.x + 2.5, this.position.y + 20, 75, 60);
  //ctx.stroke();

}

// stabs
Melee.prototype.stab = function() {
  this.state = STABBING;
  this.frame.x = 0;
  this.time = 0;
}

// swings
Melee.prototype.swing = function() {
  this.state = SWINGING;
  this.frame.x = 0;
  this.time = 0;
}

function onFloor(melee) {
  if (melee.type == "orc_basic") melee.feet = 48;
  if (melee.type == "skeleton_basic") melee.feet = 42;
  if (melee.tiles.isFloor({x:melee.position.x, y:melee.position.y + melee.feet})) {
    melee.velocity.y = 0;
    melee.floor = (Math.floor((melee.position.y+32)/16) * 16) - 32;
    melee.position.y = melee.floor + (52-melee.feet);
  }
  else {
    melee.floor = CANVAS_HEIGHT - 32;
  }
}

},{}],10:[function(require,module,exports){
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
  Melee.call(this, startingPosition, 0, 9, image, image, tiles, 80, 80, {x: 10, y: 20}, "orc_basic");
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
  Melee.prototype.render.call(this, elapsedTime, ctx, 80, 80);
}

Orc.prototype.stab = function() {
  Melee.prototype.stab.call(this);
}

},{"./melee.js":9}],11:[function(require,module,exports){
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
  Melee.call(this, startingPosition, 0, 9, image, image2, tiles, 80, 80, {x: 8, y: 22}, "skeleton_basic");
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

},{"./melee.js":9}],12:[function(require,module,exports){
"use strict";

const LEFT = "left";
const RIGHT = "right";
const WALKING = "walking";
const STABBING = "stabbing";
const SWINGING = "swinging";

/**
 * @module exports the EntityManager class
 */
module.exports = exports = EntityManager;

/**
 * @constructor EntityManager
 * Creates a new entity manager object which maintains particles and enemies
 */

function EntityManager(player) {
  this.player = player;
  this.enemies = [];
  this.particles = [];
  this.collectables = [];
}

/**
 * @function addEnemy
 * Adds an enemy, all enemies has to implement update and render method
 * update method has to take elapsedTime, playerPosition, entityManager.
 * Parameter entityManager is optional, may be useful when enemy generates a particle
 * {object} enemy
 */
EntityManager.prototype.addEnemy = function(enemy) {
  this.enemies.push(enemy);
}

/**
 * @function addParticle
 * Adds a particle
 * {object} particle
 */
EntityManager.prototype.addParticle = function(particle) {
  this.particles.push(particle);
}

/**
 * @function addCollectable
 * Adds a collectable
 * {object} collectable
 */
EntityManager.prototype.addCollectable = function(collectable) {
  this.collectables.push(collectable);
}

/**
 * @function update
 * Updates all entities, removes invalid particles (TODO)
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
EntityManager.prototype.update = function(elapsedTime) {

  // Update enemies
  var self = this;
  this.enemies.forEach(function(enemy) {
    enemy.update(elapsedTime, self.player.position, self);
  });

  // Update particles
  this.particles.forEach(function(particle) {
    particle.update(elapsedTime);
  });

  meleeInteractions(this, this.player);
  collisions(this.enemies, this.player);

  // TODO update collectables
}

/**
 * @function render
 * Calls a render method on all entities,
 * all entites are being rendered into a back buffer.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 * @param {CanvasRenderingContext2D} ctx the context to render to
 */
EntityManager.prototype.render = function(elapsedTime, ctx) {
  this.enemies.forEach(function(enemy) {
    enemy.render(elapsedTime, ctx);
  });

  this.particles.forEach(function(particle) {
    particle.render(elapsedTime, ctx);
  });

  // TODO render collectables
}

function meleeInteractions(me, player) {
  me.enemies.forEach(function(enemy) {
    if (enemy.state != "idle" && enemy.position.y + 80 > player.position.y && enemy.position.y < player.position.y + 35) {
      if (enemy.direction == LEFT && enemy.position.x < player.position.x + 40
          && enemy.position.x > player.position.x && enemy.state != STABBING && enemy.state != SWINGING) {
            if (enemy.type == "orc_basic") enemy.stab();
            if (enemy.type == "skeleton_basic") enemy.swing();
          }
      if (enemy.direction == RIGHT && enemy.position.x + 80 > player.position.x
          && enemy.position.x < player.position.x && enemy.state != STABBING && enemy.state != SWINGING) {
            if (enemy.type == "orc_basic") enemy.stab();
            if (enemy.type == "skeleton_basic") enemy.swing();
          }
    }
  });
}

function collisions(enemy_array, player) {
  enemy_array.forEach(function(enemy, i) {
    var e_array = enemy_array;
    if (enemy.hitboxDiff == null) enemy.hitboxDiff = {x:0, y:34};
    if (enemy.height == null || enemy.width == null) {enemy.height = 64; enemy.width = 32;}
    if (player.position.x + player.width > enemy.position.x + enemy.hitboxDiff.x &&
        player.position.y < enemy.position.y + enemy.height &&
        player.position.x < enemy.position.x + enemy.width - enemy.hitboxDiff.x &&
        player.position.y + player.height > enemy.position.y + enemy.hitboxDiff.y) {
          if (player.position.y + player.height <= enemy.position.y + enemy.hitboxDiff.y + 10) killEnemy(i, enemy, player, e_array);
          else { player.position = {x: 0, y: 200}; console.log(player.position.y + " " + enemy.position.y + enemy.hitboxDiff.y + 10); }
        }
  })
}

function killEnemy(index, enemy, player, e_array) {
  player.velocity.y = -10; player.state = "jump"; player.time = 0;
  e_array.splice(index, 1);

}

},{}],13:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],14:[function(require,module,exports){
"use strict";

/* Classes and Libraries */

/* Constants */
const MS_PER_FRAME = 1000/8;

/**
 * @module Particle
 * A class representing a particle
 */
module.exports = exports = Particle;

/**
 * @constructor Particle
 * Base class for a particle (Arrow, Spell, etc.)
 * @param {object} startingPosition, object containing x and y coords
 * @param {object} velocity, object containing x and y coords
 * @param {Image} image, object created by calling new Image()
 * @param {int} imageSize, frame size of the original image
 * @param {int} frame, x-position of the frame in the source image
 * @param {int} frameHeight, y-position of the frame in the source image
 * @param {int} frameSize, size (width & height) of the destionation frame
 */
function Particle(startingPosition, velocity, image, imageSize, frame, frameHeight, frameSize) {
  this.position = startingPosition;
  this.velocity = velocity;
  // TODO
  this.image = image;
  this.imageSize = imageSize;
  this.frame = frame; //Frame on X-axis
  this.frameHeight = frameHeight; //Frame on Y-axis
  this.frameSize = frameSize;
  //this.time = MS_PER_FRAME;
}

/**
 * @function update
 * Updates the particle based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 */
Particle.prototype.update = function(elapsedTime) {
  //this.time -= elapsedTime;

  //if (this.time > 0) return;
  //else this.time = MS_PER_FRAME;

  // Move the particle
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
}

/**
 * @function render
 * Renders the particle in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Particle.prototype.render = function(elapasedTime, ctx) {
  // TODO
  ctx.drawImage(this.image, this.frame * this.frameSize, this.frameHeight * this.frameSize,
    this.imageSize, this.imageSize, this.position.x, this.position.y, this.frameSize, this.frameSize);
}

},{}],15:[function(require,module,exports){
"use strict";

/* Classes and Libraries */

/* Constants */
const CANVAS_WIDTH = 1120;
const CANVAS_HEIGHT = 800;
const MS_PER_FRAME = 1000/8;
const FRAME = {source_frame_width: 64,
               source_frame_height: 64,
               dest_frame_width: 32,
               dest_frame_height: 32
};

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
function Player(position, tiles) {
  this.state = "idle";
  this.position = position;
  this.velocity = {x: 0, y: 0};
  this.gravity = {x: 0, y: 1};
  this.floor = 16*35;
  // TODO
  this.img = new Image()
  this.img.src = 'assets/img/Sprite_Sheets/animations.png';
  this.frame = 1;
  this.frameHeight = 0;
  this.direction = "right";
  this.time = MS_PER_FRAME;

  this.tiles = tiles;

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

  // Check if player is standing on the floor
  onFloor.call(this);

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
  if(this.velocity.y < 10)
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
  ctx.drawImage(this.img,
                this.frame * FRAME.source_frame_width,
                this.frameHeight * FRAME.source_frame_height,
                FRAME.source_frame_width,
                FRAME.source_frame_height,
                this.position.x,
                this.position.y,
                FRAME.dest_frame_width,
                FRAME.dest_frame_height
  );
}

Player.prototype.jump = function() {
  if (this.position.y == this.floor) {
    this.time = 0;
    this.state = "jump";
    this.velocity.y = -13;
  }
}

function onFloor() {
  if(this.velocity.y >= 0) {
    // Set the sizes of the frame which is truly displayed
    var frame = {width: FRAME.dest_frame_width, height: FRAME.dest_frame_height};

    if(this.tiles.isFloor(this.position, frame)) {
      //this.velocity = {x:0,y:0};
      this.velocity.y = 0;
      this.floor = this.tiles.getFloor(this.position, frame);
    }
    else {
      this.floor = CANVAS_HEIGHT - this.frame.height;
    }
  }
}

},{}],16:[function(require,module,exports){
const TILE_SIZE = 16;


module.exports = exports = Tiles;

function Tiles() {
  this.tiles = [{solid: false, kill: false}, {solid: true, kill: false}, {solid: false, kill: false}];
  //no platforms
  //this.map1 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
  //single platform
  //this.map1 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
  //multiple platform
  this.map1 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  this.width = 70;
}

Tiles.prototype.getMap = function(){
	return this.map1;
}

Tiles.prototype.getBlocks = function(){
	return this.tiles;
}

Tiles.prototype.getWidth = function(){
	return this.width;
}

Tiles.prototype.isFloor = function(position, frame){
	var y = Math.floor((position.y+frame.height)/TILE_SIZE);
	var x = Math.floor((position.x+frame.width)/TILE_SIZE);
	var xL = Math.floor(x);
	//var xC = Math.floor(x-1);
	var xR = Math.floor(x-2);
	var LTile = this.map1[y*70 + xL];
	//var CTile = this.map1[y*70 + xC];
	var RTile = this.map1[y*70 + xR];
	var isSolidL = this.tiles[LTile-1].solid;
	//var isSolidC = this.tiles[CTile-1].solid;
	var isSolidR = this.tiles[RTile-1].solid;

	if(isSolidL) {
		return true;
	}/*
	else if(isSolidC) {
		return true;
	}*/
	else if(isSolidR) {
		return true;
	}
	else {
		return false
	}
}

// Returns the y position of the floor
Tiles.prototype.getFloor = function(position, frame) {
  return (Math.floor((position.y+frame.height)/TILE_SIZE) * TILE_SIZE) - frame.height;
}

},{}],17:[function(require,module,exports){
"use strict";

module.exports = exports = {
  add: add,
  subtract: subtract,
  rotate: rotate,
  dotProduct: dotProduct,
  magnitude: magnitude,
  normalize: normalize,
  perpendicular: perpendicular,
  findAxes: findAxes,
  project: project
}

/**
 * Stands for matrix multiplication  {x,y} * {{cos phi, -sin phi}, {sin phi, cos phi}}
 */
function add(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  }
}

function subtract(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  }
}

function rotate(a, angle) {
  return {
    x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
    y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
  }
}

function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y;
}

function magnitude(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

function normalize(a) {
  var mag = magnitude(a);
  return {
    x: a.x / mag,
    y: a.y / mag
  };
}

function perpendicular(a) {
  return {
    x: -a.y,
    y: a.x
  }
}

function findAxes(shape) {
  var axes = [];
  shape.vertices.forEach(function(p1, i){
    // find the adjacent vertex
    var p2 = (shape.vertices.length == i+1) ? shape.vertices[0] : shape.vertices[i+1];
    var edge = subtract(p2, p1);
    var perp = perpendicular(edge);
    var normal = normalize(perp);
    axes.push(normal);
  });
  return axes;
}

function project(shape, axis){
  var min = dotProduct(shape.vertices[0], axis);
  var max = min;
  for(var i = 1; i < shape.vertices.length; i++){
    var p = dotProduct(shape.vertices[i], axis);
    if(p < min) min = p;
    else if(p > max) max = p;
  }
  return {min: min, max: max};
}

},{}]},{},[1]);
