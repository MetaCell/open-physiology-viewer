import {NgModule, Component, ViewChild, ElementRef, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {keys, values, defaults, cloneDeep} from 'lodash-bound';
import * as THREE from 'three';
import {SearchBarModule} from './gui/searchBar';
import {MatSliderModule, MatCheckboxModule, MatRadioModule} from '@angular/material'
import FileSaver  from 'file-saver';

import ThreeForceGraph   from '../three/threeForceGraph';
import {
    forceX,
    forceY,
    forceZ
} from 'd3-force-3d';

import {ResourceInfoModule} from './gui/resourceInfo';

const OrbitControls = require('three-orbit-controls')(THREE);
const WindowResize = require('three-window-resize');

/**
 * @ignore
 */
@Component({
    selector: 'webGLScene',
    template: `
        <section id="viewPanel" class="w3-row">
            <section id="canvasContainer" [class.w3-twothird]="showPanel">
                <section class="w3-padding-right" style="position:relative;">
                    <section class="w3-bar-block w3-right" style="position:absolute; right:0">
                        <button *ngIf="!lockControls" class="w3-bar-item w3-hover-light-grey"
                                (click)="toggleLockControls()" title="Lock controls">
                            <i class="fa fa-lock"> </i>
                        </button>
                        <button *ngIf="lockControls" class="w3-bar-item w3-hover-light-grey"
                                (click)="toggleLockControls()" title="Unlock controls">
                            <i class="fa fa-unlock"> </i>
                        </button>
                        <button class="w3-bar-item w3-hover-light-grey" (click)="updateGraphLayout()"
                                title="Update layout">
                            <i class="fa fa-refresh"> </i>
                        </button>
                        <button *ngIf="!showPanel" class="w3-bar-item w3-hover-light-grey"
                                (click)="toggleSettingPanel()" title="Show settings">
                            <i class="fa fa-cog"> </i>
                        </button>
                        <button *ngIf="showPanel" class="w3-bar-item w3-hover-light-grey"
                                (click)="toggleSettingPanel()" title="Hide settings">
                            <i class="fa fa-window-close"> </i>
                        </button>
                        <mat-slider vertical class="w3-grey"
                                    [min]="0.1 * scaleFactor" [max]="0.4 * scaleFactor"
                                    [step]="0.05 * scaleFactor" tickInterval="1"
                                    [value]="labelRelSize" title="Label size"
                                    (change)="onScaleChange($event.value)">
                        </mat-slider>
                        <button class="w3-bar-item w3-hover-light-grey"
                                (click)="export()" title="Export layout">
                            <i class="fa fa-save"> </i>
                        </button>
                    </section>
                    <canvas #canvas class="w3-card w3-round"> </canvas>
                </section>
            </section>
            <section id="settingsPanel" *ngIf="showPanel" class="w3-third">
                <section class="w3-padding-small">

                    <!--Highlighted entity-->

                    <fieldset *ngIf="config.highlighted" class="w3-card w3-round w3-margin-small">
                        <legend>Highlighted</legend>
                        <resourceInfoPanel *ngIf="!!_highlighted" [resource]="_highlighted"> </resourceInfoPanel>
                    </fieldset>

                    <!--Search bar-->

                    <fieldset class="w3-card w3-round w3-margin-small-small">
                        <legend>Search</legend>
                        <searchBar [selected]="_selectedName" [searchOptions]="_searchOptions"
                                   (selectedItemChange)="selectBySearch($event)">
                        </searchBar>
                    </fieldset>

                    <!--Selected entity-->

                    <fieldset *ngIf="config.selected" class="w3-card w3-round w3-margin-small">
                        <legend>Selected</legend>
                        <resourceInfoPanel *ngIf="!!_selected" [resource]="_selected">
                        </resourceInfoPanel>
                        <button *ngIf="!!_selected" title="Edit"
                                class="w3-hover-light-grey w3-right" (click)="editResource.emit(_selected)">
                            <i class="fa fa-edit"> </i>
                        </button>
                    </fieldset>

                    <!--Group controls-->

                    <fieldset class="w3-card w3-round w3-margin-small">
                        <legend>Groups</legend>
                        <span *ngFor="let group of graphData.activeGroups">
                            <mat-checkbox matTooltip="Toggle groups" labelPosition="after" class="w3-margin-left" 
                                          (change) = "toggleGroup(group)"
                                          [checked]= "showGroup(group)"> {{group.name || group.id}}
                            </mat-checkbox>
                        </span>
                    </fieldset>

                    <!--Layout config-->

                    <fieldset class="w3-card w3-round w3-margin-small">
                        <legend>Layout</legend>
                        <mat-checkbox matTooltip="Toggle lyphs" labelPosition="after" class="w3-margin-left"
                                      (change) = "toggleLayout('showLyphs')"
                                      [checked]= "config.layout.showLyphs"> Lyphs
                        </mat-checkbox>
                        <mat-checkbox matTooltip = "Toggle layers" labelPosition="after" [disabled]="!config.layout.showLyphs" class="w3-margin-left"
                                      (change) = "toggleLayout('showLayers')"
                                      [checked] = "config.layout.showLayers"> Layers
                        </mat-checkbox>
                        <mat-checkbox matTooltip="Toggle 3D lyphs" labelPosition="after" [disabled]="!config.layout.showLyphs" class="w3-margin-left"
                                      (change) = "toggleLayout('showLyphs3d')"
                                      [checked] = "config.layout.showLyphs3d"> Lyphs 3D
                        </mat-checkbox>
                        <mat-checkbox matTooltip="Toggle coalescences" labelPosition="after" [disabled]="!config.layout.showLyphs" class="w3-margin-left"
                                      (change) = "toggleLayout('showCoalescences')"
                                      [checked] = "config.layout.showCoalescences"> Coalescences
                        </mat-checkbox> 
                    </fieldset>

                    <!--Label config-->
 
                    <fieldset class="w3-card w3-round w3-margin-small">
                        <legend>Labels</legend>
                        <span *ngFor="let labelClass of _labelClasses">
                            <mat-checkbox matTooltip="Toggle labels" labelPosition="after" class="w3-margin-left"
                                   [checked]="config.labels[labelClass]"
                                   (change)="updateLabels(labelClass)"> {{labelClass}}
                            </mat-checkbox> 
                        </span>
                        <span *ngFor="let labelClass of _labelClasses">
                            <fieldset *ngIf="config.labels[labelClass]" class="w3-card w3-round w3-margin-small">
                                <legend>{{labelClass}} label</legend>
                                <mat-radio-group [(ngModel)]="_labels[labelClass]">
                                    <mat-radio-button *ngFor="let labelProp of _labelProps" class="w3-margin-left"
                                           [value] = "labelProp"
                                           (change) = "updateLabelContent()"> {{labelProp}}
                                    </mat-radio-button>
                                </mat-radio-group>
                            </fieldset>
                        </span>
                    </fieldset>
                    <!--View helpers-->

                    <fieldset class="w3-card w3-round w3-margin-small">
                        <legend>Helpers</legend>
                        <span *ngFor="let helper of helperKeys">
                            <mat-checkbox matTooltip="Toggle planes" labelPosition="after" class="w3-margin-left"
                                  [checked] = "showPlane(helper)"
                                  (change) = "togglePlane(helper)"> {{helper}}
                            </mat-checkbox> 
                        </span>
                    </fieldset>
                </section>
            </section>
        </section>
    `,
    styles: [`
        #viewPanel {
            height: 100vh;
        }

        #settingsPanel{
            height: 100vh;
            overflow-y: scroll;
        }

        :host >>> fieldset {
            border: 1px solid grey;
            margin: 2px;
        }

        :host >>> legend {
            padding: 0.2em 0.5em;
            border : 1px solid grey;
            color  : grey;
            font-size: 90%;
            text-align: right;
        }
    `]
})
/**
 * @class
 * @property {Object} helpers
 * @property {Object} defaultConfig
 */
export class WebGLSceneComponent {
    @ViewChild('canvas') canvas: ElementRef;

    showPanel = false;
    scene;
    camera;
    renderer;
    canvasContainer;
    settingsPanel;
    controls;
    mouse;
    windowResize;

    _highlighted = null;
    _selected    = null;

    _searchOptions;
    _selectedName = "";

    highlightColor = 0xff0000;
    selectColor    = 0x00ff00;
    defaultColor   = 0x000000;

    graph;
    helpers   = {};
    scaleFactor  = 8; //TODO make this a graph parameter with complete layout update on change
    labelRelSize = 0.1 * this.scaleFactor;
    lockControls = false;

    @Input() modelClasses;

    @Input('graphData') set graphData(newGraphData) {
        if (this._graphData !== newGraphData) {
            this._graphData = newGraphData;
            this.config = this._graphData.config || this.config;
            this._graphData.showGroups(this._showGroups);
            this._searchOptions = (this._graphData.entities||[]).filter(e => e.name).map(e => e.name);
            /*Map initial positional constraints to match the scaled image*/
            this._graphData.scale(this.scaleFactor);
            if (this.graph) { this.graph.graphData(this._graphData); }
        }
    }

    @Input('highlighted') set highlighted(entity) {
        if (this.highlighted === entity){ return; }
        if (this.highlighted !== this.selected){
            this.unhighlight(this._highlighted);
        } else {
            this.highlight(this.selected, this.selectColor, false);
        }
        this.highlight(entity, this.highlightColor, entity !== this._selected);
        this._highlighted = entity;
        this.highlightedItemChange.emit(entity);
    }

    @Input('selected') set selected(entity){
        if (this.selected === entity){ return; }
        this.unhighlight(this._selected);
        this.highlight(entity, this.selectColor, entity !== this.highlighted);
        this._selected     = entity;
        this._selectedName = entity? entity.name || "": "";
        this.selectedItemChange.emit(entity);
    }

    /**
     * @emits highlightedItemChange - the highlighted item changed
     */
    @Output() highlightedItemChange = new EventEmitter();

    /**
     * @emits selectedItemChange - the selected item changed
     */
    @Output() selectedItemChange = new EventEmitter();


    @Output() editResource = new EventEmitter();

    constructor(){
        this.config = {
            "layout": {
                "showLyphs"       : true,
                "showLayers"      : true,
                "showLyphs3d"     : false,
                "showCoalescences": false
            },
            "groups": true,
            "labels": {
                "Node"  : true, //{show: true, "label": "id"}
                "Link"  : false,
                "Lyph"  : false,
                "Region": false
            },
            "highlighted": true,
            "selected"   : true
        };
        this._labelClasses = this.config["labels"]::keys();
        this._labelProps   = ["id", "name"];
        this._labels       = {Node: "id", Link: "id", Lyph: "id", Region: "id"};
        this._showGroups   = new Set();
    }

    onScaleChange(newLabelScale){
        this.labelRelSize = newLabelScale;
        if (this.graph){ this.graph.labelRelSize(this.labelRelSize); }
    }

    get graphData() {
        return this._graphData;
    }

    ngAfterViewInit() {
        if (this.renderer) {  return; }

        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement});
        this.renderer.setClearColor(0xffffff);

        this.canvasContainer = document.getElementById('canvasContainer');
        this.settingsPanel   = document.getElementById('settingsPanel');

        let width = this.canvasContainer.clientWidth;
        let height = this.canvasContainer.clientHeight;

        this.camera = new THREE.PerspectiveCamera(70, width / height, 10, 4000);
        this.camera.position.set(0, 0, 100 * this.scaleFactor );
        this.camera.aspect = width / height;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.minDistance = 10;
        //Keeps rotated graph in camera range to avoid disappearing
        this.controls.maxDistance = 4000 - 100 * this.scaleFactor;

        this.scene = new THREE.Scene();
        this.camera.updateProjectionMatrix();

        // Lights
        const ambientLight = new THREE.AmbientLight(0xcccccc);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(300, 0, 300);
        this.scene.add(pointLight);

        this.mouse = new THREE.Vector2(0, 0);
        this.createEventListeners(); // keyboard / mouse events
        this.resizeCanvasToDisplaySize();
        this.createHelpers();
        this.createGraph();
        this.animate();

        console.log("CONFIG", this.config);
    }


    export(){
        if (this._graphData){
            let result = JSON.stringify(this._graphData.export(), null, 2);
            const blob = new Blob([result], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(blob, 'apinatomy-layout.json');
        }
    }

    createEventListeners() {
        window.addEventListener('mousemove', evt => this.onMouseMove(evt), false);
        window.addEventListener('dblclick', () => this.onDblClick(), false );
        window.addEventListener('keydown'  , evt => this.onKeyDown(evt)  , false);
    }

    resizeCanvasToDisplaySize() {
        const delta = 5;
        const width  = this.canvasContainer.clientWidth;
        const height = this.canvasContainer.clientHeight;
        if (Math.abs(this.renderer.domElement.width - width) > delta
            || Math.abs(this.renderer.domElement.height - height) > delta) {
            const dimensions = function(){ return { width, height } };
            this.windowResize = new WindowResize(this.renderer, this.camera, dimensions);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            window.dispatchEvent(new Event('resize'));
        }
    }

    animate() {
        this.resizeCanvasToDisplaySize();
        if (this.graph) {
            this.graph.tickFrame();
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(() => this.animate());
    }

    createHelpers() {
        let gridColor = new THREE.Color(0xcccccc);
        let axisColor = new THREE.Color(0xaaaaaa);
        let axisLength = 100 * this.scaleFactor;

        // x-y plane
        let gridHelper1 = new THREE.GridHelper(2 * axisLength, 10, axisColor, gridColor);
        gridHelper1.geometry.rotateX(Math.PI / 2);
        this.scene.add(gridHelper1);
        this.helpers["Grid x-y"] = gridHelper1;

        // x-z plane
        let gridHelper2 = new THREE.GridHelper(2 * axisLength, 10, axisColor, gridColor);
        this.scene.add(gridHelper2);
        this.helpers["Grid x-z"] = gridHelper2;

        let axesHelper = new THREE.AxesHelper(axisLength + 10);
        this.scene.add(axesHelper);
        this.helpers["Axis"] = axesHelper;
        this.helpers::values().forEach(value => value.visible = false);
    }

    createGraph() {
        this.graph = new ThreeForceGraph().graphData(this.graphData);

        const forceVal = (d, key) => {
            return ((key in d.layout) ? d.layout[key] : 0);
        };

        const forceStrength = (d, key) => {
            return (key in d.layout) ? 1 : 0
        };

        this.graph.d3Force("x", forceX().x(d => forceVal(d, "x")).strength(d => forceStrength(d, "x")));
        this.graph.d3Force("y", forceY().y(d => forceVal(d, "y")).strength(d => forceStrength(d, "y")));
        this.graph.d3Force("z", forceZ().z(d => forceVal(d, "z")).strength(d => forceStrength(d, "z")));

        this.graph.d3Force("link")
            .distance(d => d.length )
            .strength(d => (d.strength ? d.strength :
                (d.source && d.source.fixed && d.target && d.target.fixed || !d.length) ? 0 : 1));

        this.graph.labelRelSize(this.labelRelSize);
        this.graph.showLabels(this.config["labels"]);
        this.scene.add(this.graph);
    }

    updateGraphLayout() {
        if (this.graph){ this.graph.graphData(this.graphData); }
    }

    toggleLockControls(){
        this.lockControls = !this.lockControls;
        this.controls.enabled = !this.lockControls;
    }

    toggleSettingPanel() {
        this.showPanel = !this.showPanel;
    }

    getMousedOverEntity() {
        if (!this.graph) { return; }
        let vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
        vector.unproject(this.camera);
        let ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

        const selectLayer = (entity) => {
            //Refine selection to layers
            if (entity && entity.layers) {
                let layerMeshes = entity.layers.map(layer => layer.viewObjects["main"]);
                let layerIntersects = ray.intersectObjects(layerMeshes);
                if (layerIntersects.length > 0) {
                    return selectLayer(layerIntersects[0].object.userData);
                }
            }
            return entity;
        };

        let intersects = ray.intersectObjects(this.graph.children);
        if (intersects.length > 0) {
            let entity = intersects[0].object.userData;
            if (!entity|| entity.inactive) { return; }
            return selectLayer(entity);
            // let children = intersects[0].object.children||[];
            // let childIntersects = (ray.intersectObjects(children)||[]).filter(obj => obj.userData);
            // if (childIntersects.length > 0) { return childIntersects[0].userData; }
            return entity;
        }
    }

    get highlighted(){
        return this._highlighted;
    }

    get selected(){
        return this._selected;
    }

    highlight(entity, color, rememberColor = true){
        if (!entity || !entity.viewObjects) { return; }
        let obj = entity.viewObjects["main"];
        if (obj && obj.material) {
            // store color of closest object (for later restoration)
            if (rememberColor){
                obj.currentHex = obj.material.color.getHex();
                (obj.children || []).filter(child => child.material).forEach(child => {
                    child.currentHex = child.material.color.getHex();
                });
            }

            // set a new color for closest object
            obj.material.color.setHex(color);
            (obj.children || []).filter(child => child.material).forEach(child => {
                child.material.color.setHex(color);
            });
        }
    }

    unhighlight(entity){
        if (!entity || !entity.viewObjects) { return; }
        let obj = entity.viewObjects["main"];
        if (obj){
            if (obj.material){
                obj.material.color.setHex( obj.currentHex || this.defaultColor);
            }
            (obj.children || []).filter(child => child.material).forEach(child => {
                child.material.color.setHex( child.currentHex || this.defaultColor);
            })
        }
    }

    selectBySearch(name) {
        if (this.graph && (name !== this._selectedName)) {
            this._selectedName = name;
            this.selected = (this.graphData.entities||[]).find(e => e.name === name);
        }
    }

    onDblClick() {
        this.selected = this.getMousedOverEntity();
    }

    onMouseMove(evt) {
        // calculate mouse position in normalized device coordinates
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x =  ( ( evt.clientX - rect.left ) / rect.width  ) * 2 - 1;
        this.mouse.y = -( ( evt.clientY - rect.top  ) / rect.height ) * 2 + 1;

        this.highlighted = this.getMousedOverEntity();
    }

    onKeyDown(evt) {
        let keyCode = evt.which;
        if (evt.ctrlKey) {
            evt.preventDefault();
            switch (keyCode) {
                case 37: // Left arrow
                    break;
                case 39: // Right arrow
                    break;
                case 40: // Down arrow
                    this.zoom(-10);
                    break;
                case 38: // Up arrow
                    this.zoom(10);
            }
        } else {
            if (evt.shiftKey) {
                switch (keyCode) {
                    case 37: // Left arrow
                        this.rotateScene(-10, 0);
                        break;
                    case 39: // Right arrow
                        this.rotateScene(10, 0);
                        break;
                    case 40: // Down arrow
                        this.rotateScene(0, 10);
                        break;
                    case 38: // Up arrow
                        this.rotateScene(0, -10);
                }
            }
        }

    }

    zoom(delta) {
        this.camera.position.z += delta;
        this.camera.lookAt(this.scene.position);
    }

    rotateScene(deltaX, deltaY) {
        this.camera.position.x += deltaX;
        this.camera.position.y += deltaY;
        this.camera.lookAt(this.scene.position);
    }

    /* Toggle scene elements */
    get helperKeys(){
        return this.helpers::keys();
    }

    showPlane(key){
        return this.helpers[key].visible;
    }

    togglePlane(key) {
        this.helpers[key].visible = !this.helpers[key].visible
    }

    toggleLayout(prop){
        this.config.layout[prop] = !this.config.layout[prop];
        if (prop === "showCoalescences"){
            this.toggleGroup(this.graphData.coalescenceGroup);
        } else {
            if (this.graph){
                this.graph[prop](this.config.layout[prop]);
            }
        }
    }

    updateLabels(labelClass) {
        this.config["labels"][labelClass] = !this.config["labels"][labelClass];
        if (this.graph){ this.graph.showLabels(this.config["labels"]); }
    }

    updateLabelContent() {
        if (this.graph){ this.graph.labels(this._labels); }
    }

    showGroup(group){
        return this._showGroups.has(group);
    }

    toggleGroup(group) {
        if (!group) { return; }
        if (this._showGroups.has(group)){
            this._showGroups.delete(group);
        } else {
            this._showGroups.add(group);
        }
        this._graphData.showGroups(this._showGroups);
        if (this.graph) { this.graph.graphData(this.graphData); }
    }

}

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ResourceInfoModule,
        MatSliderModule, SearchBarModule, MatCheckboxModule, MatRadioModule],
    declarations: [WebGLSceneComponent],
    exports: [WebGLSceneComponent]
})
export class WebGLSceneModule {
}