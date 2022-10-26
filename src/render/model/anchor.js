import { objectBase } from './base';
import { scaffoldTypes } from './types';
import { ThreeDFactory } from '../3D/threeDFactory'; 
import { MaterialFactory } from '../3D/materialFactory';
import { queryTypes } from "../query/reducer";

export class Anchor extends objectBase
{
  static type = scaffoldTypes.anchors ;

  constructor(id, query, reducer, scaffold_index)
  {
    const model = query(id, Anchor.type, scaffold_index)
    super(model, Anchor.type, reducer);
    if(model.hostedBy)
    {
      const hostingWire = reducer(model.hostedBy.id, queryTypes.id)
      if(hostingWire)
      {
        const relpos = hostingWire.position(model.offset);
        this._position = relpos ;
      }
    }
  }

  render() {
    const geometry = ThreeDFactory.createSphereGeometry(this._val * 10);
    
    const material = MaterialFactory.createMeshLambertMaterial({
        color: this.color,
        polygonOffsetFactor: this._polygonOffsetFactor
    });

    return this._render(geometry, material);
  }
}