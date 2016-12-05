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
