import { objectBase } from './base';
import { objectTypes } from './types';
import { reducerTypes, queryTypes } from '../query/reducer';
import { ThreeDFactory } from '../3D/threeDFactory'; 
import { _clone, _cloneDeep } from 'lodash-bound';
import { getPointInBetweenByPerc } from '../autoLayout/objects';
import { layoutToVector3 } from '../autoLayout/objects';

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
  _isTemplate = false ;
  _superType = undefined ;

  constructor(model, query)
  {
    super(model, objectTypes.lyphs, query);
    this.width       = model.scale?.width ;
    this.height      = model.scale?.height ;
    this.radius      = this.height / 8 ;
    this._topology   = LYPH_TOPOLOGY.BAG || this.model.topology;
    this._groupped   = true ;
    this._isTemplate = model.isTemplate ;
    this._superType  = model.supertype ;

    this.initRadialTypes();
    //link based positioning and sizing
    const link = model.conveys ;
    if (link)
    {
      this.width = link.length * 0.5 ;      
      this.position = getPointInBetweenByPerc(
          layoutToVector3(link.source.layout)
        , layoutToVector3(link.target.layout)
        , 0.5) ;
    }
  }

  get layers() { return this._layers ; }

  initRadialTypes() {
    switch (this._topology) {
      case LYPH_TOPOLOGY.CYST   : this._radialTypes [true, true]; break;
      case LYPH_TOPOLOGY.BAG    : this._radialTypes[0] = true; break;
      case LYPH_TOPOLOGY.BAG2   : this._radialTypes[1] = true; break;
      case LYPH_TOPOLOGY["BAG-"]: this._radialTypes[0] = true; break;
      case LYPH_TOPOLOGY["BAG+"]: this._radialTypes[1] = true; break;
    }
  }

  clone() {
    const cloned = new Lyph(this._json, this._reducer);
    cloned._layers = this._layers ;
    cloned._isTemplate = false ;
    return cloned ;
  }

  _autoArrangeLayers()
  {
    const totalLayers = this._layers.length ; 
    if( totalLayers > 0)
    {
      this._layers.forEach((layer, i)=>{
        const layerWidth = this._width  ;
        const layerHeight = this._height / totalLayers;
        const starty = this.position.y + ( -1 * this._height * 0.5 ) + layerHeight * 0.5;
        layer.width = layerWidth ;
        layer.height = layerHeight ;
        layer.radius = layerHeight / 8 ;
        layer.position.y = starty + (i * layerHeight); ;
        layer.position.x = this.position.x ;
        layer.position.z = 0.1 ; //avoid z-fighting
      })
    }
  }

  _mergeSuperTypeProps(superType)
  {
    const clonedLayers = [];
    superType.layers.forEach(l => {
      const clonedLayer = l.clone();
      clonedLayers.push(clonedLayer);
    })
    this._layers =  clonedLayers;
    this._autoArrangeLayers();
  }

  mergeSuperTypes()
  {
    if (this._superType)
    {
      const superType = this._reducer(this._superType, reducerTypes.pop, queryTypes.id);
      this._mergeSuperTypeProps(superType);
      return ;
    }
  }

  merge() 
  {
    const layers = this._json.layers;
    if (layers?.length > 0)
    {
      layers?.forEach( (l, i) => {
        const id = l.id ?? l ;
        const layer = this._reducer(id, reducerTypes.pop, queryTypes.id)
        this._reducer(id, reducerTypes.delete, queryTypes.id); 
        this._layers.push(layer);
      });
      this._autoArrangeLayers();
    }
    return ;
  }

  render() {
    //don't render templates
    if (this._isTemplate)
      return null ;

    const group = new THREE.Group();
    const hasLayers = this._layers.length > 0 ;

    const params = { color: this._color, polygonOffsetFactor: this._polygonOffsetFactor} ;
    //thickness, height, radius, top, bottom
    const geometry = ThreeDFactory.lyphShape([this._width, this._height, this._radius, ...this._radialTypes]) ;
    let mesh = ThreeDFactory.createMeshWithBorder(geometry, params);
    mesh.position.set(this.position.x, this.position.y, this.position.z);
    group.add(mesh);

    if (hasLayers)
    {      
      this._layers.forEach( l => {
        const renderedLayer = l.render();
        group.add(renderedLayer);
      })
    }

    this._cache = group ;
    
    return this._cache ;
  }
}