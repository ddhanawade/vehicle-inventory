import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/DataService';

@Component({
  selector: 'app-add-vehicle',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-vehicle.component.html',
  styleUrl: './add-vehicle.component.scss'
})
export class AddVehicleComponent implements OnInit{
  vehicleForm: FormGroup;

  successMessage: string = '';

  currentTab: number = 0; // Track the current tab

  makes = ['Tata', 'Toyota', 'Eicher'];
  models = ['Corolla', 'Civic', 'Focus', 'X5', 'C-Class'];
  fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  statuses = ['Available', 'Sold', 'In Transit', 'Booked', 'Free'];

  ngOnInit() {
    this.vehicleForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      grade: ['', Validators.required],
      fuelType: ['', Validators.required],
      exteriorColor: ['', Validators.required],
      interiorColor: ['', Validators.required],
      chassisNumber: ['', Validators.required],
      engineNumber: ['', Validators.required],
      keyNumber: ['', Validators.required],
      location: ['', Validators.required],
      status: ['', Validators.required],
      receivedDate: ['', Validators.required],
      invoiceDate: [''],
      invoiceNumber: [''],
      purchaseDealer: [''],
      manufactureDate: [''],
      suffix: [''],
      tkmInvoiceValue: [''],
      interest: ['']
    });
  }

  constructor(private fb: FormBuilder, private vehicleService: DataService) {
    this.vehicleForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      grade: ['', Validators.required],
      fuelType: ['', Validators.required],
      exteriorColor: ['', Validators.required],
      interiorColor: ['', Validators.required],
      chassisNumber: ['', Validators.required],
      engineNumber: ['', Validators.required],
      keyNumber: ['', Validators.required],
      location: ['', Validators.required],
      status: ['', Validators.required],
      receivedDate: ['', Validators.required],
      invoiceDate: [''],
      invoiceNumber: [''],
      purchaseDealer: [''],
      manufactureDate: [''],
      suffix: [''],
      tkmInvoiceValue: [''],
      interest: ['']
    });
  }

  // Age will be calculated automatically based on received date
  calculateAge(receivedDate: Date): number {
    const today = new Date();
    const received = new Date(receivedDate);
    const diffTime = Math.abs(today.getTime() - received.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  onSubmit() {
    if (this.vehicleForm.valid) {
      const formData = this.vehicleForm.value;
      formData.age = this.calculateAge(formData.receivedDate);
    this.vehicleService.addVehicle(this.vehicleForm.value).subscribe(
      response => {
        console.log('Vehicle added:', response);
        this.successMessage = 'Vehicle details added successfully!';
  
        // Display the success message for 2 seconds before closing the popup
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
  
        this.vehicleForm.reset();
      },
      error => {
        console.error('Error adding vehicle:', error);
      }
    );
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
}
