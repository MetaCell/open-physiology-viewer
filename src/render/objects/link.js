import { objectBase } from '../objectBase';
import { objectTypes } from '../objectTypes';

function Link(json){
  objectBase.call(this, json, objectTypes.LINK);
}

Link.prototype.render = function() {

}

Link.prototype.highlight = function() {

}

Link.prototype.hide = function() {
  
}

Link.prototype.delete = function() {
  
}

export default Link ;