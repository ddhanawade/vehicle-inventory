export interface VehicleModel {
    id: number;
    make: string;
    model: string;
    grade: string;
    fuelType: string;
    exteriorColor: string;
    interiorColor: string;
    chassisNumber: string;
    engineNumber: string;
    keyNumber: string;
    location: string;
    vehicleStatus: string;
    receivedDate: string;
    invoiceDate: string;
    invoiceNumber: string;
    purchaseDealer: string;
    manufactureDate: string;
    suffix: string;
    invoiceValue: string;
    age: number;
    interest: string;
    lessThan30DaysCount : string;
    between30And60DaysCount: string;
    greaterThan60DaysCount : string
    [key: string]: string | number; // Index signature for dynamic access
  }