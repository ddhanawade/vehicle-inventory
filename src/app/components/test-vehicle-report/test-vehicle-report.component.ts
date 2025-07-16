import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { ReportingService } from '../../services/ReportingService';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TestVehicleModel, TestVehicleRequest } from '../../models/TestVehicleModel';

@Component({
  selector: 'app-test-vehicle-report',
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
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIcon
  ],
  templateUrl: './test-vehicle-report.component.html',
  styleUrls: ['./test-vehicle-report.component.scss']
})
export class TestVehicleReportComponent implements OnInit, AfterViewInit {

  // Filter Properties
  testStartDate: string = '';
  testEndDate: string = '';
  testType: string = '';
  testStatus: string = '';
  vehicleMake: string = '';
  testEngineer: string = '';

  // Component State
  isLoading: boolean = false;
  totalTestVehicles: number = 0;

  // Data Properties
  testVehicleList: TestVehicleModel[] = [];
  filteredTestVehicleList: TestVehicleModel[] = [];
  
  // Table Configuration
  displayedColumns: string[] = [
    'make',
    'model',
    'chassisNumber',
    'engineNumber',
    'keyNumber',
    'exteriorColor',
    'interiorColor',
    'location'
  ];
  
  dataSource: MatTableDataSource<TestVehicleModel>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient, 
    private reportService: ReportingService, 
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource = new MatTableDataSource<TestVehicleModel>([]);
  }

  ngOnInit() {
    this.initializeComponent();
    this.loadTestVehicleData(); // Load real data from backend
  }

  ngAfterViewInit() {
    // Connect paginator and sort to dataSource after view initialization
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initializeComponent(): void {
    this.isLoading = false;
    this.totalTestVehicles = 0;
    this.dataSource = new MatTableDataSource<TestVehicleModel>([]);
  }

  // Load test vehicle data from backend
  loadTestVehicleData(): void {
    this.isLoading = true;
    
    this.reportService.getTestVehicleSummary().subscribe({
      next: (response: any) => {
        console.log('Test vehicle data received:', response);
        
        // Handle the response data
        if (response && Array.isArray(response)) {
          this.testVehicleList = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          // If the response is wrapped in a data property
          this.testVehicleList = response.data;
        } else if (response && response.vehicles && Array.isArray(response.vehicles)) {
          // If the response has vehicles property
          this.testVehicleList = response.vehicles;
        } else {
          // If response structure is different, handle accordingly
          this.testVehicleList = [];
          console.warn('Unexpected response structure:', response);
        }
        
                 this.dataSource = new MatTableDataSource<TestVehicleModel>(this.testVehicleList);
         this.totalTestVehicles = this.testVehicleList.length;
         
         // Connect paginator and sort after data is loaded
         if (this.paginator) {
           this.dataSource.paginator = this.paginator;
         }
         if (this.sort) {
           this.dataSource.sort = this.sort;
         }
         
         this.isLoading = false;
         this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading test vehicle data:', error);
                 this.isLoading = false;
         this.testVehicleList = [];
         this.dataSource = new MatTableDataSource<TestVehicleModel>([]);
         this.totalTestVehicles = 0;
         
         // Reconnect paginator and sort even for empty data
         if (this.paginator) {
           this.dataSource.paginator = this.paginator;
         }
         if (this.sort) {
           this.dataSource.sort = this.sort;
         }
         
         this.cdr.detectChanges();
        
        // Show user-friendly error message
        alert('Failed to load test vehicle data. Please try again later.');
      }
    });
  }

  onFilterChange(): void {
    // This method can be used for real-time filtering if needed
  }

  clearFilters(): void {
    this.testStartDate = '';
    this.testEndDate = '';
    this.testType = '';
    this.testStatus = '';
    this.vehicleMake = '';
    this.testEngineer = '';
    
    // Reset the data source to show all data
    this.dataSource = new MatTableDataSource<TestVehicleModel>(this.testVehicleList);
    this.totalTestVehicles = this.testVehicleList.length;
    
    // Reconnect paginator and sort
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    
    this.cdr.detectChanges();
  }

  applyFilters(): void {
    this.isLoading = true;
    
    // Filter the data based on current filter values
    let filteredData = [...this.testVehicleList];

    if (this.testStartDate) {
      const startDate = new Date(this.testStartDate);
      filteredData = filteredData.filter(item => 
        new Date(item.testStartDate) >= startDate
      );
    }

    if (this.testEndDate) {
      const endDate = new Date(this.testEndDate);
      filteredData = filteredData.filter(item => 
        item.testEndDate && new Date(item.testEndDate) <= endDate
      );
    }

    if (this.testType) {
      filteredData = filteredData.filter(item => 
        item.testType.toLowerCase().includes(this.testType.toLowerCase())
      );
    }

    if (this.testStatus) {
      filteredData = filteredData.filter(item => 
        item.testStatus.toLowerCase().includes(this.testStatus.toLowerCase())
      );
    }

    if (this.vehicleMake) {
      filteredData = filteredData.filter(item => 
        item.make.toLowerCase().includes(this.vehicleMake.toLowerCase())
      );
    }

    if (this.testEngineer) {
      filteredData = filteredData.filter(item => 
        item.testEngineer.toLowerCase().includes(this.testEngineer.toLowerCase())
      );
    }

    this.filteredTestVehicleList = filteredData;
    this.dataSource = new MatTableDataSource<TestVehicleModel>(filteredData);
    this.totalTestVehicles = filteredData.length;
    
    // Reconnect paginator and sort
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 500); // Simulate loading time
  }

  getActiveTestsCount(): number {
    return this.testVehicleList.filter(item => 
      item.testStatus === 'In Progress'
    ).length;
  }

  getUniqueCount(column: string): number {
    if (!this.testVehicleList || this.testVehicleList.length === 0) {
      return 0;
    }
    
    const uniqueValues = new Set();
    this.testVehicleList.forEach(item => {
      const value = item[column as keyof TestVehicleModel];
      if (value) {
        uniqueValues.add(value);
      }
    });
    
    return uniqueValues.size;
  }

  exportData(format: string): void {
    if (!this.testVehicleList || this.testVehicleList.length === 0) {
      alert('No data to export');
      return;
    }

    if (format === 'csv') {
      this.exportToCSV();
    }
  }

  private exportToCSV(): void {
    const headers = this.displayedColumns.map(col => this.getColumnHeader(col));
    const currentData = this.dataSource.data.length > 0 ? this.dataSource.data : this.testVehicleList;
    
    const csvContent = [
      headers.join(','),
      ...currentData.map(item => 
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
    a.download = `test-vehicle-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  generateTestReport(): void {
    // Placeholder for generating detailed test report
    alert('Test report generation feature will be implemented soon');
  }

  getColumnHeader(column: string): string {
    const headerMap: { [key: string]: string } = {
      'vehicleId': 'Vehicle ID',
      'make': 'Make',
      'model': 'Model',
      'chassisNumber': 'Chassis Number',
      'engineNumber': 'Engine Number',
      'keyNumber': 'Key Number',
      'exteriorColor': 'Exterior Color',
      'interiorColor': 'Interior Color',
      'location': 'Location',
      'year': 'Year',
      'testType': 'Test Type',
      'testStatus': 'Test Status',
      'testStartDate': 'Test Start Date',
      'testEndDate': 'Test End Date',
      'testEngineer': 'Test Engineer',
      'testFacility': 'Test Facility',
      'performanceScore': 'Performance Score',
      'safetyRating': 'Safety Rating'
    };
    
    return headerMap[column] || column.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  getColumnValue(item: TestVehicleModel, column: string): string {
    const value = item[column as keyof TestVehicleModel];

    if (column.includes('Date') && value) {
      return new Date(value).toLocaleDateString();
    }

    if (column === 'performanceScore' && value) {
      return `${value}%`;
    }

    return value?.toString() || '';
  }

  shouldTruncate(column: string): boolean {
    const truncateColumns = ['chassisNumber', 'engineNumber', 'notes'];
    return truncateColumns.includes(column);
  }
} 