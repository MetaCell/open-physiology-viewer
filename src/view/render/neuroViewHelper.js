import orthogonalConnector2 from "./orthogonalConnector2";
import { dia, shapes } from 'jointjs';
import { combineLatestAll, generate } from "rxjs";

function extractVerticesFromPath(path)
{
  const vertices = [];
  path.forEach(function(path) {
    const d = path.toString.attr('d');
    const matches = d.match(/L\s*([\d.-]+)\s*,\s*([\d.-]+)/ig);

    if (matches) {
      matches.forEach(function(match) {
        const values = match.replace(/L\s*/i, '').split(/,\s*/);
        const vertex = { x: parseFloat(values[0]), y: parseFloat(values[1]) };
        vertices.push(vertex);
      });
    }
  });
  return vertices ;
}

function pointsToSVGPath(points, deltaX) {
  if (!points || points.length === 0) {
    return '';
  }

  const pathCommands = [];

  // Move to the first point
  const firstPoint = points[0];
  pathCommands.push(`M ${firstPoint.x + deltaX} ${firstPoint.y}`);

  // Create line commands for the rest of the points
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    pathCommands.push(`L ${point.x+deltaX} ${point.y}`);
  }

  // Join the commands into a single string
  const pathData = pathCommands.join(' ');

  return pathData;
}

function exportToSVG(graphJSONCells, jointGraph, paper, paperWidth, paperHeight) {
  // Create an SVG element for the exported content
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', paperWidth);
  svg.setAttribute('height', paperHeight);
  const deltaX = 500 ;

  // Iterate through all the elements in the JointJS graph
  graphJSONCells.forEach((cellData) => {
    const cell = jointGraph.getCell(cellData.id);

    if (cellData.type === 'standard.Rectangle') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', cellData.position.x + deltaX);
      rect.setAttribute('y', cellData.position.y);
      rect.setAttribute('width', cellData.size.width);
      rect.setAttribute('height', cellData.size.height);
      rect.setAttribute('fill', cellData.attrs.body.fill);
      rect.setAttribute('stroke', cellData.attrs.body.stroke);
      rect.setAttribute('stroke-width', cellData.attrs.body.strokeWidth);

      svg.appendChild(rect);
    } else if (cellData.type === 'standard.Link') {
      const link = paper.findViewByModel(cell);
      const points = link.path.toPoints();
      const pathData = pointsToSVGPath(points[0], deltaX);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', cellData.attrs.line.stroke);
      path.setAttribute('stroke-width', 2);

      svg.appendChild(path);
    }
  });

  // Serialize the SVG content to a string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);

  // Return the serialized SVG string
  return svgString;
}

export function orthogonalLayout(links, nodes, left, top, width, height)
{
  const graph = new dia.Graph();
  const linkVertices = {};

  const el = document.createElement('div');
  el.style.width = width + 'px';
  el.style.height = height + 'px';

  const paper = new dia.Paper({
    el: el,
    width: width,
    height: height,
    gridSize: 1,
    model: graph,
    defaultConnector: { name: 'rounded' },
    defaultConnectionPoint: { name: 'boundary', args: { extrapolate: true } },
    interactive: true
  });
  //obstacles, anything not a lyph and orphaned

  nodes.forEach( node => {
    const nodeModel = new shapes.standard.Rectangle({
      id: node.id,
      position: { x: node.x + left, y: node.y + top },
      size: { 
        width: node.scale.width
        , height: node.scale.height
      },
      attrs: {
          body: { fill: 'blue', stroke: 'black', strokeWidth: 2 },
          label: { text: node.id, fill: 'white', fontWeight: 'bold' }
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
  
      const connection = new shapes.standard.Link({
        id: link.id,
        source: { x: sx, y: sy },
        target: { x: tx, y: ty },
        connector: { name: 'rounded' },
        router: { name: 'manhattan', args: { obstacles: graph.getElements() } },
        attrs: {
            line: { stroke: 'red', strokeWidth: 2, targetMarker: { type: 'path', d: 'M 10 -5 0 0 10 5 z' } }
        }
      });
      graph.addCell(connection);
    }
  })

  // Wait for the routing update to complete
  const json = graph.toJSON();
  json.cells.forEach(cell => {
    if (cell.type == 'standard.Link') {
      const linkModel = graph.getCell(cell.id);
      const newLinkView = paper.findViewByModel(linkModel);
      if (newLinkView) {
        const vertices = newLinkView.path.toPoints();
        linkVertices[cell.id] = vertices ;
      }
    }
  });

  const svg = exportToSVG(json.cells, graph, paper, width, height);
  console.log(svg);

  return linkVertices ;
}

