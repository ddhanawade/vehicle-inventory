import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MonthlyPurchaseRequest } from '../../models/MonthlyPurchaseRequest';
import { VehicleModel } from '../../models/VehicleModel';
import { ReportingService } from '../../services/ReportingService';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-purchasereport',
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
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIcon
  ],
  templateUrl: './purchasereport.component.html',
  styleUrl: './purchasereport.component.scss'
})
export class PurchasereportComponent {
  startDate: string = '';
  endDate: string = '';
  city: string = '';
  make: string = '';
  model: string = '';

  // Enhanced properties
  showAdvancedFilters: boolean = false;
  isLoading: boolean = false;

  carDetailsList: VehicleModel[] = [];
  filteredCarDetailsList: VehicleModel[] = [];
  filters: { [key: string]: string } = {};
  activeFilter: string | null = null;

  displayedColumns: string[] = [
    'make',
    'model',
    'purchaseDealer',
    'chassisNumber',
    'engineNumber',
    'keyNumber',
    'location',
    'invoiceValue',
    'interest',
    'status'

  ];
  dataSource: any;
  sort: any;
  paginator: any;
  totalVehicles!: number;

  topModelData!: { labels: any; datasets: { data: any; label: string; backgroundColor: string[]; }[]; };
  salesPersonName: any;
  leadName: any;

  constructor(
    private http: HttpClient,
    private reportService: ReportingService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initializeComponent();
  }

  initializeComponent(): void {
    this.isLoading = true;
    this.totalVehicles = 0;
    this.dataSource = new MatTableDataSource<VehicleModel>([]);
    this.isLoading = false;
  }

  // Enhanced methods
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  onFilterChange(): void {
    // This method can be used for real-time filtering if needed
    // For now, we'll keep the apply button approach
  }

  clearFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.city = '';
    this.make = '';
    this.model = '';
    this.salesPersonName = '';
    this.leadName = '';

    // Reset the data source
    this.dataSource = new MatTableDataSource<VehicleModel>([]);
    this.totalVehicles = 0;
    this.cdr.detectChanges();
  }

  getUniqueCount(column: string): number {
    if (!this.carDetailsList || this.carDetailsList.length === 0) {
      return 0;
    }

    const uniqueValues = new Set();
    this.carDetailsList.forEach(item => {
      const value = item[column as keyof VehicleModel];
      if (value) {
        uniqueValues.add(value);
      }
    });

    return uniqueValues.size;
  }

  exportData(format: string): void {
    if (!this.carDetailsList || this.carDetailsList.length === 0) {
      alert('No data to export');
      return;
    }

    if (format === 'csv') {
      this.exportToCSV();
    } else if (format === 'pdf') {
      this.exportToPDF();
    }
  }

  private exportToCSV(): void {
    const headers = this.displayedColumns.map(col => this.getColumnHeader(col));
    const csvContent = [
      headers.join(','),
      ...this.carDetailsList.map(item =>
        this.displayedColumns.map(col => {
          const value = this.getColumnValue(item, col);
          return `"${value}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private exportToPDF(): void {
    // Placeholder for PDF export functionality
    alert('PDF export functionality will be implemented soon');
  }

  fetchMonthlySales(): void {
    this.isLoading = true;

    const start = this.safeParseDate(this.startDate);
    const end = this.safeParseDate(this.endDate);

    if (!start || !end) {
      this.isLoading = false;
      alert('Please select both Start and End dates.');
      return;
    }

    const request: MonthlyPurchaseRequest = {
      startDate: this.formatDate(start),
      endDate: this.formatDate(end),
      city: this.city || undefined,
      make: this.make || undefined,
      model: this.model || undefined
    };

    this.reportService.getMonthlyPurchaseReport(request).subscribe({
      next: (result: VehicleModel[]) => {
        this.carDetailsList = result;
        this.dataSource = new MatTableDataSource<VehicleModel>(this.carDetailsList);
        console.log("monthly Purchase data", this.dataSource);

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
        this.cdr.detectChanges();
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private safeParseDate(input: string): Date | null {
    if (!input) return null;
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  applyFilters(): void {
    this.fetchMonthlySales();
   // this.fetchTopModelSold();
  }

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
}

