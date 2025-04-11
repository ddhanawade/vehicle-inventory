import { Component, NgModule, OnInit } from '@angular/core';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleService } from '../../services/vehicle.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { DataService } from '../../services/DataService';
import { VehicleModel } from '../../models/VehicleModel';
import { distinct } from 'rxjs';

interface Stock {
  name: string;
  location: string;
  available: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  vehicleForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private vehicleService: DataService
  ) {
    this.vehicleForm = this.fb.group({
      make: [''],
      model: [''],
      city: [''],
      vehicleYear: ['']
    });
  }
  stocks: any[] = [];
  searchTerm: string = '';
  showPopup: boolean = false;
  showEditPopup: boolean = false; // or set to true as needed
  successMessage: string = '';

  newVehicle: { name: string, location: String, available: number } = { name: '', location: '', available: 0 };

  selectedCity: string = '';
  selectedModel: string = '';


  filteredStocks(): any[] {
    return this.carDetailsList.filter(stock =>
      (this.selectedCity ? stock.city === this.selectedCity : true) &&
      (this.selectedModel ? stock.model === this.selectedModel : true) &&
      (this.searchTerm ? stock.model.toLowerCase().includes(this.searchTerm.toLowerCase()) : true)
    );
  }

  openAddVehiclePopup() {
    this.showPopup = true;
    this.newVehicle = { name: '', location: '', available: 0 }; // Reset fields
  }

  closePopup() {
    this.showPopup = false;
  }

  closeEditPopup() {
    this.showEditPopup = false;
  }

  getCarModels(city: string): string[] {
    // Filter carDetailsList for the selected city
    const cityCars = this.carDetailsList.filter((item: any) => item.city === city);
  
    // Extract and return the models for the selected city
    return cityCars.map((item: any) => item.model);
  }

  openEditVehiclePopup(stock: any): void {
    this.editVehicleData = { ...stock };
    // Ensure vehicleYear is in YYYY-MM-DD format
    if (this.editVehicleData.vehicleYear) {
      this.editVehicleData.vehicleYear = new Date(this.editVehicleData.vehicleYear).toISOString().split('T')[0];
    }
    this.showEditPopup = true;
  }

  // Declare the editVehicle property with the Vehicle interface type
  editVehicle: Vehicle = {
    name: '',
    location: '',
    available: 0,
    id: 0,
    status: ''
    // Initialize other properties if needed
  };

  editVehicleData: any = {}; // Object to hold the selected vehicle data

  onSubmit() {
    this.vehicleService.addVehicle(this.vehicleForm.value).subscribe(
      response => {
        console.log('Vehicle added:', response);
        this.successMessage = 'Vehicle details added successfully!';
  
        // Display the success message for 2 seconds before closing the popup
        setTimeout(() => {
          this.successMessage = '';
          this.closePopup(); // Close the popup after the message disappears
        }, 2000);
  
        this.getCarDetails(); // Refresh the data
        this.getTotalCarsAvailable();
        this.getCityWiseModelCounts();
        this.getDistinctCities();
      },
      error => {
        console.error('Error adding vehicle:', error);
        this.closePopup();
      }
    );
  }
  cityWiseCounts: { city: string, count: number }[] = [];

  ngOnInit(): void {
    this.vehicleService.getData().subscribe((data: any) => {
      this.carDetailsList = data;
      console.log('Car Details List:', this.carDetailsList); // Log the carDetailsList
      this.cityWiseCounts = this.getCityWiseModelCounts(); // Store the result
      console.log('City-wise counts:', this.cityWiseCounts); // Log the result
    });
    this.getDistinctCities();
  }

  carDetailsList: VehicleModel[] = [];

  getCarDetails() {
    this.vehicleService.getData().subscribe((result: any) => {
      this.carDetailsList = result;
    })
  }

  onUpdate(): void {
    this.vehicleService.updateVehicleDetails(this.editVehicleData).subscribe(
      response => {
        console.log('Vehicle updated:', response);
        this.successMessage = 'Vehicle details updated successfully!';
        
         // Display the success message for 2 seconds before closing the popup
         setTimeout(() => {
          this.successMessage = '';
          this.closePopup(); // Close the popup after the message disappears
        }, 2000);

        // Refresh the data and close the popup
        this.getCarDetails();
       // this.closeEditPopup();
       this.getTotalCarsAvailable();
       this.getCityWiseModelCounts();
      },
      error => {
        console.error('Error updating vehicle:', error);
      }
    );
  }

  onDelete(stock : any): void {
    this.vehicleService.deleteVehicleDetails(stock.id).subscribe(
      response => {
        console.log('Vehicle deleted:', response);
        this.successMessage = 'Vehicle details deleted successfully!';
        
         // Display the success message for 2 seconds before closing the popup
         setTimeout(() => {
          this.successMessage = '';
          this.closePopup(); // Close the popup after the message disappears
        }, 2000);

        // Refresh the data and close the popup
        this.getCarDetails();
       // this.closeEditPopup();
       this.getTotalCarsAvailable();
       this.getCityWiseModelCounts();
      },
      error => {
        console.error('Error deleting vehicle:', error);
      }
    );
  }

  getTotalCarsAvailable() {
    return this.carDetailsList.length;
  }

  getCarsAvailableInCity(city: string): number {
    // Filter the carDetailsList for the selected city
    const cityStocks = this.carDetailsList.filter(stock => stock.city === city);
    // Sum up the available cars in the filtered stocks
    return cityStocks.reduce((total, stock) => total + stock.availableCars, 0);
  }

  getCityWiseModelCounts(): { city: string, count: number }[] {
    // Create a map to store city-wise model counts
    const cityModelCounts: { [key: string]: number } = {};
  
    // Iterate through the carDetailsList and calculate model counts for each city
    this.carDetailsList.forEach(stock => {
      if (cityModelCounts[stock.city]) {
        cityModelCounts[stock.city] += 1; // Increment the count for the city
      } else {
        cityModelCounts[stock.city] = 1; // Initialize the count for the city
      }
    });
  
    // Convert the map into an array of objects with city and model count
    return Object.keys(cityModelCounts).map(city => ({
      city,
      count: cityModelCounts[city]
    }));
  }

  distinctCityList: any[] = [];
  getDistinctCities() {
    this.vehicleService.getData().subscribe((result: any) => {
      this.carDetailsList = result; // Assuming result contains the full car details list
      this.distinctCityList = [...new Set(this.carDetailsList.map((item: any) => item.city))];
    });
  }
}
