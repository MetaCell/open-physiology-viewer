import { Node } from './node';
import { Chain } from './chain';
import { Link } from './link';
import { objectTypes } from './types';
import { Lyph } from './lyph';
export default class factory
{
  static create(id, type, query, reducer) {
    let threeObj;

    if (type === objectTypes.chains) {
      threeObj = new Chain(id, query, reducer);
    } else if (type === objectTypes.links) {
      threeObj = new Link(id, query, reducer);
    } else if (type === objectTypes.nodes) {
      threeObj = new Node(id, query, reducer);
    } else if (type === objectTypes.lyphs) {
      threeObj = new Lyph(id, query, reducer);
    } else if (type === objectTypes.layers) {
      threeObj = new Layer(id, query, reducer);
    }

    return threeObj;
  }
}

