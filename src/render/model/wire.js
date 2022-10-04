import { objectBase } from './base';
import { scaffoldTypes } from './types';
import { ThreeDFactory } from '../3D/threeDFactory'; 
import { MaterialFactory } from '../3D/materialFactory';
import {
  extractCoords,
  semicircleCurve,
  rectangleCurve,
  arcCurve, 
  getDefaultControlPoint
} from "../autoLayout/curve";

export class Wire extends objectBase
{
  static type = scaffoldTypes.wires ;

  constructor(id, query, reducer, scaffold_index)
  {
    const model = query(id, Wire.type, scaffold_index)
    super(model, Edge.type, reducer);
  }

  render() {
    switch (this.geometry) {
      case Edge.EDGE_GEOMETRY.ARC:
          return arcCurve(start, end, extractCoords(this.arcCenter));
      case Edge.EDGE_GEOMETRY.SEMICIRCLE:
          return semicircleCurve(start, end);
      case Edge.EDGE_GEOMETRY.RECTANGLE:
          return rectangleCurve(start, end);
      case Wire.WIRE_GEOMETRY.SPLINE:
          const control = this.controlPoint? extractCoords(this.controlPoint): getDefaultControlPoint(start, end, this.curvature);
          return new THREE.QuadraticBezierCurve3(start, control, end);
      default:
          return new THREE.Line3(start, end);
    }
  }
}