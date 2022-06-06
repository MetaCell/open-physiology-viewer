import { renderConsts } from 'objectBase';

export class ThreeDFactory {
  static createSphereGeometry(val){
    return new THREE.SphereGeometry(val * renderConsts.verticeRelSize,
                                    renderConsts.verticeResolution
                                  , renderConsts.verticeResolution);
  }
}