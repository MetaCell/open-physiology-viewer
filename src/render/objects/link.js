import { objectBase } from './base';
import { objectTypes } from '../objectTypes';

export class Link extends objectBase
{
  constructor(json, mediate)
  {
    super(json, objectTypes.links, mediate)
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