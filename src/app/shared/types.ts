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
  };
  _id: string;
  lineName: string;
  ruleName: string;
  linePoly: object;
  lineScanners: Array<object>;
  lineScannersOnMap: Array<object>;
  lineTolerance: number;
  marker1: object;
  marker2: object;
}

export interface Rule {
  _id: string;
  ruleName: string;
  ruleRedTo: number;
  ruleYellowFrom: number;
  ruleYellowTo: number;
  ruleGreenFrom: number;
}
