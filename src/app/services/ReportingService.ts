import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { VehicleModel } from '../models/VehicleModel';
import { MonthlySalesRequest } from '../models/MonthlySalesRequest';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {

  // private baseUrl = 'http://localhost:8080/api';
  private baseUrl = 'https://fleet-manager.in/api/analytics/monthly-sales';

  //private baseUrl = 'http://fleet-manager-prd.us-east-2.elasticbeanstalk.com/api';

  constructor(private http: HttpClient) {}

  getData(): Observable<VehicleModel[]> {
    return this.http.get<VehicleModel[]>(this.baseUrl);
  }


  getMonthlySalesReport(request: MonthlySalesRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/analytics/monthly-sales`, request);
  }

}
