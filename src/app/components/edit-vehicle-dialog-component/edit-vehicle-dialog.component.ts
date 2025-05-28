import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
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

// Add custom date formats
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
    { provide: DateAdapter, useClass: NativeDateAdapter } // Change this line
  ],
  templateUrl: './edit-vehicle-dialog.component.html',
  styleUrl: './edit-vehicle-dialog.scss'
})
export class EditVehicleDialogComponent {
  vehicleForm: FormGroup;
  isSaved = false;
  isUpdated = false;
  isSaving = false;
  successMessage = '';

  editOrderData: any = {};

  orderId: Number | null = null;

  // Sample data - replace with actual data from your service
  teamLeaders = ['John Doe', 'Jane Smith', 'Mike Johnson'];
  salesOfficers = ['Alice Brown', 'Bob Wilson', 'Carol White'];
  financers = ['Bank A', 'Bank B', 'Bank C', 'Self'];


  constructor(
    private dialogRef: MatDialogRef<EditVehicleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private orderService: OrderService
  ) {
    this.vehicleForm = this.fb.group({
      orderId: [''],
      vehicleId: [''],  // Add vehicleId to form controls
      customerName: ['', [Validators.required]],
      leadName: ['', [Validators.required]],
      salesPersonName: ['', [Validators.required]],
      deliveryDate: ['', [Validators.required]],
      financerName: [''],
      financeType: [''],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      status: ['', [Validators.required]],
      remarks: [''],
    });
  }


  // Update the ngOnInit method
ngOnInit(): void {
  if (this.data) {
    
    // First set the vehicleId
    const vehicleId = this.data.id;
    // Check for existing order
    if (vehicleId) {
      this.orderService.getOrdersByVehicleId(vehicleId).subscribe({
        next: (response) => {
          if (response && (Array.isArray(response) ? response.length > 0 : response.orderId)) {
            const orderData = Array.isArray(response) ? response[0] : response;
            
            // Store the orderId
            this.orderId = orderData.orderId;
            this.isSaved = true;
            
            // Format and display the data
            const formattedData = {
              vehicleId: vehicleId,
              orderId: orderData.orderId,
              customerName: orderData.customerName,
              leadName: orderData.leadName,
              salesPersonName: orderData.salesPersonName,
              deliveryDate: orderData.deliveryDate ? new Date(orderData.deliveryDate) : null,
              financerName: orderData.financerName,
              financeType: orderData.financeType,
              phoneNumber: orderData.phoneNumber,
              status: orderData.status,
              remarks: orderData.remarks
            };

            // Update form with existing data
            this.vehicleForm.patchValue(formattedData);

            // Disable appropriate fields
            // Object.keys(this.vehicleForm.controls).forEach(key => {
            //   if (key !== 'status' && key !== 'remarks') {
            //     this.vehicleForm.get(key)?.disable();
            //   }
            // });

          } else {
            // No existing order found
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
            if (key !== 'status' && key !== 'remarks') {
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
  
  // Enable all controls
  Object.keys(this.vehicleForm.controls).forEach(key => {
    this.vehicleForm.get(key)?.enable();
  });
  
  // Set initial vehicle ID
  this.vehicleForm.patchValue({
    vehicleId: vehicleId
  });
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
        this.isSaved = true;
        this.isSaving = false;
        this.successMessage = 'Order created successfully!';
        
        // Store the orderId from the response
        this.orderId = response.orderId;
        
        // Update form with response data
        this.vehicleForm.patchValue({
          ...response,
          vehicleId: vehicleId,
          orderId: response.orderId
        });

        // Disable form fields except status and remarks
        Object.keys(this.vehicleForm.controls).forEach(key => {
          if (key !== 'status' && key !== 'remarks') {
            this.vehicleForm.get(key)?.disable();
          }
        });
        // Optional: Refresh the data
        this.checkExistingOrder(vehicleId);
      },
      error: (error) => {
        this.isSaving = false;
        this.isSaved = false;
        console.error('Error occurred while saving order details:', error);
      }
    });
  }
}

onUpdate(): void {
  if (this.vehicleForm.valid && this.orderId) {
    this.isSaving = true;
    
    // Enable all controls temporarily to get complete form value
    Object.keys(this.vehicleForm.controls).forEach(key => {
      this.vehicleForm.get(key)?.enable();
    });

    const formData = {
      ...this.vehicleForm.value,
      orderId: this.orderId,
      deliveryDate: this.vehicleForm.get('deliveryDate')?.value ?
        new Date(this.vehicleForm.get('deliveryDate')?.value).toISOString() : null
    };

    this.orderService.updateOrder(formData.orderId, formData).subscribe({
      next: (response) => {
        if (response) {
          this.isUpdated = true;
          this.isSaving = false;
          this.successMessage = 'Order details updated successfully!';
          
          this.displaySavedData(response, formData.vehicleId);

          // Disable appropriate fields
          Object.keys(this.vehicleForm.controls).forEach(key => {
            if (key !== 'status' && key !== 'remarks') {
              this.vehicleForm.get(key)?.disable();
            }
          });
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.isUpdated = false;
        console.error('Error updating order details:', error);
        // Show error message to user
        this.successMessage = 'Error updating order. Please try again.';
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  } else {
    console.warn('Form is invalid or orderId is missing');
    this.successMessage = 'Please fill in all required fields.';
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
    status: response.status || '',
    remarks: response.remarks || ''
  };

  this.vehicleForm.patchValue(formData);
  this.isSaved = true;
}

}
