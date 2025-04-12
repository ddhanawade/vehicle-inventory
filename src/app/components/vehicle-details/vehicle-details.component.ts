import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-vehicle-details',
  imports: [],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.css'
})
export class VehicleDetailsComponent {
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

