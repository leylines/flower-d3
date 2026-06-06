import { select, timer as d3Timer, easeCubic } from 'd3';
import {
  phyllotaxisLayout,
  createPoints,
  flowerLayout,
  treeLayout,
  metaLayout,
} from './common';
import { createGUI } from './gui';

const LOGICAL_SIZE = 600;
const pointWidth = 2;
const pointMargin = 2;

const config = {
  numPoints: 64000,
  duration: 8000,
  bgBlack: true,
  seqTree: true,
  seqFlower: true,
  seqMeta: true,
  seqPhyllotaxis: true,
};

// --- Static geometry ---
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

var tree_radius  = (LOGICAL_SIZE / 30);
var tree_circles = [76,60,56,92,96,112,4,24,20,148];

var meta_circles = [76,76,60,44,56,36,92,108,96,116,112,148,40,4];

// --- Layout wrappers ---
const layoutMap = {
  tree: (pts) => treeLayout(pts, pointWidth + pointMargin, LOGICAL_SIZE, LOGICAL_SIZE, matrix, tree_circles, tree_radius),
  flower: (pts) => flowerLayout(pts, pointWidth + pointMargin, LOGICAL_SIZE, LOGICAL_SIZE, matrix, flower_f, radius),
  meta: (pts) => metaLayout(pts, pointWidth + pointMargin, LOGICAL_SIZE, LOGICAL_SIZE, matrix, meta_circles, radius),
  phyllotaxis: (pts) => phyllotaxisLayout(pts, pointWidth + pointMargin, LOGICAL_SIZE / 2, LOGICAL_SIZE / 2),
};

// --- Mutable state ---
let points;
let layouts = [];
let currLayout = 0;
let timer = null;
let isPlaying = false;

const container = select('#container');

// --- Canvas helpers ---
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

// --- Layout sequence builder ---
function buildLayouts() {
  const enabled = [];
  if (config.seqTree) enabled.push('tree');
  if (config.seqFlower) enabled.push('flower');
  if (config.seqMeta) enabled.push('meta');

  if (enabled.length === 0) {
    layouts = [layoutMap.phyllotaxis];
    return;
  }

  if (!config.seqPhyllotaxis || enabled.length === 1) {
    layouts = enabled.map(n => layoutMap[n]);
    return;
  }

  layouts = [];
  enabled.forEach((name, i) => {
    layouts.push(layoutMap[name]);
    if (i < enabled.length - 1) {
      layouts.push(layoutMap.phyllotaxis);
    }
  });
}

// --- Animation ---
function animate(layout) {
  points.forEach(p => { p.sx = p.x; p.sy = p.y; });
  layout(points);
  points.forEach(p => { p.tx = p.x; p.ty = p.y; });

  timer = d3Timer((elapsed) => {
    const t = Math.min(1, easeCubic(elapsed / config.duration));
    points.forEach(p => {
      p.x = p.sx * (1 - t) + p.tx * t;
      p.y = p.sy * (1 - t) + p.ty * t;
    });
    draw();
    if (t === 1) {
      timer.stop();
      currLayout = (currLayout + 1) % layouts.length;
      animate(layouts[currLayout]);
    }
  });
}

function startAnimation() {
  isPlaying = true;
  select('.play-control').style('display', 'none');
  animate(layouts[currLayout]);
}

function stopAnimation() {
  isPlaying = false;
  if (timer) { timer.stop(); timer = null; }
}

function showPlayButton() {
  select('.play-control').style('display', '');
}

function hidePlayButton() {
  select('.play-control').style('display', 'none');
}

// --- Reconfiguration ---
function recreateAll() {
  stopAnimation();
  currLayout = 0;
  points = createPoints(config.numPoints, pointWidth, LOGICAL_SIZE, LOGICAL_SIZE);
  buildLayouts();
  layoutMap.phyllotaxis(points);
  draw();
}

function applyBackground(bgBlack) {
  document.body.style.background = bgBlack ? '#000' : '#fff';
}

// --- Create canvas ---
const canvas = container.append('canvas')
  .on('click', function () {
    if (isPlaying) {
      stopAnimation();
      showPlayButton();
    }
  });

resizeCanvas();

// --- Initial state ---
points = createPoints(config.numPoints, pointWidth, LOGICAL_SIZE, LOGICAL_SIZE);
buildLayouts();
layoutMap.phyllotaxis(points);
draw();

// --- Play button ---
container.append('div')
  .attr('class', 'play-control')
  .text('PLAY')
  .on('click', function () {
    if (!isPlaying) startAnimation();
  });

// --- GUI ---
createGUI(config, {
  onNumPoints() {
    const was = isPlaying;
    recreateAll();
    hidePlayButton();
    if (was) startAnimation(); else showPlayButton();
  },
  onDuration() {},
  onBg(v) { applyBackground(v); },
  onSequence() {
    const was = isPlaying;
    stopAnimation();
    currLayout = 0;
    buildLayouts();
    layoutMap.phyllotaxis(points);
    draw();
    hidePlayButton();
    if (was) startAnimation(); else showPlayButton();
  },
});

// --- Window resize ---
window.addEventListener('resize', () => {
  resizeCanvas();
  draw();
});
