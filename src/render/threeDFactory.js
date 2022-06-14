import { renderConsts } from './objects/base';

export class ThreeDFactory {
  static createSphereGeometry(radius){
    return new THREE.SphereGeometry(radius * renderConsts.verticeRelSize,
                                    renderConsts.verticeResolution
                                  , renderConsts.verticeResolution);
  }
  static createBoxGeometry(width, height){
    return new THREE.BoxGeometry(width, height);
  }
}