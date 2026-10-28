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
  setupAppearance() {
    this.mesh.setupAppearance();
  }
  resetTransform() {
    this.transform = Graphics3D.identity();
  }
  constructor(mesh) {
    this.transform = Graphics3D.identity();
    this.mesh = null;
    this.mesh = mesh;
  }
}

Mesh3D.$clinit = function () {

};
