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