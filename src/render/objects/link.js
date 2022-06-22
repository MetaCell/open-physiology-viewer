import { objectBase } from './base';
import { objectTypes } from '../objectTypes';
import { MaterialFactory } from '../materialFactory'
import { renderConsts } from './base';
import { reducerTypes } from "../reducer";

const EDGE_STROKE = renderConsts.EDGE_STROKE ;
const EDGE_GEOMETRY = renderConsts.EDGE_GEOMETRY ;

export class Link extends objectBase
{
  _stroke ;
  _lineWidth = 1;
  _pointLength = 5;
  _points = [];

  constructor(json, reducer)
  {
    super(json, objectTypes.links, reducer);
    const startPosition = this._reducer(this._json.source, reducerTypes.position);
    const endPosition = this._reducer(this._json.target, reducerTypes.position);
    this._points.push(startPosition);
    this._points.push(endPosition);
  }

  render() {
    let material;
    if (this._stroke === EDGE_STROKE.DASHED) {
      material = MaterialFactory.createLineDashedMaterial({color: this.color});
    } else {
      //Thick lines
      if (this._stroke === EDGE_STROKE.THICK) {
        // Line 2 method: draws thick lines
        material = MaterialFactory.createLine2Material({
          color: this.color,
          lineWidth: this.lineWidth,
          polygonOffsetFactor: this.polygonOffsetFactor
        });
      } else {
        //Normal lines
        material = MaterialFactory.createLineBasicMaterial({
          color: this._color
        });
      }
    }
    let geometry, obj;
    if (this._stroke === EDGE_STROKE.THICK) {
      geometry = new THREE.LineGeometry();
      obj = new THREE.Line2(geometry, material);
    } else {
      geometry = new THREE.BufferGeometry().setFromPoints(this._points);
      obj = new THREE.Line(geometry, material);
    }
    // Edge bundling breaks a link into 66 points
    this._pointLength = (!this.geometry || this.geometry === EDGE_GEOMETRY.LINK)? 2 : (this.geometry === EDGE_GEOMETRY.PATH)? 67 : state.edgeResolution;

    return obj ;
  }

  highlight() {
    super.highlight();
  }

  hide() {
    super.hide();
  }

  delete() {
    super.delete();
  }
}