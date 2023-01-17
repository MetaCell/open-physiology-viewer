import cytoscape from "cytoscape";
import elk from "cytoscape-elk";

cytoscape.use(elk);

const style = [ 
{
  selector: 'node',
  style: {
      shape: 'rectangle',
      label: 'data(id)',
      'font-size': '0.5em',
  }
},
{
  selector: 'edge',
  style: {
      'width': 1,
      'curve-style': 'taxi',
      'line-color': '#ccc',
      label: 'data(id)',
      'font-size': '0.5em',
      'color': 'blue',
      'target-arrow-color': '#ccc',
      'target-arrow-shape': 'triangle'
  }
}
];

export function nodeFromGeneratedModel(o)
{
  return {
    data: {
      id: o._id
    }
  }
}

function getPropertyOrValue(o, prop)
{
  if(o[prop])
    return o[prop];
  else return o ;
}

export function linkFromGeneratedModel(o)
{
  if (!o._generatedModel.source || !o._generatedModel.target)
    return;
    
  return {
    data: {
      id: o._id,
      source: getPropertyOrValue(o._generatedModel.source, 'id'),
      target: getPropertyOrValue(o._generatedModel.target, 'id'),
      weight: o._generatedModel.length, 
      minLen: o._generatedModel.length, 
    }
  }
}
function createElements(nodes, edges)
{
  return {
    nodes,
    edges
  };
}

export class CytoGraph {
  _graph = undefined ;
  constructor(nodes, edges)
  {
    const elements = createElements(nodes, edges);
    this._graph = cytoscape({
      boxSelectionEnabled: false,
      autounselectify: true,
      elements,
      style
    });
    
  }
  get graph() { return this._graph }

  runLayout() {
    this._graph.layout({
      name: "cose",
      nodeDimensionsIncludeLabels: false,
      animate: false 
    }).run();
  }
}