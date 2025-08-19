import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { VehicleModel } from '../models/VehicleModel';
import { MonthlySalesRequest } from '../models/MonthlySalesRequest';
import { MonthlyPurchaseRequest } from '../models/MonthlyPurchaseRequest';
import { TestVehicleModel, TestVehicleRequest, TestVehicleResponse } from '../models/TestVehicleModel';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {

  // private baseUrl = 'http://localhost:8081/api';
  private baseUrl = 'https://fleet-manager.in/api'; // Production URL

  constructor(private http: HttpClient) {}

  getData(): Observable<VehicleModel[]> {
    return this.http.get<VehicleModel[]>(this.baseUrl);
  }

  getMonthlySalesReport(request: MonthlySalesRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/analytics/monthly-sales`, request);
  }

  getMonthlyPurchaseReport(request: MonthlyPurchaseRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/analytics/monthly-vehicle-purchased`, request);
  }

  // Test Vehicle Report Methods
  getTestVehicleReport(request: TestVehicleRequest): Observable<TestVehicleModel[]> {
    return this.http.post<TestVehicleModel[]>(`${this.baseUrl}/analytics/test-vehicles`, request);
  }

  getTestVehicleSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/vehicles/testDriveVehicles`);
  }

  exportTestVehicleReport(request: TestVehicleRequest, format: string): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.post<Blob>(`${this.baseUrl}/analytics/test-vehicles/export`, request, {
      params: params,
      responseType: 'blob' as 'json'
    });
  }

}
