const PI = 3.14;

module.exports = class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // Returns the length of vector2
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Returns values between 1 - 0
  normalized() {
    let mag = this.magnitude();
    return new Vector2(this.x / mag, this.y / mag);
  }

  add(OtherVect = Vector2) {
    let sum = new Vector2();
    sum.x += OtherVect.x;
    sum.y += OtherVect.y;
    return sum;
  }

  subtract(OtherVect = Vector2) {
    let diff = new Vector2();
    diff.x += OtherVect.x;
    diff.y += OtherVect.y;
    return diff;
  }

  distance(OtherVect = Vector2) {
    let direction = new Vector2();
    direction.x = OtherVect.x - this.x;
    direction.y = OtherVect.y - this.y;
    return direction.magnitude();
  }

  dotProduct(OtherVect = Vector2) {
    let dotProduct = this.x * OtherVect.x + this.y * OtherVect.y;
    return dotProduct;
  }

  angle(OtherVect = Vector2) {
    let cosAngle =
      this.dotProduct(OtherVect) / (this.magnitude() * OtherVect.magnitude());
    let angle = Math.floor(Math.acos(cosAngle) * (180 / PI));
    return angle;
  }

  direction(OtherVect = Vector2) {
    let direction = new Vector2();
    direction.x = OtherVect.x - this.x;
    direction.y = OtherVect.y - this.y;
    return direction;
  }

  consoleOutput() {
    return `(${this.x}, ${this.y})`;
  }
};