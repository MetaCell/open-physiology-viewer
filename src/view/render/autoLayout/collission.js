import { getSceneObjectByModelClass
  , calculateSpace
  , debugMeshFromBox 
  , highlight
  , unhighlight 
  } 
  from './objects'

  const LABEL_SPACE_PARTITION_NUM = 5 ;
  const LABEL_CLOSE_ENOUGH_DISTANCE = 15.00; 
  const DEBUG = true ;
  const COLLIDE_COLOR    = 0x00ff00;

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

//space partitioning ordering algorithm
export function tagCollidingObjects(scene, type) {
  const meshes = getSceneObjectByModelClass(scene.children, type);
  if (meshes.length > 0)
  {
    const spaceBox = getSpaceBox(meshes);
    if (DEBUG)
    {
      const debugBox = debugMeshFromBox(spaceBox);
      scene.add(debugBox);
    }
    const spacePartitionBoxes = getSpacePartitions(spaceBox, LABEL_SPACE_PARTITION_NUM);
    for (var i = 0; i < spacePartitionBoxes.length ; i ++)
    {      
      const partition = spacePartitionBoxes[i] ;
      if (DEBUG)
      {
        const debugBox = debugMeshFromBox(partition);
        scene.add(debugBox);
      }
      const partitionMeshes = getMeshesWithinPartition(partition, meshes)
      for (var j = 0 ; j < partitionMeshes.length; j ++ )
      {
        for (var k = j ; k < partitionMeshes.length; k ++ )
        {
          if ( i != j )
          {
            const first = partitionMeshes[j];
            const second = partitionMeshes[k];
            if (checkClose(first, second))
            {
              //paint red
              highlight(first, COLLIDE_COLOR);
              highlight(second, COLLIDE_COLOR);
            }
          }
        }
      }
    }
  }
}
