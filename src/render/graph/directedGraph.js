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

  runLayout() {
    this._graph.layout({
      name: 'avsdf',
      // Called on `layoutready`
      ready: function () {
      },
      // Called on `layoutstop`
      stop: function () {
      },
      // number of ticks per frame; higher is faster but more jerky
      refresh: 30,
      // Whether to fit the network view after when done
      fit: true,
      // Padding on fit
      padding: 10,
      // Prevent the user grabbing nodes during the layout (usually with animate:true)
      ungrabifyWhileSimulating: false,
      // Type of layout animation. The option set is {'during', 'end', false}
      animate: false,
      // Duration for animate:end
      animationDuration: 500,   
      // How apart the nodes are
      nodeSeparation: 60
    }).run();
  }
}
