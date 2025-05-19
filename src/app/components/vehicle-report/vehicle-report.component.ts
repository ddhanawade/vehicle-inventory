import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-vehicle-report',
  imports: [BrowserModule,FormsModule,MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, CommonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './vehicle-report.component.html',
  styleUrls: ['./vehicle-report.component.scss']
})
export class VehicleReportComponent implements OnInit {
  models: string[] = ['Tata', 'Toyota', 'Eicher'];
  selectedModel: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  vehicles = [
    { model: 'Tata', salePrice: 500000, soldDate: new Date('2023-10-01') },
    { model: 'Toyota', salePrice: 700000, soldDate: new Date('2023-10-05') },
    { model: 'Eicher', salePrice: 800000, soldDate: new Date('2023-10-10') },
  ];

  filteredVehicles = [...this.vehicles];
  displayedColumns: string[] = ['model', 'salePrice', 'soldDate'];
  totalSales: number = 0;

  ngOnInit() {
    this.calculateTotalSales();
  }

  applyFilters() {
    this.filteredVehicles = this.vehicles.filter(vehicle => {
      const matchesModel = this.selectedModel ? vehicle.model === this.selectedModel : true;
      const matchesStartDate = this.startDate ? vehicle.soldDate >= this.startDate : true;
      const matchesEndDate = this.endDate ? vehicle.soldDate <= this.endDate : true;
      return matchesModel && matchesStartDate && matchesEndDate;
    });
    this.calculateTotalSales();
  }

  calculateTotalSales() {
    this.totalSales = this.filteredVehicles.reduce((sum, vehicle) => sum + vehicle.salePrice, 0);
  }
}