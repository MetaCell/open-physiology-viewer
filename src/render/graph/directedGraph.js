import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";

cytoscape.use(fcose);

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
  if (!o._generatedModel.source?.id || !o._generatedModel.target?.id)
    return;
    
  return {
    data: {
      id: o._id,
      source: o._generatedModel.source.id,
      target: o._generatedModel.target.id,
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
