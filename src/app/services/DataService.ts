import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private baseUrl = 'http://localhost:8080/api/vehicles';

  constructor(private http: HttpClient) { }

  getData(){
    return this.http.get(this.baseUrl);
  }
}
