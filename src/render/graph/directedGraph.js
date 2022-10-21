import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";

cytoscape.use(dagre);

function getPropertyOrValue(o, prop)
{
  if(o[prop])
    return o[prop];
  else return o ;
}

export function nodeFromGeneratedModel(o)
{
  return {
    data: {
      id: o._id
    }
  }
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

export class DirectedGraph {
  _graph = undefined ;
  constructor(nodes, edges)
  {
    const elements = createElements(nodes, edges);
    this._graph = cytoscape({
      boxSelectionEnabled: false,
      autounselectify: true,
      elements
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
