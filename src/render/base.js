import { hightlight, unhighlight } from '../../utils/highlight';

export const renderConsts = Object.freeze({
  verticeRelSize   : 4 ,     // volume per val unit
  verticeResolution: 8 ,     // how many slice segments in the sphere's circumference

  nodeVal          : 2 ,
  anchorVal        : 3 ,

  edgeResolution   : 32,     // number of points on curved link
  arrowLength      : 40,     // arrow length for directed links
});

function base(json, type) {
  this._json = json ;
  this._type = type ;
  this._hidden = false ;
  this._cache = null ;
}

base.prototype.highlight = function() {
  hightlight(base._cache);
}

base.prototype.unhighlight = function() {
  unhighlight(base._cache);
}

base.prototype.hide = function() {
  this._cache.visible = false ;
}

base.prototype.delete = function() {
  this._cache = null ;
}