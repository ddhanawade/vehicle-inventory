import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DataService } from '../../services/DataService';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-update-vehicle',
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
  templateUrl: './update-vehicle.component.html',
  styleUrl: './update-vehicle.component.scss'
})
export class UpdateVehicleComponent implements OnInit {
  vehicleForm: FormGroup;

  successMessage: string = '';

  editVehicleData: any = {};

  currentTab: number = 0; // Track the current tab

  makes = ['Tata', 'Toyota', 'Eicher'];
  models = ['Corolla', 'Civic', 'Focus', 'X5', 'C-Class'];
  fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'];
  statuses = ['AVAILABLE', 'SOLD', 'IN TRANSIT', 'BOOKED', 'FREE'];

  constructor(
    private dialogRef: MatDialogRef<UpdateVehicleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, private vehicleService: DataService) {
    this.vehicleForm = this.fb.group({
      id: [null], // Add the id field
      make: ['', Validators.required],
      model: ['', Validators.required],
      grade: ['', Validators.required],
      fuelType: ['', Validators.required],
      suffix: ['', Validators.required],
      manufactureDate: ['', Validators.required],
      exteriorColor: ['', Validators.required],
      interiorColor: ['', Validators.required],
      chassisNumber: ['', Validators.required],
      engineNumber: ['', Validators.required],
      keyNumber: ['', Validators.required],
      location: ['', Validators.required],
      status: ['', Validators.required],
      receivedDate: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
      purchaseDealer: ['', Validators.required],
      tkmInvoiceValue: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.data) {
    // First set the vehicleId
     const vehicleId = this.data.id;
    this.vehicleForm.patchValue(this.data);
  }
  }
  
  onUpdate(): void {
    if (this.vehicleForm.valid) {
      
    const updatedVehicle = this.vehicleForm.value;
    console.log("Sending updated data to backend:", updatedVehicle); // Debugging log

    this.vehicleService.updateVehicleDetails(updatedVehicle).subscribe(
      (response: any) => {
        console.log("Response from backend:", response); // Debugging log
        this.successMessage = 'Vehicle details updated successfully!';
        setTimeout(() => {
          this.successMessage = '';
          // this.closeEditPopup();
        }, 2000);
        // this.getCarDetails(); // Refresh the list after update
      },
      (error: any) => {
        console.error('Error updating vehicle:', error); // Debugging log
      }
    );
  }else {
    console.warn('Form is invalid');
    this.successMessage = 'Please fill in all required fields.';
  }
  }

  setTab(index: number): void {
    this.currentTab = index;
  }

  nextTab() {
    if (this.currentTab < 2) {
      this.currentTab++;
    }
  }
  previousTab() {
    if (this.currentTab > 0) {
      this.currentTab--;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
