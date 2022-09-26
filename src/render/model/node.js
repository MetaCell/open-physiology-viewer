import { objectBase } from './base';
import { mainObjectTypes } from './types';
import { ThreeDFactory } from '../3D/threeDFactory'; 
import { MaterialFactory } from '../3D/materialFactory';

export class Node extends objectBase
{
  static type = mainObjectTypes.nodes ;

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

    geometry.translate(this.position.x, this.position.y, this.position.z);
    const mesh = new THREE.Mesh(geometry, material);
    return mesh ;
  }
}