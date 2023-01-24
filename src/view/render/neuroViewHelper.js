import { OrthogonalConnector } from "./orthogonalConnector";

export function orthogonalLayout(nodes, links)
{
  const paths = {};
  if ( nodes[0].x !== undefined ) //TODO: better check for layout
  {
    links.forEach( link => {

      const start = { 
        left: link.source.x
        , top: link.source.y
        , width: 10
        , height: 10
      }  
      const end = { 
        left: link.target.x
        , top: link.target.y
        , width: 10
        , height: 10
      }  
      
      const paths = OrthogonalConnector.route({
        pointA: {shape: start, side: 'bottom', distance: 0.5},
        pointB: {shape: end, side: 'right',  distance: 0.5},
        shapeMargin: 0,
        globalBoundsMargin: 0,
        globalBounds: {left: 0, top: 0, width: 15000, height: 15000},
      });
    
      paths[link.id] = paths ;
    })
  
    return paths ;
  }
}

