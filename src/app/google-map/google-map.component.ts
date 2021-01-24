import {Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
// import {DOCUMENT} from '@angular/common';
import {LineService} from '../_services';
import {ApiService} from '../_services';

import {Line} from '../shared/types';

import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {DialogMessageComponent} from '../dialog-message/dialog-message.component';
import {Router} from '@angular/router';

@Component({
    selector: 'app-google-map',
    templateUrl: './google-map.component.html',
    styleUrls: ['./google-map.component.less']
})
export class GoogleMapComponent implements OnInit, AfterViewInit {
    @ViewChild('mapContainer', {static: false}) gmap: ElementRef;
    map: google.maps.Map;
    marker1: any;
    marker2: any;
    markersStartEnd: Array<any> = [];
    parkingCircleArray: Array<any> = [];
    parkingPlaces: Array<any> = [];
    polylinesArray: any = {};
    listOfStreets: string[] = [];
    parkingCircleObjects: any = {};
    selectedLineObject: Line;
    selectedPolylineObject: any;
    selectedLineScanners: [];
    linesSavedArray: Array<Line> = null;

    defaultColors = {
        selectedLine: {
            lineColor: 'red',
            scannerColor: 'red',
        },
        defaultLine: {
            lineColor: 'blue',
            scannerColor: 'orange',
        },
        unselectedScanners: 'green'
    };
    isNewLine = false;
    isPreview = false;
    isEditLine = false;
    toleranceLineForm = 1;
    toleranceLineMeterForm = '2m';
    startPointForm = {};
    endPointForm = {};
    selectedPlacesForm = [];
    toleranceParamStart = 2;
    registered = false;
    submittedSave = false;
    submittedEdit = false;
    zoomLevel: number;
    geocoder: any;
    private saveLineForm: FormGroup;
    private editLineForm: FormGroup;
    onClickChangeSelectedLine = this.clickChangeSelectedLine.bind(this);
    isLoading = true;
    lineName = '';

    latCenter = 47.49219219532645;
    lngCenter = 19.05507372045515;

    constructor(
        public lineService: LineService,
        private apiService: ApiService,
        private formBuilder: FormBuilder,
        public dialog: MatDialog
    ) {
        this.saveLineForm = new FormGroup({
            lineName: new FormControl(),
            control: new FormControl(),
            toleranceLineForm: new FormControl(),
            toleranceLineMeterForm: new FormControl(),
        });
        this.editLineForm = new FormGroup({
            lineName: new FormControl(),
            toleranceLineForm: new FormControl(),
            toleranceLineMeterForm: new FormControl(),
            // _id: new FormControl(),
        });
    }

    async ngOnInit() {
        await Promise.all([
            // this.lineService.loadLinesList(),
            this.lineService.loadScannersList(),
        ]);
        this.apiService.getAllScannersFromUrl().subscribe(data => {
            this.parkingPlaces = data.response;
            this.getParkingPoints();
            this.apiService.getLinesFromDb().subscribe(resp => {
                this.linesSavedArray = resp.allLinesObject;
                this.createAllLinesOnMap();
                this.isLoading = true;
            });
        });
        this.saveLineForm = this.formBuilder.group({
            lineName: ['', Validators.required],
            toleranceLineForm: [1, Validators.required],
            toleranceLineMeterForm: ['2m'],
        });
        this.map.addListener('zoom_changed', () => {
            this.zoomLevel = this.map.getZoom();
        });

        // @ts-ignore
        google.maps.Polyline.prototype.getBounds = function () {
            const bounds = new google.maps.LatLngBounds();
            // tslint:disable-next-line:only-arrow-functions
            this.getPath().forEach((item, index) => {
                bounds.extend(new google.maps.LatLng(item.lat(), item.lng()));
            });
            return bounds;
        };
    }

    ngAfterViewInit(): void {
        this.mapInitializer();
    }

    mapInitializer(): void {
        this.map = new google.maps.Map(this.gmap.nativeElement, {
            zoom: 19,
            center: {
                lat: this.latCenter,
                lng: this.lngCenter,
            },
        });
        this.map.setOptions({
            styles: [
                {
                    featureType: 'poi.business',
                    stylers: [{visibility: 'off'}],
                },
                {
                    featureType: 'transit',
                    elementType: 'labels.icon',
                    stylers: [{visibility: 'off'}],
                },
            ]
        });
        this.setMapOnAll(null);
        this.geocoder = new google.maps.Geocoder();
        this.map.addListener('center_changed', () => {
            // 3 seconds after the center of the map has changed, pan back to the
            // marker.
            this.latCenter = this.map.getCenter().lat();
            this.lngCenter = this.map.getCenter().lng();
        });
    }

    geocodeLatLng(): void {
        this.geocoder.geocode({location: this.marker1.getPosition()}, (results, status) => {
            if (status === 'OK') {
                // @ts-ignore
                // tslint:disable-next-line:max-line-length
                this.listOfStreets = [...new Set(results.filter(item => item.types.includes('street_address')).map(it => it.address_components.filter(tt => tt.types.includes('route'))).map(kk => kk[0].long_name))];
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }

    setMapOnAll(map): void {
        if (this.markersStartEnd && this.markersStartEnd.length) {
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < this.markersStartEnd.length; i++) {
                this.markersStartEnd[i].setMap(map);
            }
        }
    }

    createAllLinesOnMap(linesArray = this.linesSavedArray): void {
        // tslint:disable-next-line:prefer-for-of
        for (const item in this.polylinesArray) {
            if (this.polylinesArray[this.polylinesArray]) {
                this.polylinesArray[this.polylinesArray].setMap(null);
                this.polylinesArray[this.polylinesArray] = null;
            }
        }
        this.polylinesArray = {};
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < linesArray.length; i++) {
            this.createLineBasedObject(linesArray[i]);
        }
    }

    createLineBasedObject(line: Line): void {
        // @ts-ignore
        const newLine = new google.maps.Polyline({
            map: this.map,
            path: [line.lineCoordinates.start, line.lineCoordinates.end],
            strokeColor: this.defaultColors.defaultLine.lineColor,
            strokeOpacity: 1.0,
            strokeWeight: 8
        });
        this.polylinesArray[line._id] = newLine;
        newLine.addListener('click', this.onClickChangeSelectedLine.bind(null, event, newLine, line, line.lineScanners));
        line.lineScanners.forEach((scanner: any) => {
            const idParking = scanner.ParkingPlaceId;
            // @ts-ignore
            const circle = this.parkingCircleObjects[idParking];
            if (circle) {
                // tslint:disable-next-line:max-line-length
                circle.setOptions({
                    fillColor: this.defaultColors.defaultLine.scannerColor,
                    strokeColor: this.defaultColors.defaultLine.scannerColor
                });
                circle.addListener('click', this.onClickChangeSelectedLine.bind(null, event, newLine, line, line.lineScanners));
            }
        });
    }

    onAddNewLine(): void {
        this.isPreview = false;
        this.isNewLine = true;
        this.makeSelectedLineDefaultColors();
        this.clearSelectedLineObjects();
        this.emptySelectedObjects();
        this.newLineOnMap2();
    }

    onCancelLine(): void {
        if (!this.isNewLine && !this.isEditLine && this.isPreview) {
            this.isLoading = false;
            this.isNewLine = false;
            this.isPreview = false;
            this.isEditLine = false;
            this.makeSelectedLineDefaultColors();
        } else {
            this.isLoading = false;
            this.isNewLine = false;
            this.isPreview = false;
            this.isEditLine = false;
            if (this.marker1) {
                google.maps.event.clearInstanceListeners(this.marker1);
            }
            if (this.marker2) {
                google.maps.event.clearInstanceListeners(this.marker2);
            }
            this.deleteMarkers();
            this.clearPolyline();
            if (!this.isPreview) {
                this.reloadMap();
            }
        }
    }

    onCancelSaveLine(): void {
        this.isNewLine = false;
        this.isPreview = false;
        this.isEditLine = false;
        if (this.marker1) {
            google.maps.event.clearInstanceListeners(this.marker1);
        }
        if (this.marker2) {
            google.maps.event.clearInstanceListeners(this.marker2);
        }
        google.maps.event.clearInstanceListeners(this.map);
        this.deleteMarkers();
        this.clearPolyline();
        // this.deleteLineAndPassDefaultColor();
        this.reloadMap();
    }

    newLineOnMap2(): void {
        // map onclick listener
        this.map.addListener('click', (e) => {
            if (this.markersStartEnd && this.markersStartEnd.length > 0 && this.markersStartEnd.length < 2) {
                this.marker2 = new google.maps.Marker({
                    map: this.map,
                    position: e.latLng,
                    draggable: true
                });

                // add listener to redraw the polyline when markers position change
                this.marker2.addListener('position_changed', () => {
                    this.drawPolyline();
                });

                // store the marker object drawn in global array
                this.markersStartEnd.push(this.marker2);
                // drawPolyline();
            }
            if (!this.markersStartEnd || this.markersStartEnd.length < 1) {
                this.marker1 = new google.maps.Marker({
                    map: this.map,
                    position: e.latLng,
                    draggable: true
                });

                // add listener to redraw the polyline when markers position change
                this.marker1.addListener('position_changed', () => {
                    this.drawPolyline();
                });

                // store the marker object drawn in global array
                this.markersStartEnd.push(this.marker1);
                // drawPolyline();
                this.geocodeLatLng();
            }
            this.drawPolyline();
        });
    }

    // define function to draw polyline that connect markers' position
    drawPolyline(): void {
        const markersPositionArray = [];
        // obtain latlng of all markers on map
        this.markersStartEnd.forEach((e) => {
            markersPositionArray.push(e.getPosition());
        });

        // check if there is already polyline drawn on map
        // remove the polyline from map before we draw new one
        if (this.selectedPolylineObject) {
            this.selectedPolylineObject.setMap(null);
            this.selectedPolylineObject = null;
        }

        // draw new polyline at markers' position
        this.selectedPolylineObject = new google.maps.Polyline({
            map: this.map,
            path: markersPositionArray,
            strokeColor: this.defaultColors.selectedLine.lineColor,
            strokeOpacity: 1.0,
            strokeWeight: 12,
        });
        if (this.marker1) {
            this.startPointForm = String(this.marker1.getPosition());
        }
        if (this.marker2) {
            this.endPointForm = String(this.marker2.getPosition());
        }
        if (this.marker1 && this.marker2) {
            this.sizeTolerance();
        }
    }

    getParkingPoints(): void {
        this.parkingPlaces.forEach((item) => {
            const lat = item.GpsCoordinates.Latitude;
            const lng = item.GpsCoordinates.Longitude;
            const idParking = item.ParkingPlaceId;
            // @ts-ignore
            const cityCircle = new google.maps.Circle({
                strokeColor: this.defaultColors.unselectedScanners,
                strokeOpacity: 1,
                strokeWeight: 2,
                fillColor: this.defaultColors.unselectedScanners,
                fillOpacity: 1,
                map: this.map,
                // id: idParking,
                center: {lat, lng},
                radius: 1,
            });
            this.parkingCircleArray.push(cityCircle);
            this.parkingCircleObjects[item.ParkingPlaceId] = cityCircle;
        });
    }

    sizeTolerance(): void {
        let res;
        if (this.isNewLine) {
            res = this.saveLineForm.getRawValue().toleranceLineForm;
        }
        if (this.isEditLine) {
            res = this.editLineForm.getRawValue().toleranceLineForm;
        }
        const resSelectedLine = this.selectedLineObject && this.selectedLineObject.lineTolerance;
        // ? this.saveLineForm.getRawValue().toleranceLineForm : this.selectedLineObject.lineTolerance;
        const resFinal = res || resSelectedLine || 1;
        const toleranceL = resFinal * 0.000025;
        this.toleranceLineMeterForm = ((this.toleranceParamStart * resFinal) + 'm').toString();
        this.selectedPlacesForm = [];
        if (this.selectedLineObject) {
            this.selectedLineObject.lineCoordinates.start.lat = this.marker1.getPosition().lat();
            this.selectedLineObject.lineCoordinates.start.lng = this.marker1.getPosition().lng();
            this.selectedLineObject.lineCoordinates.end.lat = this.marker2.getPosition().lat();
            this.selectedLineObject.lineCoordinates.end.lng = this.marker2.getPosition().lng();
            this.selectedLineObject.lineTolerance = this.toleranceParamStart * parseInt(String(resFinal), 2);
            this.selectedLineObject.lineScanners = [];
            this.selectedLineObject.lineScannersOnMap = [];
        } else {
            this.selectedLineObject = {
                lineCoordinates: {
                    start: {
                        lat: this.marker1.getPosition().lat(),
                        lng: this.marker1.getPosition().lng()
                    },
                    end: {
                        lat: this.marker2.getPosition().lat(),
                        lng: this.marker2.getPosition().lng()
                    }
                },
                lineName: '',
                _id: null,
                lineTolerance: this.toleranceParamStart * parseInt(String(resFinal), 2),
                linePoly: this.selectedPolylineObject,
                marker1: this.marker1,
                marker2: this.marker2,
                lineScanners: [],
                lineScannersOnMap: []
            };
        }

        this.parkingPlaces.forEach((item: any) => {
            const lat = item.GpsCoordinates.Latitude;
            const lng = item.GpsCoordinates.Longitude;
            const isLocationNear = google.maps.geometry.poly.isLocationOnEdge(
                new google.maps.LatLng(parseFloat(lat), parseFloat(lng)),
                this.selectedPolylineObject,
                toleranceL
            );
            const circle = this.parkingCircleObjects[item.ParkingPlaceId];
            if (isLocationNear) {
                if (circle) {
                    // tslint:disable-next-line:max-line-length
                    circle.setOptions({
                        fillColor: this.defaultColors.selectedLine.scannerColor,
                        strokeColor: this.defaultColors.selectedLine.scannerColor
                    });
                }
                this.selectedLineObject.lineScanners.push(item);
                this.selectedLineObject.lineScannersOnMap.push(circle);

                this.selectedPlacesForm.push(lat.toString() + ', ' + lng.toString());
            } else {
                if (circle.strokeColor === 'red' && circle.fillColor === 'red') {
                    circle.setOptions({
                        fillColor: this.defaultColors.unselectedScanners,
                        strokeColor: this.defaultColors.unselectedScanners
                    });
                }
            }
        });
    }

    deleteLineAndPassDefaultColor(): void {
        if (this.selectedLineObject && this.selectedLineObject.lineScanners && this.selectedLineObject.lineScanners.length > 0) {
            this.selectedLineObject.lineScanners.forEach((scanner: any) => {
                const idParking = scanner.ParkingPlaceId;
                const circle = this.parkingCircleObjects[idParking];
                if (circle) {
                    // tslint:disable-next-line:max-line-length
                    circle.setOptions({
                        fillColor: this.defaultColors.unselectedScanners,
                        strokeColor: this.defaultColors.unselectedScanners
                    });
                }
            });
        }
        this.selectedPolylineObject = null;
        this.selectedLineScanners = null;
        this.selectedLineObject = null;
    }

    makeSelectedLineDefaultColors(): void {
        if (this.selectedPolylineObject) {
            // tslint:disable-next-line:max-line-length
            this.selectedPolylineObject.setOptions({
                fillColor: this.defaultColors.defaultLine.lineColor,
                strokeColor: this.defaultColors.defaultLine.lineColor
            });
        }
        if (this.selectedLineScanners && this.selectedLineScanners.length > 0) {
            this.selectedLineScanners.forEach((scanner: any) => {
                const idParking = scanner.ParkingPlaceId;
                const circle = this.parkingCircleObjects[idParking];
                if (circle) {
                    // tslint:disable-next-line:max-line-length
                    circle.setOptions({
                        fillColor: this.defaultColors.defaultLine.scannerColor,
                        strokeColor: this.defaultColors.defaultLine.scannerColor
                    });
                }
            });
        }
        this.selectedPolylineObject = null;
        this.selectedLineScanners = null;
        this.selectedLineObject = null;
    }

    clickChangeSelectedLine(param1: any, polyLine: any, line: Line, lineScanners: []): void {
        if (!this.isEditLine && !this.isNewLine) {
            if (this.selectedPolylineObject) {
                this.selectedPolylineObject.setOptions({
                    fillColor: this.defaultColors.defaultLine.lineColor,
                    strokeColor: this.defaultColors.defaultLine.lineColor
                });
            }
            if (this.selectedLineScanners && this.selectedLineScanners.length > 0) {
                this.selectedLineScanners.forEach((scanner: any) => {
                    const idParking = scanner.ParkingPlaceId;
                    const circle = this.parkingCircleObjects[idParking];
                    if (circle) {
                        circle.setOptions({
                            fillColor: this.defaultColors.defaultLine.scannerColor,
                            strokeColor: this.defaultColors.defaultLine.scannerColor
                        });
                    }
                });
            }
            this.isPreview = true;
            this.selectedLineScanners = lineScanners;
            this.selectedPolylineObject = polyLine;
            this.selectedLineObject = line;
            polyLine.setOptions({strokeColor: this.defaultColors.selectedLine.lineColor});
            lineScanners.forEach((scanner: any) => {
                const idParking = scanner.ParkingPlaceId;
                const circle = this.parkingCircleObjects[idParking];
                if (circle) {
                    circle.setOptions({
                        fillColor: this.defaultColors.selectedLine.scannerColor,
                        strokeColor: this.defaultColors.selectedLine.scannerColor
                    });
                }
            });
            this.selectedLineScanners = lineScanners;
            this.selectedLineObject = line;
        }
    }

    // Removes the markers from the map, but keeps them in the array.
    clearMarkers(): void {
        this.setMapOnAll(null);
    }

    // Removes polyline from the map
    clearPolyline() {
        // tslint:disable-next-line:no-unused-expression
        if (this.selectedPolylineObject) {
            this.selectedPolylineObject.setMap(null);
            this.selectedPolylineObject = null;
        }
        // tslint:disable-next-line:no-unused-expression
        if (this.selectedLineObject && this.selectedLineObject.linePoly) {
            // @ts-ignore
            this.selectedLineObject.linePoly.setMap(null);
            this.selectedLineObject.linePoly = null;
        }
    }

    // Clear all selected objects
    clearSelectedLineObjects() {
        if (this.selectedLineScanners && this.selectedLineScanners.length) {
            this.selectedLineScanners.forEach((scanner: any) => {
                const idParking = scanner.ParkingPlaceId;
                const circle = this.parkingCircleObjects[idParking];
                if (circle) {
                    // tslint:disable-next-line:max-line-length
                    circle.setOptions({
                        fillColor: this.defaultColors.unselectedScanners,
                        strokeColor: this.defaultColors.unselectedScanners
                    });
                }
            });
        }
        this.selectedPolylineObject = null;
        this.selectedLineObject = null;
        this.selectedLineScanners = null;
        this.selectedPlacesForm = null;
    }

    emptySelectedObjects() {
        this.saveLineForm.setValue({
            lineName: '',
            toleranceLineForm: 1,
            toleranceLineMeterForm: '2m'
        });
        this.startPointForm = {};
        this.endPointForm = {};
        this.selectedPlacesForm = [];
    }

    // Deletes all markers in the array by removing references to them.
    deleteMarkers(): void {
        this.marker1 = null;
        this.marker2 = null;
        this.clearMarkers();
        this.markersStartEnd = [];
    }

    formatLineObject() {
        this.selectedLineObject.lineCoordinates.start.lat = this.marker1.getPosition().lat();
        this.selectedLineObject.lineCoordinates.start.lng = this.marker1.getPosition().lng();
        this.selectedLineObject.lineCoordinates.end.lat = this.marker2.getPosition().lat();
        this.selectedLineObject.lineCoordinates.end.lng = this.marker2.getPosition().lng();

        if (this.isEditLine) {
            this.selectedLineObject.lineName = this.editLineForm.value.lineName;
            this.selectedLineObject.lineTolerance = this.editLineForm.value.toleranceLineForm;
        }
        if (this.isNewLine) {
            this.selectedLineObject.lineName = this.saveLineForm.value.lineName;
            this.selectedLineObject.lineTolerance = this.saveLineForm.value.toleranceLineForm;
        }
        this.selectedLineObject.linePoly = null;
        // this.selectedLineObject.marker1 = this.marker1;
        // this.selectedLineObject.marker2 = this.marker2;
        this.selectedLineObject.marker1 = {
            lat: this.marker1.getPosition().lat(),
            lng: this.marker1.getPosition().lng()
        };
        this.selectedLineObject.marker2 = {
            lat: this.marker2.getPosition().lat(),
            lng: this.marker2.getPosition().lng()
        };

        this.linesSavedArray.push(this.selectedLineObject);

        this.selectedLineObject.lineScannersOnMap = null;
    }

    removingListeners() {
        if (this.marker1) {
            google.maps.event.clearInstanceListeners(this.marker1);
        }
        if (this.marker2) {
            google.maps.event.clearInstanceListeners(this.marker2);
        }
        google.maps.event.clearInstanceListeners(this.map);
    }

    onEditLine(): void {
        this.isPreview = false;
        this.isNewLine = false;
        this.isEditLine = true;
        const {lineCoordinates: {start}} = this.selectedLineObject;
        const {lineCoordinates: {end}} = this.selectedLineObject;
        this.editLineForm = this.formBuilder.group({
            lineName: [this.selectedLineObject.lineName, Validators.required],
            toleranceLineForm: [this.selectedLineObject.lineTolerance, Validators.required],
            toleranceLineMeterForm: [((this.toleranceParamStart * this.selectedLineObject.lineTolerance) + 'm').toString()],
            _id: [this.selectedLineObject._id, Validators.required],
        });
        // @ts-ignore
        this.editLineForm.setValue({
            _id: this.selectedLineObject._id,
            lineName: this.selectedLineObject.lineName,
            toleranceLineForm: this.selectedLineObject.lineTolerance,
            toleranceLineMeterForm: ((this.toleranceParamStart * this.selectedLineObject.lineTolerance) + 'm').toString()
        });
        this.toleranceLineMeterForm = ((this.toleranceParamStart * this.selectedLineObject.lineTolerance) + 'm').toString();
        this.toleranceLineForm = this.selectedLineObject.lineTolerance;
        this.marker1 = new google.maps.Marker({
            map: this.map,
            draggable: true,
            position: {
                lat: start.lat,
                lng: start.lng
            },
        });
        this.markersStartEnd.push(this.marker1);
        this.marker2 = new google.maps.Marker({
            map: this.map,
            draggable: true,
            position: {
                lat: end.lat,
                lng: end.lng
            },
        });
        if (this.selectedPolylineObject) {
            this.selectedPolylineObject.setMap(null);
            this.selectedPolylineObject = null;
            if (this.polylinesArray[this.selectedLineObject._id]) {
                this.polylinesArray[this.selectedLineObject._id].setMap(null);
                this.polylinesArray[this.selectedLineObject._id] = null;
            }
        }
        if (this.marker1) {
            this.startPointForm = String(this.marker1.getPosition());
        }
        if (this.marker2) {
            this.endPointForm = String(this.marker2.getPosition());
        }

        this.markersStartEnd.push(this.marker2);
        this.marker1.addListener('position_changed', () => {
            this.drawPolyline();
        });
        this.marker2.addListener('position_changed', () => {
            this.drawPolyline();
        });
        if (this.selectedPolylineObject) {
            this.selectedPolylineObject.setOptions({strokeColor: this.defaultColors.selectedLine.lineColor});
        }
        this.drawPolyline();
        this.sizeTolerance();
    }

    onSubmitSave() {
        this.submittedSave = true;

        if (this.saveLineForm.invalid === true) {
            return;
        } else {
            this.formatLineObject();
            this.registered = true;
            this.apiService.saveLineDb(this.selectedLineObject).subscribe(data => {
                    this.apiService.getLinesFromDb().subscribe(resp => {
                        this.linesSavedArray = resp.allLinesObject;
                        if (data && data.message === 'Ok') {
                            this.removingListeners();
                            this.deleteMarkers();
                            this.createAllLinesOnMap();
                            this.selectedPolylineObject.setMap(null);
                            this.selectedPolylineObject = null;
                            this.selectedLineObject = null;
                            this.isNewLine = false;
                            this.isPreview = false;
                        } else if (data && data.message === 'Error') {
                            this.clearPolyline();
                            this.drawPolyline();
                            if (data.err.keyPattern.lineName) {
                                this.openDialog(`Line with name "${data.err.keyValue.lineName}" already exists!`);
                            }
                        }
                    });
                },
                error => {
                    this.reloadMap();
                });
        }
    }

    reloadMap(): void {
        this.map = null;
        this.mapInitializer();
        this.apiService.getAllScannersFromUrl().subscribe(data => {
            this.parkingPlaces = data.response;
            this.getParkingPoints();
            this.apiService.getLinesFromDb().subscribe(resp => {
                this.linesSavedArray = resp.allLinesObject;
                this.createAllLinesOnMap();
                this.isLoading = true;
            });
        });
    }

    onSubmitEdit() {
        this.submittedEdit = true;

        if (this.editLineForm.invalid === true) {
            return;
        } else {
            this.formatLineObject();
            this.registered = true;
            this.apiService.saveEditLineDb(this.selectedLineObject).subscribe(data => {
                this.apiService.getLinesFromDb().subscribe(resp => {
                    this.linesSavedArray = resp.allLinesObject;
                    this.removingListeners();
                    this.isEditLine = false;
                    this.clearPolyline();
                    this.deleteMarkers();
                    this.createAllLinesOnMap([this.selectedLineObject]);
                    this.clearSelectedLineObjects();
                    // this.createAllLinesOnMap();
                    // this._document.defaultView.location.reload();
                    // this.reloadMap();
                });
            });
        }
    }

    onRemoveLine(): void {
        if (this.selectedLineObject._id) {
            const lineScannersUnsuedColor = this.selectedLineObject.lineScanners;
            this.apiService.removeLineFromDb(this.selectedLineObject).subscribe(data => {
                this.apiService.getLinesFromDb().subscribe(resp => {
                    this.isPreview = false;
                    this.linesSavedArray = resp.allLinesObject;
                    lineScannersUnsuedColor.forEach((item: any) => {
                        const id = item.ParkingPlaceId;
                        const cityCircle = this.parkingCircleObjects[id];

                        // @ts-ignore
                        if (cityCircle.strokeColor === 'red' && cityCircle.fillColor === 'red') {
                            cityCircle.setOptions({
                                fillColor: this.defaultColors.unselectedScanners,
                                strokeColor: this.defaultColors.unselectedScanners
                            });
                        }
                    });
                    if (this.polylinesArray[this.selectedLineObject._id]) {
                        this.polylinesArray[this.selectedLineObject._id].setMap(null);
                        this.polylinesArray[this.selectedLineObject._id] = null;
                    }
                    this.clearPolyline();
                    this.deleteMarkers();
                    this.clearSelectedLineObjects();
                    this.removingListeners();
                    this.selectedLineObject = null;
                    this.selectedPolylineObject = null;
                    this.selectedLineScanners = null;
                });
            });
        }
    }

    onSetCenterMap(): void {
        this.map.setCenter(new google.maps.LatLng(47.49219219532645, 19.05507372045515));
    }

    openDialog(textMessage): void {
        const dialogRef = this.dialog.open(DialogMessageComponent, {
            width: '500px',
            data: {
                description: textMessage
            },
        });
    }

    onGetCenterMap(): void {
        const bnds = this.map.getBounds();
        const poly = this.selectedPolylineObject.getBounds();
        console.log('checking', bnds.intersects(poly));
    }
}
