import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { VehicleModel } from "../models/VehicleModel";
import { OrderModel } from "../models/order.model";

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    // private baseUrl = 'http://localhost:8081/api/orders';
    private baseUrl = 'https://fleet-manager.in/api/orders';

    constructor(private http: HttpClient) { }

    getAllOrders(): Observable<OrderModel[]> {
        return this.http.get<OrderModel[]>(this.baseUrl);
    }

    createOrder(order: any): Observable<any> {
        return this.http.post<any>(this.baseUrl, order);
    }

    updateOrder(id: any, formData: any) {
        return this.http.put(`${this.baseUrl}/${id}`, formData);
    }

    deleteOrder(id: number) {
        // Backend endpoint: /api/orders/delete/{id}
        return this.http.delete(`${this.baseUrl}/delete/${id}`);
    }

    getOrdersByVehicleId(id : String): Observable<OrderModel>{
        return this.http.get<OrderModel>(`${this.baseUrl}/vehicle/${id}`)
    }

}
