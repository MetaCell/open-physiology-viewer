import { hightlight, unhighlight } from '../utils/highlight';

const edgeStroke = Object.freeze({
  DASHED: 'DASHED',
  THICK: 'THICK',
  LINK: 'LINK'
})

const edgeGeometry = Object.freeze({
  GEOMETRY: 'GEOMETRY',
  PATH: 'PATH'
})

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
  EDGE_STROKE: edgeStroke,
  EDGE_GEOMETRY: edgeGeometry
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
  _width = 100 ;
  _height = 100 ;
  _radius = 100 ;
  _children = [];
  _groupped = false ;
  _polygonOffsetFactor = 0;

  _reducer = undefined ;

  constructor(json, type, reducer)
  {
    this._json = json ;
    this._type = type ;
    this._reducer = reducer
  }

  fromJSON(json, modelClasses = {}, entitiesByID, namespace) {
    this._json = json ;
  }

  _render(geometry, material, position) {
    geometry.translate(position.x, position.y, 0);
    const mesh = new THREE.Mesh(geometry, material);
    return mesh ;
  }

  //move, scale, skew, etc.
  transform(m) {
    const clone = Object.clone(this_.cache.transformation.apply(m));
    this._transformationMatrixes.push(m);
    this._transformedCache = clone ;
  }

  set height(h) { if(h) this._height = h }
  set width(w) { if(w) this._width = w }
  set color(c) { if(c) this._color = c }
  set transformation(t) {  }
  set radius(r) { this._radius = r }

  get position() { return this._position }

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

  merge() {

  }

  accept(renderObjectVisitor){

  }
}