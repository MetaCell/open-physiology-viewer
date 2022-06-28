import { objectBase } from './base';
import { objectTypes } from '../objectTypes';

export class Chain extends objectBase
{
  constructor(json, reducer)
  {
    super(json, objectTypes.chains, reducer)
  }

  render = function() {
    // const geometry = ThreeDFactory.createSphereGeometry(this.json.val);

    // const material = MaterialFactory.createMeshLambertMaterial({
    //     color: this.json.color,
    //     polygonOffsetFactor: this.json.polygonOffsetFactor
    // });
  
    // this._cache = new THREE.Mesh(geometry, material);
    return null; 
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