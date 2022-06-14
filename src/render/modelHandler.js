import { objectTypes } from "./objectTypes"
import objectFactory from "./objects/factory"
import { Mediator, mediatorTypes } from "./mediator";

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
  }

  scene(scene) { this._scene = scene ; }

  createdObjects()
  {
    return this._createdObjects;
  }

  mediate(objectId, type, ...params)
  {
    const target = this._createdObjects.find(o => o.id == objectId);
    switch(type)
    {
      case mediatorTypes.height:
      {
        target.height(...params);
        break;
      }
      case mediatorTypes.width:
      {
        target.width(...params);
        break;
      }
      case mediatorTypes.position:
      {
        target.position(...params);
        break;
      }
      case mediatorTypes.transformation:
      {
        target.transformation(...params);
        break;
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
          const createdObject = objectFactory.create(objType, node, this.mediate);
          this._createdObjects.push(createdObject);
        });
      }
    })
  }

  render()
  {
    while (this._scene.children.length) { this._scene.remove(this._scene.children[0]) } // Clear the place

    this._createdObjects.forEach(o =>{
      const renderedObject = o.render();
      this._renderedObjects.push(renderedObject);
    });

    this._renderedObjects.forEach(o => this._scene.add(o));

  }

  visit()
  {
    this._createdObjects.forEach(o =>{
      o.accept(renderObjectVisitor);
    });
  }

  clearCreatedObjects()
  {
    this._createdObjects = [];
  }
}
