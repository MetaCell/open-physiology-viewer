import ELK from 'elkjs/lib/elk.bundled.js'

export function elkLayout(nodes, links)
{
  const elk = new ELK({
    workerUrl: './elk-worker.min.js'
  })

  const elkNodes = nodes.map( n => ({
    id: n.id, 
    x: 0, 
    y: 0
  }));

  const elkLinks = links.map( l => ({
    id: l.id, 
    source: l.source.id, 
    target: l.target.id
  }));

  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "nodePlacement.strategy": "SIMPLE"
    },
    children: elkNodes,
    edges: elkLinks
  };
  return elk.layout(graph);
}

