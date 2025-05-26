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
    MatNativeDateModule
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


  ngOnInit(): void {
    if (this.data) {
      console.log("Data received:", this.data); // Debugging
  
      // Convert deliveryDate to a Date object if it exists
      const formattedData = {
        ...this.data,
        deliveryDate: this.data.deliveryDate ? new Date(this.data.deliveryDate) : null
      };
  
      // Patch the form with the formatted data
      this.vehicleForm.patchValue(formattedData);
    }
  
    if (this.data && this.data.id) {
      this.checkExistingOrder(this.data.id);
    }
  }

  private checkExistingOrder(vehicleId: string) {
    console.log("Checking for existing order with vehicle ID:", vehicleId);
    
    this.getOrderByVehicleId(vehicleId).subscribe({
      next: (response) => {
        // Enhanced condition to check for null, undefined, or an empty object
        if (response && Object.keys(response).length) {
          console.log("Existing order found:", response);
          this.isSaved = true;
          
          // Populate form with existing data
          this.vehicleForm.patchValue({
            ...response,
            vehicleId: vehicleId,
            orderId: response.orderId,
            customerName : response.customerName
          });
          
          // Disable form fields except status and remarks
          Object.keys(this.vehicleForm.controls).forEach(key => {
            if (key !== 'status' && key !== 'remarks') {
              //this.vehicleForm.get(key)?.disable();
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

  private resetForm(vehicleId: string) {
    this.isSaved = false;
    this.isUpdated = false;
    
    // Reset and enable all form controls
    this.vehicleForm.reset();
    Object.keys(this.vehicleForm.controls).forEach(key => {
      this.vehicleForm.get(key)?.enable();
    });
    
    // Set only the vehicle ID
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

  // getOrderByVehicleId(id: String): Observable<OrderModel> {
  //   return this.orderService.getOrdersByVehicleId(id).pipe(
  //     tap(response => {
  //       this.orderId = response.orderId;
  //       // Handle the response data if needed
  //       console.log('Order details:', response);
  //     }),
  //     catchError(error => {
  //       console.error('Error fetching order:', error);
  //       return throwError(() => error);
  //     })
  //   );
  // }

  getOrderByVehicleId(id: String): Observable<OrderModel> {
    return this.orderService.getOrdersByVehicleId(id).pipe(
      tap(response => {
        if (Array.isArray(response) && response.length > 0) {
          this.orderId = response[0].orderId;
          console.log('Order details:', response[0].orderId);
        } else {
          console.error('Unexpected response format: ', response);
        }
      }),
      catchError(error => {
        console.error('Error fetching order:', error);
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
          
          // After successful save, check existing order again
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
    if (this.vehicleForm.valid) {
      this.isSaving = true;
      
      // Enable all controls temporarily to get complete form value
      Object.keys(this.vehicleForm.controls).forEach(key => {
        this.vehicleForm.get(key)?.enable();
      });

      const formData = {
        ...this.vehicleForm.value,
        orderId: this.orderId
      };

      this.orderService.updateOrder(formData.orderId, formData).subscribe({
        next: (response) => {
          this.isUpdated = true;
          this.isSaving = false;
          this.successMessage = 'Order details updated successfully!';
          
          // After successful update, check existing order again
          this.checkExistingOrder(formData.vehicleId);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error updating order details:', error);
          // Re-disable fields on error
          this.checkExistingOrder(formData.vehicleId);
        }
      });
    }
  }

}
