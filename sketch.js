function idNodes (...ids) {
  const nodes = {}
  for (let id of ids) {
    nodes['node' + id.charAt(0).toUpperCase() + id.slice(1)] = document.getElementById(id)
  }
  return nodes
}

const {
  nodeHeight,
  nodeSegment,
  nodeDivisions,
  nodeChargeP,
  nodeChargeQ,
  nodeText,
  nodeSpeed,
} = idNodes('height', 'segment', 'divisions', 'chargeP', 'chargeQ', 'text', 'speed')

const zMin = 0.05
const zMax = 9.00

const sensativity = 0.005
const pColor = '#C06EFF'
const qColor = '#FF7AE4'
const qPossibleColor = '#ff942a'
const linesColor = '#E8648B'
const bgColor = '#fef9ff'

let h, a, n, rectX, points, x, y, a2, length, i, chargeP, chargeQ, message, topPoint, speed, vector,
  possiblePoint

let zoom = 4.00,
  totalCharge = 0,
  shouldAddPoint = false,
  possiblePointIsActive = false
  canvasCenter = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  }

function onEnter (e) {
  if (e.keyCode === 13)
    resetSketch()
}

function possiblePointIsActiveOnChange (checkbox) {
  shouldAddPoint = false
  possiblePointIsActive = checkbox.target.checked
}

function onKeyDown (e) {
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
  zoom -= sensativity * event.delta
  zoom = constrain(zoom, zMin, zMax)
  return false
}

function resetSketch () {
  shouldAddPoint = false
  nodeHeight.value = Math.max(nodeHeight.value, 10)
  nodeSegment.value = Math.max(nodeSegment.value, 10)
  nodeDivisions.value = Math.max(nodeDivisions.value, 1)
  nodeSpeed.value = Math.max(nodeSpeed.value, 1)

  h = nodeHeight.value
  a = nodeSegment.value
  n = nodeDivisions.value
  speed = Math.min(nodeSpeed.value, n)
  chargeP = nodeChargeP.value
  chargeQ = nodeChargeQ.value
  i = 1
  points = []
  length = a * 3
  x = 0 - length / 2
  y = 1
  a2 = x + a * 2
  totalCharge = 0
  topPoint = new Point(a2, y - h, { charge: chargeP, color: color(pColor), r: 2 })
  possiblePoint = new Point(0, y, { charge: chargeQ, color: qPossibleColor })

}

function setup () {
  createCanvas(windowWidth, windowHeight)
  rectMode(CENTER)
  resetSketch()
}

function mouseMoved (e) {
  possiblePoint.x = map(e.clientX, 0, width, x, x + length)
}

function mouseClicked () {
  if (shouldAddPoint && possiblePointIsActive)
    addPoint(possiblePoint)
  shouldAddPoint = true
}

function updateHead () {
  nodeText.innerHTML = `Total force: ${totalCharge.toFixed(2)}mN
                        ${i < n ? `<span class="is-small">Adding: Q${i}</span>` : ''}`
}

function addPoint (point = null) {
  if (i >= n && !point) return false
  const init = point ? speed - 1 : 0
  const _color = point ? point.color : color(qColor)
  const charge = point ? point.charge : chargeQ
  for (let j = init; j < speed; j++, i++) {
    const p = new Point(point ? point.x : x + length / (n-1) * i, y, { charge, color: _color })
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

function draw () {
  translate(canvasCenter.x, canvasCenter.y)
  scale(zoom)
  addPoint()
  window.p = points[0]
  window.t = topPoint
  background(bgColor)
  drawBase()
  renderCanvas()
}

function renderCanvas () {
  topPoint.render()
  vector = new p5.Vector(0, 0)

  for (let p of points) {
    p.render()
    p.lineWith(topPoint, color(qColor))
    vector.add(p.calcCoulomb(topPoint))
  }

  const v0 = createVector(topPoint.x, topPoint.y)
  const v1 = createVector(vector.x, vector.y)
  drawArrow(v0, v1, color(i >= n ? 'red' : 'blue'))
  if (possiblePointIsActive)
    possiblePoint.render()
}

function drawArrow (base, vec, myColor) {
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
