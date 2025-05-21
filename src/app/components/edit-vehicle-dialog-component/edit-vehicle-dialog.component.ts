import { CommonModule } from '@angular/common';
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


  ngOnInit() {
    if (this.data) {
      // Set vehicleId along with other form data
      this.vehicleForm.patchValue({
        ...this.data,
        vehicleId: this.data.vehicleId
      });
    }
  }

  formatPhoneNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    event.target.value = input.substring(0, 10);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(vehicleId: String): void {
    if (this.vehicleForm.valid) {
      this.vehicleForm.patchValue({ vehicleId: vehicleId });
      this.isSaving = true;
      const formData = this.vehicleForm.value;
      
      this.orderService.createOrder(formData).subscribe({
        next: (response) => {
          this.isSaved = true; // This enables the update button
          this.isSaving = false;
          this.successMessage = 'Order created successfully!';
          
          // Disable all form controls except status and remarks
          Object.keys(this.vehicleForm.controls).forEach(key => {
            if (key !== 'status' && key !== 'remarks') {
              this.vehicleForm.get(key)?.disable();
            }
          });
  
          // Don't close the dialog, just update the UI state
          // this.dialogRef.close() removed to keep dialog open
        },
        error: (error) => {
          this.isSaving = false;
          this.isSaved = false; // Ensure save button remains enabled on error
          console.error('Error occurred while saving order details:', error);
        }
      });
    }
  }

  onUpdate(): void {
    if (this.vehicleForm.valid && this.isSaved) {
      this.isSaving = true;
      const formData = this.vehicleForm.value; // vehicleId is now part of form data
      
      this.orderService.updateOrder(formData.vehicleId, formData).subscribe({
        next: (response) => {
          this.isUpdated = true;
          this.isSaving = false;
          this.successMessage = 'Order details updated successfully!';
          this.dialogRef.close({
            ...formData,
            isSuccess: true,
            isUpdate: true
          });
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error updating order details:', error);
        }
      });
    }
  }

}
