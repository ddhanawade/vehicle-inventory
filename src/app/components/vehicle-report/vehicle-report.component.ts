import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartOptions, ChartType, ChartDataset, ChartData } from 'chart.js';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
// import { ChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-vehicle-report',
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
    FormsModule,
    MatCardModule,
    NgChartsModule
  ],
  templateUrl: './vehicle-report.component.html',
  styleUrls: ['./vehicle-report.component.scss']
})
export class VehicleReportComponent implements OnInit {
  // Filters
  startDate: Date | null = null;
  endDate: Date | null = null;
  city: string = '';
  make: string = '';
  model: string = '';

  // Monthly Sales Chart
  monthlySalesLabels: string[] = [];
  monthlySalesData: ChartDataset[] = [];
  monthlySalesOptions: ChartOptions = { responsive: true };
  monthlySalesType: ChartType = 'bar';

  // Top Model Sold Chart
  topModelLabels: string[] = [];
  topModelOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        enabled: true
      }
    }
  };
  topModelType: ChartType = 'pie';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchMonthlySales();
    this.fetchTopModelSold();
  }

  fetchMonthlySales(): void {
    const params = {
      dateRange: `${this.startDate?.toISOString().split('T')[0]}_to_${this.endDate?.toISOString().split('T')[0]}`,
      city: this.city,
      make: this.make,
      model: this.model
    };

    this.http.get<any>('/api/analytics/monthly-sales', { params }).subscribe(response => {
      this.monthlySalesLabels = response.labels; // e.g., ['Jan', 'Feb', 'Mar']
      this.monthlySalesData = [{ data: response.data, label: 'Monthly Sales' }]; // e.g., [100, 200, 300]
    });
  }

  topModelData: ChartData<'pie', number[]> = {
    labels: [],
    datasets: []
  };

  fetchTopModelSold(): void {
    const params = {
      startDate: this.startDate?.toISOString().split('T')[0] || '',
      endDate: this.endDate?.toISOString().split('T')[0] || '',
      city: this.city,
      make: this.make,
      model: this.model
    };

    interface TopModelResponse {
      labels: string[];
      data: number[];
    }

    this.http.get<TopModelResponse>('/api/analytics/top-model-sold', {
      params,
      responseType: 'json'
    }).subscribe(response => {
      this.topModelData = {
        labels: response.labels, // e.g., ['Model A', 'Model B']
        datasets: [
          {
            data: response.data, // e.g., [50, 30]
            label: 'Top Models'
          }
        ]
      };
    });
  }

  applyFilters(): void {
    this.fetchMonthlySales();
    this.fetchTopModelSold();
  }
}
