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
  
  // Location arrays
  tataLocations = [
    'GKM YARD',
    'SKC YARD',
    'TOYOTA YARD',
    'DABRA EMO',
    'DATIA EMO',
    'BHIND EMO',
    'SHEOPUR EMO',
    'SKC SHOWROOM',
    'GKM SHOWROOM',
    'WORKSHOP',
    'BODYSHOP'
  ];
  
  toyotaLocations = [
    'STOCK YARD PANDIT JI',
    'TOYOTA SLR',
    'DATIA',
    'BHIND',
    'MORENA',
    'SHIVPURI',
    'SHEOPUR',
    'INDORE',
    'KHANDWA',
    'DEWAS KHATEGAON'
  ];
  
  filteredLocations: string[] = [];
  
  // Color codes mapping
  colorCodes = [
    { code: 'ZHJ', name: 'CAFE WHITE' },
    { code: 'WBE', name: 'ENTICING SILVER' },
    { code: 'Z1Q', name: 'INSTA BLUE' },
    { code: 'WBG', name: 'SPORTIN RED' },
    { code: '2QY', name: 'SILVER METALLIC & A.BLACK' },
    { code: '2UE', name: 'SUPERWHITE & A.BLACK' },
    { code: '2PS', name: 'WHITEPEARL & A.BLACK' },
    { code: '218', name: 'ATTITUDE BLACK' },
    { code: '4W8', name: 'AVANT GARDE BRONZE' },
    { code: '4W9', name: 'PHANTOM BROWN' },
    { code: '089', name: 'PLATINUM WHITE PEARL' },
    { code: '1D6', name: 'SILVER METALLIC' },
    { code: '220', name: 'SPARKLING BLACK PEARL CS' },
    { code: '040', name: 'SUPER WHITE' },
    { code: '3U5', name: 'EMOTIONAL RED' },
    { code: '1G3', name: 'GREY METALLIC' },
    { code: '1L0', name: 'SILVER METALLIC' },
    { code: '221', name: 'BLUISH AGEHA GF' },
    { code: '222', name: 'BURNING BLACK' },
    { code: '4X7', name: 'GRAPHITE ME' },
    { code: '1K0', name: 'METAL STREAM ME' },
    { code: '3T3', name: 'RED MC' },
    { code: '1D4', name: 'SILVER METALLIC' },
    { code: 'Z7Q', name: 'ICONIC GREY' },
    { code: 'ZQK', name: 'RUSTIC BROWN' },
    { code: 'ZYA', name: 'SPUNKY BLUE' },
    { code: 'C8J', name: 'CAFE WHITE & MIDNIGHT BLACK' },
    { code: 'ZQD', name: 'CAVE BLACK' },
    { code: 'ERD', name: 'ENTICING SILVERMIDNIGHT BLACK' },
    { code: 'WAJ', name: 'SPEEDY BLUE' },
    { code: 'E3Y', name: 'SPEEDY BLUE & MIDNIGHT BLACK' },
    { code: 'ESL', name: 'SPORTIN RED & MIDNIGHT BLACK' },
    { code: '2YE', name: 'LUCENT ORANGE' },
    { code: 'E86', name: 'WHITE' },
    { code: 'E85', name: 'SILVER DT' },
    { code: 'E5G', name: 'WHITE DT' },
    { code: '202', name: 'BLACK' },
    { code: '1L5', name: 'PRECIOUS METAL' },
    { code: '8X8', name: 'DARK BLUE METALLIC' },
    { code: '1H5', name: 'CEMENT GREY' },
    { code: '090', name: 'PRECIOUS PEARL WHITE' },
    { code: '083', name: 'WHITE' }
  ];
  
  showCustomColorCode: boolean = false;
  showCustomLocation: boolean = false;
  
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
      colorCode: [''],
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
    this.initializeLocations();
  }
  
  // Initialize locations based on user role
  initializeLocations(): void {
    if (this.hasRole('ADMIN')) {
      // Admin can see all locations from both TATA and TOYOTA
      this.filteredLocations = [...this.tataLocations, ...this.toyotaLocations];
    } else if (this.hasRole('TATA')) {
      // TATA role can only see TATA locations
      this.filteredLocations = [...this.tataLocations];
    } else if (this.hasRole('TOYOTA')) {
      // TOYOTA role can only see TOYOTA locations
      this.filteredLocations = [...this.toyotaLocations];
    } else {
      // Default: show all locations
      this.filteredLocations = [...this.tataLocations, ...this.toyotaLocations];
    }
  }

  constructor(private fb: FormBuilder, private vehicleService: DataService, private authService: AuthService, private datePipe: DatePipe) {
    this.vehicleForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      grade: ['', Validators.required],
      fuelType: ['', Validators.required],
      exteriorColor: [''],
      interiorColor: [''],
      colorCode: [''],
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
    // Allow navigation to any tab without validation
    this.currentTab = index;
  }

  nextTab() {
    // Allow moving to next tab without validation
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
      
      // Update filtered locations based on selected make
      if (this.hasRole('ADMIN')) {
        // Admin can see locations based on the selected make
        if (selectedMake.toUpperCase() === 'TATA') {
          this.filteredLocations = [...this.tataLocations];
        } else if (selectedMake.toUpperCase() === 'TOYOTA') {
          this.filteredLocations = [...this.toyotaLocations];
        } else {
          // For other makes, show all locations
          this.filteredLocations = [...this.tataLocations, ...this.toyotaLocations];
        }
      } else {
        // Non-admin users don't need to update locations (they only see their role's locations)
        // Locations are already set in initializeLocations()
      }
      
      // Reset location field when make changes
      this.vehicleForm.patchValue({ location: '' });
    }
  }

  onColorCodeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedColorCode = target?.value;
    
    if (selectedColorCode === 'OTHERS') {
      // Show custom color code input field
      this.showCustomColorCode = true;
      // Clear the color code and exterior color for manual entry
      this.vehicleForm.patchValue({
        colorCode: '',
        exteriorColor: ''
      });
    } else if (selectedColorCode) {
      this.showCustomColorCode = false;
      const colorInfo = this.colorCodes.find((color) => color.code === selectedColorCode);
      if (colorInfo) {
        this.vehicleForm.patchValue({
          exteriorColor: colorInfo.name
        });
      }
    }
  }

  onLocationChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedLocation = target?.value;
    
    if (selectedLocation === 'OTHERS') {
      // Show custom location input field
      this.showCustomLocation = true;
      // Clear the location for manual entry
      this.vehicleForm.patchValue({
        location: ''
      });
    } else {
      this.showCustomLocation = false;
    }
  }

  steps = ['Basic Info', 'Specifications', 'Purchase Info'];
  
  prevTab() {
    if (this.currentTab > 0) this.currentTab--;
  }
}
