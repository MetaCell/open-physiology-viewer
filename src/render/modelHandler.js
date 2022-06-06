import { objectTypes } from "./objectTypes"
import { objectFactory } from "./objectFactory"

function modelHandler(json)
{
  this._json = json ;
  this._createdObjects = [];
  this._renderedObjects = [];
}

modelHandler.prototype.parse()
{
  const props = Object.getOwnPropertyNames(this._json);
  const validObjNames = Object.getOwnPropertyNames(objectTypes);

  props.forEach((objType)=>{
    if (validObjNames.indexOf(objType))
    {
      const children = this._json[objType];
      children.forEach((c)=>{
        const createdObject = objectFactory.create(objType, children);
        this._createdObjects.push(createdObject);
      });
    }
  })
}

modelHandler.prototype.render()
{
  this.clearCreatedObjects();
  this._createdObjects.forEach(o =>{
    const renderedObject = o.render();
    this._renderedObjects.push(renderedObject);
  })
}

modelHandler.prototype.clearCreatedObjects()
{
  this._createdObjects = [];
}

export default modelHandler ;