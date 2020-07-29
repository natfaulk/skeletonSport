const Mindrawing = require('mindrawingjs')
const World = require('./world')
const Utils = require('./utils')
const Fps = require('./fps')
const Drawposes = require('./drawPoses')

const logger = require('@natfaulk/supersimplelogger')('Game Engine')

;(()=>{
  logger('Process started')
  let displayCanvas = null
  let sceneCanvas = null
  let collisionCanvas = null
  let ball = null
  let CANVAS_SIZE = null
  
  let poses = []

  onmessage = _msg => {
    let canvas = _msg.data.canvas
    
    if (canvas !== undefined) {
      displayCanvas = new Mindrawing()
      displayCanvas.setup(canvas)
      displayCanvas.background('black')

      CANVAS_SIZE = Utils.newPt(displayCanvas.width, displayCanvas.height)
      sceneCanvas = World.genScene(CANVAS_SIZE)

      collisionCanvas = new Mindrawing()
      collisionCanvas.setup(new OffscreenCanvas(CANVAS_SIZE.x, CANVAS_SIZE.y))

      ball = new World.Ball(CANVAS_SIZE.x/4, CANVAS_SIZE.y/2, CANVAS_SIZE)
      
      requestAnimationFrame(draw)
    }

    if (_msg.data.poses != undefined) {
      poses = _msg.data.poses
      logger('got poses')
    }
  }
  
  let prevFrame = null
  let lastTime = null

  let draw = _time => {
    // on first run through time and last time can be rather crazy values
    if (_time && lastTime) {
      if (
        displayCanvas !== null
        && sceneCanvas !== null
        // could check for ball and canvas size not == null also
      ) {
        collisionCanvas.background('black')
        collisionCanvas.ctx.drawImage(sceneCanvas.c, 0 ,0)
        collisionCanvas.fill('red')
        collisionCanvas.stroke('red')
        // collisionCanvas.rect(Math.random()*CANVAS_SIZE.x, Math.random()*CANVAS_SIZE.y, 50, 50)
        Drawposes(collisionCanvas, poses)

        ball.tick((_time-lastTime)/1000, collisionCanvas, (prevFrame!==null)?prevFrame.data:null)
        prevFrame = collisionCanvas.ctx.getImageData(0, 0, CANVAS_SIZE.x, CANVAS_SIZE.y)
        
        displayCanvas.ctx.drawImage(collisionCanvas.c, 0, 0)
        ball.draw(displayCanvas)  
      }
  
      Fps.lastFrame(_time-lastTime)
      // logger(`FPS: ${1000/(_time-lastTime)}`)
      
      // postMessage('stat end')
    }
    // postMessage('stat start')
    
    
    lastTime = _time
    requestAnimationFrame(draw)
  }

  setInterval(() => {
    logger(`FPS: ${Fps.get()}`)
  }, 1000)
})()
