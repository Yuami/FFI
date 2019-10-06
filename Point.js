const K = 9 * Math.pow(10, 9)

class Point {
  constructor (x, y, { charge = 1, color = color('black'), r = 2 }) {
    this.x = x
    this.y = y
    this._x = x / 100
    this._y = y / 100
    this.color = color
    this.r = r
    this.alpha = null
    this.charge = charge
    this._charge = charge * Math.pow(10, -5)
  }

  getVector (point) {
    const x = point.x - this.x
    const y = point.y - this.y

    return new p5.Vector(x, y)
  }

  distance (point) {
    const x = Math.abs(this._x - point._x)
    const y = Math.abs(this._y - point._y)
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  }

  calcCharge (point) {
    return (K * this._charge * point._charge) / Math.pow(this.distance(point), 2)
  }

  calcCoulomb (point) {
    return this.getVector(point)
      .normalize()
      .mult(
        this.calcCharge(point)
      )
  }

  lineWith (point, color = null) {
    if (color)
      color.setAlpha(this.alpha || 50)
    stroke(color || '#000000')
    fill(color || '#000000')
    line(this.x, this.y, point.x, point.y)
  }

  render () {
    stroke(this.color)
    fill(this.color)
    ellipse(this.x, this.y, this.r, this.r)
  }
}