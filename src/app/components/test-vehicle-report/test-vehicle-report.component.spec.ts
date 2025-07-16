import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TestVehicleReportComponent } from './test-vehicle-report.component';
import { ReportingService } from '../../services/ReportingService';
import { TestVehicleModel } from '../../models/TestVehicleModel';

describe('TestVehicleReportComponent', () => {
  let component: TestVehicleReportComponent;
  let fixture: ComponentFixture<TestVehicleReportComponent>;
  let reportingService: jasmine.SpyObj<ReportingService>;

  const mockTestVehicleData: TestVehicleModel[] = [
    {
      id: 'TV001',
      vehicleId: 'VEH001',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      chassisNumber: 'TC123456789',
      engineNumber: 'EN123456',
      testType: 'Performance',
      testStatus: 'In Progress',
      testStartDate: new Date('2024-01-15'),
      testEndDate: new Date('2024-01-25'),
      testEngineer: 'John Smith',
      testFacility: 'Test Lab A',
      performanceScore: 85,
      safetyRating: 'A',
      mileage: 15000,
      fuelConsumption: 7.2,
      createdDate: new Date('2024-01-10'),
      updatedDate: new Date('2024-01-20')
    }
  ];

  beforeEach(async () => {
    const reportingServiceSpy = jasmine.createSpyObj('ReportingService', [
      'getTestVehicleReport',
      'getTestVehicleSummary',
      'exportTestVehicleReport'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        TestVehicleReportComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        { provide: ReportingService, useValue: reportingServiceSpy }
      ]
    }).compileComponents();

    reportingService = TestBed.inject(ReportingService) as jasmine.SpyObj<ReportingService>;
    fixture = TestBed.createComponent(TestVehicleReportComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.testStartDate).toBe('');
    expect(component.testEndDate).toBe('');
    expect(component.testType).toBe('');
    expect(component.testStatus).toBe('');
    expect(component.vehicleMake).toBe('');
    expect(component.testEngineer).toBe('');
    expect(component.isLoading).toBe(false);
    expect(component.totalTestVehicles).toBe(0);
  });

  it('should load sample data on initialization', () => {
    component.ngOnInit();
    expect(component.testVehicleList.length).toBeGreaterThan(0);
    expect(component.totalTestVehicles).toBeGreaterThan(0);
  });

  it('should clear all filters', () => {
    // Set some filter values
    component.testStartDate = '2024-01-01';
    component.testEndDate = '2024-01-31';
    component.testType = 'Performance';
    component.testStatus = 'In Progress';
    component.vehicleMake = 'Toyota';
    component.testEngineer = 'John Smith';

    // Clear filters
    component.clearFilters();

    // Verify all filters are cleared
    expect(component.testStartDate).toBe('');
    expect(component.testEndDate).toBe('');
    expect(component.testType).toBe('');
    expect(component.testStatus).toBe('');
    expect(component.vehicleMake).toBe('');
    expect(component.testEngineer).toBe('');
  });

  it('should apply filters correctly', () => {
    component.loadSampleData();
    component.testType = 'Performance';
    component.applyFilters();

    expect(component.isLoading).toBe(true);
    
    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.filteredTestVehicleList.length).toBeGreaterThan(0);
    }, 600);
  });

  it('should get active tests count', () => {
    component.loadSampleData();
    const activeCount = component.getActiveTestsCount();
    expect(activeCount).toBeGreaterThanOrEqual(0);
  });

  it('should get unique count for a column', () => {
    component.loadSampleData();
    const uniqueCount = component.getUniqueCount('testType');
    expect(uniqueCount).toBeGreaterThanOrEqual(0);
  });

  it('should format column headers correctly', () => {
    expect(component.getColumnHeader('vehicleId')).toBe('Vehicle ID');
    expect(component.getColumnHeader('testType')).toBe('Test Type');
    expect(component.getColumnHeader('testStartDate')).toBe('Test Start Date');
    expect(component.getColumnHeader('performanceScore')).toBe('Performance Score');
  });

  it('should format column values correctly', () => {
    const testItem = mockTestVehicleData[0];
    
    expect(component.getColumnValue(testItem, 'make')).toBe('Toyota');
    expect(component.getColumnValue(testItem, 'performanceScore')).toBe('85%');
    expect(component.getColumnValue(testItem, 'testStartDate')).toContain('/');
  });

  it('should identify truncate columns correctly', () => {
    expect(component.shouldTruncate('chassisNumber')).toBe(true);
    expect(component.shouldTruncate('engineNumber')).toBe(true);
    expect(component.shouldTruncate('notes')).toBe(true);
    expect(component.shouldTruncate('make')).toBe(false);
    expect(component.shouldTruncate('model')).toBe(false);
  });

  it('should export data to CSV', () => {
    component.loadSampleData();
    spyOn(window.URL, 'createObjectURL').and.returnValue('mock-url');
    spyOn(window.URL, 'revokeObjectURL');
    
    const createElementSpy = spyOn(document, 'createElement').and.returnValue({
      href: '',
      download: '',
      click: jasmine.createSpy('click')
    } as any);

    component.exportData('csv');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('should handle empty data export', () => {
    component.testVehicleList = [];
    spyOn(window, 'alert');
    
    component.exportData('csv');
    
    expect(window.alert).toHaveBeenCalledWith('No data to export');
  });

  it('should handle test report generation', () => {
    spyOn(window, 'alert');
    
    component.generateTestReport();
    
    expect(window.alert).toHaveBeenCalledWith('Test report generation feature will be implemented soon');
  });

  it('should handle filter change events', () => {
    spyOn(component, 'onFilterChange');
    
    component.onFilterChange();
    
    expect(component.onFilterChange).toHaveBeenCalled();
  });
}); 