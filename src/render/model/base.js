import { hightlight, unhighlight } from '../utils/highlight';
import { stringToColor } from '../utils/color';
import { mode } from 'd3';

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
  _generatedModel ;
  _id ;
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
  _val = 0.25 ;
  _position = new THREE.Vector3();
  _width = 100 ;
  _height = 100 ;
  _radius = 100 ;
  _children = [];
  _groupped = false ;
  _polygonOffsetFactor = 0;
  _shouldRender = true ;
  _reducer = undefined ;

  constructor(model, type, reducer)
  {
    this._generatedModel = model ;
    this._id = model.id ;
    this._color = model.color ;
    this._type = type ;
    this._reducer = reducer;
    if (this.model.layout)
      this._position = new THREE.Vector3(this.model.layout.x, this.model.layout.y, 0);
    this._shouldRender = ! model.isTemplate ;
  }

  fromJSON(json, modelClasses = {}, entitiesByID, namespace) {
    this._json = json ;
  }

  _render(mesh) { //implemented on child

  }

  //move, scale, skew, etc.
  transform(m) {
    const clone = Object.clone(this_.cache.transformation.apply(m));
    this._transformationMatrixes.push(m);
    this._transformedCache = clone ;
  }

  set height(h) { if(h) this._height = h }
  set width(w) { if(w) this._width = w }
  set color(c) { 
    this._color = c ? c : stringToColor(this._id); //hash id to color for constistent rendering
  }
  set transformation(t) {  }
  set radius(r) { if(r) this._radius = r }
  set position(p) { if(p) this._position = p }

  get id() { return this._id }
  get height() { return this._height }
  get width() { return this._width }
  get color() { return this._color }
  get transformation() {  }
  get radius() { return this._radius }

  get model() { return this._generatedModel }
  get shouldRender() { return this._shouldRender }

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

  mergeSuperTypes() {

  }

  accept(renderObjectVisitor){

  }
}