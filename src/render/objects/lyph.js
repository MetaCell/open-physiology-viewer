import { objectBase } from './base';
import { objectTypes } from '../objectTypes';
import { mediatorTypes } from '../mediator';
import { ThreeDFactory } from '../threeDFactory'; 
import { MaterialFactory } from '../materialFactory';

export class Lyph extends objectBase
{
  _polygonOffsetFactor = 0;

  constructor(json, mediator)
  {
    super(json, objectTypes.lyphs, mediator);
  }

  merge() {
    this._json.layers?.forEach( l => {
      debugger;
      const id = l.id ?? l ;
      const layer = this._mediator(l, mediatorTypes.pop)
      this._mediator(l.id, mediatorTypes.delete); 
      this._children.push(layer);
    });
  }

  render() {
    const geometry = ThreeDFactory.createBoxGeometry(this.json.val);

    const material = MaterialFactory.createMeshLambertMaterial({
        color: this.json.color,
        polygonOffsetFactor: this.json.polygonOffsetFactor
    });

    this._cache = this._render(geometry, material, this._position);
    return this._cache ;
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