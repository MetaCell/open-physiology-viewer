import { objectBase } from './base';
import { objectTypes } from './types';
import { ThreeDFactory } from '../3D/threeDFactory'; 
import { MaterialFactory } from '../3D/materialFactory';

export class Node extends objectBase
{
  constructor(json, reducer)
  {
    super(json, objectTypes.nodes, reducer);
    this._color = json.color || this._color;
    this._val = json.val || this._val;
  }

  render() {
    const geometry = ThreeDFactory.createSphereGeometry(this._val);
    
    const material = MaterialFactory.createMeshLambertMaterial({
        color: this._color,
        polygonOffsetFactor: this._polygonOffsetFactor
    });
  
    return this._render(geometry, material, this._position);
  }
}