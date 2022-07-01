import { objectTypes } from "./objects/types"
import objectFactory from "./objects/factory"
import { reducerTypes, selectorTypes } from "./query/reducer";

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

  reducer(objectId, type, selectType = selectorTypes.id, ...params)
  {
    let targetIndex =  -1 ;
    if (selectType == selectorTypes.id)
      targetIndex = this._createdObjects.findIndex(o => o._json.id == objectId);
    else if (selectType == selectorTypes.conveyingLyph)
      targetIndex = this._createdObjects.findIndex(o => o._json.conveyingLyph == objectId);

    let target ;
    if (targetIndex > -1)
    {
      target = this._createdObjects[targetIndex];
      switch(type)
      {
        case reducerTypes.changeHeight:
        {
          target.height = params[0];
          break;
        }
        case reducerTypes.changeWidth:
        {
          target.width = params[0];
          break;
        }
        case reducerTypes.changePosition:
        {
          target.position = params[0];
          break;
        }
        case reducerTypes.changeTransformation:
        {
          target.transformation = params[0];
          break;
        }
        case reducerTypes.height:
        {
          return target.height ;
          break;
        }
        case reducerTypes.width:
        {
          return target.width ;
          break;
        }
        case reducerTypes.position:
        {
          return target.position ;
          break;
        }
        case reducerTypes.transformation:
        {
          return target.transformation ;
          break;
        }
        case reducerTypes.pop:
        {
          return target ;
          break;
        }
        case reducerTypes.delete:
        {
          this._createdObjects = this._createdObjects.splice(targetIndex, 1);
        }
      }
    }
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
          const createdObject = objectFactory.create(objType, node, this.reducer.bind(this));
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
