import { objectTypes } from "./model/types"
import objectFactory from "./model/factory"
import { queryTypes } from "./query/reducer";
import { nodeFromGeneratedModel, linkFromGeneratedModel, DirectedGraph } from "./graph/directedGraph";

export class modelHandler
{
  _model ;
  _createdObjects = [];
  _renderedObjects = [];
  _graph = undefined ;
  _secene ;

  constructor(model, scene) { 
    this._model = model ;
    this._scene = scene ;
    this.parse();
  }

  scene(scene) { this._scene = scene ; }

  createdObjects()
  {
    return this._createdObjects;
  }

  queryGeneratedModel(objectId, type)
  {
    return this._model[type].find( o => o.id === objectId ) ;
  }

  queryCreatedObjects(objectId, selectType = queryTypes.id, ...params)
  {
    let targetIndex =  -1 ;
    if (selectType == queryTypes.id)
      targetIndex = this._createdObjects.findIndex(o => o.id == objectId );
    else if (selectType == queryTypes.conveyingLyph)
      targetIndex = this._createdObjects.findIndex(o => o.conveyingLyph == objectId);
    const target = targetIndex >-1 ? this._createdObjects[targetIndex] : undefined ;
    return target ;
  }

  parse()
  {
    const props = Object.getOwnPropertyNames(this._model);
    const validObjNames = Object.getOwnPropertyNames(objectTypes);

    props.forEach((objType)=>{
      if (validObjNames.indexOf(objType) > -1)
      {
        const children = this._model[objType];
        children?.forEach((node)=>{
          const createdObject = objectFactory.create(node.id, objType, this.queryGeneratedModel.bind(this), this.queryCreatedObjects.bind(this));
          this._createdObjects.push(createdObject);
        });
      }
    })

    //set initial location for nodes and links
    const nodes = this._createdObjects.filter( o => o._type === objectTypes.nodes ).map( o => nodeFromGeneratedModel(o) );
    const links = this._createdObjects.filter( o => o._type === objectTypes.links ).map( o => linkFromGeneratedModel(o) )
    this._graph = new DirectedGraph(nodes, links);
  }

  render()
  {
    while (this._scene.children.length) { this._scene.remove(this._scene.children[0]) } // Clear the place

    //TODO handle THREEJS Groups
    this._createdObjects?.forEach(o =>{
      const renderedObject = o.render();
      if(renderedObject)
        this._renderedObjects.push(renderedObject);
    });

    this._renderedObjects.forEach(o => this._scene.add(o));
  }

  clearCreatedObjects()
  {
    this._createdObjects = [];
  }
}
