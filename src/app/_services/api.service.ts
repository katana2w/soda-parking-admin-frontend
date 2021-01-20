import {Injectable} from '@angular/core';
import {
  HttpClient,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import {SERVER} from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  public getJSON(): Observable<any> {
    return this.http.get('./assets/scanners.json');
  }

  getAllScannersFromUrl(): Observable<any> {
    console.log('GET ALL SCANNERS');
    return this.http.get(`${ SERVER.protocol }${ SERVER.host }` + '/all-scanners');
  }

  getLinesFromDb(): Observable<any> {
    console.log('GET ALL LINES');

    return this.http.get(`${ SERVER.protocol }${ SERVER.host }` + '/all-lines');
  }

  getLinesLatLngFromDb(lat1: number, lng1: number, lat2: number, lng2: number): Observable<any> {
    console.log('GET ALL LAT&LNG LINES');
    // tslint:disable-next-line:max-line-length
    return this.http.get(`${ SERVER.protocol }${ SERVER.host }/all-lines-lat-lng?lat1=${lat1}&lng1=${lng1}&lat2=${lat2}&lng2=${lng2}`);
  }

  public saveLineDb(lineObject): Observable<any> {
    console.log('SAVING');
    return this.http.post(`${ SERVER.protocol }${ SERVER.host }` + '/save-line', lineObject);
  }

  public saveEditLineDb(lineObject): Observable<any> {
    console.log('SAVING EDIT');
    return this.http.put(`${SERVER.protocol}${SERVER.host}` + '/update-line', lineObject);
  }

  public removeLineFromDb(lineObject): Observable<any> {
    console.log('REMOVING');
    return this.http.post(`${ SERVER.protocol }${ SERVER.host }` + '/remove-line', lineObject);
  }

  public authUserLogin(lineObject): Observable<any> {
    console.log('REMOVING');
    return this.http.post(`${ SERVER.protocol }${ SERVER.host }` + '/users/authenticate', lineObject);
  }
}
