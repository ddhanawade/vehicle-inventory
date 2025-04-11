export class VehicleModel {
    id: number;
    make: string;
    model: string;
    city: string;
    vehicleYear: number;
    availableCars : number;
    // More fields as necessary

    constructor(){
        this.id = 0;
        this.make = '';
        this.model = '';
        this.city = '';
        this.vehicleYear = 0;
        this.availableCars = 0;
    }
}
