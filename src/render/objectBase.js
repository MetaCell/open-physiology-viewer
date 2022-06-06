import { hightlight, unhighlight } from './utils/highlight';

export const renderConsts = Object.freeze({
  verticeRelSize   : 4 ,     // volume per val unit
  verticeResolution: 8 ,     // how many slice segments in the sphere's circumference

  nodeVal          : 2 ,
  anchorVal        : 3 ,

  edgeResolution   : 32,     // number of points on curved link
  arrowLength      : 40,     // arrow length for directed links
});

function objectBase(json, type) {
  this._json = json ;
  this._type = type ;
  this._hidden = false ;
  this._cache = null ;
  this._isHighlighted = false ;
  this_.transformedCache = null ;
  this._transformationMatrixes = [] ;
}

objectBase.prototype.fromJSON = function(json, modelClasses = {}, entitiesByID, namespace) {
  this._json = json ;
}

//move, scale, skew, etc.
objectBase.prototype.transform = function(m) {
  const clone = Object.clone(this_.cache.transformation.apply(m));
  this._transformationMatrixes.push(m);
  this._transformedCache = clone ;
}

objectBase.prototype.highlight = function() {
  this._isHighlighted = true ;
  hightlight(objectBase._cache);
}

objectBase.prototype.unhighlight = function() {
  this._isHighlighted = false ;
  unhighlight(objectBase._cache);
}

objectBase.prototype.hide = function() {
  this.visible = false ;
}

objectBase.prototype.delete = function() {
  this._cache = null ;
}