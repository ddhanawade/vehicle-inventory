import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserModel } from "../models/UserModel";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
export class userService {

private baseUrl = 'http://authorization.us-east-2.elasticbeanstalk.com/api/users';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<UserModel[]>{
    return this.http.get<UserModel[]>(this.baseUrl);
  }

  createUser(vehicle: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, vehicle);
  }

  updateUser(userData: any){
    return this.http.put(`${this.baseUrl}/${userData.id}`, userData);
  }

  deleteUser(id : number){
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}
