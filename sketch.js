const inputH = document.getElementById('height')
const inputA = document.getElementById('segment')
const inputN = document.getElementById('divisions')
const inputChargeP = document.getElementById('chargeP')
const inputChargeQ = document.getElementById('chargeQ')
const textNode = document.getElementById('text')
const inputSpeed = document.getElementById('speed')

const zMin = 0.05
const zMax = 9.00
const sensativity = 0.005

const pColor = '#C06EFF'
const qColor = '#FF7AE4'
const linesColor = '#E8648B'
const bgColor = '#fef9ff'

let h, a, n, rectX, points, x, y, a2, length, i, chargeP, chargeQ, message, topPoint, speed, vector
let zoom = 4.00,
  totalCharge = 0,
  moving = false,
  canvasCenter = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  }

function onEnter (e) {
  if (e.keyCode === 13)
    resetSketch()
}

function onKeyDown (e) {
  moving = true
  const vel = (10 - zoom) * 3
  if (e.keyCode === 37)
    canvasCenter.x -= vel
  if (e.keyCode === 38)
    canvasCenter.y -= vel
  if (e.keyCode === 39)
    canvasCenter.x += vel
  if (e.keyCode === 40)
    canvasCenter.y += vel
}

function mouseWheel (event) {
  moving = true
  zoom -= sensativity * event.delta
  zoom = constrain(zoom, zMin, zMax)
  return false
}

function resetSketch () {
  inputH.value = Math.max(inputH.value, 10)
  inputA.value = Math.max(inputA.value, 10)
  inputN.value = Math.max(inputN.value, 1)
  inputSpeed.value = Math.max(inputSpeed.value, 1)

  h = inputH.value
  a = inputA.value
  n = inputN.value
  speed = Math.min(inputSpeed.value, n)
  chargeP = inputChargeP.value
  chargeQ = inputChargeQ.value
  i = 1
  points = []
  length = a * 3
  x = 0 - length / 2
  y = 1
  a2 = x + a * 2
  totalCharge = 0
  topPoint = new Point(a2, y - h, { charge: chargeP, color: color(pColor), r: 2 })
}

function setup () {
  createCanvas(windowWidth - 17, windowHeight - 215)
  rectMode(CENTER)
  resetSketch()
}

function updateHead () {
  textNode.innerHTML = `Total force (μN): ${totalCharge.toFixed(2)}
                        ${i < n ? `<span class="is-small">Adding: Q${i}</span>` : ''}`
}

function addPoint () {
  if (i > n) {
    return false
  }
  for (let j = 0; j < speed; j++, i++) {
    const p = new Point(x + length / n * i, y, { charge: chargeQ, color: color(qColor) })
    points.push(p)
    totalCharge += p.calcCharge(topPoint)
    message = `Adding charge: q${i}`
    updateHead()
  }
  return true
}

function drawBase () {
  stroke(linesColor)
  line(x, y, x + length, y)
  line(a2, y, a2, y - h)
  for (let i = 0; i <= 3; i++) {
    line(x + a * (i), y - 5, x + a * (i), y)
  }
}

function drawArrow(base, vec, myColor) {
  push()
  stroke(myColor)
  fill(myColor)
  translate(base.x, base.y)
  line(0, 0, vec.x, vec.y)
  rotate(vec.heading())
  let arrowSize = 1
  translate(vec.mag() - arrowSize, 0)
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0)
  pop()
}

function draw () {
  translate(canvasCenter.x, canvasCenter.y)
  scale(zoom)
  if (addPoint() || moving) {
    background(bgColor)
    drawBase()
    window.p = points[0]
    window.t = topPoint

    topPoint.render()
    vector = new p5.Vector(0, 0)
    for (let p of points) {
      p.render()
      p.lineWith(topPoint, color(qColor))
      vector.add(p.calcCoulomb(topPoint))
    }

    let v0 = createVector(topPoint.x, topPoint.y);
    let v1 = createVector(vector.x, vector.y);
    drawArrow(v0, v1, color(i >= n ? 'red' : 'blue'));
    moving = false
  }
}