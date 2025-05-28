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
import { MatNativeDateModule } from '@angular/material/core';
import { ReportingService } from '../../services/ReportingService';
import { ReportParams } from '../../models/ReportParams';
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
    MatNativeDateModule,
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
  //monthlySalesLabels: string[] = [];
  //monthlySalesData: ChartDataset[] = [];
  //monthlySalesOptions: ChartOptions = { responsive: true };
  monthlySalesType: ChartType = 'bar';

  monthlySalesLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']; // Default labels
  monthlySalesData: ChartDataset[] = [{
    data: [0, 0, 0, 0, 0, 0], // Default data
    label: 'Monthly Sales'
  }];
  monthlySalesOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Top Model Chart configuration
  topModelData: ChartData<'pie'> = {
    labels: ['No Data'],
    datasets: [{
      data: [100],
      label: 'Top Models'
    }]
  };
  topModelOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true
      }
    }
  };
  topModelType: 'pie' = 'pie';
topModelLabels: string [] = [];

  constructor(private http: HttpClient, private reportService : ReportingService) {}

  ngOnInit() {
    // Ensure charts are responsive
    this.monthlySalesOptions = {
      responsive: true,
      maintainAspectRatio: false
    };

    this.topModelOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
  }

  // Update your fetchMonthlySales method
  fetchMonthlySales(): void {
    const params: ReportParams = {
      dateRange: this.startDate && this.endDate ? 
        `${this.formatDate(this.startDate)}_to_${this.formatDate(this.endDate)}` : undefined,
      city: this.city || undefined,
      make: this.make || undefined,
      model: this.model || undefined
    };

    this.reportService.getMonthlySalesReport(params).subscribe({
      next: (response) => {
        if (response && response.labels && response.data) {
          this.monthlySalesLabels = response.labels;
          this.monthlySalesData = [{
            data: response.data,
            label: 'Monthly Sales',
            backgroundColor: 'rgba(25, 118, 210, 0.5)',
            borderColor: 'rgb(25, 118, 210)',
            borderWidth: 1
          }];
        }
      },
      error: (error) => {
        console.error('Error fetching monthly sales:', error);
        // Reset to default state on error
        this.monthlySalesLabels = ['No Data'];
        this.monthlySalesData = [{
          data: [0],
          label: 'Monthly Sales'
        }];
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // topModelData: ChartData<'pie', number[]> = {
  //   labels: [],
  //   datasets: []
  // };

  // Update your fetchTopModelSold method
  fetchTopModelSold(): void {
    const params: ReportParams = {
      dateRange: this.startDate && this.endDate ? 
        `${this.formatDate(this.startDate)}_to_${this.formatDate(this.endDate)}` : undefined,
      city: this.city || undefined,
      make: this.make || undefined,
      model: this.model || undefined
    };

    this.reportService.getTopModelSold(params).subscribe({
      next: (response) => {
        // Check if response contains labels and data
        if (response && response.labels && response.data) {
          this.topModelData = {
            labels: response.labels,
            datasets: [{
              data: response.data,
              label: 'Top Models',
              backgroundColor: [
                'rgba(25, 118, 210, 0.5)',
                'rgba(76, 175, 80, 0.5)',
                'rgba(33, 150, 243, 0.5)',
                'rgba(156, 39, 176, 0.5)',
                'rgba(233, 30, 99, 0.5)'
              ]
            }]
          };
        }
        console.log('Top Model Response:', JSON.stringify(this.topModelData));
      },
      error: (error) => {
        console.error('Error fetching top models:', error);
        // Reset to default state on error
        this.topModelData = {
          labels: ['No Data'],
          datasets: [{
            data: [100],
            label: 'Top Models'
          }]
        };
      }
    });
  }

  applyFilters(): void {
    this.fetchMonthlySales();
    this.fetchTopModelSold();
  }
}
