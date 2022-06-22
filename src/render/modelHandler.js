import { objectTypes } from "./objectTypes"
import objectFactory from "./objects/factory"
import { Reducer, reducerTypes } from "./reducer";

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

  mediate(objectId, type, ...params)
  {
    const targetIndex = this._createdObjects.findIndex(o => o._json.id == objectId);
    let target ;
    if (targetIndex > -1)
    {
      target = this._createdObjects[targetIndex];
      switch(type)
      {
        case reducerTypes.height:
        {
          Reducer.changeHeight(target, ...params);
          break;
        }
        case reducerTypes.width:
        {
          Reducer.changeWidth(target, ...params);
          break;
        }
        case reducerTypes.position:
        {
          Reducer.changePosition(target, ...params);
          break;
        }
        case reducerTypes.transformation:
        {
          Reducer.changeTransformation(target, ...params);
          break;
        }
        case reducerTypes.delete:
        {

          this._createdObjects = this._createdObjects.splice(targetIndex, 1);
        }
      }
    }
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
          const createdObject = objectFactory.create(objType, node, this.mediate.bind(this));
          this._createdObjects.push(createdObject);
        });
      }
    })
  }

  merge()
  {
    this._createdObjects.forEach(o =>{ o.merge() });
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
