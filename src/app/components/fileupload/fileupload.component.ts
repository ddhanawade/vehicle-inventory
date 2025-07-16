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

  // Tab management
  activeTab: 'fleet' | 'test' = 'fleet';

  // Fleet data upload properties
  fleetSelectedFile: File | null = null;
  fleetSelectedFileName: string | null = null;
  fleetSuccessMessage: string | null = null;
  fleetErrorMessage: string | null = null;
  fleetIsLoading: boolean = false;
  fleetDragOver: boolean = false;

  // Test vehicles upload properties
  testSelectedFile: File | null = null;
  testSelectedFileName: string | null = null;
  testSuccessMessage: string | null = null;
  testErrorMessage: string | null = null;
  testIsLoading: boolean = false;
  testDragOver: boolean = false;

  // Legacy properties for backward compatibility
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isUploading = false;
  isLoading: boolean = false;

  constructor(private http: HttpClient, private dataService: DataService) {}

  // Tab switching functionality
  switchTab(tab: 'fleet' | 'test'): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  // File selection handler
  onFileSelected(event: Event, type: 'fleet' | 'test'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (type === 'fleet') {
        this.fleetSelectedFile = file;
        this.fleetSelectedFileName = file.name;
        this.fleetErrorMessage = null;
        this.fleetSuccessMessage = null;
      } else {
        this.testSelectedFile = file;
        this.testSelectedFileName = file.name;
        this.testErrorMessage = null;
        this.testSuccessMessage = null;
      }
    } else {
      if (type === 'fleet') {
        this.fleetSelectedFile = null;
        this.fleetSelectedFileName = null;
      } else {
        this.testSelectedFile = null;
        this.testSelectedFileName = null;
      }
    }
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent, type: 'fleet' | 'test'): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (type === 'fleet') {
      this.fleetDragOver = true;
    } else {
      this.testDragOver = true;
    }
  }

  onDragLeave(type: 'fleet' | 'test'): void {
    if (type === 'fleet') {
      this.fleetDragOver = false;
    } else {
      this.testDragOver = false;
    }
  }

  onDrop(event: DragEvent, type: 'fleet' | 'test'): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (type === 'fleet') {
      this.fleetDragOver = false;
    } else {
      this.testDragOver = false;
    }

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file type
      const allowedTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        if (type === 'fleet') {
          this.fleetSelectedFile = file;
          this.fleetSelectedFileName = file.name;
          this.fleetErrorMessage = null;
          this.fleetSuccessMessage = null;
        } else {
          this.testSelectedFile = file;
          this.testSelectedFileName = file.name;
          this.testErrorMessage = null;
          this.testSuccessMessage = null;
        }
      } else {
        if (type === 'fleet') {
          this.fleetErrorMessage = 'Please select a valid file type (CSV, XLSX, XLS)';
        } else {
          this.testErrorMessage = 'Please select a valid file type (CSV, XLSX, XLS)';
        }
      }
    }
  }

  // File upload handler
  uploadFile(type: 'fleet' | 'test'): void {
    let selectedFile: File | null;
    
    if (type === 'fleet') {
      selectedFile = this.fleetSelectedFile;
      if (!selectedFile) {
        this.fleetErrorMessage = "Please select a file before uploading.";
        this.fleetSuccessMessage = null;
        return;
      }
      this.fleetIsLoading = true;
      this.fleetSuccessMessage = null;
      this.fleetErrorMessage = null;
    } else {
      selectedFile = this.testSelectedFile;
      if (!selectedFile) {
        this.testErrorMessage = "Please select a file before uploading.";
        this.testSuccessMessage = null;
        return;
      }
      this.testIsLoading = true;
      this.testSuccessMessage = null;
      this.testErrorMessage = null;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    if (type === 'fleet') {
      // Use existing fleet data upload API
      this.dataService.bulkUpload(formData).subscribe({
        next: (response: any) => {
          this.fleetIsLoading = false;
          this.fleetSuccessMessage = response.message || 'Fleet data uploaded successfully!';
          this.fleetErrorMessage = null;
        },
        error: (error: any) => {
          this.fleetIsLoading = false;
          this.fleetErrorMessage = "Fleet data upload failed. Please try again.";
          this.fleetSuccessMessage = null;
          console.error('Fleet upload error:', error);
        }
      });
    } else {
      // Use test vehicles upload API (you'll need to implement this in DataService)
      this.uploadTestVehicles(formData);
    }
  }

  // Test vehicles upload method (placeholder for future API implementation)
  uploadTestVehicles(formData: FormData): void {
    // TODO: Implement test vehicles API call in DataService
    // For now, simulate the upload
    setTimeout(() => {
      this.testIsLoading = false;
      this.testSuccessMessage = 'Test vehicle data uploaded successfully! (Simulated)';
      this.testErrorMessage = null;
    }, 2000);

    
    this.dataService.uploadTestVehicles(formData).subscribe({
      next: (response: any) => {
        this.testIsLoading = false;
        this.testSuccessMessage = response.message || 'Test vehicle data uploaded successfully!';
        this.testErrorMessage = null;
      },
      error: (error: any) => {
        this.testIsLoading = false;
        this.testErrorMessage = "Test vehicle upload failed. Please try again.";
        this.testSuccessMessage = null;
        console.error('Test upload error:', error);
      }
    });
  }

  // Template download handler
  downloadTemplate(type: 'fleet' | 'test'): void {
    const link = document.createElement('a');
    
    if (type === 'fleet') {
      link.href = 'assets/Demo_File_Fleet_Manager.csv';
      link.download = 'Demo_File_Fleet_Manager.csv';
    } else {
      // TODO: Add test vehicle template file
      link.href = 'assets/Demo_File_Test_Vehicles.csv';
      link.download = 'Demo_File_Test_Vehicles.csv';
    }
    
    link.click();
  }

  // Remove selected file
  removeFile(type: 'fleet' | 'test'): void {
    if (type === 'fleet') {
      this.fleetSelectedFile = null;
      this.fleetSelectedFileName = null;
      this.fleetErrorMessage = null;
      this.fleetSuccessMessage = null;
    } else {
      this.testSelectedFile = null;
      this.testSelectedFileName = null;
      this.testErrorMessage = null;
      this.testSuccessMessage = null;
    }
  }

  // Get file size in human readable format
  getFileSize(file: File | null): string {
    if (!file) return '';
    
    const bytes = file.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Clear all messages
  clearMessages(): void {
    this.fleetSuccessMessage = null;
    this.fleetErrorMessage = null;
    this.testSuccessMessage = null;
    this.testErrorMessage = null;
  }

  // Legacy method for backward compatibility
  onFileSelected_Legacy(event: Event): void {
    this.onFileSelected(event, 'fleet');
  }

  // Legacy method for backward compatibility
  uploadFile_Legacy(): void {
    this.uploadFile('fleet');
  }

  // Legacy method for backward compatibility
  downloadTemplate_Legacy(): void {
    this.downloadTemplate('fleet');
  }
}
