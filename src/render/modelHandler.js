import { objectTypes } from "./objectTypes"
import objectFactory from "./objectFactory"

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

  parse()
  {
    const props = Object.getOwnPropertyNames(this._json);
    const validObjNames = Object.getOwnPropertyNames(objectTypes);

    props.forEach((objType)=>{
      if (validObjNames.indexOf(objType) > -1)
      {
        const children = this._json[objType];
        children.forEach((node)=>{
          const createdObject = objectFactory.create(objType, node);
          this._createdObjects.push(createdObject);
        });
      }
    })
  }

  scene(scene) { this._scene = scene ; }

  createdObjects()
  {
    return this._createdObjects;
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

  clearCreatedObjects()
  {
    this._createdObjects = [];
  }
}
