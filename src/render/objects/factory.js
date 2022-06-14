import { Node } from './node';
import { Chain } from './chain';
import { Link } from './link';
import { objectTypes } from '../objectTypes';

export default class factory
{
  static create(type, json, mediate) {
    let threeObj;

    if (type === objectTypes.chains) {
      threeObj = new Chain(json, mediate);
    } else if (type === objectTypes.links) {
      threeObj = new Link(json, mediate);
    } else if (type === objectTypes.nodes) {
      threeObj = new Node(json, mediate);
    }

    return threeObj;
  }
}

