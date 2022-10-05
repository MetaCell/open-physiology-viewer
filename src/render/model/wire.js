import { objectBase, renderConsts } from './base';
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
  _geometry = undefined ;
  _start    = undefined ;
  _end      = undefined ;
  _arcCenter = undefined ;
  _controlPoint = undefined ; 
  _curvature = undefined ;

  constructor(id, query, reducer, scaffold_index)
  {
    const model = query(id, Wire.type, scaffold_index)
    super(model, Wire.type, reducer);
    this._geometry  = model.geometry ;
    this._start     = model.start ;
    this._end       = model.end ;
    this._arcCenter = model.arcCenter ;
    this._curvature = model.curvature ;
  }

  render() {
    switch (this._geometry) {
      case renderConsts.EDGE_GEOMETRY.ARC:
        return arcCurve(this._start, this._end, extractCoords(this._arcCenter));
      case renderConsts.EDGE_GEOMETRY.SEMICIRCLE:
        return semicircleCurve(this._start, this._end,);
      case renderConsts.EDGE_GEOMETRY.RECTANGLE:
        return rectangleCurve(this._start, this._end,);
      case renderConsts.WIRE_GEOMETRY.SPLINE:
        const control = this._controlPoint? extractCoords(this._controlPoint): getDefaultControlPoint(this._start, this._end, this._curvature);
        return new THREE.QuadraticBezierCurve3(this._start, this._controlPoint, this._end);
      default:
        return new THREE.Line3(start, end);
    }
  }
}