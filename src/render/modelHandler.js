import { objectTypes, mainObjectTypes, scaffoldTypes } from "./model/types"
import objectFactory from "./model/factory"
import { queryTypes } from "./query/reducer";
import { nodeFromGeneratedModel, linkFromGeneratedModel, DirectedGraph } from "./graph/directedGraph";
import { autoLayout } from "./autoLayout"

export class modelHandler
{
  _model ;
  _createdObjects = [];
  _renderedObjects = [];
  _layout = undefined ;
  _secene ;

  constructor(model, scene) { 
    this._model = model ;
    this._scene = scene ;
    this.parse(model);
    //set initial location for nodes and links
    const nodes = this._createdObjects.filter( o => o._type === mainObjectTypes.nodes ).map( o => nodeFromGeneratedModel(o) );
    const links = this._createdObjects.filter( o => o._type === mainObjectTypes.links ).map( o => linkFromGeneratedModel(o) );

    //re run when?
    this._graph = new DirectedGraph(nodes.filter ( o => o !== undefined), links.filter ( o => o !== undefined));
    this._graph.runLayout();
    this.updateCreatedObjectsLayout(); //now anything else is safe to be crated using the nodes position
  }

  scene(scene) { this._scene = scene ; }

  createdObjects()
  {
    return this._createdObjects;
  }

  queryGeneratedModel(objectId, type, scaffold_index)
  {
    if (scaffold_index > -1)
      return this['scaffolds'][scaffold_index][type].find( o => o.id === objectId ) ;
    else
      return this[type].find( o => o.id === objectId ) ;
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

  parseScaffolds(model)
  {
    model.scaffolds?.forEach( (s, level) => {
      const anchors = s.anchors ;
      const wires = s.wires ;
      //anchors with fixed position
      anchors?.filter( a=> !a.hostedBy ).forEach((anchor)=>{
        const createdObject = objectFactory.create(anchor.id, scaffoldTypes.anchors, this.queryGeneratedModel.bind(model), this.queryCreatedObjects.bind(this), level);
        if(createdObject)
          this._createdObjects.push(createdObject);
      });
      //wires with radius
      wires?.filter( w=> w.radius ).forEach((wire)=>{
        const createdObject = objectFactory.create(wire.id, scaffoldTypes.wires, this.queryGeneratedModel.bind(model), this.queryCreatedObjects.bind(this), level);
        if(createdObject)
          this._createdObjects.push(createdObject);
      });
      //anchors relative to wires
      anchors?.filter( a=> a.hostedBy ).forEach((anchor)=>{
        const createdObject = objectFactory.create(anchor.id, scaffoldTypes.anchors, this.queryGeneratedModel.bind(model), this.queryCreatedObjects.bind(this), level);
        if(createdObject)
          this._createdObjects.push(createdObject);
      });
      //wires without radius
      wires?.filter( w=> !w.radius ).forEach((wire)=>{
        const createdObject = objectFactory.create(wire.id, scaffoldTypes.wires, this.queryGeneratedModel.bind(model), this.queryCreatedObjects.bind(this), level);
        if(createdObject)
          this._createdObjects.push(createdObject);
      });
    })
  }

  parse(model)
  {
    this.parseScaffolds(model);

    model.groups?.forEach((group) => {
      this.parse(group);
    })
    //nodes 
    let children = model[mainObjectTypes.nodes];
    children?.forEach((node)=>{
      const createdObject = objectFactory.create(node.id, mainObjectTypes.nodes, this.queryGeneratedModel.bind(model), this.queryCreatedObjects.bind(this));
      if(createdObject)
        this._createdObjects.push(createdObject);
    });

    //chains 
    children = model[mainObjectTypes.chains];
    children?.forEach((chain)=>{
      //chain.update();
    });

    //links
    children = model[mainObjectTypes.links];
    children?.forEach((node)=>{
      const createdObject = objectFactory.create(node.id, mainObjectTypes.links, this.queryGeneratedModel.bind(model), this.queryCreatedObjects.bind(this));
      if(createdObject)
        this._createdObjects.push(createdObject);
    });

    const props = Object.getOwnPropertyNames(model);
    const validObjNames = Object.getOwnPropertyNames(objectTypes);

    props.forEach((objType)=>{
      if (validObjNames.indexOf(objType) > -1)
      {
        children = model[objType];
        children?.forEach((node)=>{
          const createdObject = objectFactory.create(node.id, objType, this.queryGeneratedModel.bind(model), this.queryCreatedObjects.bind(this));
          if(createdObject)
            this._createdObjects.push(createdObject);
        });
      }
    })
  }

  updateCreatedObjectsLayout()
  {
    const elements = this._graph._graph._private.elements ;
    this._createdObjects.filter( o => o._type === mainObjectTypes.nodes )
    .forEach( node => {
      const el = elements.find( e => e.data().id == node.id );
      if (el)
      {
        const layoutPosition = el.position() ;
        node.position.x = layoutPosition.x ;
        node.position.y = layoutPosition.y ;
        node.position.z = 0 ;
      }
    })
    this._createdObjects.filter( o => o._type === mainObjectTypes.links )
    .forEach( link => {
      link.updatePoints();
    })
  }

  render()
  {
    this._renderedObjects = [];
    while (this._scene.children.length) { this._scene.remove(this._scene.children[0]) } // Clear the place

    //TODO handle THREEJS Groups
    this._createdObjects?.forEach(o =>{
      //const skip = ( o._generatedModel.invisible != undefined && o._generatedModel.invisible ) || ( o._generatedModel.geometry == 'invisible') ;
      if (o)
      {
        const renderedObject = o.render();
        if(renderedObject)
          this._renderedObjects.push(renderedObject);
      }
    });

    this._renderedObjects.filter( o => o.geometry ).forEach(o => this._scene.add(o));
    
    autoLayout(this._scene, this._model, false);
  }

  clearCreatedObjects()
  {
    this._createdObjects = [];
  }
}