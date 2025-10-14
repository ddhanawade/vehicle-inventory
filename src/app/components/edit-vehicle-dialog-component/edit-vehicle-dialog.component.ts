import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderService } from '../../services/OrderService';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { OrderModel } from '../../models/order.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'MM/DD/YYYY',
  },
  display: {
    dateInput: 'MM/DD/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-edit-vehicle-dialog-component',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  providers: [
    OrderService,
    MatDatepickerModule,
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: DateAdapter, useClass: NativeDateAdapter }
  ],
  templateUrl: './edit-vehicle-dialog.component.html',
  styleUrls: ['./edit-vehicle-dialog.scss'] // Corrected property name
})
export class EditVehicleDialogComponent {
  vehicleForm: FormGroup;
  isSaved = false;
  isUpdated = false;
  isSaving = false;
  successMessage = '';
  editOrderData: any = {};
  orderId: number | null = null;
  isAdmin = false;

  teamLeaders = ['John Doe', 'Jane Smith', 'Mike Johnson'];
  salesOfficers = ['Alice Brown', 'Bob Wilson', 'Carol White'];
  financers = [
    'BANK OF MAHARASHTRA',
    'TOYOTA FINANCIAL SERVICES INDIA LTD',
    'HDFC BANK LTD',
    'CANARA BANK',
    'PUNJAB NATIONAL BANK',
    'CHOLAMANDALAM',
    'AXIS BANK',
    'ICICI BANK',
    'STATE BANK OF INDIA',
    'KOTAK MAHINDRA BANK',
    'INDUSIND BANK',
    'YES BANK',
    'IDFC FIRST BANK',
    'RBL BANK',
    'FEDERAL BANK',
    'BANDHAN BANK',
    'AU SMALL FINANCE BANK',
    'BAJAJ FINANCE',
    'MAHINDRA FINANCE',
    'TATA CAPITAL',
    'L&T FINANCE',
    'SUNDARAM FINANCE',
    'SHRIRAM FINANCE',
    'UNION BANK OF INDIA',
    'BANK OF INDIA',
    'BANK OF BARODA',
    'CENTRAL BANK OF INDIA',
    'INDIAN OVERSEAS BANK',
    'IDBI BANK',
    'HDB FINANCIAL SERVICES',
    'Not Applicable'
  ];

  constructor(
    private dialogRef: MatDialogRef<EditVehicleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private orderService: OrderService
  ) {
    this.vehicleForm = this.fb.group({
      orderId: [''],
      vehicleId: [''],
      customerName: [''],
      leadName: [''],
      salesPersonName: [''],
      deliveryDate: [''],
      financerName: [''],
      financeType: [''],
      phoneNumber: ['', [Validators.pattern('^[0-9]{10}$')]],
      orderStatus: [''],
      remarks: [''],
      dealAmount: [''],
      dmsStatus: [''],
      vehicleStatus: ['']
    });
  }

  ngOnInit(): void {
    // derive admin role
    const storedUser = localStorage.getItem('user');
    const roles = storedUser ? (JSON.parse(storedUser).roles || []) : [];
    this.isAdmin = Array.isArray(roles) && roles.includes('ADMIN');

    if (this.data) {
      // Handle both 'id' and 'vehicleId' field names
      const vehicleId = this.data.vehicleId || this.data.id;
      if (vehicleId) {
        this.orderService.getOrdersByVehicleId(vehicleId).subscribe({
          next: (response) => {
            if (response && Array.isArray(response) && response.length > 0) {
              const orderData = response[0];
              this.orderId = orderData.orderId;
              this.isSaved = true;
              this.vehicleForm.patchValue({
                ...orderData,
                deliveryDate: orderData.deliveryDate ? new Date(orderData.deliveryDate) : null,
                vehicleId: vehicleId
              });
            } else {
              this.resetForm(vehicleId.toString());
            }
          },
          error: (error) => {
            console.error('Error fetching order data:', error);
            this.resetForm(vehicleId.toString());
          }
        });
      }
    }
  }

  private checkExistingOrder(vehicleId: string) {
    
    this.getOrderByVehicleId(vehicleId).subscribe({
      next: (response) => {
        if (response && Object.keys(response).length) {
         // console.log("Existing order found:", response);
          this.isSaved = true;
          
          // Use the helper method to display data
          this.displaySavedData(response, vehicleId);
          
          // Disable form fields except status and remarks
          Object.keys(this.vehicleForm.controls).forEach(key => {
            if (key !== 'orderStatus' && key !== 'remarks') {
              this.vehicleForm.get(key)?.disable();
            }
          });
          
        } else {
          this.isSaved = false;
          console.log("No existing order found");
          this.resetForm(vehicleId);
        }
      },
      error: (error) => {
        console.error('Error checking for existing order:', error);
        this.resetForm(vehicleId);
      }
    });
}

  // Update the resetForm method to handle initial state
private resetForm(vehicleId: string): void {
    this.isSaved = false;
    this.isUpdated = false;
    this.orderId = null;
    this.vehicleForm.reset();
    this.vehicleForm.patchValue({ vehicleId });
  }

  formatPhoneNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    event.target.value = input.substring(0, 10);
  }

  // Returns true if at least one field has a non-empty value (excluding ids)
  hasAnyValue(): boolean {
    if (!this.vehicleForm) return false;
    const raw = this.vehicleForm.getRawValue();
    const keys = Object.keys(raw);
    for (const key of keys) {
      if (key === 'orderId' || key === 'vehicleId') continue;
      const val = raw[key as keyof typeof raw];
      if (val instanceof Date) return true;
      if (val !== null && val !== undefined && String(val).toString().trim() !== '') {
        return true;
      }
    }
    return false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get canDelete(): boolean {
    return !!this.orderId; 
  }

  deleteOrder(): void {
    if (!this.orderId) return;
    // Allow only admins to delete order details
    const storedUser = localStorage.getItem('user');
    const roles = storedUser ? (JSON.parse(storedUser).roles || []) : [];
    const isAdmin = Array.isArray(roles) && roles.includes('ADMIN');
    if (!isAdmin) {
      alert('Only admins can delete order details.');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this order? This action cannot be undone.');
    if (!confirmed) return;

    this.isSaving = true;
    this.orderService.deleteOrder(this.orderId).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Order deleted successfully';
        // Close dialog and signal deletion
        this.dialogRef.close({ deleted: true, orderId: this.orderId });
      },
      error: (err) => {
        console.error('Failed to delete order', err);
        this.isSaving = false;
        alert('Failed to delete order. Please try again.');
      }
    });
  }

  getOrderByVehicleId(id: String): Observable<OrderModel> {
    return this.orderService.getOrdersByVehicleId(id).pipe(
      tap(response => {
        if (Array.isArray(response) && response.length > 0) {
          const orderData = response[0];
          this.orderId = orderData.orderId;
          // Update the form with the first order's data
          this.displaySavedData(orderData, id.toString());
        } else if (response && 'orderId' in response) {
          // Handle single object response
          this.orderId = response.orderId;
          this.displaySavedData(response, id.toString());
        } else {
          console.warn('No order found or unexpected response format');
          this.resetForm(id.toString());
        }
      }),
      catchError(error => {
        console.error('Error fetching order:', error);
        this.resetForm(id.toString());
        return throwError(() => error);
      })
    );
  }

  // Helper method to clean form data before sending to backend
  private cleanFormData(formData: any): any {
    const cleanedData = { ...formData };
    
    // Convert empty strings to null for enum fields
    const enumFields = ['orderStatus', 'dmsStatus', 'vehicleStatus', 'financeType'];
    
    enumFields.forEach(field => {
      if (cleanedData[field] === '' || cleanedData[field] === undefined) {
        cleanedData[field] = null;
      }
    });
    
    // Also handle other fields that should be null instead of empty string
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '') {
        cleanedData[key] = null;
      }
    });
    
    return cleanedData;
  }

 onSave(vehicleId: string): void {
    if (this.vehicleForm.valid) {
      this.isSaving = true;
      const formData = this.cleanFormData(this.vehicleForm.value);
      this.orderService.createOrder(formData).subscribe({
        next: (response) => {
          setTimeout(() => {
          this.isSaved = true;
          this.isSaving = false;
          this.successMessage = 'Order created successfully!';
          this.orderId = response.orderId;
          this.vehicleForm.patchValue({
            ...response,
            vehicleId,
            orderId: response.orderId
          });
          setTimeout(() => {
            this.dialogRef.close(true); // Pass true to indicate success
        window.location.reload();   // Refresh the page
      }, 1000); // Wait 1 second before closing and refreshing
    }, 1500); // Simulate network delay
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error occurred while saving order details:', error);
        }
      });
    }
  }

onUpdate(): void {
    if (this.vehicleForm.valid && this.orderId) {
      this.isSaving = true;
      const formData = {
        ...this.cleanFormData(this.vehicleForm.value),
        orderId: this.orderId,
        deliveryDate: this.vehicleForm.get('deliveryDate')?.value
          ? new Date(this.vehicleForm.get('deliveryDate')?.value).toISOString()
          : null
      };
      console.log('Updating order with data:', JSON.stringify(formData));
      this.orderService.updateOrder(formData.orderId, formData).subscribe({
        next: (response) => {
          setTimeout(() => {
          this.isUpdated = true;
          this.isSaving = false;
          this.successMessage = 'Order details updated successfully!';
      setTimeout(() => {
        this.dialogRef.close(true);
        window.location.reload();
      }, 1000);
    }, 1500);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error updating order details:', error);
        }
      });
    }
  }

// Add a helper method to display the saved data
private displaySavedData(response: any, vehicleId: string): void {
  if (!response) return;

  const formData = {
    vehicleId: vehicleId,
    orderId: response.orderId || null,
    customerName: response.customerName || '',
    leadName: response.leadName || '',
    salesPersonName: response.salesPersonName || '',
    deliveryDate: response.deliveryDate ? new Date(response.deliveryDate) : null,
    financerName: response.financerName || '',
    financeType: response.financeType || '',
    phoneNumber: response.phoneNumber || '',
    orderStatus: response.orderStatus || '',
    remarks: response.remarks || ''
  };

  this.vehicleForm.patchValue(formData);
  this.isSaved = true;
}

}
