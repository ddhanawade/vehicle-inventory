import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/DataService';
import { UserModel } from '../../models/UserModel';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-add-vehicle',
  imports: [CommonModule, ReactiveFormsModule],
  providers: [DatePipe],
  templateUrl: './add-vehicle.component.html',
  styleUrl: './add-vehicle.component.scss'
})
export class AddVehicleComponent implements OnInit{
  vehicleForm: FormGroup;
  successMessage: string = '';
  currentTab: number = 0;
  models: any[] = [];
  makes: any[] = [];
  fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'];
  statuses = ['TRANSIT', 'STOCK', 'AVAILABLE', 'SOLD', 'BILLED', 'WATER', 'FRESH', 'FREE'];
  filteredModels: { make: string; model: string }[] = [];
  selectedMake: string = '';
  user: UserModel | null = null;
  holdModel: any[] = [];
  
  // Enhanced UI state properties
  focusedField: string | null = null;
  isSubmitting: boolean = false;

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    this.authService.getUser().subscribe((user) => {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(this.user));
    });

    this.vehicleForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      grade: ['', Validators.required],
      fuelType: ['', Validators.required],
      exteriorColor: [''],
      interiorColor: [''],
      chassisNumber: ['', Validators.required],
      engineNumber: ['', Validators.required],
      keyNumber: [''],
      location: ['', Validators.required],
      status: ['', Validators.required],
      receivedDate: [''],
      invoiceDate: ['', Validators.required],
      invoiceNumber: [''],
      purchaseDealer: [''],
      manufactureDate: [''],
      suffix: [''],
      invoiceValue: ['', Validators.required],
      interest: [''],
      remarks: ['']
    });

    this.getModelInfo();
    this.getVehicleMake();
  }

  constructor(private fb: FormBuilder, private vehicleService: DataService, private authService: AuthService, private datePipe: DatePipe) {
    this.vehicleForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      grade: ['', Validators.required],
      fuelType: ['', Validators.required],
      exteriorColor: [''],
      interiorColor: [''],
      chassisNumber: ['', Validators.required],
      engineNumber: ['', Validators.required],
      keyNumber: [''],
      location: ['', Validators.required],
      status: ['', Validators.required],
      receivedDate: [''],
      invoiceDate: ['', Validators.required],
      invoiceNumber: [''],
      purchaseDealer: [''],
      manufactureDate: [''],
      suffix: [''],
      invoiceValue: ['', Validators.required],
      interest: [''],
      remarks: ['']
    });
  }

  // Calculate progress percentage for the progress bar
  getProgressPercentage(): number {
    return ((this.currentTab + 1) / 3) * 100;
  }

  // Handle field focus events
  onFieldFocus(fieldName: string): void {
    this.focusedField = fieldName;
  }

  // Handle field blur events
  onFieldBlur(fieldName: string): void {
    this.focusedField = null;
  }

  // Check if current tab is valid for next button
  isCurrentTabValid(): boolean {
    const currentTabFields = this.getCurrentTabFields();
    return currentTabFields.every(field => {
      const control = this.vehicleForm.get(field);
      return control ? control.valid : false;
    });
  }

  // Get fields for current tab
  private getCurrentTabFields(): string[] {
    switch (this.currentTab) {
      case 0:
        return ['make', 'model', 'grade', 'fuelType', 'suffix', 'manufactureDate'];
      case 1:
        return ['exteriorColor', 'interiorColor', 'chassisNumber', 'engineNumber', 'keyNumber'];
      case 2:
        return ['location', 'status', 'receivedDate', 'invoiceDate', 'invoiceNumber', 'purchaseDealer', 'invoiceValue'];
      default:
        return [];
    }
  }

  // Clear success message
  clearSuccessMessage(): void {
    this.successMessage = '';
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
      this.isSubmitting = true;
      const formData = this.vehicleForm.value;
      formData.age = this.calculateAge(formData.invoiceDate);
      
      // Format all date fields using DatePipe
      const formattedData = {
        ...formData,
        receivedDate: this.datePipe.transform(formData.receivedDate, 'yyyy-MM-dd') || '',
        invoiceDate: this.datePipe.transform(formData.invoiceDate, 'yyyy-MM-dd') || ''
      };
console.log
      this.vehicleService.addVehicle(formattedData).subscribe({
        next: (response) => {
          console.log('Vehicle added:', response);
          this.successMessage = 'Vehicle details added successfully!';
          this.isSubmitting = false;
          
          // Display the success message for 5 seconds before clearing
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
          
          this.vehicleForm.reset();
          this.currentTab = 0; // Reset to first tab
        },
        error: (error) => {
          console.error('Error adding vehicle:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  setTab(index: number): void {
    // Only allow moving to the next tab if current tab is valid
    // Or allow moving to previous tabs (backwards navigation)
    if (index <= this.currentTab || this.isCurrentTabValid()) {
      this.currentTab = index;
    }
  }

  nextTab() {
    if (this.currentTab < 2 && this.isCurrentTabValid()) {
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
        this.models = data;
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
        this.models = data;
  
        // Filter the data based on roles
        if (this.hasRole('ADMIN')) {
          this.makes = [...new Set(this.models.map(car => car.make))];
          console.log("vehicle type " + JSON.stringify(this.makes));
        } else if (this.hasRole('TATA')) {
          this.makes = [...new Set(this.models.filter(car => car.make === 'Tata').map(car => car.make))];
        } else if (this.hasRole('TOYOTA')) {
          this.makes = [...new Set(this.models.filter(car => car.make === 'Toyota').map(car => car.make))];
        } else if (this.hasRole('EICHER')) {
          this.makes = [...new Set(this.models.filter(car => car.make === 'Eicher').map(car => car.make))];
        } else {
          this.makes = [];
        }
      },
      error: (error) => {
        console.error('Error fetching model info:', error);
      }
    });
  }

  onMakeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedMake = target?.value;
    if (selectedMake) {
      this.filteredModels = this.models.filter((model) => model.make === selectedMake);
    }
  }

  steps = ['Basic Info', 'Specifications', 'Purchase Info'];
  
  prevTab() {
    if (this.currentTab > 0) this.currentTab--;
  }
}
