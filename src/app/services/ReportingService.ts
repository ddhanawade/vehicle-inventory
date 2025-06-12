import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { VehicleModel } from '../models/VehicleModel';
import { MonthlySalesRequest } from '../models/MonthlySalesRequest';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getData(): Observable<VehicleModel[]> {
    return this.http.get<VehicleModel[]>(this.baseUrl);
  }

  // getMonthlySalesReport(request: MonthlySalesRequest): Observable<any> {
  //   let httpParams = new HttpParams();
    
  //   if (request.dateRange) httpParams = httpParams.set('dateRange', request.dateRange);
  //   if (request.city) httpParams = httpParams.set('city', request.city);
  //   if (request.make) httpParams = httpParams.set('make', request.make);
  //   if (request.model) httpParams = httpParams.set('model', request.model);

  //   return this.http.post<any>(`${this.baseUrl}/analytics/monthly-sales`, {
  //     request: httpParams
  //   });
  // }

  getMonthlySalesReport(request: MonthlySalesRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/analytics/monthly-sales`, request);
  }

  // getTopModelSold(request: MonthlySalesRequest): Observable<any> {
  //   let httpParams = new HttpParams();
    
  //   if (request.dateRange) httpParams = httpParams.set('dateRange', request.dateRange);
  //   if (request.city) httpParams = httpParams.set('city', request.city);
  //   if (request.make) httpParams = httpParams.set('make', request.make);
  //   if (request.model) httpParams = httpParams.set('model', request.model);

  //   return this.http.get(`${this.baseUrl}/analytics/top-model-sold`, { params: httpParams });
  // }
  
}