import {copyCoords, extractCoords, getCenterOfMass, THREE} from "./utils";
import {MaterialFactory} from "./materialFactory";
import {modelClasses} from "../model";
const {VisualResource, Vertice, Node, Anchor} = modelClasses;

/**
 * Create visual object for vertice
 */
Vertice.prototype.createViewObjects = function(state) {
    VisualResource.prototype.createViewObjects.call(this, state);
    if (this.invisible){ return; }
    if (!this.viewObjects["main"]) {
        let geometry = new THREE.SphereGeometry(this.val * state.verticeRelSize,
            state.verticeResolution, state.verticeResolution);
        let material = MaterialFactory.createMeshLambertMaterial({
            color: this.color,
            polygonOffsetFactor: this.polygonOffsetFactor
        });
        let obj = new THREE.Mesh(geometry, material);
        // Attach vertice data
        obj.userData = this;
        this.viewObjects["main"] = obj;
    }
    this.createLabels();
};

/**
 * Update visual object for vertice
 */
Vertice.prototype.updateViewObjects = function(state) {
    VisualResource.prototype.updateViewObjects.call(this, state);
    if (!this.invisible) {
        copyCoords(this.viewObjects["main"].position, this);
        this.updateLabels( this.viewObjects["main"].position.clone().addScalar(this.state.labelOffset.Vertice));
    }
};

/**
 * Create visual objects for a node
 * @param state
 */
Node.prototype.createViewObjects = function(state) {
    this.val = this.val || state.nodeVal;
    Vertice.prototype.createViewObjects.call(this, state);
};

/**
 * Update visual objects for a node
 */
Node.prototype.updateViewObjects = function(state) {
    if (this.anchoredTo){
        copyCoords(this, this.anchoredTo);
    } else {
        if (this.fixed) {
            copyCoords(this, this.layout);
        }
        if (this.controlNodes) {
            copyCoords(this, getCenterOfMass(this.controlNodes));
        }
    }
    Vertice.prototype.updateViewObjects.call(this, state);
};

Object.defineProperty(Node.prototype, "polygonOffsetFactor", {
    get: function() { return 0; }
});


/**
 * Create visual resources for an anchor
 * @param state
 */
Anchor.prototype.createViewObjects = function(state){
    this.val = this.val || state.anchorVal;
    Vertice.prototype.createViewObjects.call(this, state);
};

/**
 * Update visual resources for an anchor
 */
Anchor.prototype.updateViewObjects = function(state) {
    if (this.layout) {
        let coords = extractCoords(this.layout);
        copyCoords(this, coords);
    }
    Vertice.prototype.updateViewObjects.call(this, state);
};

Anchor.prototype.relocate = function(delta, updateDependent = true){
    let v = extractCoords(delta);
    let p0 = extractCoords(this);
    let p = p0.clone().add(v);
    copyCoords(this.layout, p);
    this.updateViewObjects(this.state);
    if (updateDependent) {
        (this.onBorderInRegion || []).forEach(region => region.resize(this, delta));
    }
    const updateWires = (wire, prop) => {
        wire.updateViewObjects(this.state);
        (wire[prop].sourceOf || []).forEach(w => w.updateViewObjects(this.state));
        (wire[prop].targetOf || []).forEach(w => w.updateViewObjects(this.state));
    }
    (this.sourceOf || []).forEach(wire => updateWires(wire, "target"));
    (this.targetOf || []).forEach(wire => updateWires(wire, "source"));
}

Object.defineProperty(Anchor.prototype, "polygonOffsetFactor", {
    get: function() { return -10; }
});