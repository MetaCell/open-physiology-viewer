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
    const nodeModel = new shapes.standard.Rectangle({
      id: node.id,
      position: { x: node.x, y: node.y },
      size: { 
        width: node.width
        , height: node.height 
      }
    });
  
    graph.addCell(nodeModel);
  });
  
  links.forEach( link => {

    if (link.points?.length > 0)
    {
      const sx = link.points[0].x ;
      const sy = link.points[0].y ;
      const tx = link.points[link.points.length-1].x ;
      const ty = link.points[link.points.length-1].y ;
  
      const source = new shapes.standard.Rectangle({
        position: { x: sx, y: sy },
        size: { 
          width: 10
          , height: 10 
        }
      });
      graph.addCell(source);
      const target = new shapes.standard.Rectangle({
        position: { x: tx, y: ty },
        size: { 
          width: 10
          , height: 10
        }
      });
      graph.addCell(target);
      const linkModel = new shapes.standard.Link({
        id: link.id,
        source: { id: source.id },
        target: { id: target.id },
      });
      graph.addCell(linkModel);
    }
  })

  // Call requestConnectionUpdate() to update the routing of all links
  paper.requestConnectedLinksUpdate();

  // Wait for the routing update to complete
  await new Promise(resolve => paper.on('render:done', resolve));

  const json = graph.toJSON();
  json.cells.forEach(cell => {
    if (cell.type == 'standard.Link') {
      const link = graph.getCell(cell.id);
      link.findView(paper).requestConnectionUpdate();
      const vertices = link.get('vertices');
      console.log(vertices);
    }
  });
  return json ;
}

