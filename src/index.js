import { select, timer as d3Timer, easeCubic } from 'd3';
import {
  phyllotaxisLayout,
  createPoints,
  flowerLayout,
  treeLayout,
  metaLayout,
} from './common';

const LOGICAL_SIZE = 600;

const numPoints = 64000;
const pointWidth = 2;
const pointMargin = 2;

const duration = 8000;
const ease = easeCubic;
let timer;
let currLayout = 0;

const points = createPoints(numPoints, pointWidth, LOGICAL_SIZE, LOGICAL_SIZE);

var flower_f = [
  76,
  68,58,66,84,94,86,
  78,60,50,40,48,56,74,92,102,112,104,96,
  70,52,42,32,22,30,38,46,64,82,100,110,120,130,122,114,106,88,
  80,62,44,34,24,14,4,12,20,28,36,54,72,90,108,118,128,138,148,140,132,124,116,98
];

var radius  = (LOGICAL_SIZE / 10) - 0.4 * pointWidth;

var gridXOffset = Math.sqrt(Math.pow(radius,2) - (Math.pow((radius /2),2)));
var gridYOffset = radius / 2.0;

var matrix = []
for (var k=1.0; k<18.0; k++) {
  for (var j=1.0; j<10.0; j++) {
     var x = j * (gridXOffset);
     var y = k * (gridYOffset);
     matrix.push([x,y])
  }
}

var flower_1 = flower_f.slice(0, 1);
var flower_2 = flower_f.slice(0, 7);
var flower_3 = flower_f.slice(0, 19);
var flower_4 = flower_f.slice(0, 37);

var tree_radius  = (LOGICAL_SIZE / 30);
var tree_circles = [
  76,60,56,92,96,112,4,24,20,148
];

var meta_circles = [
  76,76,60,44,56,36,92,108,96,116,112,148,40,4
];

const toFlower_f = (points) => flowerLayout(points, pointWidth + pointMargin, LOGICAL_SIZE, LOGICAL_SIZE, matrix, flower_f, radius);
const toFlower_1 = (points) => flowerLayout(points, pointWidth + pointMargin, LOGICAL_SIZE, LOGICAL_SIZE, matrix, flower_1, radius);
const toFlower_2 = (points) => flowerLayout(points, pointWidth + pointMargin, LOGICAL_SIZE, LOGICAL_SIZE, matrix, flower_2, radius);
const toFlower_3 = (points) => flowerLayout(points, pointWidth + pointMargin, LOGICAL_SIZE, LOGICAL_SIZE, matrix, flower_3, radius);
const toFlower_4 = (points) => flowerLayout(points, pointWidth + pointMargin, LOGICAL_SIZE, LOGICAL_SIZE, matrix, flower_4, radius);

const toTree = (points) => treeLayout(points, pointWidth + pointMargin, LOGICAL_SIZE, LOGICAL_SIZE, matrix, tree_circles, tree_radius);
const toMeta = (points) => metaLayout(points, pointWidth + pointMargin, LOGICAL_SIZE, LOGICAL_SIZE, matrix, meta_circles, radius);
const toPhyllotaxis = (points) => phyllotaxisLayout(points, pointWidth + pointMargin, LOGICAL_SIZE / 2, LOGICAL_SIZE / 2);

const layouts = [toTree, toPhyllotaxis, toFlower_f, toPhyllotaxis, toMeta];

const container = select('#container');

function getCanvasDisplaySize() {
  return Math.floor(window.innerHeight > window.innerWidth
    ? window.innerWidth
    : window.innerHeight);
}

function resizeCanvas() {
  const size = getCanvasDisplaySize();
  const dpr = window.devicePixelRatio || 1;

  canvas
    .attr('width', LOGICAL_SIZE * dpr)
    .attr('height', LOGICAL_SIZE * dpr)
    .style('width', size + 'px')
    .style('height', size + 'px');

  canvas.node().getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw() {
  const ctx = canvas.node().getContext('2d');
  ctx.save();
  ctx.clearRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);

  for (let i = 0; i < points.length; ++i) {
    const point = points[i];
    ctx.fillStyle = point.color;
    ctx.fillRect(point.x, point.y, pointWidth, pointWidth);
  }

  ctx.restore();
}

function animate(layout) {
  points.forEach(point => {
    point.sx = point.x;
    point.sy = point.y;
  });

  layout(points);

  points.forEach(point => {
    point.tx = point.x;
    point.ty = point.y;
  });

  timer = d3Timer((elapsed) => {
    const t = Math.min(1, ease(elapsed / duration));

    points.forEach(point => {
      point.x = point.sx * (1 - t) + point.tx * t;
      point.y = point.sy * (1 - t) + point.ty * t;
    });

    draw();

    if (t === 1) {
      timer.stop();
      currLayout = (currLayout + 1) % layouts.length;
      animate(layouts[currLayout]);
    }
  });
}

const canvas = container.append('canvas')
  .on('click', function () {
    select('.play-control').style('display', '');
    if (timer) timer.stop();
  });

resizeCanvas();

toPhyllotaxis(points);
draw();

container.append('div')
  .attr('class', 'play-control')
  .text('PLAY')
  .on('click', function () {
    animate(layouts[currLayout]);
    select(this).style('display', 'none');
  });

window.addEventListener('resize', () => {
  resizeCanvas();
  draw();
});
