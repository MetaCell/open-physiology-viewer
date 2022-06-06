import { Node } from './objects/node';
import { Chain } from './objects/chain';
import { Link } from './objects/link';
import { objectTypes } from './objectTypes';

var objectFactory = function () {
  this.create = function (type, json) {
    var threeObj;

    if (type === objectTypes.CHAIN) {
      threeObj = new Chain();
    } else if (type === objectTypes.LINK) {
      threeObj = new Link();
    } else if (type === objectTypes.NODE) {
      threeObj = new Node(json);
    }

    return threeObj;
  }
}

export default objectFactory;