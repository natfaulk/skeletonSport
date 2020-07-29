const logger = require('@natfaulk/supersimplelogger')('Fps')

let fps = 60
let AV_FACTOR = 0.9

let lastFrame = _time => {
  fps = fps*AV_FACTOR + (1-AV_FACTOR)*(1000/_time)
}

let get = () => {
  return fps
}

module.exports = {
  lastFrame,
  get
}

