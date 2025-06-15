import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { DataService } from '../../services/DataService';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatSpinner } from '@angular/material/progress-spinner';
import { Location } from '@angular/common';

@Component({
  selector: 'app-fileupload',
  imports: [
    FormsModule,
    BrowserModule,
    MatCardModule,
    MatIconModule,
    MatSpinner
  ],
  templateUrl: './fileupload.component.html',
  styleUrl: './fileupload.component.scss'
})
export class FileuploadComponent {
  [x: string]: any;

  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  successMessage: string | null = null;
  errorMessage: string | null = null;
  isUploading = false;
  isLoading: boolean = false;


  constructor(private http: HttpClient, private dataService : DataService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    } else {
      this.selectedFile = null;
      this.selectedFileName = null;
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.errorMessage = "Please select a file before uploading.";
      this.successMessage = ''; // Clear success message
      return;
    }
    
    this.isLoading = true; // Show spinner
    this.successMessage = null;
    this.errorMessage = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
  
    this.dataService.bulkUpload(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false; // Hide spinner
        this.successMessage = response.message; // Access the 'message' property
        this.errorMessage = ''; // Clear error message
      },
      error: (error: any) => {
        this.isLoading = false; // Hide spinner
        this.errorMessage =  "File upload failed. Please try again."; // Handle error message
        this.successMessage = ''; // Clear success message
        this['location'].reload(); // Refresh the component
      }
    });
  }

  downloadTemplate(): void {
    const link = document.createElement('a');
    link.href = 'assets/Stock_Tracker.csv'; // Path to your file
    link.download = 'Stock_Tracker.csv'; // File name for download
    link.click();
  }

}
