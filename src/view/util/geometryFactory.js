export const geometryEngine = {
  THREE: 'THREE'
}

export const geometryEngineK = {
  CYLINDER_TA_START : 10,
  CYLINDER_TA_END : 4,
  BUFFER_ATTRIBUTE_LENGTH : 3
}

export class GeometryFactory {
  static createArrowHelper(normalize, targetCoords, arrowLength, colorHex, engine = geometryEngine.THREE) { 
    if( engine == geometryEngine.THREE )
    {
      return THREE.ArrowHelper(normalize
      , targetCoords
      , arrowLength
      , colorHex
      , arrowLength
      , arrowLength * 0.75);
    }
  }
  static createCatmullRomCurve3(path, engine = geometryEngine.THREE) { 
    if( engine == geometryEngine.THREE )
    {
      return THREE.CatmullRomCurve3(path);
    }
  }
  static createCubicBezierCurve3(start, p0, p1, end, engine = geometryEngine.THREE ) { 
    if( path == geometryEngine.THREE )
    {
      return THREE.CubicBezierCurve3(start
        , p0
        , p1
        , end);
    }
  }
  static createCurvePath(paths, engine = geometryEngine.THREE ) { 
    if( path == geometryEngine.THREE )
    {
      let path = THREE.CurvePath()
      params.paths.forEach((p)=>{
        path.add(p);
      });
      return path;
    }
  }
  static createCylinderGeometry(thickness, a, height, engine = geometryEngine.THREE) { 
    if( engine == geometryEngine.THREE )
    {
      return new THREE.CylinderGeometry(thickness
        , thickness
        , a * height
        , geometryEngineK.CYLINDER_TA_END
        , geometryEngineK.CYLINDER_TA_END)
    }
  }
  static createEllipseCurve(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation, engine = geometryEngine.THREE ) { 
    if( engine == geometryEngine.THREE )
    {
      return new THREE.EllipseCurve(
        aX, aY,
        xRadius, yRadius,
        0, Math.PI / 2,  // aStartAngle, aEndAngle
        false,               // aClockwise
        Math.PI / 2 * (aRotation - 1) // aRotation
      );
    }
  }
  static createGeometry(engine = geometryEngine.THREE) { 
    if( engine == geometryEngine.THREE )
    {
      return new THREE.Geometry();
    }
  }
  static createLineCurve3(p0, p1, engine = geometryEngine.THREE ) {
    if ( engine == geometryEngine.THREE )
    {
      return new THREE.LineCurve3(p0, p1);
    }
  }
  static createLine2(geometry, material, engine = geometryEngine.THREE ) { 
    if ( engine == geometryEngine.THREE )
    {
      return new THREE.createLine2(geometry, material);
    }
  }
  static createLine3(start, end, engine = geometryEngine.THREE) { 
    if ( engine == geometryEngine.THREE )
    {
      return new THREE.Line3(start, end);
    }
  }
  static createLineGeometry(params = {}, engine = geometryEngine.THREE) { 
    if ( engine == geometryEngine.THREE )
    {
      return new THREE.LineGeometry(params);
    }
  }
  static createLineMaterial(params = {}) { 
    if(params.ENGINE == geometryEngine.THREE || params.ENGINE === undefined )
    {
      return new THREE.LineBasicMaterial(params);
    }
  }
  createLineSegments2(params = {}) { 
    if(params.ENGINE == geometryEngine.THREE || params.ENGINE === undefined )
    {
      return new THREE.createLineSegments2(params);
    }
  }
  createMesh(params = {}) { 
    if(params.ENGINE == geometryEngine.THREE || params.ENGINE === undefined )
    {
      return new THREE.Mesh()
    }
  }
  createMeshBasicMaterial(params = {}) { 
    if(params.ENGINE == geometryEngine.THREE || params.ENGINE === undefined )
    {
      return new THREE.MeshBasicMaterial(params);
    }
  }
  static createQuadraticBezierCurve(start, control, end, engine = geometryEngine.THREE ) {
    if(engine == geometryEngine.THREE)
    {
      return new THREE.QuadraticBezierCurve(start, control, end);
    }
   }
  static createQuadraticBezierCurve3(start, control, end, engine = geometryEngine.THREE ) { 
    if(engine == geometryEngine.THREE )
    {
      return new THREE.QuadraticBezierCurve3(start
                                            ,control
                                            ,end)
    }
  }
  static createShape(points, engine = geometryEngine.THREE ) { 
    if( engine == geometryEngine.THREE)
    {
      return new THREE.Shape(points.map(p => new THREE.Vector2(p.x, p.y)));
    }
  }
  static createSphereGeometry(verticeRelSize, verticeResolution, engine = geometryEngine.THREE) {
    if( engine == geometryEngine.THREE)
    { 
      return new THREE.SphereGeometry(verticeRelSize,
                                      verticeResolution,
                                      verticeResolution);
    }
  }
  static createVector2(x, y, engine = geometryEngine.THREE) { 
    if( engine == geometryEngine.THREE)
    {
      return new GeometryFactory.Vector2(x, y);
    }
  }
  static createVector3(x, y, z, engine = geometryEngine.THREE) { 
    if( engine == geometryEngine.THREE)
    {
      return new THREE.Vector2(x, y, z);
    }
  }
  static createBufferAttribute(pointLength, engine = geometryEngine.THREE) {
    if( engine == geometryEngine.THREE)
    {
      return new THREE.BufferAttribute(new Float32Array(pointLength * geometryEngineK.BUFFER_ATTRIBUTE_LENGTH)
                                                        , geometryEngineK.BUFFER_ATTRIBUTE_LENGTH)
    }
   }
  static createBufferGeometry(engine = geometryEngine.THREE) { 
    if( engine == geometryEngine.THREE)
    {
      return new THREE.BufferGeometry();
    }
  }
  static createGeometry(engine = geometryEngine.THREE) { 
    if( engine == geometryEngine.THREE)
    {
      return new THREE.Geometry();
    }
  }
}
