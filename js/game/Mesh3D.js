class Mesh3D {
  render() {
    Graphics3D.render(this.mesh, this.transform);
  }
  translate(dx, dy, dz) {
    if ((dx < 1.0E-4) && (dx > -1.0E-4)) {
      dx = 0.0;
    }
    if ((dy < 1.0E-4) && (dy > -1.0E-4)) {
      dy = 0.0;
    }
    if ((dz < 1.0E-4) && (dz > -1.0E-4)) {
      dz = 0.0;
    }
    this.transform = Graphics3D.mul(this.transform, Graphics3D.translation(dx, dy, dz));
  }
  rotate(angleFraction, axisX, axisY, axisZ) {
    this.transform = Graphics3D.mul(this.transform, Graphics3D.rotation((360.0 * angleFraction), axisX, axisY, axisZ));
  }
  bounds() {
    if (this.bounds_f == null) {
      let p = this.mesh.pos;
      let b = new Float32Array([3.4028234663852886e38, 3.4028234663852886e38, 3.4028234663852886e38, (-3.4028234663852886e38), (-3.4028234663852886e38), (-3.4028234663852886e38)]);
      for (let i = 0; (i + 2) < p.length; i += 3) {
        for (let k = 0; k < 3; k++) {
          b[k] = Math.min(b[k], p[(i + k)]);
          b[(k + 3)] = Math.max(b[(k + 3)], p[(i + k)]);
        }
      }
      if (p.length < 3) {
        b = new Float32Array([-128, -128, -128, 128, 128, 128]);
      }
      this.bounds_f = b;
    }
    return this.bounds_f;
  }
  setupAppearance() {
    this.mesh.setupAppearance();
  }
  resetTransform() {
    this.transform = Graphics3D.identity();
  }
  constructor(mesh) {
    this.transform = Graphics3D.identity();
    this.mesh = null;
    this.bounds_f = null;
    this.mesh = mesh;
  }
}

Mesh3D.$clinit = function () {

};
