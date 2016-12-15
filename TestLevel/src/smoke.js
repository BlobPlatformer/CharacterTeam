"use strict"

module.exports = exports = Smoke;

// based heavily on code from a helpful site --
// http://www.gameplaypassion.com/blog/explosion-effect-html5-canvas/
function Smoke (p, r, c)
{
  this.scale = 1.0;
  this.position = {
    x: p.x,
    y: p.y
  };
  this.radius = r;
  this.color = c;
  this.velocityX = 0;
  this.velocityXY = 0;
  this.scaleSpeed = 0.5;
  console.log("Creating Smoke at " + this.position.x + " " + this.position.y );
}

Smoke.prototype.update = function(time)
{
  //shrink
  this.scale -= this.scaleSpeed * time / 1000;

  if (this.scale <= 0) { this.scale = 0; }

  //exploding
  this.position.x += this.velocityX * time/1000;
  this.position.y += this.velocityY * time/1000;
}

Smoke.prototype.render = function(time, ctx)
{
  console.log("Rendering smoke");
  // translating ctx to the particle coords
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.scale(this.scale, this.scale);

  ctx.rect(this.position.x, this.position.y, 50, 50);
  //drawing circles
  ctx.beginPath();
  ctx.arc(0,0, this.radius, 0, Math.PI*2, true);
  ctx.closePath();

  ctx.fillStyle = this.color;
  ctx.fill();

  ctx.restore();
}
