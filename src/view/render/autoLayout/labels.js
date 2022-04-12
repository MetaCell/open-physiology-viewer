import { getMeshesWithinPartition
  , checkClose
  , getSpaceBox
  , getSpacePartitions
  , removeLinePosData
  , createLinksToOrigin
  , createLineBetweenVectors  } from './collission';
  
function arrangeLabelsWithinPartition(partition, meshes, incZ)
{
  const inPartitionMeshes = getMeshesWithinPartition(partition, meshes);
  const alreadyProcessed = [];

  //arrange within partition
  if (inPartitionMeshes.length > 0)
  {
    //const radius = inPartitionMeshes.length * LABEL_SPACE_ARM_LENGTH ;//arm length is a fixed value taken as delta radius from the center of the partition
                                                                        //the larger ammount of meshes within the partition, the larger the arm
                                                                        //so it results in a "explode from center" kind of effect

                                                                        //for circle, need to implement this, no time
                                                                        //https://planetcalc.com/8943/
                                                                        //giving the upper/down positions for each index

    const total = inPartitionMeshes.length ;

    for ( var i = 0 ; i < total ; i++ )
    {
      for ( var j = i ; j < total ; j++ )
      {
        if (i!=j) // overlap with itself
        {
          const first = inPartitionMeshes[i];
          const second = inPartitionMeshes[j];
          if ( checkClose(first, second) )
          //if (checkCollide(first, second))
          {
            //move away in Y axis
            if ( ( alreadyProcessed.indexOf(first.id) == -1 ) && ( alreadyProcessed.indexOf(second.id) == -1 ) )
            {
              const firstPos    = first.position.clone() ;
              const secondPos   = second.position.clone() ;

              //shaking
              first.position.y  -= first.height ; 
              second.position.y += second.height ;
              first.position.x  -= first.width ;
              second.position.x += second.width ;
              second.position.z = incZ ;

              first.userData.initialPos = firstPos ;
              second.userData.initialPos = secondPos ;

              alreadyProcessed.push(first.id);
              alreadyProcessed.push(second.id);
            }
          }
        }
      } 
    }
  }
}

//space partitioning ordering algorithm
export function layoutLabelCollide(scene, showLabelWires) {
  const labels = getSceneObjectByModelClass(scene.children, "Label");
  if (labels.length > 0)
  {
    const spaceBox = getSpaceBox(labels);
    if (DEBUG)
    {
      const debugBox = debugMeshFromBox(spaceBox);
      //scene.add(debugBox);
    }
    const spacePartitionBoxes = getSpacePartitions(spaceBox, LABEL_SPACE_PARTITION_NUM);
    for (var i = 0; i < spacePartitionBoxes.length ; i ++)
    {      
      arrangeLabelsWithinPartition(spacePartitionBoxes[i], labels, LABEL_ELEVATION, showLabelWires);
      //arrangeLabelsWithinPartition(spacePartitionBoxes[i], labels, LABEL_ELEVATION, showLabelWires);
      // arrangeLabelsWithinPartition(spacePartitionBoxes[i], labels, 250);
      if (DEBUG)
      {
        let innerDebugBox = debugMeshFromBox(spacePartitionBoxes[i]);
        scene.add(innerDebugBox);
      }
    }
    removeLinePosData();
    if (showLabelWires)
      createLinksToOrigin(labels);
  }
}
function createLinksToOrigin(labels)
{
  labels.forEach((l)=>{
    if( l.userData.initialPos && l.userData.viewPosition && l.visible && l.text.length > 0 )
      createLineBetweenVectors(l.userData.viewPosition, l.position);
  })
}