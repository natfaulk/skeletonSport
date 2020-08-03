const Mindrawing = require('mindrawingjs')
const Utils = require('./utils')

const logger = require('@natfaulk/supersimplelogger')('World')

const WALL_THICKNESS = 50
const FLOOR_ANGLE = 5 // degrees
const BALL_SIZE = 80
const GOAL_HEIGHT = 2*BALL_SIZE
const RESITUTION = 0.8
const GRAVITY = 1000

const PIXEL_LUT = genPixelLUT(BALL_SIZE)

const genScene = _canvasSize => {
  logger('Generating scene...')
  let offscreen = new OffscreenCanvas(_canvasSize.x, _canvasSize.y)
  let out = new Mindrawing()
  out.setup(offscreen)
  
  out.fill('red')
  out.stroke('red')
  
  // roof
  out.rect(0, 0,_canvasSize.x, WALL_THICKNESS)
    
  // floor
  out.rect(0, _canvasSize.y-WALL_THICKNESS,_canvasSize.x, WALL_THICKNESS)
  let angRads = Math.PI*FLOOR_ANGLE/180
  let heightOffset = Math.tan(angRads)*_canvasSize.x/2
  out.rotatedRect(0, _canvasSize.y-(WALL_THICKNESS + heightOffset),_canvasSize.x*1.1,1.5*WALL_THICKNESS,angRads)
  out.rotatedRect(0, _canvasSize.y-(WALL_THICKNESS - heightOffset),_canvasSize.x*1.1,1.5*WALL_THICKNESS,-angRads)

  // walls
  out.rect(0, 0,WALL_THICKNESS, _canvasSize.y-(WALL_THICKNESS + heightOffset + GOAL_HEIGHT))
  out.rect(_canvasSize.x-WALL_THICKNESS, 0,WALL_THICKNESS, _canvasSize.y-(WALL_THICKNESS + heightOffset + GOAL_HEIGHT))

  return out
}

class Ball {
  constructor(_x, _y, _canvasSize) {
    this.x = _x
    this.y = _y
    this.vel = Utils.newPt()
    this.canvasSize = _canvasSize

    this.size = BALL_SIZE
  }

  reset(_x, _y) {
    if (_x === undefined || _y === undefined) {
      this.x = this.canvasSize.x/2
      this.y = this.canvasSize.y/2
    } else {
      this.x = _x
      this.y = _y
    }
    this.vel = Utils.newPt()
  }

  tick(_dt, _canvas, _prevImData) {
    let imData = _canvas.ctx.getImageData(
      Math.round(this.x-this.size/2),
      Math.round(this.y-this.size/2),
      this.size,
      this.size
    )

    this.vel.y += _dt*GRAVITY

    let com = Utils.newPt()
    let count = 0
    let velCom = Utils.newPt()
    let velCount = 0
    for (let i = 0; i < imData.width*imData.height;++i) {
      if (imData.data[i*4] === 255) {
        let xpos = i%imData.width
        let ypos = Math.floor(i/imData.height)
        if (PIXEL_LUT[i]) {
          com.x += xpos
          com.y += ypos
          ++count
          
          if (_prevImData!==null) {
            let prevVal = _prevImData[
              Math.round(xpos+this.x-this.size/2)*4 + 
              Math.round(ypos+this.y-this.size/2)*this.canvasSize.x*4
            ]
            let currVal = imData.data[i*4]
            if (currVal - prevVal != 0) {
              velCom.x += xpos
              velCom.y += ypos
              ++velCount
            }
          }
        }
      }
    }
    
    if(count > 0) {
      com.x /= count
      com.y /= count
      com.x -= this.size/2
      com.y -= this.size/2

      let norm = Math.hypot(com.x, com.y)
      com.x/=norm
      com.y/=norm

      // r = d - 2(d.n)n
      let d_dot_n = this.vel.x*com.x+this.vel.y*com.y
      
      // only reflect if facing in opposite directions
      // else if it tunnels it gets stuck
      if (d_dot_n > 0) {
        let r=Utils.newPt()
        r.x = (this.vel.x - 2*d_dot_n*com.x)*RESITUTION
        r.y = (this.vel.y - 2*d_dot_n*com.y)*RESITUTION
        this.vel = r
      }

      if(velCount>0) {
        velCom.x /= velCount
        velCom.y /= velCount
        velCom.x -= this.size/2
        velCom.y -= this.size/2

        let norm2 = Math.hypot(velCom.x, velCom.y)
        velCom.x/=norm2
        velCom.y/=norm2

        // facing wrong direction
        this.vel.x-=velCom.x*velCount
        this.vel.y-=velCom.y*velCount
      }
    }

    this.x += _dt*this.vel.x
    this.y += _dt*this.vel.y

    // if (this.x < 0) {
    //   this.vel.x*=-1
    //   this.x = 0
    // } else if (this.x > this.canvasSize.x) {
    //   this.vel.x*=-1
    //   this.x = this.canvasSize.x
    // }

    if (this.y < 0) {
      this.vel.y*=-1
      this.y = 0
    } else if (this.y > this.canvasSize.y) {
      this.vel.y*=-1
      this.y = this.canvasSize.y
    }
  }

  draw(_canvas) {
    _canvas.stroke('blue')
    _canvas.fill('blue')
    _canvas.ellipse(this.x, this.y, this.size)

    // let norm = Math.hypot(this.vel.x, this.vel.y)
    // _canvas.stroke('green')
    // _canvas.strokeWeight(5)
    // _canvas.line(
    //   this.x,
    //   this.y,
    //   this.x+(this.size/2)*this.vel.x/norm,
    //   this.y+(this.size/2)*this.vel.y/norm
    // )
    // _canvas.strokeWeight(1)
  }
}

function genPixelLUT(_size) {
  let LUT = []

  for (let i = 0; i < _size*_size; ++i) {
    let xpos = i%_size
    let ypos = Math.floor(i/_size)
    LUT.push(Utils.dist(
      Utils.newPt(xpos, ypos),
      Utils.newPt(_size/2,_size/2)
    ) < _size / 2)
  }

  logger(LUT)
  return LUT
}

module.exports = {
  genScene,
  Ball
}
