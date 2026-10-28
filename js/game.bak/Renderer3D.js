class Renderer3D {
  static getModel(id, resId, load) {
    let cached = Renderer3D.models.get(id);
    if ((cached != null) || !load) {
      return cached;
    }
    let mesh = Model.find(id);
    if (mesh == null) {
      return null;
    }
    let created = new Mesh3D(mesh);
    created.setupAppearance();
    Renderer3D.models.put(id, created);
    return created;
  }
  static setFov(fovDegrees) {
    Renderer3D.fov = fovDegrees;
    Renderer3D.projection = Graphics3D.perspective((Renderer3D.fov * Renderer3D.aspectInv), Renderer3D.aspect, 10.0, 10000.0);
  }
  static lookAt(eyeX, eyeY, eyeZ, dirX, dirY, dirZ, upX, upY, upZ) {
    if ((dirX < 1.0E-4) && (dirX > -1.0E-4)) {
      dirX = 0.0;
    }
    if ((dirY < 1.0E-4) && (dirY > -1.0E-4)) {
      dirY = 0.0;
    }
    if ((dirZ < 1.0E-4) && (dirZ > -1.0E-4)) {
      dirZ = 0.0;
    }
    let crossX = (((dirY * upZ)) - ((dirZ * upY)));
    let crossY = (((dirZ * upX)) - ((dirX * upZ)));
    let crossZ = (((dirX * upY)) - ((dirY * upX)));
    let invLength = (1.0 / (Math.sqrt(((((((crossX * crossX)) + ((crossY * crossY)))) + ((crossZ * crossZ)))))));
    crossX *= invLength;
    crossY *= invLength;
    crossZ *= invLength;
    let finalUpX = (((crossY * dirZ)) - ((crossZ * dirY)));
    let finalUpY = (((crossZ * dirX)) - ((crossX * dirZ)));
    let finalUpZ = (((crossX * dirY)) - ((crossY * dirX)));
    let matrix = new Float32Array(16);
    matrix[0] = crossX;
    matrix[1] = finalUpX;
    matrix[2] = (-dirX);
    matrix[3] = eyeX;
    matrix[4] = crossY;
    matrix[5] = finalUpY;
    matrix[6] = (-dirY);
    matrix[7] = eyeY;
    matrix[8] = crossZ;
    matrix[9] = finalUpZ;
    matrix[10] = (-dirZ);
    matrix[11] = eyeZ;
    matrix[12] = 0.0;
    matrix[13] = 0.0;
    matrix[14] = 0.0;
    matrix[15] = 1.0;
    Renderer3D.cameraTransform = matrix;
    Graphics3D.setCamera(Renderer3D.cameraTransform, Renderer3D.projection);
  }
  static init(top, width, height) {
    Renderer3D.models = new Hashtable();
    Renderer3D.setupCamera(top, width, height);
  }
  static beginFrame(obj) {
    let g = obj;
    Renderer3D.setClip(g);
    Graphics3D.bindTarget(g, 0, 0, Renderer3D.viewWidth, Renderer3D.viewHeight);
    Graphics3D.clearDepth();
    Graphics3D.setCamera(Renderer3D.cameraTransform, Renderer3D.projection);
  }
  static project(vertexCoords) {
    let invCamera = Graphics3D.invert(Renderer3D.cameraTransform);
    Graphics3D.transform(invCamera, vertexCoords);
    Graphics3D.transform(Renderer3D.projection, vertexCoords);
    vertexCoords[0] = (((((((0.5 * (Renderer3D.viewWidth))) * vertexCoords[0])) / vertexCoords[3])) + (((Renderer3D.viewWidth >> 1))));
    vertexCoords[1] = (((((((-0.5 * (Renderer3D.viewHeight))) * vertexCoords[1])) / vertexCoords[3])) + (((Renderer3D.viewHeight >> 1))));
  }
  static preloadModels(ids, resId) {
    for (let k = 0; k < ids.length; k++) {
      Renderer3D.getModel(ids[k], resId, true);
    }
  }
  static endFrame() {
    Graphics3D.releaseTarget();
  }
  static setupCamera(top, width, height) {
    Renderer3D.viewTop = top;
    Renderer3D.viewWidth = width;
    Renderer3D.viewHeight = height;
    Renderer3D.aspect = ((((((Renderer3D.viewWidth) / (((Renderer3D.viewHeight - top))))) * 0.7)) + 0.3);
    Renderer3D.aspectInv = ((((((((Renderer3D.viewHeight - top))) / (Renderer3D.viewWidth))) * 0.7)) + 0.3);
    Renderer3D.setFov(60.0);
    Renderer3D.cameraTransform = Graphics3D.identity();
  }
  static setClip(g) {
    g.setClip(0, Renderer3D.viewTop, Renderer3D.viewWidth, (Renderer3D.viewHeight - Renderer3D.viewTop));
  }
  constructor() {
  }
}

Renderer3D.$clinit = function () {
  Renderer3D.projected = new Float32Array(4);
  Renderer3D.models = new Hashtable();
  Renderer3D.cameraTransform = Graphics3D.identity();
  Renderer3D.projection = Graphics3D.identity();
  Renderer3D.fov = 0;
  Renderer3D.aspect = 0;
  Renderer3D.aspectInv = 0;
  Renderer3D.viewTop = 0;
  Renderer3D.viewWidth = 0;
  Renderer3D.viewHeight = 0;
};
