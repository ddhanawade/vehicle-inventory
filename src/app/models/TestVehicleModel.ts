// Test Vehicle Model Interface
export interface TestVehicleModel {
  id: string;
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  chassisNumber: string;
  engineNumber: string;
  testType: string;
  purchaseDealer: string;
  keyNumber: string;
  location: string;
  invoiceValue: number;
  status: string;
  testStatus: string;
  testStartDate: Date;
  testEndDate?: Date;
  testEngineer: string;
  testFacility: string;
  testResults?: string;
  mileage?: number;
  fuelConsumption?: number;
  emissions?: number;
  safetyRating?: string;
  performanceScore?: number;
  notes?: string;
  createdDate: Date;
  updatedDate: Date;
}

// Test Vehicle Request Interface for API calls
export interface TestVehicleRequest {
  testStartDate?: string;
  testEndDate?: string;
  testType?: string;
  testStatus?: string;
  vehicleMake?: string;
  testEngineer?: string;
}

// Test Vehicle Response Interface for API responses
export interface TestVehicleResponse {
  data: TestVehicleModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Test Type Enum
export enum TestType {
  PERFORMANCE = 'Performance',
  SAFETY = 'Safety',
  DURABILITY = 'Durability',
  EMISSIONS = 'Emissions',
  FUEL_ECONOMY = 'Fuel Economy',
  QA = 'Quality Assurance'
}

// Test Status Enum
export enum TestStatus {
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold',
  FAILED = 'Failed',
  PASSED = 'Passed',
  CANCELLED = 'Cancelled'
}

// Safety Rating Enum
export enum SafetyRating {
  A_PLUS = 'A+',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F'
}

// Test Vehicle Summary for dashboard stats
export interface TestVehicleSummary {
  totalTestVehicles: number;
  activeTests: number;
  completedTests: number;
  failedTests: number;
  averagePerformanceScore: number;
  testTypeDistribution: { [key: string]: number };
  engineerWorkload: { [key: string]: number };
} 