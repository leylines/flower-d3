import { scaleSequential, interpolateRainbow, range, scaleLinear } from 'd3';

export function phyllotaxisLayout(points, pointWidth, xOffset = 0, yOffset = 0, iOffset = 0) {
  const theta = Math.PI * (3 - Math.sqrt(5));
  const maxR = Math.min(xOffset, yOffset) - pointWidth;
  const pointRadius = maxR / Math.sqrt(points.length - 1);

  points.forEach((point, i) => {
    const index = (i + iOffset) % points.length;
    const phylloX = pointRadius * Math.sqrt(index) * Math.cos(index * theta);
    const phylloY = pointRadius * Math.sqrt(index) * Math.sin(index * theta);
    point.x = xOffset + phylloX - pointRadius;
    point.y = yOffset + phylloY - pointRadius;
  });

  return points;
}

export function randomLayout(points, pointWidth, width, height) {
  points.forEach((point, i) => {
    point.x = Math.random() * (width - pointWidth);
    point.y = Math.random() * (height - pointWidth);
  });
  return points;
}

export function createPoints(numPoints, pointWidth, width, height) {
  const colorScale = scaleSequential(interpolateRainbow)
    .domain([numPoints - 1, 0]);

  const points = range(numPoints).map(id => ({
    id,
    color: colorScale(id),
  }));

  return randomLayout(points, pointWidth, width, height);
}

export function flowerLayout(points, pointWidth, width, height, matrix, symbol, radius) {
  const periods = 64;
  const sSize = Math.ceil((points.length - 1) / periods);

  const thetaScale = scaleLinear()
    .domain([0, points.length - 1])
    .range([0, periods * 2 * Math.PI]);

  var sCount = 0;
  var xOffset = 42;
  var yOffset = 32;

  symbol.map(function(m) {
    var end = Math.min((sCount + 1) * sSize, points.length);
    for (var i = sCount * sSize; i < end; i++) {
      points[i].x = radius * Math.cos(thetaScale(i)) + xOffset + matrix[m][0];
      points[i].y = radius * Math.sin(thetaScale(i)) + yOffset + matrix[m][1];
    }
    sCount++;
  });

  xOffset = width / 2;
  yOffset = height / 2;
  radius  = (height / 2) - 0.5 * pointWidth;

  var end = Math.min((sCount + 3) * sSize, points.length);
  for (var i = sCount * sSize; i < end; i++) {
    points[i].x = radius * Math.cos(thetaScale(i)) + xOffset;
    points[i].y = radius * Math.sin(thetaScale(i)) + yOffset;
  }
  sCount = sCount + 3;

  return points;
}

export function treeLayout(points, pointWidth, width, height, matrix, symbol, radius) {
  const periods = 64;
  const sSize = Math.ceil((points.length - 1) / periods);

  const thetaScale = scaleLinear()
    .domain([0, points.length - 1])
    .range([0, periods * 2 * Math.PI]);

  var sCount = 0;
  var xOffset = 42;
  var yOffset = 32;

  symbol.map(function(m) {
    var end = Math.min((sCount + 2) * sSize, points.length);
    for (var i = sCount * sSize; i < end; i++) {
      points[i].x = radius * Math.cos(thetaScale(i)) + xOffset + matrix[m][0];
      points[i].y = radius * Math.sin(thetaScale(i)) + yOffset + matrix[m][1];
    }
    sCount = sCount + 2;
  });

  var lines = [
    [4,20],[4,24],[20,24],
    [20,56],[24,60],[56,60],
    [4,76],[20,76],[24,76],
    [56,76],[60,76],[56,92],
    [60,96],[92,76],[96,76],
    [92,96],[76,112],[92,112],
    [96,112],[92,148],[96,148],
    [112,148]
  ];

  lines.map(function(m) {
    var width  = matrix[m[1]][0] - matrix[m[0]][0];
    var height = matrix[m[1]][1] - matrix[m[0]][1];

    var xScale = scaleLinear()
      .domain([0, 2 * sSize - 1])
      .range([0, width]);
    var yScale = scaleLinear()
      .domain([0, 2 * sSize - 1])
      .range([0, height]);

    var j = 0;
    var end = Math.min((sCount + 2) * sSize, points.length);
    for (var i = sCount * sSize; i < end; i++) {
      points[i].x = matrix[m[0]][0] + xScale(j) + xOffset;
      points[i].y = matrix[m[0]][1] + yScale(j) + yOffset;
      j++;
    }
    sCount = sCount + 2;
  });

  return points;
}

export function metaLayout(points, pointWidth, width, height, matrix, symbol, radius) {
  const periods = 64;
  const sSize = Math.ceil((points.length - 1) / periods);

  const thetaScale = scaleLinear()
    .domain([0, points.length - 1])
    .range([0, periods * 2 * Math.PI]);

  var sCount = 0;
  var xOffset = 42;
  var yOffset = 32;

  symbol.map(function(m) {
    var end = Math.min((sCount + 1) * sSize, points.length);
    for (var i = sCount * sSize; i < end; i++) {
      points[i].x = radius * Math.cos(thetaScale(i)) + xOffset + matrix[m][0];
      points[i].y = radius * Math.sin(thetaScale(i)) + yOffset + matrix[m][1];
    }
    sCount = sCount + 1;
  });

  xOffset = width / 2;
  yOffset = height / 2;
  radius  = (height / 2) - 0.5 * pointWidth;

  var end = Math.min((sCount + 6) * sSize, points.length);
  for (var i = sCount * sSize; i < end; i++) {
    points[i].x = radius * Math.cos(thetaScale(i)) + xOffset;
    points[i].y = radius * Math.sin(thetaScale(i)) + yOffset;
  }
  sCount = sCount + 6;

  var xOffset = 42;
  var yOffset = 32;

  var lines = [
    [4,20],[20,36],
    [4,24],[24,44],
    [36,40],[40,44],
    [36,72],[72,108],
    [44,80],[80,116],
    [56,60],[92,96],
    [4,92],[4,96],
    [36,112],[36,148],
    [44,112],[44,148],
    [36,60],[36,76],
    [44,56],[44,76],
    [56,112],[40,92],
    [60,112],[40,96],
    [108,96],[108,76],
    [116,92],[116,76],
    [108,112],[112,116],
    [4,76],[76,148],
    [108,4],[108,40],
    [116,4],[116,40],
    [108,148],[56,148],
    [116,148],[60,148],
    [56,92],[60,96]
  ];

  lines.map(function(m) {
    var width  = matrix[m[1]][0] - matrix[m[0]][0];
    var height = matrix[m[1]][1] - matrix[m[0]][1];

    var xScale = scaleLinear()
      .domain([0, sSize - 1])
      .range([0, width]);
    var yScale = scaleLinear()
      .domain([0, sSize - 1])
      .range([0, height]);

    var j = 0;
    var end = Math.min((sCount + 1) * sSize, points.length);
    for (var i = sCount * sSize; i < end; i++) {
      points[i].x = matrix[m[0]][0] + xScale(j) + xOffset;
      points[i].y = matrix[m[0]][1] + yScale(j) + yOffset;
      j++;
    }
    sCount = sCount + 1;
  });

  return points;
}
