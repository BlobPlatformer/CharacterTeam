"use strict";

const LEFT = "left";
const RIGHT = "right";
const WALKING = "walking";
const STABBING = "stabbing";
const SWINGING = "swinging";

const Smoke = require('./smoke.js');

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
  this.smokes = [];
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

// Add a smoke particle to the entityManager
EntityManager.prototype.addSmoke = function(smoke) {
  this.smokes.push(smoke);
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

  var removePart = [];
  var array = this.smokes;
  // Update smoke particles
  this.smokes.forEach(function(smoke, i) {
    smoke.update(elapsedTime);
    if (smoke.scale == 0) { removePart.unshift(i); }
  });
  var s = this.smokes;
  removePart.forEach(function(i) {
    s.splice(i, 1);
  })

  meleeInteractions(this, this.player);
  collisions.call(this);

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

  this.smokes.forEach(function(smoke) {
    smoke.render(elapsedTime, ctx);
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

function collisions() {
  var self = this;
  var player = this.player;
  this.enemies.forEach(function(enemy, i) {
    var e_array = self.enemies;
    var s_array = self.smokes;
    if (enemy.hitboxDiff == null) enemy.hitboxDiff = {x:0, y:15};
    if (enemy.height == null || enemy.width == null) {enemy.height = 64; enemy.width = 32;}
    if (player.position.x + player.width > enemy.position.x + enemy.hitboxDiff.x &&
        player.position.y < enemy.position.y + enemy.height &&
        player.position.x < enemy.position.x + enemy.width - enemy.hitboxDiff.x &&
        player.position.y + player.height > enemy.position.y + enemy.hitboxDiff.y) {
          if (player.position.y + player.height <= enemy.position.y + enemy.hitboxDiff.y + 10) {
            player.velocity.y = -10; player.state = "jump"; player.time = 0;
            if (enemy.life == null) enemy.life = 1;
            enemy.life--;
            if (enemy.life == 0) {
              killEnemy.call(self, i, enemy); }
            }
          else { player.position = {x: 0, y: 200};  }
        }
  })
}

function killEnemy(index, enemy) {
  var e_array = this.enemies;
  var s_array = this.smokes;
  var player = this.player;
  var pos = {x: enemy.position.x + enemy.width/2, y: enemy.position.y + enemy.hitboxDiff.y};
  smoke.call(this, pos, "Red");
  //smoke.call(this, pos, "OrangeRed");
  e_array.splice(index, 1);

}

// creates an explosion at a given position with a given color
// still referencing http://www.gameplaypassion.com/blog/explosion-effect-html5-canvas/ heavily
function smoke(position, color)
{
  var s_array = this.smokes;
  var minSize = 5;
  var maxSize = 20;
  var count = 12;
  var minSpeed = 60;
  var maxSpeed = 200;
  var minScaleSpeed = 1;
  var maxScaleSpeed = 4;
  var radius;
  var position = position;

  for (var angle = 0; angle < 360; angle+=Math.round(360/count))
  {
    radius = minSize + Math.random()*(maxSize-minSize);
    var smoke = new Smoke(position, radius, color);
    smoke.scaleSpeed = minScaleSpeed + Math.random()*(maxScaleSpeed-minScaleSpeed);
    var speed = minSpeed + Math.random()*(maxSpeed-minSpeed);
    smoke.velocityX = speed * Math.cos(angle * Math.PI / 180);
    smoke.velocityY = speed * Math.sin(angle * Math.PI / 180);
    s_array.push(smoke);

  }
}
