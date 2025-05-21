import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { VehicleModel } from "../models/VehicleModel";
import { OrderModel } from "../models/order.model";

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    // private baseUrl = 'http://fleet-manager-env.eba-5vfuueih.us-east-2.elasticbeanstalk.com/api/vehicles';
    private baseUrl = 'http://localhost:8080/api/orders';

    constructor(private http: HttpClient) { }

    getAllOrders(): Observable<OrderModel[]> {
        return this.http.get<OrderModel[]>(this.baseUrl);
    }

    createOrder(order: any): Observable<any> {
        return this.http.post<any>(this.baseUrl, order);
    }

    updateOrder(order: any, formData: any) {
        return this.http.put(`${this.baseUrl}/${order.id}`, order);
    }

    deleteOrder(id: number) {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }

}