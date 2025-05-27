export interface OrderModel {
    orderId: number;
    customerName: string;
    leadName: string;
    salesPersonName: string;
    deliveryDate: string;
    financerName: string;
    financeType: string;
    phoneNumber: string;
    remarks: string;
    status: string;
    [key: string]: string | number; // Index signature for dynamic access
}