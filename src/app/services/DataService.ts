import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { VehicleModel } from '../models/VehicleModel';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseUrl = 'http://localhost:8080/api/vehicles';

  constructor(private http: HttpClient) {}

  getData(): Observable<VehicleModel[]> {
    return this.http.get<VehicleModel[]>(this.baseUrl);
  }

  addVehicle(vehicle: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, vehicle);
  }

  updateVehicleDetails(vehicleData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${vehicleData.id}`, vehicleData);
  }

  deleteVehicleDetails(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getUnqiueVehicleModels(): Observable<VehicleModel[]> {
    return this.http.get<VehicleModel[]>(`${this.baseUrl}/getUniqueVehicles`);
  }

  getAgeCountByModel(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ageCountByModel`);
  }

  private modelNameSubject = new Subject<string>();

  modelName$ = this.modelNameSubject.asObservable();

  setModelName(modelName: string): void {
    this.modelNameSubject.next(modelName);
  }
}