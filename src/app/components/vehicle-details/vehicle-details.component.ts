import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
    MatInputModule
  ],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss'
})
export class VehicleDetailsComponent implements OnInit{
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  

  dataSource!: MatTableDataSource<VehicleModel>;
  isLoading = false;
  totalVehicles = 0;

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

  carDetailsList: VehicleModel[] = [];
  filteredCarDetailsList: VehicleModel[] = [];
  filters: { [key: string]: string } = {};
  activeFilter: string | null = null;

  constructor(private route: ActivatedRoute, private vehicleService: DataService, private cdr: ChangeDetectorRef,  private dialog: MatDialog,
    private orderService: OrderService
  ){
    
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

  // editVehicle(vehicle: any): void {
  //   this.orderService.getOrdersByVehicleId(vehicle.vehicleId).subscribe(orderData => {
  //     console.log("dddd " + JSON.stringify(vehicle))
  //     const dialogRef = this.dialog.open(EditVehicleDialogComponent, {
  //       width: '600px',
  //       data: orderData // Pass the fetched data to the dialog
  //     });
    
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       // Update the vehicle in your data source
  //       const index = this.dataSource.data.findIndex(item => item.id === result.id);
  //       if (index > -1) {
  //         this.dataSource.data[index] = result;
  //         this.dataSource._updateChangeSubscription(); // Refresh the table
  //       }
  //     }
  //   });
  // }

  editVehicle(vehicle: any): void {
    this.orderService.getOrdersByVehicleId(vehicle.id).subscribe(vehicleData => {
      const dialogRef = this.dialog.open(EditVehicleDialogComponent, {
        width: '600px',
        data: vehicleData // Pass the fetched data to the dialog
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Updated Vehicle Data:', result);
          // Handle the updated data here
        }
      });
    });
  }

  exportToPDF() {
    const doc = new jsPDF();
    const table = document.querySelector('.responsive-table') as HTMLElement;
  
    html2canvas(table).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Calculate height proportionally
      doc.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight); // Add image to PDF
      doc.save('vehicle-details.pdf'); // Save the PDF
    }).catch((error) => {
      console.error('Error generating PDF:', error);
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
    this.vehicleService.getData().subscribe({
      next: (result: VehicleModel[]) => {
        this.carDetailsList = result.filter((item) => item.model === modelName);
        this.dataSource = new MatTableDataSource<VehicleModel>(this.carDetailsList);
        
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
function html2canvas(table: HTMLElement): Promise<HTMLCanvasElement> {
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

