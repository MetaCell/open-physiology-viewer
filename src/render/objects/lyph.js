import { objectBase } from './base';
import { objectTypes } from '../objectTypes';
import { reducerTypes } from '../reducer';
import { ThreeDFactory } from '../threeDFactory'; 
import { MaterialFactory } from '../materialFactory';

export class Lyph extends objectBase
{
  _layers = [];

  constructor(json, reducer)
  {
    super(json, objectTypes.lyphs, reducer);
    this._groupped = true ;
  }

  merge() {
    const layers = this._json.layers;
    if (layers.length > 0)
    {
      const layerWidth = this._width / layers.length ;
      const layerHeight = this._height ;
      layers?.forEach( l => {
        const id = l.id ?? l ;
        const layer = this._reducer(l, reducerTypes.pop)
        this._reducer(l.id, reducerTypes.delete); 
        layer.width = layerWidth ;
        layer.height = layerHeight ;
        this._layers.push(layer);
      });
    }
  }

  render() {
    const group = new THREE.Group();

    const width = this._json.scale.width ;
    const height = this._json.scale.height ;
    const geometry = ThreeDFactory.createBoxGeometry(width, height);
    const layers = [];

    const material = MaterialFactory.createMeshLambertMaterial({
        color: this._json.color,
        polygonOffsetFactor: this.polygonOffsetFactor
    });

    const parent = this._render(geometry, material, this._position);
    group.add(parent);

    this._layers.forEach(layer =>{
      const renderedLayer = layer.render();
      layers.push(renderedLayer);
      group.add(layers);
    });

    this._cache = group ;
    
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