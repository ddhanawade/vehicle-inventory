import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/DataService';

@Component({
  selector: 'app-add-vehicle',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-vehicle.component.html',
  styleUrl: './add-vehicle.component.scss'
})
export class AddVehicleComponent {
  vehicleForm: FormGroup;

  successMessage: string = '';

  currentTab: number = 0; // Track the current tab

  makes = ['Tata', 'Toyota', 'Eicher'];
  models = ['Corolla', 'Civic', 'Focus', 'X5', 'C-Class'];
  fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  statuses = ['Available', 'Sold', 'In Transit', 'Booked', 'Free'];

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
      receivedDate: ['', Validators.required]
    });
  }

  onSubmit() {
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
