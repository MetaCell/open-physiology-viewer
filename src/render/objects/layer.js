import { objectBase } from './base';
import { objectTypes } from '../objectTypes';
import { reducerTypes } from '../reducer';
import { ThreeDFactory } from '../threeDFactory'; 
import { MaterialFactory } from '../materialFactory';

export class Layer extends objectBase
{
  constructor(json, reducer)
  {
    super(json, objectTypes.lyphs, reducer);
  }

  merge() {

  }

  render() {
    const width = this._json.scale.width ;
    const height = this._json.scale.height ;
    const geometry = ThreeDFactory.createBoxGeometry(width, height);

    const material = MaterialFactory.createMeshLambertMaterial({
        color: this._json.color,
        polygonOffsetFactor: this.polygonOffsetFactor
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