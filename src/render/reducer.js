export const reducerTypes = {
  width: 'width',
  height: 'height',
  position: 'position',
  transformation: 'transformation',
  delete: 'delete',
  pop: 'pop'
}

export class Reducer {
  static changeWidth(o, width) {
    o.width = width ;
  }
  static changeHeight(o, height) {
    o.height = height ;
  }
  static changePosition(o, position) {
    o.position = position ;
  }
  static changeTransformation(o, transformation) {
    o.transformation = transformation ;
  }
}