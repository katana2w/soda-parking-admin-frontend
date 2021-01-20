import { Injectable } from '@angular/core';
import { Line } from '../shared/types';
import { ApiService } from './api.service';
import {Observable, Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LineService {
  public allLines: any;
  public scanners: any[];

  constructor(public apiService: ApiService) { }

  async loadLinesList(): Promise<any> {
    return this.apiService.getLinesFromDb().subscribe(resp => {
      this.allLines = resp.allLinesObject;
      console.log(this.allLines);
      return this.allLines;
    });
  }

  loadScannersList(): any[] {
    this.scanners = [];
    return [];
  }
}
