import { objectBase } from './base';
import { objectTypes } from './types';
import { ThreeDFactory } from '../3D/threeDFactory'; 
import { MaterialFactory } from '../3D/materialFactory';

export class Node extends objectBase
{
  static type = objectTypes.nodes ;

  constructor(id, query, reducer)
  {
    const model = query(id, Node.type)
    super(model, Node.type, reducer);
  }

  render() {
    const geometry = ThreeDFactory.createSphereGeometry(this._val);
    
    const material = MaterialFactory.createMeshLambertMaterial({
        color: this.color,
        polygonOffsetFactor: this._polygonOffsetFactor
    });
  
    return this._render(geometry, material, this._position);
  }
}