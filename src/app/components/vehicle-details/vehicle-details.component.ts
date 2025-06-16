import { ChangeDetectorRef, Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { VehicleModel } from '../../models/VehicleModel';
import { DataService } from '../../services/DataService';
import { CommonModule, DatePipe } from '@angular/common';
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


  dataSource!: MatTableDataSource<VehicleModel>;
  isLoading = false;
  totalVehicles = 0;
  isLoad: boolean = false;
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
    'invoiceValue',
    'age',
    'interest',
    'vehicleStatus',
    'make',
    'customerName',
    'orderDate',
    'deliveryDate',
    'orderStatus',
    'actions'
  ];

  carDetailsList: VehicleModel[] = [];
  filteredCarDetailsList: VehicleModel[] = [];
  filters: { [key: string]: string } = {};
  activeFilter: string | null = null;
  successMessage: string = '';

  constructor(private route: ActivatedRoute, private vehicleService: DataService, private cdr: ChangeDetectorRef, private dialog: MatDialog,
    private orderService: OrderService, private renderer: Renderer2
  ) {

  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.cdr.detectChanges();
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const modelName = params.get('modelName');
      if (modelName) {
        this.isLoading = true;
        this.getCarDetails(modelName);
      }
    });
  }

  editVehicle(vehicle: any): void {
    console.log("Editing vehicle:", JSON.stringify(vehicle));
    const dialogRef = this.dialog.open(EditVehicleDialogComponent, {
      width: '600px',
      data: { ...vehicle }
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

  updateVehicle(vehicle: any): void {
    // Map vehicle object to replace vehicleId with id
     // invoiceDate: this.formatDate(new Date(vehicle.invoiceDate)); // Format the startDate
     // receivedDate: this.formatDate(new Date(vehicle.receivedDate));   // Format the endDate

      const updatedVehicle = { ...vehicle, id: vehicle.vehicleId, invoiceDate: this.formatDate(new Date(vehicle.invoiceDate)),  receivedDate: this.formatDate(new Date(vehicle.receivedDate)) };
      delete updatedVehicle.vehicleId; // Remove vehicleId if not needed
  
    console.log("Update vehicle:", JSON.stringify(updatedVehicle));
    const dialogRef = this.dialog.open(UpdateVehicleComponent, {
      width: '80%', // Adjust width for responsiveness
      maxWidth: '600px', // Set a maximum width
      height: 'auto', // Adjust height dynamically
      data: { ...updatedVehicle }
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

  exportToPDF() {
    const table = document.querySelector('table') as HTMLElement;
  
    if (!table) {
      console.error('Table element not found');
      return;
    }
  
    // Save original styles for excluded columns
    const excludedColumns = table.querySelectorAll('.Actions');
    const originalDisplayStyles: string[] = [];
    excludedColumns.forEach((col) => {
      originalDisplayStyles.push((col as HTMLElement).style.display);
      (col as HTMLElement).style.display = 'none'; // Hide the column
    });
  
    html2canvas(table, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight);
      pdf.save('vehicle-data.pdf');
  
      // Restore original styles for excluded columns
      excludedColumns.forEach((col, index) => {
        (col as HTMLElement).style.display = originalDisplayStyles[index];
      });
    }).catch((error) => {
      console.error('Error generating PDF:', error);
  
      // Restore original styles in case of error
      excludedColumns.forEach((col, index) => {
        (col as HTMLElement).style.display = originalDisplayStyles[index];
      });
    });
  }

  exportToExcel() {
    const table = document.querySelector('.responsive-table') as HTMLElement;
    const worksheet = XLSX.utils.table_to_sheet(table);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Details');
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
        this.carDetailsList = result;
        console.log("V det " + JSON.stringify(this.carDetailsList));
        this.dataSource = new MatTableDataSource<VehicleModel>(this.carDetailsList);
  
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
        this.isLoad = false; // Start loading
        this.cdr.detectChanges(); // Trigger change detection
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
      }
    });
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
    console.log("deleting vehicle " + JSON.stringify(vehicle))
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    id : vehicle.vehicleId;
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
        console.log(`Entry deleted:`, vehicle.id);
      } else {
        console.log('Delete operation canceled.');
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

