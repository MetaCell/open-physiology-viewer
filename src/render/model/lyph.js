import { objectBase } from './base';
import { objectTypes } from './types';
import { reducerTypes, queryTypes } from '../query/reducer';
import { ThreeDFactory } from '../3D/threeDFactory'; 

const LYPH_TOPOLOGY = Object.freeze({
  CYST: 'DASHED',
  BAG: 'THICK',
  BAG2: 'LINK'
})

export class Lyph extends objectBase
{
  _layers = [];
  _topology ;
  _radialTypes = [false, false];
  constructor(json, query)
  {
    super(json, objectTypes.lyphs, query);
    this.width = this._json.scale?.width ;
    this.height = this._json.scale?.height ;
    this.radius = this.height / 8 ;
    this.color = this._json.color ;
    this._topology = LYPH_TOPOLOGY.BAG || this._json.topology;
    this._groupped = true ;
    this.initRadialTypes();
    //link based positioning and sizing
    const link = query(this.id, reducerTypes.pop, queryTypes.conveyingLyph ); //get the conveying lyph link width
    if (link)
    {
      this.width = link.width * 0.5 ;
      this.position = link.position ;
    }
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
        const layer = this._reducer(l, reducerTypes.pop, queryTypes.id)
        this._reducer(id, reducerTypes.delete, queryTypes.id); 
        // layer.width = layerWidth ;
        // layer.height = layerHeight ;
        this._layers.push(layer);
      });
    }
  }

  render() {
    const params = { color: this._color, polygonOffsetFactor: this._polygonOffsetFactor} ;
    //thickness, height, radius, top, bottom
    const geometry = ThreeDFactory.lyphShape([this._width, this._height, this._radius, ...this._radialTypes]) ;
    let mesh = ThreeDFactory.createMeshWithBorder(geometry, params);
    mesh.position.set(this.position.x, this.position.y, 0);
    this._cache = mesh ;
    
    return this._cache ;
  }
}