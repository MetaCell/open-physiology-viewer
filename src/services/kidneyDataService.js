import { lyphs } from '../data/kidney-lyphs.json';
import { trees } from '../data/kidney-mapping.json';

import { modelClasses } from '../models/utils';
import { NodeModel, NODE_TYPES } from '../models/nodeModel';
import { LinkModel, LINK_TYPES } from '../models/linkModel';

import {cloneDeep} from 'lodash-bound';
import {DataService} from './dataService';

/**
 * Create omega trees and lyphs tfor Kidney scenario
 * https://drive.google.com/file/d/0B89UZ62PbWq4ZkJkTjdkN1NBZDg/view
 */
export class KidneyDataService extends DataService{

    constructor(){
        super();
        this._lyphs = lyphs::cloneDeep();
    }

    init(){
        super.init();
        const hosts = {
            "5": {
                "color": "#4444ff",
                "sign" : -1,
                "trees": [
                    {"lyphs": trees["Vascular"]["Arterial"]},
                    {"lyphs": trees["Vascular"]["Venous"]}
                ]
            },
            "7": {
                "color": "#ff4444",
                "sign" : 1,
                "trees": [ {"lyphs": trees["Urinary"]} ]
                //TODO test to see if we still need "end" node
            }
        };

        //Add an extra node to correctly end the Urinary tree
        hosts["7"].trees[0].lyphs["end"] = 0;

        const offsets = {"500": 0.25, "510": 0.65, "700": 0.25};
        //Omega tree nodes
        Object.keys(hosts).forEach((host) => {
            //let hostLink = this._graphData.getLinkByID(host);
            hosts[host].trees.forEach((tree, i) => {
                let lyphKeys = Object.keys(tree.lyphs);
                lyphKeys.forEach((key, j) => {
                    let node = NodeModel.fromJSON({
                        "id"       : `${host}${i}${j}`,
                        "host"     : host,
                        "isRoot"   : (j === 0),
                        "color"    : hosts[host].color
                    },  modelClasses);

                    // explicitly define position of the root node on the hosting link:
                    // fraction 0 <= x <= 1, where 0 corresponds to the source node and 1 to the target node
                    // To bypass the central node, shift the root close to L
                    if (node.isRoot && offsets[node.id]){
                        node.offset = offsets[node.id];
                    }
                    //TODO save root in the treeModel
                    //TODO Make sure the data below is kept in the treeModel
                    //     "tree"  : ,
                    //     "level" : j + 1

                    this._graphData.nodes.push(node);
                });
            });
            //Create links for generated omega tree
            hosts[host].trees.forEach((tree, i) => {
                const NUM_LEVELS = Object.keys(tree.lyphs).length;
                Object.keys(tree.lyphs).forEach((key, j) => {
                    if (j === NUM_LEVELS - 1) { return; }
                    let link = LinkModel.fromJSON({
                        "id"       : (this._graphData.links.length + 1).toString(),
                        "source"   : `${host}${i}${j}`,
                        "target"   : `${host}${i}${j + 1}`,
                        //"level": j,
                        "external" : key,
                        "length"   : 2, //(host === "5")? 3: 2, //Urinary links shorter
                        "type"     : LINK_TYPES.LINK,
                        "conveyingLyph" : tree.lyphs[key],
                        "color"         : hosts[host].color
                    }, modelClasses);
                    this._graphData.links.push(link);
                });
            })
        });

        //Connect leaves of two omega trees between nodes 506 and 515
        const CONNECTOR_COLOR = "#ff44ff";
        ["I", "J"].forEach((key, i) => {
            this._graphData.nodes.push(NodeModel.fromJSON({
                    "id"   : `57${i}`,
                    "color": CONNECTOR_COLOR}, modelClasses)
            );
        });

        const connector = ["505", "570", "571", "515"];
        const connectorLabels = Object.keys(trees["Connector"]);
        const connectorLyphs  = Object.values(trees["Connector"]);

        for (let i = 0 ; i < connector.length - 1; i++){
            this._graphData.links.push(LinkModel.fromJSON({
                "id"           : (this._graphData.links.length + 1).toString(),
                "source"       : connector[i],
                "target"       : connector[i + 1],
                //"level": i,
                "external"     : connectorLabels[i],
                "length"       : 4,
                "type"         : LINK_TYPES.LINK,
                "conveyingLyph": connectorLyphs[i],
                "color"        : CONNECTOR_COLOR
            }, modelClasses));
        }

        //Coalescences defined by node alignment
        // this._coalescences = [
        //     {"node1": "570", "node2": "7014"},
        //     {"node1": "571", "node2": "7015"}
        // ];

        //Coalescences defined by lyph alignment
        this._coalescences = [ ["78", "24"] ];

        //Add link from center to the center of mass for a coalescence group
        this._graphData.nodes.push(NodeModel.fromJSON({
                "id"     : "k",
                "name"   : "k",
                "type"   : NODE_TYPES.FIXED,
                "hidden": true,
                "layout" : {x: 0, y: 0, z: 25}
            }, modelClasses)
        );
        this._graphData.nodes.push(NodeModel.fromJSON({
                "id"     : "l",
                "type"   : NODE_TYPES.FIXED,
                "hidden" : true,
                "layout" : {x: 0, y: 70, z: 25},
                //"type" : NODE_TYPES.CONTROL //Determine node position based on other nodes
                //"controlNodes" : ["510", "R", "a"]
            }, modelClasses)
        );

        this._graphData.links.push(LinkModel.fromJSON({
            "id"    : (this._graphData.links.length + 1).toString(),
            "source": "k",
            "target": "l",
            "length": 50,
            "type"  : LINK_TYPES.CONTAINER,
            //"conveyingLyph"  : "1", //Kidney
            "conveyingLyph"  : "5", //Kidney lobus
        }, modelClasses));

        let containerLyph = this._lyphs.find(lyph => lyph.id === "5");
        containerLyph["internalLyphs"]       = ["105", "63", "77", "24", "27", "30", "33"];

        //TODO place nodes on lyph border
        containerLyph["boundaryNodes"]       = ["7013", "505", "515"];
        containerLyph["boundaryNodeBorders"] = [3, 3, 3];
        //TODO process the following definition instead of above statements
        // containerLyph.border = {
        //     "0": {}, "1": {}, "2": {}, "3": {nodes: ["7013", "505", "515"]}
        // };

        super.afterInit();
    }
}