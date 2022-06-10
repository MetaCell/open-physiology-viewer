import { hightlight, unhighlight } from './utils/highlight';

export const renderConsts = Object.freeze({
  verticeRelSize   : 4 ,     // volume per val unit
  verticeResolution: 8 ,     // how many slice segments in the sphere's circumference

  nodeVal          : 2 ,
  anchorVal        : 3 ,

  edgeResolution   : 32,     // number of points on curved link
  arrowLength      : 40,     // arrow length for directed links
  highlightColor : 0xff0000,
  selectColor    : 0x00ff00,
  defaultColor   : 0x000000,
  scaleFactor    : 10,
  isConnectivity : true,
});

export class objectBase
{
  _json ;
  _type ;
  _hidden = false ;
  _cache = null ;
  _isHighlighted = false ;
  _transformedCache = null ;
  _transformationMatrixes = [] ;
  _geometry = null;
  _material = null ;
  _mesh = null ;
  //render props
  _color = renderConsts.defaultColor ;
  _val = 1.0 ;
  _position = new THREE.Vector3();

  constructor(json, type)
  {
    this._json = json ;
    this._type = type ;
  }

  fromJSON(json, modelClasses = {}, entitiesByID, namespace) {
    this._json = json ;
  }

  _render() {
    debugger;
    this._geometry.translate(this._position.x, this._position.y, 0);
    this._mesh = new THREE.Mesh(this._geometry, this._material);
 
    return this._mesh ;
  }

  //move, scale, skew, etc.
  transform(m) {
    const clone = Object.clone(this_.cache.transformation.apply(m));
    this._transformationMatrixes.push(m);
    this._transformedCache = clone ;
  }

  highlight() {
    this._isHighlighted = true ;
    hightlight(objectBase._cache);
  }

  unhighlight() {
    this._isHighlighted = false ;
    unhighlight(objectBase._cache);
  }

  hide() {
    this.visible = false ;
  }

  delete() {
    this._cache = null ;
  }
}