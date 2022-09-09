import cytoscape from "cytoscape";
import avsdf from "cytoscape-avsdf";

cytoscape.use(avsdf);

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
  return {
    data: {
      id: o._id,
      source: o._generatedModel.source.id,
      target: o._generatedModel.target.id
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
}
