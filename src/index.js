const tf = require('@tensorflow/tfjs-node')
const posenet = require('@tensorflow-models/posenet')

const logger = require('@natfaulk/supersimplelogger')('Index')

const VIDEO_SIZE = {
  x: 1280,
  y: 720
}

;(async ()=>{
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    logger('Browser API navigator.mediaDevices.getUserMedia not available')
    return
  }
 
  const video = document.getElementById('video')
  video.width = VIDEO_SIZE.x
  video.height = VIDEO_SIZE.y

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        width: VIDEO_SIZE.x,
        height: VIDEO_SIZE.y,
      },
    })
    video.srcObject = stream
    video.play()
  } catch (_err) {
    if (_err.name === 'NotFoundError') logger('No camera attached!')
    else throw(_err)
  }

  const net = await posenet.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: { width: 320, height: 240 },
    multiplier: 0.75
  })

  let lastTime = Date.now()
  logger('Video loaded')
  
  const canvas = document.getElementById('display')
  // const ctx = canvas.getContext('2d')
  canvas.width = VIDEO_SIZE.x
  canvas.height = VIDEO_SIZE.y

  const worker = new Worker('../src/gameengine/engine.js')
  const offscreen = canvas.transferControlToOffscreen()
  worker.postMessage({
    canvas: offscreen
  }, [offscreen])

  async function draw() {
    // ctx.drawImage(video, 0, 0, VIDEO_SIZE.x, VIDEO_SIZE.y)

    // let poses = []
    let poses = await net.estimatePoses(video, {
      flipHorizontal: true,
      decodingMethod: 'multi-person',
      maxDetections: 5,
      scoreThreshold: 0.1,
      nmsRadius: 30
    })

    let posesOut = []
    poses.forEach(({score, keypoints}) => {
      if (score >= 0.15) {
        posesOut.push({
          kps: keypoints,
          adjKps: posenet.getAdjacentKeyPoints(keypoints, 0.1)
        })
      }
    })
    
    if (posesOut.length > 0) {
      worker.postMessage({
        poses: posesOut
      })
    }

    // document.getElementById("lastFrame").innerText = (1000 / (Date.now() - lastTime)).toFixed(2)
    lastTime = Date.now()
    // stats.end()
    requestAnimationFrame(draw)
  }
  
  draw()
})()
