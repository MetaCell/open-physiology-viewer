import { objectBase } from '../objectBase';
import { objectTypes } from '../objectTypes';

export class Node extends objectBase
{

  constructor(json)
  {
    this._json = json ;
    this._type = objectTypes.CHAIN ;
  }

  render = function() {
    const geometry = ThreeDFactory.createSphereGeometry(this.json.val);

    const material = MaterialFactory.createMeshLambertMaterial({
        color: this.json.color,
        polygonOffsetFactor: this.json.polygonOffsetFactor
    });
  
    this._cache = new THREE.Mesh(geometry, material);
  }

  highlight = function() {

  }

  hide = function() {
    
  }

  delete = function() {
    
  }
}