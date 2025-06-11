import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { DataService } from '../../services/DataService';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fileupload',
  imports: [
    FormsModule,
    BrowserModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './fileupload.component.html',
  styleUrl: './fileupload.component.scss'
})
export class FileuploadComponent {

  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  successMessage = '';
  errorMessage = '';
  isUploading = false;


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
  
    const formData = new FormData();
    formData.append('file', this.selectedFile);
  
    this.dataService.bulkUpload(formData).subscribe({
      next: (response: any) => {
        this.successMessage = response.message; // Access the 'message' property
        this.errorMessage = ''; // Clear error message
      },
      error: (error: any) => {
        this.errorMessage =  "File upload failed. Please try again."; // Handle error message
        this.successMessage = ''; // Clear success message
      }
    });
  }

}
