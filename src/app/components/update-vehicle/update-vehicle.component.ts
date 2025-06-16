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
import { MatTableDataSource } from '@angular/material/table';
import { VehicleModel } from '../../models/VehicleModel';

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

  carDetailsList: VehicleModel[] = [];

  dataSource!: MatTableDataSource<VehicleModel>;

  isLoading: boolean = false;

  currentTab: number = 0; // Track the current tab

  makes = ['Tata', 'Toyota', 'Eicher'];
  models = ['Corolla', 'Civic', 'Focus', 'X5', 'C-Class'];
  fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'];
  statuses = ['AVAILABLE', 'SOLD', 'IN_TRANSIT', 'BOOKED', 'FREE'];
  sort: any;
  paginator: any;

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
      vehicleStatus: ['', Validators.required],
      receivedDate: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
      purchaseDealer: ['', Validators.required],
      invoiceValue: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.data) {
      console.log("sd " + JSON.stringify(this.data));
    // First set the vehicleId
     const vehicleId = this.data.vehicleId;
     const id = this.data.vehicleId;
    this.vehicleForm.patchValue(this.data);
  }
  }
  
  onUpdate(): void {
    if (this.vehicleForm.valid) {
    this.isLoading = true; // Start loading
    const updatedVehicle = this.vehicleForm.value;

    const updateVehicle = { ...updatedVehicle, id: updatedVehicle.id, invoiceDate: this.formatDate(new Date(updatedVehicle.invoiceDate))};
    delete updateVehicle.vehicleId; // Remove vehicleId if not needed

    console.log("Sending updated data to backend:", updateVehicle); // Debugging log

    this.vehicleService.updateVehicleDetails(updateVehicle).subscribe(
      (response: any) => {
        console.log("Response from backend:", response); // Debugging log
        this.successMessage = 'Vehicle details updated successfully!';
        this.isLoading = false; // Stop loading
        setTimeout(() => {
          this.successMessage = '';
          // this.closeEditPopup();
        }, 2000);
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

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
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

