export interface VehicleModel {
    id: number;
    make: string;
    model: string;
    grade: string;
    fuelType: string;
    exteriorColor: string;
    interiorColor: string;
    colorCode: string;
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
    greaterThan60DaysCount : string;
    remarks: string;
    // Order related fields
    customerName?: string;
    orderDate?: string;
    deliveryDate?: string;
    orderStatus?: string;
    salesPersonName?: string;
    leadName?: string;
    dmsStatus?: string;
    dealAmount?: string;
    financerName?: string;
    financeType?: string;
    [key: string]: string | number | undefined; // Index signature for dynamic access
  }