import { objectBase } from './base';
import { scaffoldTypes } from './types';
import { ThreeDFactory } from '../3D/threeDFactory'; 
import { MaterialFactory } from '../3D/materialFactory';

export class Anchor extends objectBase
{
  static type = scaffoldTypes.anchors ;

  constructor(id, query, reducer, scaffold_index)
  {
    const model = query(id, Anchor.type, scaffold_index)
    super(model, Anchor.type, reducer);
  }

  render() {
    const geometry = ThreeDFactory.createSphereGeometry(this._val);
    
    const material = MaterialFactory.createMeshLambertMaterial({
        color: this.color,
        polygonOffsetFactor: this._polygonOffsetFactor
    });

    geometry.translate(this.position.x, this.position.y, this.position.z);
    const mesh = new THREE.Mesh(geometry, material);
    return mesh ;
  }
}