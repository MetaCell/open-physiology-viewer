export function getSceneObjectByModelId(scene, userDataId) {
  return scene.children.find(c => c.userData.id === userDataId);
}

export function getSceneObjectsByList(scene, ids) {
  return scene.children.find(c => ids.indexOf(c.userData.id) > -1);
}

export function getSceneObjectByModelClass(all, className) {
  return all.filter(c => c.userData.class === className);
}


export function getBoundingBox(obj)
{
  return isGroup(obj) ? getGroupBoundingBox(obj) : getMeshBoundingBox(obj);
}

export function getMeshBoundingBox(obj)
{
  obj.geometry.computeBoundingBox();
  return obj.geometry.boundingBox ;
}

export function getGroupBoundingBox(group)
{
  return new THREE.Box3().setFromObject(group);
}

export function getBoundingBoxSize(obj)
{
  return isGroup(obj) ? getGroupBoundingBoxSize(obj) : getMeshBoundingBoxSize(obj);
  //return isGroup(obj) ? calculateGroupBoundaries(obj) : getMeshBoundingBoxSize(obj);
}

export function getMeshBoundingBoxSize(obj)
{
  obj.geometry.computeBoundingBox();
  const size = new THREE.Vector3();
  obj.geometry.boundingBox.getSize(size) ;
  return size ;
}

export function getGroupBoundingBoxSize(group)
{
  let bb = new THREE.Box3().setFromObject(group);
  return bb.getSize(new THREE.Vector3());
}

export function isGroup(obj)
{
  return obj.type == 'Group' ;
}

export function isMesh(obj)
{
  return obj.type == 'Mesh' ;
}

export function getNumberOfHorizontalLyphs(ar, total)
{
  return Math.floor(total / (ar + 1));  
}

export function cloneTargetRotation(target, source) {
  const r = target.rotation.clone();
  source.setRotationFromEuler(r);
}

export function cloneTargetGeometry(target, source) {
  const g = target.geometry.clone();
  source.geometry = g ;
}

export function getMiddle(object)
{
  var middle = new THREE.Vector3();
  object.geometry.computeBoundingBox();
  object.geometry.boundingBox.getCenter( middle );
  return middle ;
}

export function getCenterPoint(mesh) {

  const middle = getMiddle(mesh);
  mesh.localToWorld( middle );

  return middle;
}

export function removeEntity(scene, obj) {
  scene.remove( obj );
}

export function setMeshPos(obj, x, y, z)
{
  obj.position.x = x ;
  obj.position.y = y ;
  obj.position.z = z ;
}


export function reCenter(obj)
{
  const boxSize = getBoundingBoxSize(obj);
  const deltaX = - boxSize.x /2;
  const deltaY = - boxSize.y /2;
  obj.translateX(deltaX);
  //obj.translateY(deltaY);
}

export function putDebugObjectInPosition(scene, position)
{
  const geometry = new THREE.SphereGeometry(50);
  const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  const sphere = new THREE.Mesh( geometry, material );
  sphere.position.set(position);
  scene.add(sphere);
}


export function getHostParentForLyph(all, hostId)
{
  return all.find((c)=> c.userData.id == hostId )
}

export function computeGroupCenter(group)
{
  let box = new THREE.Box3().setFromObject(group)
  let position = new THREE.Vector3();
  box.getCenter(position);
  return position;
}

export function getPointInBetweenByPerc(pointA, pointB, percentage) {
    
  var dir = pointB?.clone().sub(pointA);
  var len = dir?.length();
  dir = dir?.normalize().multiplyScalar(len*percentage);
  return pointA?.clone().add(dir);
     
}

export function getWorldPosition(host){
  var position = new THREE.Vector3();
  host.getWorldPosition(position);
  return getCenterPoint(host);
}

export function validPosition(position){
  if( isNaN(position.x) || isNaN(position.y) || isNaN(position.z) ){
    return false;
  }

  return true;
}

export function clearByObjectType(scene, type) {
  const objects = getSceneObjectByModelClass(scene.children, type);
  objects.forEach((l)=> {
    removeEntity(scene, l);
  });
}

function preventMaxSizeLyph() {
  let all = [];
  let kapsuleChildren = scene.children ;
  trasverseSceneChildren(kapsuleChildren, all);
  let lyphs = getSceneObjectByModelClass(all, 'Lyph');
  lyphs.forEach((l)=>{
    checkMaxLyphSize(l);
  })
}


function calculateGroupCenter(obj)
{
  let minX = 0 ;
  let maxX = 0 ;
  let minY = 0 ;
  let maxY = 0 ;
  let minZ = 0 ;
  let maxZ = 0 ;
  obj.children.forEach((c) => {
    // if (isMesh(c))
    // {
    //   if (!c.geometry.boundingBox)
    //     c.geometry.computeBoundingBox();
      if ( c.geometry.boundingBox.min.x < minX ) minX = c.geometry.boundingBox.min.x ;
      if ( c.geometry.boundingBox.max.x > maxX ) maxX = c.geometry.boundingBox.max.x ;
      if ( c.geometry.boundingBox.min.y < minY ) minY = c.geometry.boundingBox.min.y ;
      if ( c.geometry.boundingBox.max.y > maxY ) maxY = c.geometry.boundingBox.max.y ;
      if ( c.geometry.boundingBox.min.z < minZ ) minZ = c.geometry.boundingBox.min.z ;
      if ( c.geometry.boundingBox.max.z > maxZ ) maxZ = c.geometry.boundingBox.max.z ;
    //}
  });

  return new THREE.Vector3(avg(minX, maxX), avg(minY, maxY), avg(minZ, maxZ));
}

function getBorder(target)
{
  //add border bounding for debugging
  let bxbb = getBoundingBoxSize(target);

  var bx = new THREE.Mesh(
    new THREE.BoxGeometry(bxbb.x, bxbb.y, bxbb.z),
    new THREE.LineBasicMaterial( {
      color: 0xffffff,
      linewidth: 1,
      linecap: 'round', //ignored by WebGLRenderer
      linejoin:  'round' //ignored by WebGLRenderer
    } ));

  return bx ;
}


function avg(a,b)
{
  return (a+b)/2;
}

export function calculateSpace(meshes)
{
  let minX = 0 ;
  let maxX = 0 ;
  let minY = 0 ;
  let maxY = 0 ;
  meshes.forEach((c) => {
    if (c.geometry)
    {
      const targetSize = getBoundingBox(c);
      const width = targetSize.max.x - targetSize.min.x ;
      const height = targetSize.max.y - targetSize.min.y ;

      const objMinX = c.position.x - 0.5 * width ;
      const objMaxX = c.position.x + 0.5 * width ;
      const objMinY = c.position.y - 0.5 * height ;
      const objMaxY = c.position.y + 0.5 * height ;

      if ( objMinX < minX ) minX = objMinX ;
      if ( objMaxX > maxX ) maxX = objMaxX ;
      if ( objMinY < minY ) minY = objMinY ;
      if ( objMaxY > maxY ) maxY = objMaxY ;

      const objbbox = new THREE.Box3(new THREE.Vector3(objMinX, objMinY, 1), new THREE.Vector2(objMaxX, objMaxY, 1));
      c.userData.worldBBox = bbox ;
    }
  });

  const bbox = new THREE.Box3(new THREE.Vector3(minX, minY, 1), new THREE.Vector3(maxX, maxY, 1));
  return bbox ;
}

export function debugMeshFromBox(box)
{
  const material = new THREE.LineBasicMaterial({
    color: 0x0000ff
  });
  
  const boxGeometry = geometryFromBox(box);

  const line = new THREE.Line( boxGeometry, material );  

  return line ;
}

export function geometryFromBox(box)
{
  // make a BoxBufferGeometry of the same size as Box3
  const dimensions = new THREE.Vector3().subVectors( box.max, box.min );
  const boxGeo = new THREE.BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z);

  // move new mesh center so it's aligned with the original object
  const matrix = new THREE.Matrix4().setPosition(dimensions.addVectors(box.min, box.max).multiplyScalar( 0.5 ));
  boxGeo.applyMatrix(matrix);

  return boxGeo ;
}

export function highlight(entity, color, rememberColor = true){
  if (!entity || !entity.viewObjects) { return; }
  let obj = entity.viewObjects["main"];
  if (obj && obj.material) {
      // store color of closest object (for later restoration)
      if (rememberColor){
          obj.currentHex = obj.material.color.getHex();
          (obj.children || []).forEach(child => {
              if (child.material) {
                  child.currentHex = child.material.color.getHex();
              }
          });
      }

      // set a new color for closest object
      obj.material.color.setHex(color);
      (obj.children || []).forEach(child => {
          if (child.material) {
              child.material.color.setHex(color);
          }
      });
  }
}

export function unhighlight(entity, defaultColor){
  if (!entity || !entity.viewObjects) { return; }
  let obj = entity.viewObjects["main"];
  if (obj){
      if (obj.material){
          obj.material.color.setHex( obj.currentHex || defaultColor);
      }
      (obj.children || []).forEach(child => {
          if (child.material) {
              child.material.color.setHex(child.currentHex || defaultColor);
          }
      })
  }
}
