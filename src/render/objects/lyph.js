import { objectBase } from './base';
import { objectTypes } from '../objectTypes';
import { mediatorTypes } from '../mediator';
export class Lyph extends objectBase
{
  _polygonOffsetFactor = 0;

  constructor(json, mediate)
  {
    super(json, objectTypes.lyphs, mediate)
  }

  render() {
    const geometry = ThreeDFactory.createBoxGeometry(this.json.val);

    const material = MaterialFactory.createMeshLambertMaterial({
        color: this.json.color,
        polygonOffsetFactor: this.json.polygonOffsetFactor
    });
  
    this._cache = new THREE.Mesh(geometry, material);

    //mediate for layers
    const layers = this._json.layers ;
    const layerHeight = this._height / layers.length ; 
    layers.forEach(l => {
      this._mediator(l.id, mediatorTypes.height, layerHeight)
    });

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