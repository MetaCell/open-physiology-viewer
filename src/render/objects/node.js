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
  }

  render() {
    const geometry = ThreeDFactory.createSphereGeometry(this._val);
    const layout = this._json.layout ;
    
    if (layout);
      geometry.translate(layout.x, layout.y, 0)

    const material = MaterialFactory.createMeshLambertMaterial({
        color: this._color,
        polygonOffsetFactor: this._polygonOffsetFactor
    });
  
    return new THREE.Mesh(geometry, material);
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