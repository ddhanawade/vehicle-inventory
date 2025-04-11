import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VehicleModel } from '../models/VehicleModel';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private baseUrl = 'http://localhost:8080/api/vehicles';

  constructor(private http: HttpClient) { }

  getData(){
    return this.http.get(this.baseUrl);
  }

  addVehicle(vehicle: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, vehicle);
  }

  updateVehicleDetails(vehicleData: any){
    return this.http.put(`${this.baseUrl}/${vehicleData.id}`, vehicleData);
  }

  deleteVehicleDetails(id : number){
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
