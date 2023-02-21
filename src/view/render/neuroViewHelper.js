import orthogonalConnector2 from "./orthogonalConnector2";
import { dia, shapes } from 'jointjs';

export async function orthogonalLayout(links, nodes, left, top, width, height)
{
  const graph = new dia.Graph();

  const el = document.createElement('div');
  el.style.width = width + 'px';
  el.style.height = height + 'px';

  const paper = new dia.Paper({
    el: el,
    width: width,
    height: height,
    gridSize: 10,
    async: true,
    model: graph
  });
  //obstacles, anything not a lyph and orphaned

  nodes.forEach( node => {
    const nodeModel = new shapes.basic.Rect({
      position: { x: node.points[0].x, y: node.points[0].y },
      size: { width: node.width, height: node.height }
    });
  
    graph.addCell(nodeModel);
  });
  
  links.forEach( link => {
    const linkModel = new shapes.standard.Link({
      id: link.id,
      router: { name: 'manhattan' },
      source: { x: link.points[0].x, y: link.points[0].y },
      target: { x: link.points[link.points.length-1].x , y: link.points[link.points.length-1].y }
    });
    graph.addCell(linkModel);
  })

  // Call requestConnectionUpdate() to update the routing of all links
  paper.requestConnectedLinksUpdate();

  // Wait for the routing update to complete
  await new Promise(resolve => paper.on('render:done', resolve));

  return graph.toJSON(); ;
}

