import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/DataService';
import { UserModel } from '../../models/UserModel';
import { AuthService } from '../../services/AuthService';

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
  models: any[] = [];
  makes: any[] = [];
  //makes = ['Tata', 'Toyota', 'Eicher'];
  fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  statuses = ['Available', 'Sold', 'In Transit', 'Booked', 'Free'];

  filteredModels: { make: string; model: string }[] = [];
  selectedMake: string = '';

  user: UserModel | null = null;
  holdModel: any[] = [];

  ngOnInit() {
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    this.authService.getUser().subscribe((user) => {
      this.user = user;

      // Store the user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(this.user));
    });

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

    this.getModelInfo();
    this.getVehicleMake();
  }

  constructor(private fb: FormBuilder, private vehicleService: DataService, private authService: AuthService) {
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

  hasRole(role: string): boolean {
    if (this.user?.roles?.includes('ADMIN')) {
      return true; // ADMIN can access all menus
    }
    return this.user?.roles?.includes(role) || false;
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

  getModelInfo(): void {
   
    this.vehicleService.getAllModels().subscribe({
      next: (data) => {
        console.log('Model Info:', data);
        this.models = data; // Process the data as needed
      },
      error: (error) => {
        console.error('Error fetching model info:', error);
      }
    });
  }

  getVehicleMake(): void {
    this.vehicleService.getAllModels().subscribe({
      next: (data) => {
        console.log('Model Info:', data);
        this.models = data; // Process the data as needed
  
        // Filter the data based on roles
        if (this.hasRole('ADMIN')) {
          this.makes = [...new Set(this.models.map(car => car.make))]; // Show unique makes for ADMIN
          console.log("vehicle type " + JSON.stringify(this.makes))
        } else if (this.hasRole('TATA')) {
          this.makes = [...new Set(this.models.filter(car => car.make === 'Tata').map(car => car.make))];
        } else if (this.hasRole('TOYOTA')) {
          this.makes = [...new Set(this.models.filter(car => car.make === 'Toyota').map(car => car.make))];
        } else if (this.hasRole('EICHER')) {
          this.makes = [...new Set(this.models.filter(car => car.make === 'Eicher').map(car => car.make))];
        } else {
          this.makes = []; // Default to an empty list if no roles match
        }
        // Notify Angular about data changes if necessary
        // this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error fetching model info:', error);
      }
    });
  }

  onMakeChange(event: Event): void {
    const target = event.target as HTMLSelectElement; // Explicitly cast EventTarget to HTMLSelectElement
    const selectedMake = target?.value; // Access the value property safely
    if (selectedMake) {
      this.filteredModels = this.models.filter((model) => model.make === selectedMake);
    }
  }
}
