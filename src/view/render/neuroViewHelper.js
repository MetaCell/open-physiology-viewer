import orthogonalConnector2 from "./orthogonalConnector2";

export function orthogonalLayout(links, left, top, width, height)
{
  const paths = {};
  if ( links[0].source.x !== undefined ) //TODO: better check for layout
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
      
      const link_paths = orthogonalConnector2.route({
        pointA: {shape: start, side: 'bottom', distance: 0.5},
        pointB: {shape: end, side: 'right',  distance: 0.5},
        shapeMargin: 0,
        globalBoundsMargin: 0,
        globalBounds: { left, top, width, height },
      });
    
      paths[link.id] = link_paths ;
    })
  
    return paths ;
  }
}

