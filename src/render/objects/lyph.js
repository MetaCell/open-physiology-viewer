import { objectBase } from './base';
import { objectTypes } from '../objectTypes';
import { reducerTypes } from '../reducer';
import { ThreeDFactory } from '../threeDFactory'; 
import { MaterialFactory } from '../materialFactory';

const LYPH_TOPOLOGY = Object.freeze({
  CYST: 'DASHED',
  BAG: 'THICK',
  BAG2: 'LINK'
})

LYPH_TOPOLOGY['BAG-'] = 'BAG-';
LYPH_TOPOLOGY['BAG+'] = 'BAG+';

export class Lyph extends objectBase
{
  _layers = [];
  _topology ;
  _radialTypes = [false, false];
  constructor(json, reducer)
  {
    super(json, objectTypes.lyphs, reducer);
    this.width = this._json.scale?.width ;
    this.height = this._json.scale?.height ;
    this.radius = this.height / 8 ;
    this.color = this._json.color ;
    this._topology = this._json.topology;
    this._groupped = true ;
    initRadialTypes();
  }

  initRadialTypes() {
      switch (this._topology) {
          case LYPH_TOPOLOGY.CYST   : this._radialTypes [true, true]; break;
          case LYPH_TOPOLOGY.BAG    : this._radialTypes[0] = true; break;
          case LYPH_TOPOLOGY.BAG2   : this._radialTypes[1] = true; break;
          case LYPH_TOPOLOGY["BAG-"]: this._radialTypes[0] = true; break;
          case LYPH_TOPOLOGY["BAG+"]: this._radialTypes[1] = true; break;
      }
  }

  merge() {
    const layers = this._json.layers;
    if (layers?.length > 0)
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
    const params = { color: this._color, polygonOffsetFactor: this._polygonOffsetFactor} ;
    //thickness, height, radius, top, bottom
    const lyph = lyphShape([this._width, this._height, this._radius, ...this._radialTypes]) ;
    let geometry = ThreeDFactory.createMeshWithBorder(lyph, params);

    const layers = [];

    const material = MaterialFactory.createMeshLambertMaterial({
        color: this.color,
        polygonOffsetFactor: this.polygonOffsetFactor
    });

    const parent = this._render(geometry, material, this._position);
    //group.add(parent);

    this._layers.forEach(layer =>{
      const renderedLayer = layer.render();
      layers.push(renderedLayer);
      //group.add(layers);
    });

    this._cache = parent ;
    
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