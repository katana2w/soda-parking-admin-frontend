export interface Line {
  lineCoordinates: {
    start: {
      lat: number,
      lng: number
    },
    end: {
      lat: number,
      lng: number
    },
  },
  _id: string,
  lineName: string,
  linePoly: object,
  lineScanners: Array<object>,
  lineScannersOnMap: Array<object>,
  lineTolerance: number,
  marker1: object,
  marker2: object
}
