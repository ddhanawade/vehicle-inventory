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
    status: string;
    receivedDate: string;
    invoiceDate: string;
    invoiceNumber: string;
    purchaseDealer: string;
    manufactureDate: string;
    suffix: string;
    tkmInvoiceValue: string;
    age: number;
    interest: string;
    [key: string]: string | number; // Index signature for dynamic access
  }