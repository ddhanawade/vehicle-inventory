import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { VehicleModel } from '../../models/VehicleModel';
import { DataService } from '../../services/DataService';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../services/AuthService';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { EditVehicleDialogComponent } from '../edit-vehicle-dialog-component/edit-vehicle-dialog.component';
import { OrderService } from '../../services/OrderService';
import { UpdateVehicleComponent } from '../update-vehicle/update-vehicle.component';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-vehicle-details',
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatInputModule,
    MatIcon
  ],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss'
})
export class VehicleDetailsComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('statusFilter') statusFilter!: ElementRef<HTMLSelectElement>;
  @ViewChild('ageFilter') ageFilter!: ElementRef<HTMLSelectElement>;
  @ViewChild('financerFilter') financerFilter!: ElementRef<HTMLSelectElement>;


  dataSource!: MatTableDataSource<VehicleModel>;
  isLoading = false;
  totalVehicles = 0;
  isLoad: boolean = false;
  // Define all available columns with their properties
  allColumns = [
    { name: 'make', label: 'Make', visible: true, mandatory: true },
    { name: 'model', label: 'Model', visible: true, mandatory: true },
    { name: 'chassisNumber', label: 'Chassis Number', visible: true, mandatory: true },
    { name: 'vehicleStatus', label: 'Vehicle Status', visible: true, mandatory: true },
    { name: 'age', label: 'Age', visible: true, mandatory: true },
    { name: 'invoiceDate', label: 'Invoice Date', visible: true, mandatory: false },
    { name: 'invoiceNumber', label: 'Invoice Number', visible: true, mandatory: false },
    { name: 'purchaseDealer', label: 'Purchase Dealer', visible: true, mandatory: false },
    { name: 'receivedDate', label: 'Received Date', visible: true, mandatory: false },
    { name: 'manufactureDate', label: 'Manufacture Date', visible: true, mandatory: false },
    { name: 'grade', label: 'Grade', visible: true, mandatory: false },
    { name: 'fuelType', label: 'Fuel Type', visible: true, mandatory: false },
    { name: 'suffix', label: 'Suffix', visible: false, mandatory: false },
    { name: 'exteriorColor', label: 'Exterior Color', visible: true, mandatory: false },
    { name: 'interiorColor', label: 'Interior Color', visible: false, mandatory: false },
    { name: 'colorCode', label: 'Color Code', visible: true, mandatory: false },
    { name: 'engineNumber', label: 'Engine Number', visible: true, mandatory: false },
    { name: 'keyNumber', label: 'Key Number', visible: false, mandatory: false },
    { name: 'location', label: 'Location', visible: true, mandatory: false },
    { name: 'invoiceValue', label: 'Invoice Value', visible: true, mandatory: false },
    { name: 'interest', label: 'Interest', visible: false, mandatory: false },
    { name: 'customerName', label: 'Customer Name', visible: true, mandatory: false },
    { name: 'orderDate', label: 'Order Date', visible: true, mandatory: false },
    { name: 'deliveryDate', label: 'Delivery Date', visible: true, mandatory: false },
    { name: 'orderStatus', label: 'Order Status', visible: true, mandatory: false },
    { name: 'salesPersonName', label: 'Sales Person', visible: false, mandatory: false },
    { name: 'leadName', label: 'Lead Name', visible: false, mandatory: false },
    { name: 'dmsStatus', label: 'DMS Status', visible: true, mandatory: false },
    { name: 'dealAmount', label: 'Deal Amount', visible: true, mandatory: false },
    { name: 'financerName', label: 'Financer Name', visible: true, mandatory: false },
    { name: 'financeType', label: 'Finance Type', visible: false, mandatory: false }
  ];

  displayedColumns: string[] = [];
  showColumnSelector = false;

  carDetailsList: VehicleModel[] = [];
  filteredCarDetailsList: VehicleModel[] = [];
  filters: { [key: string]: string } = {};
  activeFilter: string | null = null;
  successMessage: string = '';
  originalCarDetailsList: VehicleModel[] = [];
  viewMode: 'table' | 'card' = 'table';
  selectedRow: VehicleModel | null = null;
  currentFilter: string = 'available'; // Track current filter state
  currentAgeFilter: string = 'all'; // Track current age filter
  currentFinancerFilter: string = 'all'; // Track current financer filter
  
  // Financer names list
  financerNames = [
    'BANK OF MAHARASHTRA',
    'TOYOTA FINANCIAL SERVICES INDIA LTD',
    'HDFC BANK LTD',
    'CANARA BANK',
    'PUNJAB NATIONAL BANK',
    'CHOLAMANDALAM',
    'AXIS BANK',
    'ICICI BANK',
    'STATE BANK OF INDIA',
    'KOTAK MAHINDRA BANK',
    'INDUSIND BANK',
    'YES BANK',
    'IDFC FIRST BANK',
    'RBL BANK',
    'FEDERAL BANK',
    'BANDHAN BANK',
    'AU SMALL FINANCE BANK',
    'BAJAJ FINANCE',
    'MAHINDRA FINANCE',
    'TATA CAPITAL',
    'L&T FINANCE',
    'SUNDARAM FINANCE',
    'SHRIRAM FINANCE'
  ];

  constructor(private route: ActivatedRoute, private vehicleService: DataService, private cdr: ChangeDetectorRef, private dialog: MatDialog,
    private orderService: OrderService, private renderer: Renderer2, private authService: AuthService
  ) {

  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.cdr.detectChanges();
    }
  }

  hasRole(role: string): boolean {
    const storedUser = localStorage.getItem('user');
    const roles = storedUser ? (JSON.parse(storedUser).roles || []) : [];
    if (roles.includes('ADMIN')) return true;
    return roles.includes(role);
  }

  ngOnInit(): void {
    // Load column preferences from localStorage
    this.loadColumnPreferences();
    // Update displayed columns
    this.updateDisplayedColumns();

    this.route.paramMap.subscribe((params) => {
      const modelName = params.get('modelName');
      const make = params.get('make');
      this.isLoading = true;
      if (modelName) {
        this.getCarDetails(modelName);
      } else if (make) {
        this.getCarDetailsByMake(make);
      } else {
        // Fallback: show all vehicles
        this.getAllVehicles();
      }
      // Apply default filter: All Active (not SOLD)
      setTimeout(() => {
        const selectEl = document.querySelector('.filter-dropdown') as HTMLSelectElement | null;
        if (selectEl) {
          selectEl.value = 'all-active';
        }
        this.onStatusFilterChange({ target: { value: 'all-active' } } as any);
      }, 0);
    });
  }

  // Load column preferences from localStorage
  loadColumnPreferences(): void {
    const savedPreferences = localStorage.getItem('vehicleDetailsColumnPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        this.allColumns.forEach(column => {
          const savedColumn = preferences.find((p: any) => p.name === column.name);
          if (savedColumn && !column.mandatory) {
            column.visible = savedColumn.visible;
          }
        });
      } catch (error) {
        console.error('Error loading column preferences:', error);
      }
    }
  }

  // Save column preferences to localStorage
  saveColumnPreferences(): void {
    const preferences = this.allColumns.map(col => ({
      name: col.name,
      visible: col.visible
    }));
    localStorage.setItem('vehicleDetailsColumnPreferences', JSON.stringify(preferences));
  }

  // Update displayed columns based on visibility
  updateDisplayedColumns(): void {
    this.displayedColumns = [
      ...this.allColumns.filter(col => col.visible).map(col => col.name),
      'actions'
    ];
  }

  // Toggle column visibility
  toggleColumn(columnName: string): void {
    const column = this.allColumns.find(col => col.name === columnName);
    if (column && !column.mandatory) {
      column.visible = !column.visible;
      this.updateDisplayedColumns();
      this.saveColumnPreferences();
    }
  }

  // Toggle column selector panel
  toggleColumnSelector(): void {
    this.showColumnSelector = !this.showColumnSelector;
  }

  // Reset columns to default
  resetColumns(): void {
    this.allColumns.forEach(column => {
      if (column.mandatory) {
        column.visible = true;
      } else {
        // Set default visibility
        column.visible = ['invoiceDate', 'invoiceNumber', 'purchaseDealer', 'receivedDate', 
          'manufactureDate', 'grade', 'fuelType', 'exteriorColor', 'colorCode', 'engineNumber', 
          'location', 'invoiceValue', 'customerName', 'orderDate', 'deliveryDate', 
          'orderStatus', 'dmsStatus', 'dealAmount', 'financerName'].includes(column.name);
      }
    });
    this.updateDisplayedColumns();
    this.saveColumnPreferences();
  }

  editVehicle(vehicle: any): void {
    const dialogRef = this.dialog.open(EditVehicleDialogComponent, {
      width: '600px',
      data: { ...vehicle }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      // If an order was deleted, just refresh data from the server
      if (result.deleted) {
        this.refreshData();
        return;
      }

      // If we got an updated vehicle object, merge it into the table
      if (result.id) {
        const index = this.dataSource.data.findIndex(item => item.id === result.id);
        if (index > -1) {
          this.dataSource.data[index] = { ...this.dataSource.data[index], ...result };
          this.dataSource._updateChangeSubscription();
        }
      }
    });
  }

  updateVehicle(vehicle: any): void {
    // Prepare vehicle data for update
      const updatedVehicle = { 
        ...vehicle, 
        id: vehicle.id, // Use vehicle.id, not vehicle.vehicleId
        invoiceDate: this.formatDate(new Date(vehicle.invoiceDate)),  
        receivedDate: this.formatDate(new Date(vehicle.receivedDate)) 
      };
  
    console.log("Update vehicle:", JSON.stringify(updatedVehicle));
    const dialogRef = this.dialog.open(UpdateVehicleComponent, {
      width: '80%', // Adjust width for responsiveness
      maxWidth: '600px', // Set a maximum width
      height: 'auto', // Adjust height dynamically
      data: updatedVehicle
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the vehicle in your data source
        const index = this.dataSource.data.findIndex(item => item.id === result.id);
        if (index > -1) {
          this.dataSource.data[index] = result;
          this.dataSource._updateChangeSubscription();
        }
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
  }

  exportToExcel(): void {
    // Get only the visible columns from the allColumns array
    const columnsToInclude = this.allColumns
      .filter(col => col.visible)
      .map(col => col.name);
  
    // Map the data to include only the visible columns and format date columns
    const excelData = this.dataSource.data.map((vehicle) => {
      const row: { [key: string]: any } = {};
      columnsToInclude.forEach((column) => {
        // Get the column label for better header names
        const columnConfig = this.allColumns.find(col => col.name === column);
        const columnLabel = columnConfig ? columnConfig.label : column;
        
        if (['invoiceDate', 'receivedDate', 'orderDate', 'deliveryDate', 'manufactureDate'].includes(column)) {
          const value = vehicle[column as keyof VehicleModel];
          row[columnLabel] = value
            ? new Date(value as string | number).toLocaleDateString() // Format as date
            : ''; // Handle empty or null values
        } else {
          row[columnLabel] = vehicle[column as keyof VehicleModel];
        }
      });
      return row;
    });

    // Create a worksheet from the filtered data
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Details');

    // Write the workbook to a file
    XLSX.writeFile(workbook, 'vehicle-details.xlsx');
  }

  toggleFilter(column: string): void {
    this.activeFilter = this.activeFilter === column ? null : column;
  }
  applyFilters(): void {
    this.filteredCarDetailsList = this.carDetailsList.filter((item) => {
      return Object.keys(this.filters).every((key) => {
        const itemValue = item[key as keyof VehicleModel];
        return !this.filters[key] || (typeof itemValue === 'string' && itemValue.toLowerCase().includes(this.filters[key].toLowerCase()));
      });
    });
  }

  getCarDetails(modelName: string): void {
    this.isLoad = true; // Start loading
    this.vehicleService.getVehicleAndOrderDetailsByModel(modelName).subscribe({
      next: (result: VehicleModel[]) => {
        // Flatten order data from nested orders array
        let processedResult = this.flattenOrderData(result);

        // Transform manufactureDate to extract only the year
        processedResult.forEach(vehicle => {
          if (vehicle.manufactureDate) {
            const date = new Date(vehicle.manufactureDate);
            vehicle.manufactureDate = date.getFullYear().toString(); // Extract year as string
          }
        });
  
        // Store the original unfiltered data
        this.originalCarDetailsList = processedResult;
  
                // Filter out vehicles with status "sold" (default to available)
        this.carDetailsList = processedResult.filter(vehicle => !vehicle.vehicleStatus || vehicle.vehicleStatus.toLowerCase() !== 'sold');
        console.log("Filtered Vehicle Details: " + JSON.stringify(this.carDetailsList));

        this.dataSource = new MatTableDataSource<VehicleModel>(this.carDetailsList);
        this.currentFilter = 'available'; // Set initial filter state
  
        // Set up sorting and pagination
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
  
        // Configure custom sorting
        this.dataSource.sortingDataAccessor = (item: VehicleModel, property: string) => {
          switch (property) {
            case 'receivedDate':
            case 'invoiceDate':
              return new Date(item[property] || '').getTime();
            case 'manufactureDate': // Treat as a string
              return item.manufactureDate || '';
            case 'age':
            case 'tkmInvoiceValue':
              return typeof item[property] === 'number' ? item[property] : 0;
            default:
              return item[property]?.toString() || '';
          }
        };
  
        this.totalVehicles = this.carDetailsList.length;
        this.isLoading = false;
        this.isLoad = false; // Stop loading
        this.cdr.detectChanges(); // Trigger change detection
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
        this.isLoad = false;
      }
    });
  }
  
  onStatusFilterChange(event: Event): void {
    const selectedStatus = (event.target as HTMLSelectElement).value;
    this.currentFilter = selectedStatus.toLowerCase();
    this.applyAllFilters();
  }

  onAgeFilterChange(event: Event): void {
    const selectedAge = (event.target as HTMLSelectElement).value;
    this.currentAgeFilter = selectedAge;
    this.applyAllFilters();
  }

  onFinancerFilterChange(event: Event): void {
    const selectedFinancer = (event.target as HTMLSelectElement).value;
    this.currentFinancerFilter = selectedFinancer;
    this.applyAllFilters();
  }

  applyAllFilters(): void {
    let filteredData = [...this.originalCarDetailsList];

    // Apply status filter
    if (this.currentFilter === 'all-active' || this.currentFilter === 'available') {
      // Active = not SOLD
      filteredData = filteredData.filter(vehicle => !vehicle.vehicleStatus || vehicle.vehicleStatus.toUpperCase() !== 'SOLD');
    } else if (this.currentFilter === 'sold') {
      filteredData = filteredData.filter(vehicle => vehicle.vehicleStatus?.toUpperCase() === 'SOLD');
    } else if (this.currentFilter !== 'all-active') {
      // Other explicit statuses
      filteredData = filteredData.filter(vehicle => vehicle.vehicleStatus?.toUpperCase() === this.currentFilter.toUpperCase());
    }

    // Apply age filter
    if (this.currentAgeFilter !== 'all') {
      filteredData = filteredData.filter(vehicle => {
        const age = typeof vehicle.age === 'number' ? vehicle.age : Number(vehicle.age || 0);
        
        switch (this.currentAgeFilter) {
          case 'lt30':
            return age < 30;
          case '30-60':
            return age >= 30 && age <= 60;
          case 'gt60':
            return age > 60;
          default:
            return true;
        }
      });
    }

    // Apply financer filter
    if (this.currentFinancerFilter !== 'all') {
      filteredData = filteredData.filter(vehicle => {
        const financerName = vehicle.financerName?.toUpperCase() || '';
        return financerName === this.currentFinancerFilter.toUpperCase();
      });
    }

    this.dataSource.data = filteredData;
    this.totalVehicles = filteredData.length;
    this.cdr.detectChanges();
  }
  

  // Update filter method
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.dataSource) {
      this.dataSource.filter = filterValue.trim().toLowerCase();

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage(); // Reset to first page when filtering
      }
    }
  }

  onDelete(vehicle: any): void {
    if (!(this as any).hasRole || !(this as any)['hasRole']('ADMIN')) {
      alert('Only admins can delete vehicles.');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.vehicleService.deleteVehicleDetails(vehicle.vehicleId).subscribe(
          () => {
            this.successMessage = 'Vehicle details deleted successfully!';
            setTimeout(() => {
              this.successMessage = '';
            }, 2000);
            this.getCarDetails(vehicle.model);
          },
          (error) => console.error('Error deleting vehicle:', error)
        );
      }
    });
  }

  getColumnHeader(column: string): string {
    // Convert camelCase to Title Case with spaces
    return column.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  // Update the getColumnValue method
  getColumnValue(item: VehicleModel, column: string): string {
  const value = item[column as keyof VehicleModel];

  if (column === 'make' && value) {
    return value.toString().toUpperCase();
  }

  if (column === 'chassisNumber' && value) {
    const raw = value.toString();
    const trimmed = raw.split('~')[0].split('\n')[0].split('\r')[0].split(' ')[0];
    return trimmed.toUpperCase();
  }

  if (column === 'manufactureDate' && value) {
    // If value is a year (e.g., "2024"), just return it
    if (/^\d{4}$/.test(value.toString())) {
      return value.toString();
    }
    // If value is a date string, extract the year
    return new Date(value).getFullYear().toString();
  }

  if (column.includes('Date') && value) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString();
    }
    return value.toString();
  }

  return value?.toString() || '';
}

  shouldTruncate(column: string): boolean {
    // Do not truncate VIN-like identifiers; show full strings
    const truncateColumns: string[] = [];
    return truncateColumns.includes(column);
  }

  // Enhanced methods for the new UI
  getAvailableCount(): number {
    // Always calculate from original data to show total available vehicles
    return this.originalCarDetailsList.filter(vehicle => 
      !vehicle.vehicleStatus || vehicle.vehicleStatus.toLowerCase() !== 'sold'
    ).length;
  }

  getSoldCount(): number {
    // Always calculate from original data to show total sold vehicles
    return this.originalCarDetailsList.filter(vehicle => 
      vehicle.vehicleStatus && vehicle.vehicleStatus.toLowerCase() === 'sold'
    ).length;
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.applyFilter({ target: input } as any);
  }

  refreshData(): void {
    this.isLoading = true;
    this.isLoad = true;
    
    this.route.paramMap.subscribe((params) => {
      const modelName = params.get('modelName');
      const make = params.get('make');
      
      if (modelName) {
        this.getCarDetails(modelName);
      } else if (make) {
        this.getCarDetailsByMake(make);
      } else {
        // Fallback: show all vehicles
        this.getAllVehicles();
      }
    });
  }

  setViewMode(mode: 'table' | 'card'): void {
    this.viewMode = mode;
  }

  selectRow(row: VehicleModel): void {
    this.selectedRow = this.selectedRow === row ? null : row;
  }

  getStatusClass(status: string | undefined): string {
    if (!status || typeof status !== 'string' || status.trim() === '') return '';
    switch (status.toLowerCase()) {
      case 'sold':
        return 'sold';
      case 'available':
        return 'available';
      default:
        return '';
    }
  }

  getTotalVehicles(): number {
    return this.originalCarDetailsList.length;
  }

  resetFilters(): void {
    this.filters = {};
    this.activeFilter = null;
    this.currentFilter = 'available';
    this.currentAgeFilter = 'all';
    this.currentFinancerFilter = 'all';
    this.dataSource.filter = '';
    
    // Reset dropdown values in the UI using ViewChild references
    if (this.statusFilter) {
      this.statusFilter.nativeElement.value = 'all-active';
    }
    if (this.ageFilter) {
      this.ageFilter.nativeElement.value = 'all';
    }
    if (this.financerFilter) {
      this.financerFilter.nativeElement.value = 'all';
    }
    
    // Apply the combined filters (will show only available vehicles by default)
    this.applyAllFilters();
  }

  getModelCount(model: string): number {
    return this.carDetailsList.filter(car => car.model === model).length;
  }

  // Helper method to flatten order data from orders array
  private flattenOrderData(vehicles: VehicleModel[]): VehicleModel[] {
    return vehicles.map(vehicle => {
      // If vehicle has orders array with at least one order, flatten the first order's data
      if ((vehicle as any).orders && Array.isArray((vehicle as any).orders) && (vehicle as any).orders.length > 0) {
        const firstOrder = (vehicle as any).orders[0];
        return {
          ...vehicle,
          customerName: firstOrder.customerName || '',
          orderDate: firstOrder.orderDate || '',
          deliveryDate: firstOrder.deliveryDate || '',
          orderStatus: firstOrder.orderStatus || '',
          salesPersonName: firstOrder.salesPersonName || '',
          leadName: firstOrder.leadName || '',
          dmsStatus: firstOrder.dmsStatus || '',
          dealAmount: firstOrder.dealAmount || '',
          financerName: firstOrder.financerName || '',
          financeType: firstOrder.financeType || ''
        };
      }
      return vehicle;
    });
  }

  // New: Load all vehicles and show in table
  private getAllVehicles(): void {
    this.isLoad = true;
    this.vehicleService.getAllVehiclesWithOrders().subscribe({
      next: (result: VehicleModel[]) => {
        // Flatten order data from nested orders array
        let processedResult = this.flattenOrderData(result);

        // Transform manufactureDate to extract only the year
        processedResult.forEach(vehicle => {
          if (vehicle.manufactureDate) {
            const date = new Date(vehicle.manufactureDate);
            if (!isNaN(date.getTime())) {
              vehicle.manufactureDate = date.getFullYear().toString();
            }
          }
        });

        this.originalCarDetailsList = processedResult;
        this.carDetailsList = processedResult.filter(vehicle => !vehicle.vehicleStatus || vehicle.vehicleStatus.toLowerCase() !== 'sold');
        this.dataSource = new MatTableDataSource<VehicleModel>(this.carDetailsList);
        this.currentFilter = 'available';
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        // Configure custom sorting
        this.dataSource.sortingDataAccessor = (item: VehicleModel, property: string) => {
          switch (property) {
            case 'receivedDate':
            case 'invoiceDate':
            case 'orderDate':
            case 'deliveryDate':
              return new Date(item[property] || '').getTime();
            case 'manufactureDate':
              return item.manufactureDate || '';
            case 'age':
            case 'invoiceValue':
              return typeof item[property] === 'number' ? item[property] : 0;
            default:
              return item[property]?.toString() || '';
          }
        };

        this.totalVehicles = this.carDetailsList.length;
        this.isLoading = false;
        this.isLoad = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.isLoad = false;
      }
    });
  }

  // New: Load by make regardless of model
  private getCarDetailsByMake(make: string): void {
    this.isLoad = true;
    this.vehicleService.getAllVehiclesWithOrders().subscribe({
      next: (result: VehicleModel[]) => {
        const lowerMake = (make || '').toLowerCase();
        const filtered = result.filter(v => (v.make || '').toLowerCase() === lowerMake);

        // Flatten order data from nested orders array
        let processedResult = this.flattenOrderData(filtered);

        // Transform manufactureDate to year where applicable
        processedResult.forEach(vehicle => {
          if (vehicle.manufactureDate) {
            const date = new Date(vehicle.manufactureDate);
            if (!isNaN(date.getTime())) {
              vehicle.manufactureDate = date.getFullYear().toString();
            }
          }
        });

        this.originalCarDetailsList = processedResult;
        this.carDetailsList = processedResult.filter(vehicle => !vehicle.vehicleStatus || vehicle.vehicleStatus.toLowerCase() !== 'sold');
        this.dataSource = new MatTableDataSource<VehicleModel>(this.carDetailsList);
        this.currentFilter = 'available';
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        // Configure custom sorting
        this.dataSource.sortingDataAccessor = (item: VehicleModel, property: string) => {
          switch (property) {
            case 'receivedDate':
            case 'invoiceDate':
            case 'orderDate':
            case 'deliveryDate':
              return new Date(item[property] || '').getTime();
            case 'manufactureDate':
              return item.manufactureDate || '';
            case 'age':
            case 'invoiceValue':
              return typeof item[property] === 'number' ? item[property] : 0;
            default:
              return item[property]?.toString() || '';
          }
        };

        this.totalVehicles = this.carDetailsList.length;
        this.isLoading = false;
        this.isLoad = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.isLoad = false;
      }
    });
  }
}
function html2canvas(table: HTMLElement, p0: { scale: number; useCORS: boolean; }): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    try {
      import('html2canvas').then((html2canvas) => {
        html2canvas.default(table).then((canvas) => {
          resolve(canvas);
        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

