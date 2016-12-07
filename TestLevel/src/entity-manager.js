"use strict";

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
  collisions(this, this.player);
  
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
          && enemy.position.x > player.position.x && enemy.state != STABBING) {
            enemy.stab();
          }
      if (enemy.direction == RIGHT && enemy.position.x + 80 > player.position.x
          && enemy.position.x < player.position.x && enemy.state != STABBING) {
            enemy.stab();
          }
    }
  });
}

function collisions(me, player) {
  me.enemies.forEach(function(enemy, i) {
    if (player.position.x + 32 > enemy.position.x + 5 &&
        player.position.y < enemy.position.y + 80 &&
        player.position.x < enemy.position.x + 75 &&
        player.position.y + 32 > enemy.position.y + 20) {
          console.log(player.position.x + " " + player.position.y + " // " + enemy.position.x + " " + enemy.position.y);
          if (player.position.y + 32 <= enemy.position.y + 25) me.enemies.splice(i, 1);
          else { me.player.state = "DEAD"; me.player.velocity = {x: 0, y: 0};
                 me.player.gravity = {x: 0, y: 0}; me.player.position = {x: -100, y: 100}; }
        }
  })
}
