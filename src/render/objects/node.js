import { base } from '../base';
import { objectTypes } from '../objectTypes';
import { MaterialFactory } from '../materialFactory';
import { ThreeDFactory } from '../threeDFactory';

function Node(json){
  base.call(this, json, objectTypes.NODE);
}

base.prototype.render = function() {
  const geometry = ThreeDFactory.createSphereGeometry(this.json.val);

  const material = MaterialFactory.createMeshLambertMaterial({
      color: this.json.color,
      polygonOffsetFactor: this.json.polygonOffsetFactor
  });

  this._cache = new THREE.Mesh(geometry, material);
}

export default Node ;