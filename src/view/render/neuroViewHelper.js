import orthogonalConnector2 from "./orthogonalConnector2";

export function orthogonalLayout(links, left, top, width, height)
{
  const paths = {};

  links.forEach( link => {

    const start = { 
      left: link.points[0].x 
      , top: link.points[0].y 
      , width: 0
      , height: 0
    }  
    const end = { 
      left: link.points[link.points.length-1].x 
      , top: link.points[link.points.length-1].y
      , width: 0
      , height: 0
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

