import { objectBase } from '../objectBase';
import { objectTypes } from '../objectTypes';
import { ThreeDFactory } from '../threeDFactory'; 
import { MaterialFactory } from '../materialFactory';

export class Node extends objectBase
{
  _polygonOffsetFactor = 0;
  constructor(json)
  {
    super(json, objectTypes.nodes);
    this._color = json.color || this._color;
    this._val = json.val || this._val;;
    this._position = this._json.layout ?? new THREE.Vector3(this._json.layout.x, this._json.layout.y, 0);
  }

  render() {
    const geometry = ThreeDFactory.createSphereGeometry(this._val);
    

    const material = MaterialFactory.createMeshLambertMaterial({
        color: this._color,
        polygonOffsetFactor: this._polygonOffsetFactor
    });
  
    this._geometry = geometry ;
    this._material = material ;

    return this._render();
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