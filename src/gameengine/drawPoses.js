const logger = require('@natfaulk/supersimplelogger')('Draw poses')
const Utils = require('./utils')

const color = 'red'
const lineWidth = 20

function drawSkeleton(adjacentKeyPoints, ctx, scale = 1) {
  // const adjacentKeyPoints =
  //     posenet.getAdjacentKeyPoints(keypoints, minConfidence);

  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(
        toTuple(keypoints[0].position), toTuple(keypoints[1].position), color,
        scale, ctx);
  })
}

const HEAD_PARTS = [
  'nose',
  'leftEye',
  'rightEye',
  'leftEar',
  'rightEar'
]

let drawHead = (_kps, ctx) => {
  let headPts = []

  _kps.forEach(_point => {
    if (HEAD_PARTS.includes(_point.part)) headPts.push(_point.position)
  })

  if (headPts.length < 2) return

  let centre = Utils.newPt()

  headPts.forEach(_pt => {
    centre.x += _pt.x
    centre.y += _pt.y
  })

  centre.x /= headPts.length
  centre.y /= headPts.length

  let maxDist = 0
  headPts.forEach(_pt => {
    let dist = Utils.dist(centre, _pt)
    if (dist > maxDist) maxDist = dist
  })
  
  ctx.beginPath()
  ctx.arc(centre.x, centre.y, maxDist, 0, 2 * Math.PI)
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = color
  ctx.stroke()
}

/**
 * Draw pose keypoints onto a canvas
 */
function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const {y, x} = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 3, color);
  }
}

function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function toTuple({y, x}) {
  return [y, x];
}

let drawAll = (_canvas, _poses) => {
  _poses.forEach(_pose => {
    drawSkeleton(_pose.adjKps, _canvas.ctx)
    drawKeypoints(_pose.kps, 0.1, _canvas.ctx)
    drawHead(_pose.kps, _canvas.ctx)
  })
}

module.exports = drawAll
