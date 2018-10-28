import * as three from 'three';
const THREE = window.THREE || three;
import {Entity} from './entityModel';
import {copyCoords} from './utils';
import {extractCoords, createMeshWithBorder, getCenterOfMass} from '../three/utils';

/**
 * Class that creates visualization objects of regions
 */
export class Region extends Entity {

    static fromJSON(json, modelClasses = {}, entitiesByID) {
        return super.fromJSON(json, modelClasses, entitiesByID, true);
    }

    get polygonOffsetFactor() {
        let res = 0;
        if (this.host) {
            res = Math.min(res, this.host.polygonOffsetFactor + 1);
        }
        return res;
    }

    translate(p0) {
        if (!p0 || !this.viewObjects["main"]) { return p0; }
        let p = p0.clone();
        return p;
    }


    /**
     * Create view model for the class instance
     * @param state - layout settings
     */
    createViewObjects(state) {
        if (!this.viewObjects["main"]) {
            if (this.host) {
                let s = this.host.length / (this.host.hostedRegions? this.host.hostedRegions.length : 1);
                this.points = [
                    {"x": -s, "y": -s/2, "z": -1},
                    {"x": -s, "y":  s/2, "z": -1},
                    {"x":  s, "y":  s/2, "z": -1},
                    {"x":  s, "y": -s/2, "z": -1}
                ].map(p => extractCoords(p));
            }

            this.points.push(this.points[0]); //make closed shape
            this.center = getCenterOfMass(this.points);

            let shape = new THREE.Shape(this.points);
            let obj = createMeshWithBorder(shape, {
                color: this.color,
                polygonOffsetFactor: this.polygonOffsetFactor
            });
            obj.userData = this;
            this.viewObjects['main'] = obj;

            this.border.createViewObjects(state);
        }

        this.createLabels(state.labels[this.constructor.name], state.fontParams);
    }

    /**
     * Update positions of regions in the force-directed graph (and their inner content)
     * @param state - view settings
     */
    updateViewObjects(state) {
        const linkObj = this.viewObjects["main"];
        if (!linkObj) { return; }

        if (this.host){
            copyCoords(linkObj.position, this.center);
        }

        // Update buffer geometry
        // let linkPos = linkObj.geometry.attributes && linkObj.geometry.attributes.position;
        // if (linkPos) {
        //     for (let i = 0; i < this.points.length; i++) {
        //         linkPos.array[3 * i] = this.points[i].x;
        //         linkPos.array[3 * i + 1] = this.points[i].y;
        //         linkPos.array[3 * i + 2] = this.points[i].z;
        //     }
        //     linkPos.needsUpdate = true;
        //     linkObj.geometry.computeBoundingSphere();
        // }

        this.border.updateViewObjects(state);

        this.updateLabels(state.labels[this.constructor.name], state.showLabels[this.constructor.name], this.center.clone().addScalar(5));

    }
}
