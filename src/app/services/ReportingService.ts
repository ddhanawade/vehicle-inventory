import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { VehicleModel } from '../models/VehicleModel';
import { ReportParams } from '../models/ReportParams';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getData(): Observable<VehicleModel[]> {
    return this.http.get<VehicleModel[]>(this.baseUrl);
  }

  getMonthlySalesReport(params: ReportParams): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params.dateRange) httpParams = httpParams.set('dateRange', params.dateRange);
    if (params.city) httpParams = httpParams.set('city', params.city);
    if (params.make) httpParams = httpParams.set('make', params.make);
    if (params.model) httpParams = httpParams.set('model', params.model);

    return this.http.get(`${this.baseUrl}/analytics/monthly-sales`, {
      params: httpParams
    });
  }

  getTopModelSold(params: ReportParams): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params.dateRange) httpParams = httpParams.set('dateRange', params.dateRange);
    if (params.city) httpParams = httpParams.set('city', params.city);
    if (params.make) httpParams = httpParams.set('make', params.make);
    if (params.model) httpParams = httpParams.set('model', params.model);

    return this.http.get(`${this.baseUrl}/analytics/top-model-sold`, { params: httpParams });
  }
  
}