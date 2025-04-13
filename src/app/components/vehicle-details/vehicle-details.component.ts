import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { VehicleModel } from '../../models/VehicleModel';
import { DataService } from '../../services/DataService';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vehicle-details',
  imports: [CommonModule,DatePipe],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.css'
})
export class VehicleDetailsComponent implements OnInit{

  carDetailsList: VehicleModel[] = [];
  filteredCarDetailsList: VehicleModel[] = [];
  filters: { [key: string]: string } = {};
  activeFilter: string | null = null;

  constructor(private route: ActivatedRoute, private vehicleService: DataService, private cdr: ChangeDetectorRef){
    
  }

  ngOnInit(): void {
    // Retrieve the parameter from the route
    this.route.paramMap.subscribe((params) => {
      const modelName = params.get('modelName');
      if (modelName) {
        this.getCarDetails(modelName);
      }
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
    this.vehicleService.getData().subscribe((result: VehicleModel[]) => {
      this.carDetailsList = result.filter((item) => item.model === modelName);
      console.log('Filtered car details list:', this.carDetailsList);
    });
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

