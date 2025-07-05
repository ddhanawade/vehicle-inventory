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
    MatProgressSpinnerModule
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

  teamLeaders = ['John Doe', 'Jane Smith', 'Mike Johnson'];
  salesOfficers = ['Alice Brown', 'Bob Wilson', 'Carol White'];
  financers = ['BANK OF MAHARASHTRA', 'TOYOTA FINANCIAL SERVICES INDIA LTD', 'HDFC BANK LTD', 'CANARA BANK', 'PUNJAB NATIONAL BANK', 'CHOLAMANDALAM INVESTMENT AND FINANCE CO LTD', 'STATE BANK OF INDIA', 'SHRI TIRUPATI NAGARI SAH.PATSANSTHA MAYADIT', 'UNION BANK OF INDIA', 'MAHINDRA AND MAHINDRA FINANCIAL SERVICES LTD', 'Not Applicable', 'AU SMALL FINANCE BANK LIMITED', 'KOTAK MAHINDRA BANK LTD', 'ICICI BANK LTD', 'HDB FINANCIAL SERVICES LTD', 'BANK OF INDIA', 'SUNDARAM FINANCE LTD', 'AXIS BANK LTD', 'MADHYA PRADESH GRAMIN BANK', 'THE ANAND MERCANTILE CO-OPERATIVE BANK LIMITED', 'INDIAN OVERSEAS BANK', 'CENTRAL BANK OF INDIA', 'BANK OF BARODA', 'SHRIRAM TRANSPORT FINANCE COMPANY LTD', 'IDBI BANK LTD'];

  constructor(
    private dialogRef: MatDialogRef<EditVehicleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private orderService: OrderService
  ) {
    this.vehicleForm = this.fb.group({
      orderId: [''],
      vehicleId: [''],
      customerName: ['', [Validators.required]],
      leadName: ['', [Validators.required]],
      salesPersonName: ['', [Validators.required]],
      deliveryDate: ['', [Validators.required]],
      financerName: [''],
      financeType: [''],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      orderStatus: ['', [Validators.required]],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    if (this.data) {
      const vehicleId = this.data.vehicleId;
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
              this.resetForm(vehicleId);
            }
          },
          error: (error) => {
            console.error('Error fetching order data:', error);
            this.resetForm(vehicleId);
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

  onCancel(): void {
    this.dialogRef.close();
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


 onSave(vehicleId: string): void {
    if (this.vehicleForm.valid) {
      this.isSaving = true;
      const formData = this.vehicleForm.value;
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
        ...this.vehicleForm.value,
        orderId: this.orderId,
        deliveryDate: this.vehicleForm.get('deliveryDate')?.value
          ? new Date(this.vehicleForm.get('deliveryDate')?.value).toISOString()
          : null
      };
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
