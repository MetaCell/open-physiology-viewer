import { objectBase } from '../objectBase';
import { objectTypes } from '../objectTypes';

export class Node extends objectBase
{
  constructor(json)
  {
    super(json, objectTypes.chains)
  }

  render = function() {
    const geometry = ThreeDFactory.createSphereGeometry(this.json.val);

    const material = MaterialFactory.createMeshLambertMaterial({
        color: this.json.color,
        polygonOffsetFactor: this.json.polygonOffsetFactor
    });
  
    this._cache = new THREE.Mesh(geometry, material);
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