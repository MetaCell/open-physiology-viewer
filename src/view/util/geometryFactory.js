// import '../lines/LineSegments2'
// import '../lines/Line2'
// import '../lines/LineGeometry'  

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
          aStartAngle, aEndAngle,  // aStartAngle, aEndAngle
          aClockwise,               // aClockwise
          aRotation // aRotation
        );
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
        return new THREE.Line2(geometry, material);
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
    static createLineBasicMaterial(params = {}, engine = geometryEngine.THREE) { 
      if(engine == geometryEngine.THREE)
      {
        return new THREE.LineBasicMaterial(params);
      }
    }
    static createLineMaterial(params = {}, engine = geometryEngine.THREE) { 
      if(engine == geometryEngine.THREE)
      {
        return new THREE.LineMaterial(params);
      }
    }
    static createLineSegments2(params = {}, engine = geometryEngine.THREE) { 
      if(engine == geometryEngine.THREE)
      {
        return new THREE.LineSegments2(params);
      }
    }
    static createMesh(geometry, material, engine = geometryEngine.THREE) { 
      if(engine == geometryEngine.THREE)
      {
        return new THREE.Mesh(geometry, material)
      }
    }
    static createMeshBasicMaterial(params = {}, engine = geometryEngine.THREE) { 
      if(engine == geometryEngine.THREE)
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
    static createShape(pieces, engine = geometryEngine.THREE ) { 
      if( engine == geometryEngine.THREE)
      {
        return new THREE.Shape(pieces);
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
        return new THREE.Vector2(x, y);
      }
    }
    static createVector3(x, y, z, engine = geometryEngine.THREE) { 
      if( engine == geometryEngine.THREE)
      {
        return new THREE.Vector3(x, y, z);
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

    static createLineDashedMaterial(params = {}, engine = geometryEngine.THREE) { 
      if(engine == geometryEngine.THREE)
      {
        return new THREE.LineDashedMaterial(params);
      }
    }

    static createMeshBasicMaterial(params = {}, engine = geometryEngine.THREE) { 
      if(engine == geometryEngine.THREE)
      {
        return new THREE.MeshBasicMaterial(params);
      }
    }
    static createMeshLambertMaterial(params = {}, engine = geometryEngine.THREE) { 
      if(engine == geometryEngine.THREE)
      {
        return new THREE.MeshLambertMaterial(params);
      }
    }
  }