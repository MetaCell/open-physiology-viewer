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
    if (anchors.length == 4)
    {
      anchors.forEach( a => {
        if ( a.layout)
          this._points.push(a.layout);
        else {
          const p = reducer(a.id, queryTypes.id);
          if (p?.position)
            this._points.push(p.position);
        }
      })
    }
  }

  render() {
    if (this._points.length == 0)
      return ;

    var shape = ThreeDFactory.regionShape(this._points);

    const material = MaterialFactory.createLineBasicMaterial({
        color: this.color,
        polygonOffsetFactor: this._polygonOffsetFactor
    });

    const geometry = new THREE.ShapeGeometry( shape );

    return new THREE.Mesh( geometry, material );
  }
}