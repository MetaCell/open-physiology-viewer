import { renderConsts } from '../model/base';
import { MaterialFactory } from './materialFactory';
import tinycolor from 'tinycolor2';

export class ThreeDFactory {
  static createSphereGeometry(radius){
    return new THREE.SphereGeometry(radius * renderConsts.verticeRelSize,
                                    renderConsts.verticeResolution
                                  , renderConsts.verticeResolution);
  }
  static createBoxGeometry(width, height){
    return new THREE.BoxGeometry(width, height);
  }
  static createMeshWithBorder(shape, params = {}, includeBorder = true) {
    let geometry = new THREE.ShapeBufferGeometry(shape);
    let obj = new THREE.Mesh(geometry, MaterialFactory.createMeshBasicMaterial(params));
    if (includeBorder) {
        let borderGeometry = new THREE.BufferGeometry();
        shape.getPoints().forEach(point => point.z = 0);
        borderGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(shape.getPoints() * 3), 3));
        let borderParams = {
            color   : tinycolor(params.color).darken(25), //darker border than surface
            opacity : 0.5,
            polygonOffsetFactor: params.polygonOffsetFactor - 1
        };
        let borderObj = new THREE.Line(borderGeometry, MaterialFactory.createLineBasicMaterial(borderParams));
        obj.add(borderObj);
    }
    return obj;
  }

  static lyphShape(params) {
      let [thickness, height, radius, top, bottom] = params;

      const shape = new THREE.Shape();

      //Axial border
      shape.moveTo(0, -height / 2);
      shape.lineTo(0, height / 2);

      //Top radial border
      if (top) {
          shape.lineTo(thickness - radius, height / 2);
          shape.quadraticCurveTo(thickness, height / 2, thickness, height / 2 - radius);
      } else {
          shape.lineTo(thickness, height / 2);
      }

      //Non-axial border
      if (bottom) {
          shape.lineTo(thickness, -height / 2 + radius);
          shape.quadraticCurveTo(thickness, -height / 2, thickness - radius, -height / 2);
      } else {
          shape.lineTo(thickness, -height / 2);
      }

      //Finish Bottom radial border
      shape.lineTo(0, -height / 2);
      return shape;
  }

  layerShape(inner, outer) {
    const [innerThickness, innerHeight, innerRadius, innerTop, innerBottom] = inner;
    const [thickness, height, radius, top, bottom] = outer;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    //draw top of the preceding layer geometry
    if (innerThickness) {
        if (innerTop) {
            shape.lineTo(0, innerHeight / 2 - innerRadius);
            shape.quadraticCurveTo(0, innerHeight / 2, -innerRadius, innerHeight / 2);
            shape.lineTo(-innerThickness, innerHeight / 2);
            shape.lineTo(-innerThickness, height / 2);
        }
    }

    //top of the current layer
    shape.lineTo(0, height / 2);
    if (top) {
        shape.lineTo(thickness - radius, height / 2);
        shape.quadraticCurveTo(thickness, height / 2, thickness, height / 2 - radius);
    } else {
        shape.lineTo(thickness, height / 2);
    }

    //side and part of the bottom of the current layer
    if (bottom) {
        shape.lineTo(thickness, -height / 2 + radius);
        shape.quadraticCurveTo(thickness, -height / 2, thickness - radius, -height / 2);
    } else {
        shape.lineTo(thickness, -height / 2);
    }
    shape.lineTo(0, -height / 2);

    //draw bottom of the preceding layer geometry
    if (innerThickness) {
        if (innerBottom) {
            shape.lineTo(-innerThickness, -height / 2);
            shape.lineTo(-innerThickness, -innerHeight / 2);
            shape.lineTo(-innerRadius, -innerHeight / 2);
            shape.quadraticCurveTo(0, -innerHeight / 2, 0, -innerHeight / 2 + innerRadius);
        } else {
            shape.lineTo(0, -height / 2);
        }
    }
    shape.lineTo(0, 0);
    return shape;
  }
}