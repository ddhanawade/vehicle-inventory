import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartOptions, ChartType, ChartDataset, ChartData } from 'chart.js';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { MatNativeDateModule } from '@angular/material/core';
import { ReportingService } from '../../services/ReportingService';
import { ReportParams } from '../../models/ReportParams';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { VehicleModel } from '../../models/VehicleModel';
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
    NgChartsModule,
    DatePipe,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIcon
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

  carDetailsList: VehicleModel[] = [];
  filteredCarDetailsList: VehicleModel[] = [];
  filters: { [key: string]: string } = {};
  activeFilter: string | null = null;

  displayedColumns: string[] = [
    'invoiceDate',
    'invoiceNumber',
    'purchaseDealer',
    'receivedDate',
    'manufactureDate',
    'model',
    'grade',
    'fuelType',
    'suffix',
    'exteriorColor',
    'interiorColor',
    'chassisNumber',
    'engineNumber',
    'keyNumber',
    'location',
    'tkmInvoiceValue',
    'age',
    'interest',
    'status',
    'make',
    'actions'
  ];
  dataSource: any;
  sort: any;
  paginator: any;
  totalVehicles!: number;
  isLoading!: boolean;
  
  topModelData!: { labels: any; datasets: { data: any; label: string; backgroundColor: string[]; }[]; };

  constructor(
    private http: HttpClient, 
    private reportService: ReportingService, 
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) { }

  ngOnInit() {
  //this.fetchMonthlySales();
  }

  fetchMonthlySales(): void {
    const params: ReportParams = {
      dateRange: this.startDate && this.endDate
        ? `${this.formatDate(this.startDate)}_to_${this.formatDate(this.endDate)}`
        : undefined,
      city: this.city || undefined,
      make: this.make || undefined,
      model: this.model || undefined
    };
  
    this.reportService.getMonthlySalesReport(params).subscribe({
      next: (result: VehicleModel[]) => {
        this.carDetailsList = result;
        this.dataSource = new MatTableDataSource<VehicleModel>(this.carDetailsList);
        console.log("monthly sales data", this.dataSource);
  
        // Set up sorting and pagination
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
  
        // Configure custom sorting
        this.dataSource.sortingDataAccessor = (item: VehicleModel, property: string) => {
          switch (property) {
            case 'receivedDate':
            case 'invoiceDate':
            case 'manufactureDate':
              return new Date(item[property] || '').getTime();
            case 'age':
            case 'tkmInvoiceValue':
              return typeof item[property] === 'number' ? item[property] : 0;
            default:
              return item[property]?.toString() || '';
          }
        };
  
        // Update the filter predicate
        this.dataSource.filterPredicate = (data: VehicleModel, filter: string) => {
          return Object.keys(data).some(key => {
            const value = data[key];
            return value !== null &&
              value !== undefined &&
              value.toString().toLowerCase().includes(filter.toLowerCase());
          });
        };
  
        this.totalVehicles = this.carDetailsList.length;
        this.isLoading = false;
        this.cdr.detectChanges(); // Trigger change detection
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  
  // Update your fetchTopModelSold method
  // fetchTopModelSold(): void {
  //   const params: ReportParams = {
  //     dateRange: this.startDate && this.endDate ?
  //       `${this.formatDate(this.startDate)}_to_${this.formatDate(this.endDate)}` : undefined,
  //     city: this.city || undefined,
  //     make: this.make || undefined,
  //     model: this.model || undefined
  //   };

  //   this.reportService.getTopModelSold(params).subscribe({
  //     next: (response) => {
  //       // Check if response contains labels and data
  //       if (response && response.labels && response.data) {
  //         this.topModelData = {
  //           labels: response.labels,
  //           datasets: [{
  //             data: response.data,
  //             label: 'Top Models',
  //             backgroundColor: [
  //               'rgba(25, 118, 210, 0.5)',
  //               'rgba(76, 175, 80, 0.5)',
  //               'rgba(33, 150, 243, 0.5)',
  //               'rgba(156, 39, 176, 0.5)',
  //               'rgba(233, 30, 99, 0.5)'
  //             ]
  //           }]
  //         };
  //       }
  //       console.log('Top Model Response:', JSON.stringify(this.topModelData));
  //     },
  //     error: (error) => {
  //       console.error('Error fetching top models:', error);
  //       // Reset to default state on error
  //       this.topModelData = {
  //         labels: ['No Data'],
  //         datasets: [{
  //           data: [100],
  //           label: 'Top Models'
  //         }]
  //       };
  //     }
  //   });
  // }

  // applyFilters(): void {
  //   this.fetchMonthlySales();
  //   this.fetchTopModelSold();
  // }

  getColumnHeader(column: string): string {
    // Convert camelCase to Title Case with spaces
    return column.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  // Update the getColumnValue method
  getColumnValue(item: VehicleModel, column: string): string {
    const value = item[column as keyof VehicleModel];

    if (column.includes('Date') && value) {
      return new Date(value).toLocaleDateString();
    }

    return value?.toString() || '';
  }

  shouldTruncate(column: string): boolean {
    // Add columns that should be truncated
    const truncateColumns = ['chassisNumber', 'engineNumber', 'keyNumber'];
    return truncateColumns.includes(column);
  }

  applyFilters(): void {
    this.fetchMonthlySales();
    //this.fetchTopModelSold();
  }
}
