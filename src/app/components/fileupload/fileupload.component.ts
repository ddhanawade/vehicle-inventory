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

    // Normalize CSV (uppercase MAKE/MODEL/LOCATION) when applicable
    this.normalizeCsvFile(selectedFile)
      .then((normalizedFile) => {
        const formData = new FormData();
        formData.append('file', normalizedFile);

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
              this.extractErrorMessageAsync(error)
                .then((msg) => {
                  this.fleetErrorMessage = msg || 'Fleet data upload failed. Please try again.';
                })
                .catch(() => {
                  this.fleetErrorMessage = 'Fleet data upload failed. Please try again.';
                });
              this.fleetSuccessMessage = null;
              console.error('Fleet upload error:', error);
            }
          });
        } else {
          // Use test vehicles upload API
          this.uploadTestVehicles(formData);
        }
      })
      .catch((err) => {
        console.warn('CSV normalization skipped due to error:', err);
        const fallbackForm = new FormData();
        fallbackForm.append('file', selectedFile as File);
        if (type === 'fleet') {
          this.dataService.bulkUpload(fallbackForm).subscribe({
            next: (response: any) => {
              this.fleetIsLoading = false;
              this.fleetSuccessMessage = response.message || 'Fleet data uploaded successfully!';
              this.fleetErrorMessage = null;
            },
            error: (error: any) => {
              this.fleetIsLoading = false;
              this.extractErrorMessageAsync(error)
                .then((msg) => {
                  this.fleetErrorMessage = msg || 'Fleet data upload failed. Please try again.';
                })
                .catch(() => {
                  this.fleetErrorMessage = 'Fleet data upload failed. Please try again.';
                });
              this.fleetSuccessMessage = null;
              console.error('Fleet upload error:', error);
            }
          });
        } else {
          this.uploadTestVehicles(fallbackForm);
        }
      });
  }

  // Safely normalize CSV by uppercasing specific columns before upload
  private async normalizeCsvFile(file: File): Promise<File> {
    try {
      const name = file.name || '';
      const ext = name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv') {
        return file; // Only normalize CSV; pass others through (xlsx/xls)
      }

      const text = await this.readFileAsText(file);
      const eol = text.includes('\r\n') ? '\r\n' : '\n';
      const lines = text.split(/\r?\n/).filter(l => l.length > 0);
      if (lines.length === 0) return file;

      const headerRaw = lines[0];
      const headers = this.parseCsvLine(headerRaw).map(h => h.replace(/^[\"]|[\"]$/g, '').trim());
      const indexByLower: Record<string, number> = {};
      headers.forEach((h, i) => indexByLower[h.toLowerCase()] = i);

      const makeIdx = indexByLower['make'];
      const modelIdx = indexByLower['model'];
      const locationIdx = indexByLower['location'];

      const out: string[] = [];
      // Preserve original header exactly to avoid backend header mismatches
      out.push(headerRaw);

      for (let i = 1; i < lines.length; i++) {
        const rowVals = this.parseCsvLine(lines[i]);
        const nextVals = [...rowVals];
        if (makeIdx !== undefined && nextVals[makeIdx] !== undefined) nextVals[makeIdx] = (nextVals[makeIdx] || '').toString().toUpperCase().trim();
        if (modelIdx !== undefined && nextVals[modelIdx] !== undefined) nextVals[modelIdx] = (nextVals[modelIdx] || '').toString().toUpperCase().trim();
        if (locationIdx !== undefined && nextVals[locationIdx] !== undefined) nextVals[locationIdx] = (nextVals[locationIdx] || '').toString().toUpperCase().trim();

        const serialized = nextVals.map(v => this.escapeCsv(v ?? ''));
        out.push(serialized.join(','));
      }

      const normalized = out.join(eol);
      return new File([normalized], name, { type: 'text/csv' });
    } catch (e) {
      // On any parsing error, fall back to original file
      return file;
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        // toggle quote mode unless it's an escaped quote
        if (inQuotes && line[i + 1] === '"') {
          currentValue += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    return values;
  }

  private escapeCsv(value: string): string {
    if (/[",\n]/.test(value)) {
      // escape quotes and wrap in quotes
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }

  // Test vehicles upload method (placeholder for future API implementation)
  uploadTestVehicles(formData: FormData): void {
    console.log("uploadTestVehicles" + JSON.stringify(formData));
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

  private async extractErrorMessageAsync(error: any): Promise<string> {
    try {
      if (!error) return '';

      // If backend returned a Blob (e.g., text/plain), read it
      if (error?.error instanceof Blob) {
        const text = await error.error.text();
        const parsed = this.tryParseJson(text);
        if (parsed) {
          return this.buildMessageFromBody(parsed);
        }
        const dupFromText = this.tryExtractDuplicatesFromText(text);
        if (dupFromText) return dupFromText;
        return text || '';
      }

      // If error.error is a string (plain text or JSON string)
      if (typeof error?.error === 'string') {
        const str = error.error;
        const parsed = this.tryParseJson(str);
        if (parsed) {
          return this.buildMessageFromBody(parsed);
        }
        const dupFromText = this.tryExtractDuplicatesFromText(str);
        if (dupFromText) return dupFromText;
        return str;
      }

      // If error.error is already an object/array
      if (error?.error && typeof error.error === 'object') {
        // Check common nested fields that may contain text
        const nestedText: string | undefined = (error.error as any)?.text;
        if (typeof nestedText === 'string' && nestedText.trim().length > 0) {
          const parsed = this.tryParseJson(nestedText);
          if (parsed) return this.buildMessageFromBody(parsed);
          const dupFromText = this.tryExtractDuplicatesFromText(nestedText);
          if (dupFromText) return dupFromText;
          return nestedText;
        }

        const nestedBody: any = (error.error as any)?.body;
        if (nestedBody) {
          if (typeof nestedBody === 'string') {
            const parsed = this.tryParseJson(nestedBody);
            if (parsed) return this.buildMessageFromBody(parsed);
            const dupFromText = this.tryExtractDuplicatesFromText(nestedBody);
            if (dupFromText) return dupFromText;
            return nestedBody;
          }
          if (typeof nestedBody === 'object') {
            const msg = this.buildMessageFromBody(nestedBody);
            if (msg) return msg;
          }
        }

        return this.buildMessageFromBody(error.error);
      }

      // Fall back to top-level message
      if (typeof error?.message === 'string') {
        const dupFromText = this.tryExtractDuplicatesFromText(error.message);
        if (dupFromText) return dupFromText;
        return error.message;
      }

      // As a fallback, use status code text if available
      if (typeof error?.status === 'number') {
        return `Request failed with status ${error.status}${error.statusText ? ' - ' + error.statusText : ''}`;
      }
      return '';
    } catch {
      return '';
    }
  }

  private tryParseJson(text: string): any | null {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  private buildMessageFromBody(body: any): string {
    try {
      // If body is an array, use the first element
      const obj = Array.isArray(body) ? (body[0] ?? {}) : body;

      // Common shapes from backend
      const duplicates: string[] | undefined = obj?.duplicates;
      const messageField: string | undefined = obj?.message;
      const errorField: string | undefined = obj?.error;

      if (Array.isArray(duplicates) && duplicates.length > 0) {
        const prefix = (messageField || errorField || 'Duplicate chassis numbers found').replace(/[:.]?$/,'');
        return `${prefix}: ${duplicates.join(', ')}`;
      }

      if (typeof messageField === 'string' && messageField.trim().length > 0) return messageField;
      if (typeof errorField === 'string' && errorField.trim().length > 0) return errorField;

      // As a last resort, stringify compactly (avoid huge dumps)
      const json = JSON.stringify(obj);
      const dupText = this.tryExtractDuplicatesFromText(json);
      if (dupText) return dupText;
      return json;
    } catch {
      return '';
    }
  }

  private tryExtractDuplicatesFromText(text: string): string | null {
    if (!text) return null;
    const match = text.match(/duplicates=\[([^\]]+)\]/i) || text.match(/"duplicates"\s*:\s*\[([^\]]+)\]/i);
    if (match && match[1]) {
      const list = match[1]
        .replace(/\"/g, '"')
        .split(/\s*,\s*/)
        .map(s => s.replace(/^\"|\"$/g, '').trim())
        .filter(s => s.length > 0);
      if (list.length > 0) {
        return `Duplicate chassis numbers found: ${list.join(', ')}`;
      }
    }
    if (/duplicate\s+chassis/i.test(text)) {
      return 'Duplicate chassis numbers found';
    }
    return null;
  }
}
