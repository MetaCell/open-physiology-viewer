import { renderConsts } from './objects/base';

export class ThreeDFactory {
  static createSphereGeometry(val){
    return new THREE.SphereGeometry(val * renderConsts.verticeRelSize,
                                    renderConsts.verticeResolution
                                  , renderConsts.verticeResolution);
  }
}