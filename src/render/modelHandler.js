import { objectTypes } from "./objectTypes"
import objectFactory from "./objectFactory"

export class modelHandler
{
  _json ;
  _createdObjects = [];
  _renderedObjects = [];

  constructor(json) { this._json = json }

  parse()
  {
    const props = Object.getOwnPropertyNames(this._json);
    const validObjNames = Object.getOwnPropertyNames(objectTypes);

    props.forEach((objType)=>{
      if (validObjNames.indexOf(objType) > -1)
      {
        const children = this._json[objType];
        children.forEach((c)=>{
          const createdObject = objectFactory.create(objType, children);
          this._createdObjects.push(createdObject);
        });
      }
    })
  }

  createdObjects()
  {
    return this._createdObjects;
  }

  render()
  {
    this.clearCreatedObjects();
    this._createdObjects.forEach(o =>{
      const renderedObject = o.render();
      this._renderedObjects.push(renderedObject);
    })
  }

  clearCreatedObjects()
  {
    this._createdObjects = [];
  }
}
