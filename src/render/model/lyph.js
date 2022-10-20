import { objectBase } from './base';
import { objectTypes } from './types';
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
  _isTemplate  = false ;
  _superType   = undefined ;

  _query   = undefined
  _reducer = undefined ;
  static type    = objectTypes.lyphs; 

  constructor(id, query, reducer, props)
  {
    if (id.indexOf('ref_mat_mat')) //TODO support materials
    {
      super(undefined, objectTypes.lyphs, reducer);
      return undefined ;
    }

    const obj = query(id, Lyph.type);
    const model = props ? Object.assign(obj, props) : obj ; 
    super(model, objectTypes.lyphs, reducer);
    this.color       = model.color ;
    this.width       = model.scale?.width ;
    this.height      = model.scale?.height ;
    this.radius      = model.radius || ( this.height / 8 ) ;
    this._topology   = LYPH_TOPOLOGY.BAG || this.model.topology;
    this._groupped   = true ;
    this._isTemplate = model.isTemplate ;
    this._superType  = model.supertype ;

    this._query = query ;
    this._reducer = reducer ;

    //this.initRadialTypes(); TODO for some reason this doesn't match model
    //layout based positioning and sizing
    if(model.layout)
      this.position = model.layout ;
    else {
      //link based positioning and sizing
      const linkId = model.conveys?.id ;
      if (linkId)
      {
        const link    = reducer(linkId);
        this.width    = link.width * 0.125 ;
        this.height   = link.width * 0.25 ;
        const source  = reducer(link._generatedModel.source.id)
        const target  = reducer(link._generatedModel.target.id)      
        this.position = getPointInBetweenByPerc(
          layoutToVector3(source.position), 
          layoutToVector3(target.position)
          , 0.5) ;
      }
    }
    this._autoArrangeLayers();
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
    const cloned = new Lyph(this._id, this._query, this._reducer, props);
    cloned._layers = this._layers ;
    cloned._isTemplate = false ;
    return cloned ;
  }

  _autoArrangeLayers()
  {
    const totalLayers = this.model.layers?.length ; 
    if( totalLayers > 0)
    {
      this.model.layers.forEach((layer, i)=>{
        const width  = this._width  / totalLayers;
        const height = this._height ;
        const radius = height / 8 ;
        const color  = layer.color ;
        const scale  = { width, height, radius }
        const x = this.position.x + i * width;
        const y = this.position.y ;
        const z = 0.1 ;
        const id = layer.id ;
        const layout = { x, y, z }
        const innerLayer = new Lyph(id, this._query, this._reducer, { scale, layout, color })
        this._layers.push(innerLayer);
      })
    }
  }

  render() {
    if ((!this._shouldRender) || (!this._generatedModel))
      return null ;

    //const group     = new THREE.Group();
    const hasLayers = this._layers.length > 0 ;

    const params   = { color: this._color, polygonOffsetFactor: this._polygonOffsetFactor} ;
    //thickness, height, radius, top, bottom
    const shape = ThreeDFactory.lyphShape([this._width, this._height, this._radius, ...this._radialTypes]) ;
    
    let mesh       = ThreeDFactory.createMeshWithBorder(shape, params);
    mesh.position.set(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100));
    //group.add(mesh);
    return mesh;
    // if (hasLayers)
    // {      
    //   this._layers.forEach( l => {
    //     const renderedLayer = l.render();
    //     if (renderedLayer)
    //     {
    //       renderedLayer.visible = true ;
    //       group.add(renderedLayer);
    //     }
        
    //   })
    // }

    // if(this._generatedModel.layerIn !== undefined)
    //   group.visible = false ;

    // group.userData = this._generatedModel ;

    // this._cache = group ;
    
    // return this._cache ;
  }
}