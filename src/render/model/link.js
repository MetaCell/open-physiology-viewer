import { objectBase } from './base';
import { objectTypes } from './types';
import { MaterialFactory } from '../3D/materialFactory'
import { renderConsts } from './base';

const EDGE_STROKE = renderConsts.EDGE_STROKE ;
const EDGE_GEOMETRY = renderConsts.EDGE_GEOMETRY ;

function layoutToVecto3(layout)
{
  return new THREE.Vector3(layout.x, layout.y, layout.z)
}

export class Link extends objectBase
{
  _stroke ;
  _lineWidth = 1;
  _pointLength = 5;
  _points = [];

  constructor(model, query)
  {
    super(model, objectTypes.links, query);
    if(!model._points)
      this._points = [layoutToVecto3(model.source.layout), layoutToVecto3(model.target.layout)]
  }

  render() {
    let material;
    const stroke    = this.model.stroke ;
    const color     = this.model.color ;
    const linewidth = this.model.lineWidth ;
    if (stroke === EDGE_STROKE.DASHED) {
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
    let geometry, obj;
    if (stroke === EDGE_STROKE.THICK) {
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
}