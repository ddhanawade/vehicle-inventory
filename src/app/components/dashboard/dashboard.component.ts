import { Component, NgModule, OnInit } from '@angular/core';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleService } from '../../services/vehicle.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { DataService } from '../../services/DataService';
import { VehicleModel } from '../../models/VehicleModel';
import { distinct } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  vehicleForm!: FormGroup;
  carDetailsList: VehicleModel[] = [];
  filteredStocksList: VehicleModel[] = [];
  searchTerm: string = '';
  selectedMake: string = ''; // Selected make for filtering
  successMessage: string = '';
  showPopup: boolean = false;
  showEditPopup: boolean = false;
  editVehicleData: any = {};

  constructor(private fb: FormBuilder, private vehicleService: DataService) {}

  ngOnInit(): void {
    this.getCarDetails();
  }

  getCarDetails(): void {
    this.vehicleService.getData().subscribe((data: VehicleModel[]) => {
      this.carDetailsList = data;
      this.filteredStocksList = [...this.carDetailsList]; // Initialize filtered list
    });
  }

  filterByMake(make: string): void {
    this.selectedMake = make; // Set the selected make
    this.filterStocks(); // Apply the filter
  }

  filterStocks(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredStocksList = this.carDetailsList.filter((stock) => {
      const matchesMake = this.selectedMake ? stock.make.toLowerCase() === this.selectedMake.toLowerCase() : true;
      const matchesSearch = stock.make.toLowerCase().includes(searchTermLower) ||
                            stock.model.toLowerCase().includes(searchTermLower) ||
                            stock.location.toLowerCase().includes(searchTermLower);
      return matchesMake && matchesSearch;
    });
  }

  openAddVehiclePopup(): void {
    this.showPopup = true;
    this.vehicleForm.reset();
  }

  closePopup(): void {
    this.showPopup = false;
  }

  openEditVehiclePopup(stock: VehicleModel): void {
    this.editVehicleData = { ...stock };
    this.showEditPopup = true;
  }

  closeEditPopup(): void {
    this.showEditPopup = false;
  }

  onSubmit(): void {
    this.vehicleService.addVehicle(this.vehicleForm.value).subscribe(
      () => {
        this.successMessage = 'Vehicle details added successfully!';
        setTimeout(() => {
          this.successMessage = '';
          this.closePopup();
        }, 2000);
        this.getCarDetails();
      },
      (error) => console.error('Error adding vehicle:', error)
    );
  }

  onUpdate(): void {
    this.vehicleService.updateVehicleDetails(this.editVehicleData).subscribe(
      () => {
        this.successMessage = 'Vehicle details updated successfully!';
        setTimeout(() => {
          this.successMessage = '';
          this.closeEditPopup();
        }, 2000);
        this.getCarDetails();
      },
      (error) => console.error('Error updating vehicle:', error)
    );
  }

  onDelete(stock: VehicleModel): void {
    this.vehicleService.deleteVehicleDetails(stock.id).subscribe(
      () => {
        this.successMessage = 'Vehicle details deleted successfully!';
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
        this.getCarDetails();
      },
      (error) => console.error('Error deleting vehicle:', error)
    );
  }

  getTotalCarsAvailable() {
    return this.carDetailsList.length;
  }

  getCityWiseModelCounts(): { city: string, count: number }[] {
    // Create a map to store city-wise model counts
    const cityModelCounts: { [key: string]: number } = {};
  
    // Iterate through the carDetailsList and calculate model counts for each city
    this.carDetailsList.forEach(stock => {
      const city = stock.location.trim().toLowerCase(); // Normalize city names (case-insensitive)
      if (cityModelCounts[city]) {
        cityModelCounts[city] += 1; // Increment the count for the city
      } else {
        cityModelCounts[city] = 1; // Initialize the count for the city
      }
    });
  
    // Convert the map into an array of objects with city and model count
    return Object.keys(cityModelCounts).map(city => ({
      city: city.charAt(0).toUpperCase() + city.slice(1), // Capitalize the city name
      count: cityModelCounts[city]
    }));
  }
}
