import { objectBase } from './base';
import { objectTypes } from '../objectTypes';
import { ThreeDFactory } from '../threeDFactory'; 
import { MaterialFactory } from '../materialFactory';

export class Node extends objectBase
{
  constructor(json, reducer)
  {
    super(json, objectTypes.nodes, reducer);
    this._color = json.color || this._color;
    this._val = json.val || this._val;
    if (this._json.layout)
      this._position = new THREE.Vector3(this._json.layout.x, this._json.layout.y, 0);
  }

  render() {
    const geometry = ThreeDFactory.createSphereGeometry(this._val);
    
    const material = MaterialFactory.createMeshLambertMaterial({
        color: this._color,
        polygonOffsetFactor: this._polygonOffsetFactor
    });
  
    return this._render(geometry, material, this._position);
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

  accept(renderObjectVisitor){
    renderObjectVisitor.visit(this);
  }
}