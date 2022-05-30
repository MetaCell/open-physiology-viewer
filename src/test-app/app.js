import { NgModule, Component, ViewChild, ElementRef, ErrorHandler, ChangeDetectionStrategy } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { cloneDeep, isArray, isObject, keys, merge, mergeWith, pick} from 'lodash-bound';

import FileSaver  from 'file-saver';
import JSONEditor from "jsoneditor/dist/jsoneditor.min.js";

// import {MainToolbarModule} from "../components/mainToolbar";
// import {SnapshotToolbarModule} from "../components/snapshotToolbar";
// import {StateToolbarModule} from "../components/stateToolbar";
// import {ResourceEditorModule} from '../components/gui/resourceEditor';
// import {ResourceEditorDialog} from '../components/gui/resourceEditorDialog';
// import {LayoutEditorModule} from "../components/layoutEditor";
// import {RelGraphModule} from "../components/relationGraph";
// import {ModelRepoPanelModule} from "../components/modelRepoPanel";
import {GlobalErrorHandler} from '../services/errorHandler';
// import {
//     modelClasses,
//     schema,
//     loadModel,
//     joinModels,
//     isGraph,
//     isScaffold,
//     isSnapshot,
//     fromJSON,
//     jsonToExcel,
//     $SchemaClass
// } from '../model/index';

import 'hammerjs';
//import initModel from '../data/graph.json';
import initModel from '../../test/data/basalGanglia.json'
import 'font-awesome/css/font-awesome.css';
import 'jsoneditor/dist/jsoneditor.min.css';
import "@angular/material/prebuilt-themes/deeppurple-amber.css";
import "./styles/material.scss";

// import {$Field, findResourceByID, getGenID, getGenName, mergeResources} from "../model/utils";
// import {$LogMsg, logger} from "../model/logger";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {ImportDialog} from "../components/gui/importDialog";
import {WebGLSceneModule} from '../components/webGLScene';
import {enableProdMode} from '@angular/core';

//import { removeDisconnectedObjects } from '../../src/view/render/autoLayout'

import { test_data } from '../../test/data'

enableProdMode();

const ace = require('ace-builds');
const fileExtensionRe = /(?:\.([^.]+))?$/;

@Component({
	selector: 'test-app',
    changeDetection: ChangeDetectionStrategy.Default,
	template: `

        <!-- Header -->

        <header class="w3-bar w3-top w3-dark-grey" style="z-index:10;">
            <span class="w3-bar-item"><i class="fa fa-heartbeat w3-margin-right"> </i>ApiNATOMY
			</span>
            <span class="w3-bar-item" title="About ApiNATOMY">
				<a href="https://youtu.be/XZjldom8CQM"><i class="fa fa-youtube"> </i></a>
			</span>
            <span class="w3-bar-item" title="Source code">
				<a href="https://github.com/open-physiology/open-physiology-viewer"><i class="fa fa-github"> </i></a>
			</span>

      <ng-template mat-tab-label><i class="fa fa-heartbeat"> Viewer </i></ng-template>
      <webGLScene #webGLScene
              [graphData]="_graphData"
              (onImportExternal)="importExternal($event)"    
              (selectedItemChange)="onSelectedItemChange($event)"
              (highlightedItemChange)="onHighlightedItemChange($event)"
              (editResource)="onEditResource($event)"
              (scaffoldUpdated)="onScaffoldUpdated($event)">
      </webGLScene>
                

        <!-- Footer -->

        <footer class="w3-container w3-grey">
            <span class="w3-row w3-right">
				<i class="fa fa-code w3-padding-small"> </i>natallia.kokash@gmail.com
			</span>
            <span class="w3-row w3-right">
				<i class="fa fa-envelope w3-padding-small"> </i>bernard.de.bono@gmail.com
			</span>
        </footer>
    `,
    styles: [`
        .vertical-toolbar{
            width : 48px;
        }
               
        #main-panel{            
            margin-top : 40px;
            margin-left: 48px; 
            height : 90vh
        }

        #main-panel mat-tab-group{            
            height : inherit;
        }

        #viewer-panel {
            width : 100%;
        }

        #main-panel mat-tab-group{            
            height : inherit;
            width : calc(100%);
        }

        #json-editor{
            height : 100vh;
            width  : calc(100% - 48px);
        }
        
        #resource-editor, #layout-editor{
            height : 100%;
            overflow : auto;
            width  : calc(100% - 48px);
        }
        
        #repo-panel{
            height : 100vh;
        }

        footer{
            position: absolute;
            bottom: 0;
            width: 100%;
        }
	`]
})
export class TestApp {
    showRepoPanel = false;
    _graphData;
    _model = {};
    _modelName;
    _dialog;
    _editor;
    _flattenGroups;
    _counter = 1;
    _scaffoldUpdated = false;

    _snapshot;
    _snapshotCounter = 1;
    _unsavedState;

    @ViewChild('webGLScene') _webGLScene: ElementRef;
    @ViewChild('jsonEditor') _container: ElementRef;

    constructor(){
        const params = new Proxy(new URLSearchParams(window.location.search), {
          get: (searchParams, prop) => searchParams.get(prop),
        });
        let testModel ;
        if (params.initModel)
        {
          if (params.initModel in test_data)
            testModel = test_data[params.initModel]
        }
        this.model = testModel ?? initModel;
        //this._dialog = dialog;
        this._flattenGroups = false;
    }

    ngAfterViewInit(){
        if (!this._container) { return; }
        this._editor = new JSONEditor(this._container.nativeElement, {
            mode  : 'code',
            modes : ['code', 'tree', 'view'],
            ace   : ace,
            schema: schema
        });
        this._editor.set(this._model);
    }

    // noinspection JSMethodCanBeStatic
    get currentDate(){
        let today = new Date();
        let [yyyy, mm, dd] = [today.getFullYear(), (today.getMonth()+1), today.getDate()];
        if (dd < 10) { dd = '0' + dd; }
        if (mm < 10) { mm = '0' + mm; }
        return [yyyy,mm,dd].join("-");
    }

    get className(){
        return isScaffold(this._model)? $SchemaClass.Scaffold: $SchemaClass.Graph;
    }

    toggleRepoPanel(){
        this.showRepoPanel = !this.showRepoPanel;
    }

    create(){
        logger.clear();
        this.model = {
            [$Field.name]        : "newModel-" + this._counter++,
            [$Field.created]     : this.currentDate,
            [$Field.lastUpdated] : this.currentDate
        };
        this._flattenGroups = false;
    }

    load(newModel) {
        this.model = newModel;
        this._flattenGroups = false;
    }

    importExternal(){
        if (this._model.imports && this._model.imports.length > 0) {
            //Model contains external inputs
            let dialogRef = this._dialog.open(ImportDialog, {
                width: '75%', data: {
                    imports: this._model.imports || []
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result !== undefined) {
                    let scaffolds = (result||[]).filter(m => isScaffold(m));
                    let groups = (result||[]).filter(m => isGraph(m));
                    let snapshots = (result||[]).filter(m => isSnapshot(m));
                    this._model.scaffolds = this._model.scaffolds || [];
                    this._model.groups = this._model.groups || [];
                    scaffolds.forEach(newModel => {
                        const scaffoldIdx = this._model.scaffolds.findIndex(s => s.id === newModel.id);
                        if (scaffoldIdx === -1) {
                            this._model.scaffolds.push(newModel);
                        } else {
                            this._model.scaffolds[scaffoldIdx] = newModel;
                        }
                    });
                    groups.forEach(newModel => {
                        const groupIdx = this._model.groups.findIndex(s => s.id === newModel.id);
                        if (groupIdx === -1) {
                            this._model.groups.push(newModel);
                        } else {
                            this._model.groups[groupIdx] = newModel;
                        }
                    });
                    if (groups.length > 0 || scaffolds.length > 0) {
                       this.model = this._model;
                    }
                    if (snapshots.length > 0){
                        this.loadSnapshot(snapshots[0]);
                        if (snapshots.length > 1){
                            logger.warn($LogMsg.SNAPSHOT_IMPORT_MULTI);
                        }
                    }
                }
            });
        }
    }

    applyScaffold(modelA, modelB){
        const applyScaffold = (model, scaffold) => {
            model.scaffolds = model.scaffolds || [];
            if (!model.scaffolds.find(s => s.id === scaffold.id)){
                model.scaffolds.push(scaffold);
            } else {
                throw new Error("Scaffold with such identifier is already attached to the model!");
            }
            this.model = model;
        };

        if (isScaffold(modelA)){
            applyScaffold(modelB, modelA);
        } else {
            applyScaffold(modelA, modelB);
        }
    }

    join(newModel) {
        if (this._model.id === newModel.id){
            throw new Error("Cannot join models with the same identifiers: " + this._model.id);
        }
        if (isScaffold(this._model) !== isScaffold(newModel)){
          this.model = removeDisconnectedObjects(this._model, newModel);
          this.applyScaffold(this._model, newModel);
        } else {
          this.model = removeDisconnectedObjects(this._model, newModel);
          let jointModel = joinModels(this._model, newModel, this._flattenGroups);
          jointModel.config::merge({[$Field.created]: this.currentDate, [$Field.lastUpdated]: this.currentDate});
          this.model = jointModel;
          this._flattenGroups = true;
        }
    }

    merge(newModel) {
        if (isScaffold(this._model) !== isScaffold(newModel)){
            this.applyScaffold(this._model, newModel);
        } else {
            this.model = {
                [$Field.created]: this.currentDate,
                [$Field.lastUpdated]: this.currentDate
            }::merge(this._model::mergeWith(newModel, mergeResources));
        }
    }

    save(format){
        if (format === "excel"){
            jsonToExcel(this._model);
        } else {
            if (this._scaffoldUpdated) {
                this.saveScaffoldUpdates();
                this._scaffoldUpdated = false;
            }
            let result = JSON.stringify(this._model, null, 4);
            const blob = new Blob([result], {type: 'text/plain'});
            FileSaver.saveAs(blob, (this._model.id ? this._model.id : 'mainGraph') + '-model.json');
        }
    }

    loadFromRepo({fileName, fileContent}){
        let [name, extension]  = fileExtensionRe.exec(fileName);
        extension = extension.toLowerCase();
        this.model = loadModel(fileContent, name, extension);
    }

    applyJSONEditorChanges() {
        if (this._editor){
            //this._graphData = ({});
            this._graphData.logger.clear();
            this.model = this._editor.get()::merge({[$Field.lastUpdated]: this.currentDate});
        }
    }

    applyChanges(){
        //this._graphData = fromJSON({});
        this.model = this._model::merge({[$Field.lastUpdated]: this.currentDate});
    }

    onSelectedItemChange(item){}

	onHighlightedItemChange(item){}

	set model(model){
        this._model = model;
        //try{
            this._modelName = this._model.name || "?";
            //this._graphData = fromJSON(this._model);
        // } catch(err){
        //    throw new Error(err);
        // }
        if (this._editor){
            this._editor.set(this._model);
        }
    }

    get graphData(){
	    return this._graphData;
    }


    onScaffoldUpdated(){
        this._scaffoldUpdated = true;
    }
}

/**
 * The TestAppModule test module, which supplies the _excellent_ TestApp test application!
 */
@NgModule({
	imports     : [BrowserModule, WebGLSceneModule],
	declarations: [TestApp],
    bootstrap: [TestApp],
    entryComponents: []
})
export class TestAppModule {}