import { Chain, Link, Node } from './objects'
import { objectTypes } from './objectTypes';

var objectFactory = function () {
  this.createEmployee = function (type) {
    var threeObj;

    if (type === objectTypes.CHAIN) {
      threeObj = new Chain();
    } else if (type === objectTypes.LINK) {
      threeObj = new Link();
    } else if (type === objectTypes.NODE) {
      threeObj = new Node();
    }

    return threeObj;
  }
}

export default objectFactory;