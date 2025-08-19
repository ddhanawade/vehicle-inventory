import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  rowErrors: { row: number, errors: string[] }[];
}

export interface FleetRecord {
  [key: string]: string | undefined;
  invoiceDate?: string;
  invoiceNumber?: string;
  purchaseDealer?: string;
  receivedDate?: string;
  manufactureDate?: string;
  make?: string;
  model?: string;
  grade?: string;
  fuelType?: string;
  suffix?: string;
  exteriorColor?: string;
  interiorColor?: string;
  chassisNumber?: string;
  engineNumber?: string;
  keyNumber?: string;
  location?: string;
  invoiceValue?: string;
  age?: string;
  interest?: string;
  vehicleStatus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileValidationService {

  // Required columns - order is flexible, any order is acceptable
  private requiredColumns = [
    'receivedDate', 'manufactureDate', 'model', 'grade', 'fuelType', 'suffix',
    'exteriorColor', 'interiorColor', 'chassisNumber', 'engineNumber', 
    'keyNumber', 'location', 'invoiceValue', 'age', 'interest', 'vehicleStatus', 'make'
  ];

  // Optional columns that may be present in full fleet uploads
  private optionalColumns = [
    'invoiceDate', 'invoiceNumber', 'purchaseDealer'
  ];

  private validVehicleStatuses = [
    'TRANSIT', 'STOCK', 'AVAILABLE', 'SOLD', 'BILLED', 'WATER', 'FRESH', 'FREE'
  ]; // Values expected in uppercase
  private maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  constructor() {}

  async validateFile(file: File): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: '',
      rowErrors: []
    };

    try {
      // Basic file validations
      this.validateFileBasics(file, result);
      
      if (result.errors.length > 0) {
        result.isValid = false;
        result.summary = 'File validation failed. Please fix the errors and try again.';
        return result;
      }

      // Parse and validate CSV content
      const csvData = await this.parseCSV(file);
      this.validateCSVStructure(csvData, result);
      this.validateCSVContent(csvData, result);

      // Generate summary
      this.generateSummary(result, csvData.length);

    } catch (error) {
      result.isValid = false;
      result.errors.push('Failed to process file. Please ensure it\'s a valid CSV file.');
      result.summary = 'File processing failed.';
    }

    return result;
  }

  private validateFileBasics(file: File, result: ValidationResult): void {
    // File size validation
    if (file.size > this.maxFileSize) {
      result.errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of 10MB.`);
    }

    // File type validation
    if (!file.name.toLowerCase().endsWith('.csv')) {
      result.errors.push('File must be a CSV format (.csv extension required).');
    }

    // File name validation
    if (file.name.length > 100) {
      result.warnings.push('File name is very long. Consider using a shorter name.');
    }
  }

  private async parseCSV(file: File): Promise<FleetRecord[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const lines = csvText.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('File is empty'));
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const records: FleetRecord[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const record: FleetRecord = {};
            
            headers.forEach((header, index) => {
              record[header] = values[index] || '';
            });
            
            records.push(record);
          }

          resolve(records);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
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

  private validateCSVStructure(records: FleetRecord[], result: ValidationResult): void {
    if (records.length === 0) {
      result.errors.push('CSV file contains no data rows.');
      return;
    }

    // Get headers from first record
    const headers = Object.keys(records[0]);
    
    // Check for required columns
    const missingColumns = this.requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      result.errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Check for extra columns (but allow optional columns)
    const allAllowedColumns = [...this.requiredColumns, ...this.optionalColumns];
    const extraColumns = headers.filter(col => !allAllowedColumns.includes(col));
    if (extraColumns.length > 0) {
      result.warnings.push(`Extra columns found (will be ignored): ${extraColumns.join(', ')}`);
    }

    // Column order validation removed - any order is acceptable
    // Note: Column order is flexible and doesn't need to match template exactly
  }

  private validateCSVContent(records: FleetRecord[], result: ValidationResult): void {
    records.forEach((record, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
      const rowErrors: string[] = [];

      // Validate required fields (skip optional columns for basic template)
      this.requiredColumns.forEach(column => {
        if (!record[column] || record[column].trim() === '') {
          rowErrors.push(`${column} is required but empty`);
        }
      });

      // Validate optional fields if they exist
      this.optionalColumns.forEach(column => {
        if (record[column] && record[column].trim() === '') {
          rowErrors.push(`${column} should not be empty if included`);
        }
      });

      // Validate vehicle status
      if (record.vehicleStatus && !this.validVehicleStatuses.includes(record.vehicleStatus.toUpperCase())) {
        rowErrors.push(`Invalid vehicle status "${record.vehicleStatus}". Must be one of: ${this.validVehicleStatuses.join(', ')}`);
      }

      // Validate date formats
      this.validateDateField(record.receivedDate, 'receivedDate', rowErrors);
      this.validateDateField(record.manufactureDate, 'manufactureDate', rowErrors);
      
      // Validate optional date fields if present
      if (record.invoiceDate) {
        this.validateDateField(record.invoiceDate, 'invoiceDate', rowErrors);
      }

      // Validate numeric fields
      this.validateNumericField(record.invoiceValue, 'invoiceValue', rowErrors);
      this.validateNumericField(record.age, 'age', rowErrors);
      this.validateNumericField(record.interest, 'interest', rowErrors);

      // Validate specific field formats
      this.validateChassisNumber(record.chassisNumber, rowErrors);
      this.validateEngineNumber(record.engineNumber, rowErrors);

      if (rowErrors.length > 0) {
        result.rowErrors.push({ row: rowNumber, errors: rowErrors });
        result.isValid = false;
      }
    });

    // Add summary errors
    if (result.rowErrors.length > 0) {
      result.errors.push(`${result.rowErrors.length} rows have validation errors.`);
    }
  }

  private validateDateField(dateValue: string | undefined, fieldName: string, rowErrors: string[]): void {
    if (!dateValue) return;

    // Check DD/MM/YY format
    const dateRegex = /^\d{2}\/\d{2}\/\d{2}$/;
    if (!dateRegex.test(dateValue)) {
      rowErrors.push(`${fieldName} must be in DD/MM/YY format (e.g., 25/12/23)`);
      return;
    }

    // Validate date parts
    const [day, month, year] = dateValue.split('/').map(Number);
    
    if (day < 1 || day > 31) {
      rowErrors.push(`${fieldName} has invalid day: ${day}`);
    }
    
    if (month < 1 || month > 12) {
      rowErrors.push(`${fieldName} has invalid month: ${month}`);
    }

    // Check if date is reasonable (not too far in future)
    const fullYear = year < 50 ? 2000 + year : 1900 + year; // Assume 00-49 is 2000s, 50-99 is 1900s
    const currentYear = new Date().getFullYear();
    
    if (fullYear > currentYear + 1) {
      rowErrors.push(`${fieldName} year ${fullYear} seems too far in the future`);
    }
  }

  private validateNumericField(value: string | undefined, fieldName: string, rowErrors: string[]): void {
    if (!value) return;

    if (isNaN(Number(value))) {
      rowErrors.push(`${fieldName} must be a valid number`);
    } else if (Number(value) < 0) {
      rowErrors.push(`${fieldName} cannot be negative`);
    }
  }

  private validateChassisNumber(chassisNumber: string | undefined, rowErrors: string[]): void {
    if (!chassisNumber) return;

    // Chassis number should be alphanumeric and typically 17 characters for VIN
    if (chassisNumber.length < 10) {
      rowErrors.push('Chassis number seems too short (should be at least 10 characters)');
    }
    
    if (!/^[A-Z0-9]+$/i.test(chassisNumber)) {
      rowErrors.push('Chassis number should contain only letters and numbers');
    }
  }

  private validateEngineNumber(engineNumber: string | undefined, rowErrors: string[]): void {
    if (!engineNumber) return;

    if (engineNumber.length < 5) {
      rowErrors.push('Engine number seems too short');
    }
    
    if (!/^[A-Z0-9]+$/i.test(engineNumber)) {
      rowErrors.push('Engine number should contain only letters and numbers');
    }
  }

  private generateSummary(result: ValidationResult, totalRows: number): void {
    if (result.isValid) {
      result.summary = `✅ File validation successful! ${totalRows} records are ready for upload.`;
    } else {
      const errorCount = result.errors.length;
      const rowErrorCount = result.rowErrors.length;
      result.summary = `❌ File validation failed. ${errorCount} file errors and ${rowErrorCount} row errors found. Please fix these issues and try again.`;
    }

    if (result.warnings.length > 0) {
      result.summary += ` Note: ${result.warnings.length} warnings to review.`;
    }
  }

  // Helper method to format validation results for chatbot display
  formatValidationForChat(result: ValidationResult): string {
    let message = result.summary + '\n\n';

    if (result.errors.length > 0) {
      message += '🚨 **Errors to Fix:**\n';
      result.errors.forEach(error => {
        message += `• ${error}\n`;
      });
      message += '\n';
    }

    if (result.rowErrors.length > 0 && result.rowErrors.length <= 10) {
      message += '📝 **Row-specific Issues:**\n';
      result.rowErrors.forEach(rowError => {
        message += `Row ${rowError.row}:\n`;
        rowError.errors.forEach(error => {
          message += `  • ${error}\n`;
        });
      });
      message += '\n';
    } else if (result.rowErrors.length > 10) {
      message += `📝 **Row Issues:** Found errors in ${result.rowErrors.length} rows. First 5 shown:\n`;
      result.rowErrors.slice(0, 5).forEach(rowError => {
        message += `Row ${rowError.row}: ${rowError.errors[0]}\n`;
      });
      message += `... and ${result.rowErrors.length - 5} more rows with issues.\n\n`;
    }

    if (result.warnings.length > 0) {
      message += '⚠️ **Warnings:**\n';
      result.warnings.forEach(warning => {
        message += `• ${warning}\n`;
      });
      message += '\n';
    }

    if (result.isValid) {
      message += '🎉 **Your file is ready for upload!** You can proceed with the fleet upload on the main dashboard.';
    } else {
      message += '💡 **Next Steps:**\n';
      message += '1. Download the correct template from the File Upload page\n';
      message += '2. Fix the errors mentioned above\n';
      message += '3. Ensure dates are in DD/MM/YY format\n';
      message += '4. Verify vehicle status values: Transit, Stock, Available, Sold, Billed, Water, Fresh, Free\n';
      message += '5. Column order is flexible - arrange them as needed\n';
      message += '6. Upload the corrected file again for validation';
    }

    return message;
  }
} 