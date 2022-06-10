import { Node } from './objects/node';
import { Chain } from './objects/chain';
import { Link } from './objects/link';
import { objectTypes } from './objectTypes';

export default class objectFactory
{
  static create(type, json) {
    let threeObj;

    if (type === objectTypes.chains) {
      threeObj = new Chain(json);
    } else if (type === objectTypes.links) {
      threeObj = new Link(json);
    } else if (type === objectTypes.nodes) {
      threeObj = new Node(json);
    }

    return threeObj;
  }
}

