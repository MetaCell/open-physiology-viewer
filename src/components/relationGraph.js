import * as d3 from 'd3';
window.d3 = d3;
import {attrs} from 'd3-selection-multi';

import {Component, ElementRef, Input, NgModule, ViewChild} from "@angular/core";
import {CommonModule} from "@angular/common";
import {values, pick, flatten, keys, entries} from 'lodash-bound';
import forceInABox from '../algorithms/forceInABox';
import FileSaver from "file-saver";

const STROKE_COLOR = "#CCC";

@Component({
    selector: 'relGraph',
    template: `
        <section id="svgPanel" class="w3-row">
            <section #svgContainer id="svgContainer" [class.w3-threequarter]="showPanel">
                <!--<section class="w3-padding-right" style="position:relative;">-->
                    <section class="w3-bar-block w3-right" style="position:absolute; right:0">
                        <input #fileInput
                               type   = "file"
                               accept = ".json"
                               [style.display] = "'none'"
                               (change) = "load(fileInput.files)"
                        />
    
                        <button class="w3-bar-item w3-hover-light-grey" (click)="updateGraphLayout()"
                                title="Update layout">
                            <i class="fa fa-refresh"> </i>
                        </button>
                        <button *ngIf="!showPanel" class="w3-bar-item w3-hover-light-grey"
                                (click)="toggleSettingPanel()" title="Show legend">
                            <i class="fa fa-cog"> </i>
                        </button>
                        <button *ngIf="showPanel" class="w3-bar-item w3-hover-light-grey"
                                (click)="toggleSettingPanel()" title="Hide legend">
                            <i class="fa fa-window-close"> </i>
                        </button>
                        <button class="w3-bar-item w3-hover-light-grey"
                                (click)="export()" title="Save coordinates">
                            <i class="fa fa-save"> </i>
                        </button>
                        <button class="w3-bar-item w3-hover-light-grey" 
                                (click)="fileInput.click()" title="Load coordinates">
                            <i class="fa fa-folder"> </i>
                        </button>
                    </section>
    
                    <svg #svg [attr.width.px]="width" [attr.height.px]="height"> </svg>
                    <section #tooltip class="tooltip"> </section>
                <!--</section>-->
            </section>            
            <section id="svgSettingsPanel" [hidden]="!showPanel" class="w3-quarter">
                <svg #legendSvg></svg>
            </section>
        </section>
    `,
    styles: [`
        #svgPanel {
            height: 100vh;
        }
        .tooltip {
            position: absolute;
            padding: 2px;
            background-color: #f5f5f5;
            font: 12px sans-serif;
            border: 1px solid #666;
            pointer-events: none;
        }
    `]
})
/**
 * Search bar component
 */
export class RelGraph {
    @ViewChild('svg') svgRef: ElementRef;
    @ViewChild('legendSvg') legendSvgRef: ElementRef;
    @ViewChild('tooltip') tooltipRef: ElementRef;

    _graphData;
    data = { nodes: [], links: [] };
    width = 1000; height = 600;

    nodeTypes = {
        "Lyph"             : {color: "#FF0000", shape: "circle", attrs: {"r": 5}},
        "LyphFromMaterial" : {color: "#00FF00", shape: "circle", attrs: {"r": 5}},
        "Link"             : {color: "#000000", shape: "rect",   attrs: {"width": 10, "height": 10, "x": -5, "y": -5}},
        "Coalescence"      : {color: "#FFFF00", shape: "path",   attrs: {"d": "M -10 8 L 0 -8 L 10 8 L -10 8"}},
        "Material"         : {color: "#008000", shape: "path",   attrs: {"d": "M -7 0 L -4 -7 L 4 -7 L 7 0 L 4 7 L -4 7 L -7 0"}}
    };


    linkTypes = {
        "diffusive"         :  {color: "#CCC"},
        "advective"         :  {color: "#000"},
        "conveyingLyph"     :  {color: "#FF0000"},
        "layer"             :  {color: "#00FF00", directed: true},
        "subtype"           :  {color: "#0000FF", directed: true},
        "coalescence"       :  {color: "#FFA500"},
        "material"          :  {color: "#000080", directed: true},
        "conveyingMaterial" :  {color: "#FFC0CB"},
        "lyphFromMaterial"  :  {color: "#008000", directed: true}
    };

    @Input('graphData') set graphData(newGraphData) {
        if (this._graphData !== newGraphData) {
            this._graphData = newGraphData;

            this.data = {nodes: [], links: []};

            let nodeResources = this._graphData::pick(["materials", "lyphs", "coalescences", "links"])::values()::flatten();
            let filter = (this._graphData.config && this._graphData.config.filter) || [];
            nodeResources = nodeResources.filter(e => !filter.find(x => e.isSubtypeOf(x)));
            this.data.nodes = nodeResources.map(e => e::pick(["id", "name", "class", "conveyingType", "generatedFrom"]));
            this.data.nodes.filter(e => e.class === "Lyph" && e.generatedFrom).forEach(e => e.class = "LyphFromMaterial");

            const getNode = (d) => this.data.nodes.find(e => d && (e === d || e.id === d.id));

            //link - link
            (this._graphData.nodes||[]).filter(node  => node.sourceOf && node.targetOf).forEach(node => {
                let sources = (node.sourceOf||[]).map(lnk => getNode(lnk));
                let targets = (node.targetOf||[]).map(lnk => getNode(lnk));
                sources.forEach(source => {
                    targets.forEach(target => {
                        this.data.links.push({
                            "source": source.id, "target": target.id, "type"  : source.conveyingType? source.conveyingType.toLowerCase(): "advective"
                        });
                    })
                })
            });

            (this._graphData.links||[]).forEach(lnk => {
                if (getNode(lnk.conveyingLyph)){
                    this.data.links.push({"source": lnk.id, "target": lnk.conveyingLyph.id, "type"  : "conveyingLyph"});
                }
                (lnk.conveyingMaterials||[]).forEach(material => {
                    if (getNode(material)) {
                        this.data.links.push({"source": lnk.id, "target": material.id, "type": "conveyingMaterial"});
                    }
                })
            });

            (this._graphData.lyphs||[]).filter(e => getNode(e)).forEach(lyph => {
                if (getNode(lyph.layerIn)){
                    this.data.links.push({"source": lyph.layerIn.id, "target": lyph.id, "type"  : "layer"});
                }
                if (getNode(lyph.supertype)){
                    this.data.links.push({"source": lyph.supertype.id, "target": lyph.id, "type" : "subtype"});
                }
                if (getNode(lyph.cloneOf)){
                    this.data.links.push({"source": lyph.cloneOf.id, "target": lyph.id, "type"  : "subtype"});
                }
                (lyph.materials||[]).forEach(material => {
                    if (getNode(material) && lyph.generatedFrom && (lyph.generatedFrom.id === material.id)){
                        this.data.links.push({"source": material.id, "target": lyph.id, "type"  : "lyphFromMaterial"});
                    }
                })
            });

            (this._graphData.materials||[]).filter(e => getNode(e)).forEach(material => {
                (material.materials||[]).forEach(material2 => {
                    if (getNode(material2)){
                        this.data.links.push({"source": material.id, "target": material2.id, "type" : "material"});
                    }
                })
            });

            (this._graphData.coalescences||[]).filter(e => getNode(e)).forEach(coalescence => {
                (coalescence.lyphs||[]).filter(e => getNode(e)).forEach(lyph  => {
                    this.data.links.push({"source": lyph.id, "target": coalescence.id, "type"  : "coalescence"})
                })
            });

            this.resizeToDisplaySize();
            this.draw();
        }
    }

    ngAfterViewInit() {
        this.svgContainer = document.getElementById('svgContainer');
        window.addEventListener('resize', evt => this.resizeToDisplaySize(evt), false);
        this.draw();

        this.drawLegend();

    }

    resizeToDisplaySize(evt) {
        if (this.svgContainer){
            this.width  = this.svgContainer.clientWidth;
            this.height = this.svgContainer.clientHeight;
        }
    }

    draw() {
        if (!this.data) {return; }
        let data = this.data;
        let svg = d3.select(this.svgRef.nativeElement).attr("width", this.width).attr("height", this.height);

        //Clean the view
        svg.selectAll("g").remove();
        let graphSvg = svg.append("g");

        let useGroupInABox = true;

        let fParams = {
            forceInABoxStrength      : 0.1,
            linkStrengthInterCluster : 0.2,
            linkStrengthIntraCluster : 0.1
            // forceLinkDistance: 150,
            // forceLinkStrength: 0.2,
            // forceCharge  : 700,
            // forceNodeSize: 3
        };

        //TODO stimulate forceInABox after resizing

        //Simulation
        let groupingForce = forceInABox()
            .size([this.width, this.height])       // Size of the chart
            .template("treemap")                   // Either treemap or force
            .groupBy("class")                      // Nodes' attribute to group
            .strength(fParams.forceInABoxStrength) // Strength to foci
            .links(data.links)
            .enableGrouping(useGroupInABox)
            .linkStrengthInterCluster(fParams.linkStrengthInterCluster) // linkStrength between nodes of different clusters
            .linkStrengthIntraCluster(fParams.linkStrengthIntraCluster); // linkStrength between nodes of the same cluster
            // .forceLinkDistance(fParams.forceLinkDistance)       // linkDistance between meta-nodes on the template (Force template only)
            // .forceLinkStrength(fParams.forceLinkStrength)       // linkStrength between meta-nodes of the template (Force template only)
            // .forceCharge(-fParams.forceCharge)                  // Charge between the meta-nodes (Force template only)
            // .forceNodeSize(fParams.forceNodeSize);              // Used to compute the template force nodes size (Force template only)

        let simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(-15))
            .force("collide", d3.forceCollide(15))
            .force("group", groupingForce)
            .force("x", useGroupInABox ? null : d3.forceX(this.width / 2))
            .force("y", useGroupInABox ? null : d3.forceY(this.height / 2));

        this.simulation = simulation;

        //Arrow markers
        const directedLinkTypes = this.linkTypes::entries().filter(([, value]) => value.directed).map(([key, ]) => key);

        graphSvg.append("defs").selectAll("marker")
            .data(directedLinkTypes)
            .enter().append("marker")
            .attr("id",   d => 'marker' + d)
            .attr('fill', d => this.linkTypes[d].color)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 20)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr('markerUnits', 'strokeWidth')
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0,-5 L 10, 0 L 0,5");

        const link = graphSvg.append("g").selectAll("path")
            .data(data.links).join("path")
            .attr("stroke-opacity", 0.6)
            .attr("stroke", d => this.linkTypes[d.type].color)
            .attr("marker-end", d => "url(#marker" + d.type + ")");

        //Nodes

        const [nodeLyph, nodeLyphFromMaterial, nodeLink, nodeCoalescence, nodeMaterial] =
        this.nodeTypes::keys().map(clsName =>
            graphSvg.append("g").selectAll(this.nodeTypes[clsName].shape)
                .data(data.nodes.filter(e => e.class === clsName))
                .join(this.nodeTypes[clsName].shape)
        );

        //Tooltips

        let tooltip = d3.select(this.tooltipRef.nativeElement)
            .style("opacity", 0);

        let text = graphSvg.append("g")
            .selectAll("text")
            .data(data.nodes)
            .enter().append("text")
            .attr("y", 12)
            .style("pointer-events", "none")
            .style("font", "10px sans-serif")
            .style("text-anchor", "middle")
            .style("opacity", 0.6)
            .text(d => d.id);

        //Drag

        const nodeDrag = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);

        function dragstarted(d) {
            if (!d3.event.active) {simulation.alphaTarget(0.3).restart(); }
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) {simulation.alphaTarget(0);}
        }

        //Set common node attributes

        [nodeLink, nodeCoalescence, nodeMaterial, nodeLyph, nodeLyphFromMaterial].forEach(node => {
            node.attrs(d => this.nodeTypes[d.class].attrs)
                .attr("stroke", STROKE_COLOR)
                .attr("fill", e => this.nodeTypes[e.class].color);

            node.on("dblclick", d => {
                d.fx = null;
                d.fy = null;
            });

            node.on("mouseover", d => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`<div>${d.id}: ${d.name||"?"}<\div>`)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

            node.call(nodeDrag);
        });

        //Update

        simulation.on("tick", () => {
            const boundX = x => Math.min(this.width, Math.max(0, x));
            const boundY = y => Math.min(this.height, Math.max(0, y));

            link.attr("d", d => {
                //screen boundaries
                ["source", "target"].forEach(prop => {
                    d[prop].x = boundX(d[prop].x);
                    d[prop].y = boundY(d[prop].y);
                });
                return "M" + d.source.x + ' ' + d.source.y + " L" + d.target.x + ' ' + d.target.y;
            });

            [nodeLyph, nodeLyphFromMaterial].forEach(node => {
                node.attr("cx", d => boundX(d.x))
                    .attr("cy", d => boundY(d.y));
            });

            [nodeLink, nodeCoalescence, nodeMaterial, text].forEach(e =>
                e.attr("transform", d => "translate(" + boundX(d.x) + "," + boundY(d.y) + ")"));
        });

        //Zoom
        // const groupZoom = d3.zoom()
        //     .scaleExtent([1, 10])
        //     .on("zoom", zoomed);
        //
        // function zoomed() {
        //     graphSvg.attr("transform", d3.event.transform);
        // }
        //
        // graphSvg.call(groupZoom);

        return graphSvg.node();
    }

    drawLegend(){
        //Legends
        if (!this.legendSvgRef){ return; }
        let legendSvg = d3.select(this.legendSvgRef.nativeElement).attr("width", 200).attr("height", 300);
        let nodeTypes = this.nodeTypes;

        const labelHSpacing = 15;
        const labelVSpacing = 4;
        const legendXOffset = 50;

        //Link legend

        const linkVSpacing  = 15;
        const linkLegendRect = {width: 40, height: 1};

        const linkLegend = legendSvg.append("g").selectAll('.linkLegend')
            .data(this.linkTypes::keys()).enter().append('g').attr('class', 'linkLegend')
            .attr('transform', (d, i) => {
                let [h, v] = [legendXOffset -linkLegendRect.width, i * (linkLegendRect.height + linkVSpacing) + linkVSpacing];
                return 'translate(' + h + ',' + v + ')';
            });

        linkLegend.append('rect')
            .attr('width', linkLegendRect.width).attr('height', linkLegendRect.height)
            .style('fill', d => this.linkTypes[d].color).style('stroke', d => this.linkTypes[d].color);

        linkLegend.append('text')
            .attr('x', linkLegendRect.width  + labelHSpacing)
            .attr('y', linkLegendRect.height + labelVSpacing)
            .style("pointer-events", "none")
            .text(d => d);

        //Node legend

        const offset = this.linkTypes::keys().length * (linkLegendRect.height + linkVSpacing) + linkVSpacing;
        const nodeLegendRect = {width: 12, height: 12};
        const nodeVSpacing   = 4;

        const nodeLegend = legendSvg.append("g").selectAll('.nodeLegend')
            .data(this.nodeTypes::keys())
            .enter().append("g")
            .attr('class', 'nodeLegend')
            .attr('transform', (d, i) => {
                let [h, v] = [legendXOffset - nodeLegendRect.width, offset + i * (nodeLegendRect.height + nodeVSpacing) + nodeVSpacing];
                return 'translate(' + h + ',' + v + ')';
            });

        nodeLegend.each(function(d){
            d3.select(this).append(nodeTypes[d].shape).attrs(nodeTypes[d].attrs)
                .attr('fill', nodeTypes[d].color)
                .attr('stroke', STROKE_COLOR)
        });

        nodeLegend.append('text')
            .attr('x', nodeLegendRect.width  + labelHSpacing)
            .attr('y', nodeLegendRect.height - labelVSpacing)
            .style("pointer-events", "none")
            .text(d => d);
    }

    updateGraphLayout(){
        this.draw();
    }

    toggleSettingPanel(){
        this.showPanel = !this.showPanel;
    }

    export(){
        if (this._graphData){
            let coords = {};
            (this.data.nodes||[]).forEach(e => coords[e.id] = {"x": e.x, "y": e.y});
            let result = JSON.stringify(coords, null, 2);
            const blob = new Blob([result], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(blob, 'apinatomy-relationshipCoords.json');
        }
    }

    load(files) {
        if (files && files[0]){
            const reader = new FileReader();
            reader.onload = () => {
                let coords = JSON.parse(reader.result);
                (this.data.nodes||[]).forEach(d => {
                    if (coords[d.id]){
                        d.x = coords[d.id].x;
                        d.y = coords[d.id].y;
                        d.fx = d.x;
                        d.fy = d.y;
                    }
                })
            };

            try {
                reader.readAsText(files[0]);
            } catch (err){
                throw new Error("Failed to open the input file: " + err);
            }
        }

        // if (msgCount["error"] || msgCount["warn"]){
        //     throw new Error(`Detected ${msgCount["error"]} error(s), ${msgCount["warn"]} warning(s),
        //         may affect the model layout, check console messages for more detail!`);
        // }
        // msgCount = {};
    }



}

@NgModule({
    imports: [CommonModule],
    declarations: [RelGraph],
    exports: [RelGraph]
})
export class RelGraphModule {
}

