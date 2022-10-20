import { Node } from './node';
import { Link } from './link';
import { Wire } from './wire';
import { objectTypes, mainObjectTypes, scaffoldTypes } from './types';
import { Lyph } from './lyph';
import { Anchor } from './anchor';

export default class factory
{
  static create(id, type, query, reducer, scaffold_index = -1) {
    let threeObj;

    if (type === mainObjectTypes.links) {
      threeObj = new Link(id, query, reducer);
    } else if (type === mainObjectTypes.nodes) {
      threeObj = new Node(id, query, reducer);
    } else if (type === objectTypes.lyphs) {
      threeObj = new Lyph(id, query, reducer);
    } else if (type === objectTypes.layers) {
      threeObj = new Layer(id, query, reducer);
    } else if ( type === scaffoldTypes.wires) {
      threeObj = new Wire(id, query, reducer, scaffold_index);
    } else if ( type === scaffoldTypes.anchors ) {
      threeObj = new Anchor(id, query, reducer, scaffold_index);
    }

    return threeObj;
  }
}
