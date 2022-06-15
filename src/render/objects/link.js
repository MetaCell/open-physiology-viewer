import { objectBase } from './base';
import { objectTypes } from '../objectTypes';

export class Link extends objectBase
{
  constructor(json, mediate)
  {
    super(json, objectTypes.links, mediate)
  }

  render = function() {
    return null ;
  }

  highlight() {
    super.highlight();
  }

  hide() {
    super.hide();
  }

  delete() {
    super.delete();
  }
}