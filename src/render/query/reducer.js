export const reducerTypes = {
  changeWidth: 'changeWidth',
  changeHeight: 'changeHeight',
  changePosition: 'changePosition',
  changeTransformation: 'changeTransformation',
  width: 'width',
  height: 'height',
  position: 'position',
  transformation: 'transformation',
  delete: 'delete',
  pop: 'pop'
}

export const queryTypes = {
  id: 'id',
  conveyingLyph: 'conveyingLyph'
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