
function checkCollide(a, b) {
  const collideX = ( ( b.position.x > a.position.x - a.width / 2 ) && (b.position.x < a.position.x + a.width / 2) ) ;
  const collideY = ( ( b.position.y > a.position.y - a.height / 2 ) && (b.position.y < a.position.y + a.height / 2) ) ;
  return collideX && collideY ;
}

function getSpaceBox(meshes)  {
  return calculateSpace(meshes);
}
function getSpacePartitions(spaceBox, n)
{
  const spaceBoxSize = spaceBox.getSize();
  const widthSize = Math.floor(spaceBoxSize.x / n) ;
  const heightSize = Math.floor(spaceBoxSize.y / n);
  const startX = spaceBox.min.x ;
  const startY = spaceBox.min.y ;
  let partitions = [];

  for (var i = 0; i < n; i++)
  {
    for (var j = 0; j < n; j++)
    { 
      const minX = startX + widthSize* i ;
      const maxX = startX + widthSize*(i+1);
      const minY = startY + heightSize* j;
      const maxY = startY + heightSize*(j+1);

      partitions.push(new THREE.Box3(new THREE.Vector3(minX,minY,1)
                                   , new THREE.Vector3(maxX,maxY,1)))
    }
  }

  return partitions ;
}

function checkClose(first, second)
{
  return first.position.distanceTo(second.position) < LABEL_CLOSE_ENOUGH_DISTANCE ;
}

function createLineBetweenVectors(start, end)
{
  start.z = 0 ; //force matching plane
  const points = [];
  points.push( start );
  points.push( end );

  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  var lineMesh=new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({color:0x0000ff})//basic blue color as material
  );
  lineMesh['userData']['linePosData'] = true ;
  scene.add(lineMesh);
}

function removeLinePosData()
{
  const linePosData = scene.children.filter((m)=>m['userData']['linePosData'] );
  linePosData.forEach((m)=> scene.remove(m));
}

function getMeshesWithinPartition(partition, meshes)
{
  return meshes.filter((m)=> m.position.x > partition.min.x &&  m.position.x < partition.max.x && m.position.y > partition.min.y &&  m.position.y < partition.max.y)
}
