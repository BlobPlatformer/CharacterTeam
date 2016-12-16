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
entityManager.addBird(bird);
entityManager.addEnemy(orc);
entityManager.addEnemy(skelly);
entityManager.addEnemy(diver);

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
