import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { VehicleModel } from '../models/VehicleModel';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  //private baseUrl = 'http://fleet-manager-env.eba-5vfuueih.us-east-2.elasticbeanstalk.com/api/vehicles';
  private baseUrl = 'http://localhost:8080/api/vehicles';

  constructor(private http: HttpClient) { }

  getData(): Observable<VehicleModel[]>{
    return this.http.get<VehicleModel[]>(this.baseUrl);
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

  private modelNameSubject = new Subject<string>();

  // Observable to listen for model name changes
  modelName$ = this.modelNameSubject.asObservable();

  // Method to emit the model name
  setModelName(modelName: string) {
    this.modelNameSubject.next(modelName);
  }
  
}
