import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DataService } from '../../services/DataService';
import { AuthService } from '../../services/AuthService';
import { UserModel } from '../../models/UserModel';
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

  makes = ['TATA', 'TOYOTA', 'EICHER'];
  models = ['Corolla', 'Civic', 'Focus', 'X5', 'C-Class'];
  fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'];
  statuses = ['TRANSIT', 'STOCK', 'AVAILABLE', 'SOLD', 'BILLED', 'WATER', 'FRESH', 'FREE'];
  sort: any;
  paginator: any;
  user: UserModel | null = null;
  
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
    { code: '1J7', name: 'GRAY METALLIC' },
    { code: '1K0', name: 'SILVER METALLIC' },
    { code: '1L5', name: 'PRECIOUS METAL' },
    { code: '3T3', name: 'RED MICA METALLIC' },
    { code: '8X8', name: 'DARK BLUE MICA' },
    { code: '8W7', name: 'PHANTOM BROWN PEARL' },
    { code: 'E8W', name: 'AVANT GARDE BRONZE METALLIC' },
    { code: 'ESA', name: 'CAFE WHITE & MIDNIGHT BLACK' },
    { code: 'Z1F', name: 'INSTA BLUE & MIDNIGHT BLACK' },
    { code: 'ESU', name: 'ENTICING SILVER & MIDNIGHT BLACK' },
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

  constructor(
    private dialogRef: MatDialogRef<UpdateVehicleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, 
    private vehicleService: DataService,
    private authService: AuthService) {
    this.vehicleForm = this.fb.group({
      id: [null], // Add the id field
      make: ['', Validators.required],
      model: ['', Validators.required],
      grade: ['', Validators.required],
      fuelType: ['', Validators.required],
      suffix: [''],
      manufactureDate: [''],
      exteriorColor: [''],
      interiorColor: [''],
      colorCode: [''],
      chassisNumber: ['', Validators.required],
      engineNumber: ['', Validators.required],
      keyNumber: [''],
      location: ['', Validators.required],
      vehicleStatus: ['', Validators.required],
      receivedDate: [''],
      invoiceDate: ['', Validators.required],
      invoiceNumber: [''],
      purchaseDealer: [''],
      invoiceValue: ['', Validators.required],
      remarks: ['']
    });
  }

  ngOnInit() {
    // Get user from localStorage or AuthService
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    this.authService.getUser().subscribe((user) => {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(this.user));
    });

    // Initialize locations based on user role
    this.initializeLocations();
    
    if (this.data) {
      console.log("Vehicle data received:", JSON.stringify(this.data));
      
      // Normalize the make field to uppercase to match dropdown options
      const normalizedData = {
        ...this.data,
        make: this.data.make?.toUpperCase()
      };
      
      this.vehicleForm.patchValue(normalizedData);
      
      // Update filtered locations based on the vehicle's make
      if (normalizedData.make) {
        this.updateLocationsForMake(normalizedData.make);
      }
      
      // Check if color code is custom (not in predefined list)
      if (this.data.colorCode) {
        const isColorCodeInList = this.colorCodes.some(color => color.code === this.data.colorCode);
        if (!isColorCodeInList) {
          this.showCustomColorCode = true;
        }
      }
      
      // Check if location is custom (not in filtered locations list)
      if (this.data.location) {
        const isLocationInList = this.filteredLocations.includes(this.data.location);
        if (!isLocationInList) {
          this.showCustomLocation = true;
        }
      }
    }
  }
  
  // Check if user has a specific role
  hasRole(role: string): boolean {
    if (this.user?.roles?.includes('ADMIN')) {
      return true; // ADMIN can access all menus
    }
    return this.user?.roles?.includes(role) || false;
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
  
  // Update locations when make changes
  updateLocationsForMake(make: string): void {
    if (this.hasRole('ADMIN')) {
      // Admin can see locations based on the selected make
      if (make.toUpperCase() === 'TATA') {
        this.filteredLocations = [...this.tataLocations];
      } else if (make.toUpperCase() === 'TOYOTA') {
        this.filteredLocations = [...this.toyotaLocations];
      } else {
        // For other makes, show all locations
        this.filteredLocations = [...this.tataLocations, ...this.toyotaLocations];
      }
    }
  }
  
  // Handle make change event
  onMakeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedMake = target?.value;
    if (selectedMake) {
      this.updateLocationsForMake(selectedMake);
      // Reset location field when make changes
      this.vehicleForm.patchValue({ location: '' });
    }
  }
  
  // Handle color code change event
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
  
  onUpdate(): void {
    if (this.vehicleForm.valid) {
    this.isLoading = true; // Start loading
    const updatedVehicle = this.vehicleForm.value;

    const updateVehicle = { ...updatedVehicle, id: updatedVehicle.id, invoiceDate: this.formatDate(new Date(updatedVehicle.invoiceDate))};
    delete updateVehicle.vehicleId; // Remove vehicleId if not needed

    console.log("Sending updated data to backend:", updateVehicle); // Debugging log

    this.vehicleService.updateVehicleDetails(updateVehicle).subscribe(
      (response: any) => {
      setTimeout(() => {  
        this.successMessage = 'Vehicle details updated successfully!';
        this.isLoading = false; // Stop loading
        setTimeout(() => {
          this.successMessage = '';
          this.dialogRef.close(true);
          window.location.reload();
        }, 2000);
        }, 1500);
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

