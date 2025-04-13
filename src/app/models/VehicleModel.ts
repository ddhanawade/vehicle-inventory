export class VehicleModel {
    id: number;
    make: string;
    model: string;
    grade: string;
    fuelType: string;
    exteriorColor: string;
    interiorColor: string;
    chassisNumber: string;
    engineNumber: string;
    location: string;
    status: string;
    keyNumber: number;
    availableCars: number;
    receivedDate: Date;

    constructor(data?: Partial<VehicleModel>) {
        this.id = data?.id || 0;
        this.make = data?.make || '';
        this.model = data?.model || '';
        this.grade = data?.grade || '';
        this.fuelType = data?.fuelType || '';
        this.exteriorColor = data?.exteriorColor || '';
        this.interiorColor = data?.interiorColor || '';
        this.chassisNumber = data?.chassisNumber || '';
        this.engineNumber = data?.engineNumber || '';
        this.location = data?.location || '';
        this.status = data?.status || '';
        this.keyNumber = data?.keyNumber || 0;
        this.availableCars = data?.availableCars || 0;
        this.receivedDate = data?.receivedDate ? new Date(data.receivedDate) : new Date();
    }
}