import { objectBase } from './base';
import { scaffoldTypes } from './types';
import { ThreeDFactory } from '../3D/threeDFactory'; 
import { MaterialFactory } from '../3D/materialFactory';
import { queryTypes } from "../query/reducer";

export class Region extends objectBase
{
  static type = scaffoldTypes.regions ;

  constructor(id, query, reducer)
  {
    const model = query(id, Region.type)
    super(model, Region.type, reducer);
    const anchors = model.borderAnchors ;
    this._points = [];
    anchors.forEach( a => {
      const p = reducer(a.id, queryTypes.id);
      if (p?.position)
        this._points.push(p.position);
    })
  }

  render() {
    var geometry = ThreeDFactory.regionShape(this._points);

    const material = MaterialFactory.createLineBasicMaterial({
        color: this.color,
        polygonOffsetFactor: this._polygonOffsetFactor
    });
    return new THREE.Line( geometry, material );
  }
}