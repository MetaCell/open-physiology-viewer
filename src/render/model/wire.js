import { objectBase, renderConsts } from './base';
import { scaffoldTypes } from './types';
import { ThreeDFactory } from '../3D/threeDFactory'; 
import { MaterialFactory } from '../3D/materialFactory';
import {
  extractCoords,
  semicircleCurve,
  rectangleCurve,
  arcCurve, 
  getDefaultControlPoint,
  vectorEquals
} from "../autoLayout/curve";

const EDGE_STROKE = renderConsts.EDGE_STROKE ;
const EDGE_GEOMETRY = renderConsts.EDGE_GEOMETRY ;

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
    this._start     = model.source ;
    this._end       = model.target ;
    this._arcCenter = model.arcCenter ;
    this._curvature = model.curvature ;
    if ( !this._start && model.radius )
      this._start = model.radius
    if ( !this._end && model.radius )
      this._end = model.radius
  }

  geometry() {
    switch (this._geometry.toUpperCase()) {
      case renderConsts.EDGE_GEOMETRY.ARC || renderConsts.EDGE_GEOMETRY.ELLIPSE:
        {
          let start  = extractCoords(this._start);
          const end    = extractCoords(this._end) ;
          const center = extractCoords(this._arcCenter.layout)
          if ( vectorEquals(start, end ) )
          {
            const aux = start.clone();
            aux.x *= -1; 
            start = aux ;
          }
          return arcCurve( start, end, center );
        }
      case renderConsts.EDGE_GEOMETRY.SEMICIRCLE:
        return semicircleCurve(this._start, this._end,);
      case renderConsts.EDGE_GEOMETRY.RECTANGLE:
        return rectangleCurve(this._start, this._end,);
      case renderConsts.WIRE_GEOMETRY.SPLINE:
        const control = this._controlPoint? extractCoords(this._controlPoint): getDefaultControlPoint(this._start, this._end, this._curvature);
        return new THREE.QuadraticBezierCurve3(this._start, control, this._end);
      default:
        return new THREE.Line3(start, end);
    }
  }

  render() {
    if (!this._shouldRender)
      return null ;

    const curve = this.geometry();

    let material;
    const stroke    = this.model.stroke ;
    const color     = this.model.color ;
    const linewidth = this.model.lineWidth ;
    if (stroke.toUpperCase() === EDGE_STROKE.DASHED) {
      material = MaterialFactory.createLineDashedMaterial({color: color});
    } else {
      //Thick lines
      if (stroke=== EDGE_STROKE.THICK) {
        // Line 2 method: draws thick lines
        material = MaterialFactory.createLine2Material({
          color: color,
          lineWidth: linewidth,
          polygonOffsetFactor: this._polygonOffsetFactor
        });
      } else {
        //Normal lines
        material = MaterialFactory.createLineBasicMaterial({
          color: color
        });
      }
    }

    const points = curve.getPoints( 50 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const mesh = new THREE.Mesh(geometry, material);

    return mesh; 
  }
}