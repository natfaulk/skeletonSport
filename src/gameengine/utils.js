function dist(_p1, _p2) {
  return Math.hypot(_p1.x - _p2.x, _p1.y - _p2.y)
}

function newPt(_x = 0, _y = 0) {
  return {x:_x,y:_y}
}

module.exports = {
  dist,
  newPt
}
