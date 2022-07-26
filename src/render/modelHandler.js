import { objectTypes } from "./model/types"
import objectFactory from "./model/factory"
import { queryTypes } from "./query/reducer";

export class modelHandler
{
  _json ;
  _createdObjects = [];
  _renderedObjects = [];
  _secene ;

  constructor(json, scene) { 
    this._json = json ;
    this._scene = scene ;
    this.parse();
    this.merge();
  }

  scene(scene) { this._scene = scene ; }

  createdObjects()
  {
    return this._createdObjects;
  }

  query(objectId, type, selectType = queryTypes.id, ...params)
  {
    let targetIndex =  -1 ;
    if (selectType == queryTypes.id)
      targetIndex = this._createdObjects.findIndex(o => o._json.id == objectId );
    else if (selectType == queryTypes.conveyingLyph)
      targetIndex = this._createdObjects.findIndex(o => o._json.conveyingLyph == objectId);
    const target = targetIndex >-1 ? this._createdObjects[targetIndex] : undefined ;
    return target ;
  }

  parse()
  {
    const props = Object.getOwnPropertyNames(this._json);
    const validObjNames = Object.getOwnPropertyNames(objectTypes);

    props.forEach((objType)=>{
      if (validObjNames.indexOf(objType) > -1)
      {
        const children = this._json[objType];
        children.forEach((node)=>{
          const createdObject = objectFactory.create(objType, node, this.query.bind(this));
          this._createdObjects.push(createdObject);
        });
      }
    })
  }

  merge()
  {
    this._createdObjects.forEach(o =>{ o.merge() });
    this._createdObjects.forEach(o =>{ 
      o.mergeSuperTypes() 
    });
  }

  render()
  {
    while (this._scene.children.length) { this._scene.remove(this._scene.children[0]) } // Clear the place

    //TODO handle THREEJS Groups
    this._createdObjects.forEach(o =>{
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
