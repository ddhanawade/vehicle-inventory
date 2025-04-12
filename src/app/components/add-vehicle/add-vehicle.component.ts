import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-vehicle',
  imports: [ReactiveFormsModule],
  templateUrl: './add-vehicle.component.html',
  styleUrl: './add-vehicle.component.css'
})
export class AddVehicleComponent {
  vehicleForm: FormGroup;

  makes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes'];
  models = ['Corolla', 'Civic', 'Focus', 'X5', 'C-Class'];
  fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  statuses = ['Available', 'Sold', 'In Transit', 'Under Maintenance'];

  constructor(private fb: FormBuilder) {
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
    if (this.vehicleForm.valid) {
      console.log('Vehicle Details:', this.vehicleForm.value);
      alert('Vehicle added successfully!');
      this.vehicleForm.reset();
    }
  }
}
