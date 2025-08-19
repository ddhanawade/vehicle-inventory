import { AfterViewInit, ChangeDetectorRef, Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { DataService } from '../../services/DataService';
import { VehicleModel } from '../../models/VehicleModel';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { UserModel } from '../../models/UserModel';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';

interface AgeResult {
  days: number;
  status: string;
  label: string;
}


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe, RouterLink,
    MatPaginatorModule,  MatTableModule, MatSortModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  stocksList: any;
  selectedAgeFilter: any;
  vehicleOrderDetails: any;
  isLoading: boolean = false;


  // Enhanced slider navigation method
  scrollSlider(direction: 'left' | 'right'): void {
    const slider = document.querySelector('.stats-slider') as HTMLElement;
    if (slider) {
      const scrollAmount = 280; // Width of one card plus gap
      const currentScroll = slider.scrollLeft;

      if (direction === 'left') {
        slider.scrollTo({
          left: Math.max(0, currentScroll - scrollAmount),
          behavior: 'smooth'
        });
      } else {
        slider.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }

  // Clear search functionality
  clearSearch(): void {
    this.searchTerm = '';
    this.filterStocks();
  }

  // Get current date for welcome section
  getCurrentDate(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return now.toLocaleDateString('en-US', options);
  }

  // Navigate to add vehicle functionality
  navigateToAddVehicle(): void {
    this.showPopup = true;
  }

  // Navigate to reports functionality
  navigateToReports(): void {
    this.router.navigate(['/vehicle-report']);
  }

  // Open quick menu for total vehicles
  totalMenuOpen = false;

  toggleTotalMenu(): void {
    this.totalMenuOpen = !this.totalMenuOpen;
    // When opening, set focus to first item shortly
    if (this.totalMenuOpen) {
      setTimeout(() => {
        const btn = document.querySelector<HTMLButtonElement>('.total-menu .menu-item');
        btn?.focus();
      }, 0);
    }
    // Attach one-time outside click handler
    if (this.totalMenuOpen) {
      const close = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.total-menu') && !target.closest('.stat-card')) {
          this.totalMenuOpen = false;
          document.removeEventListener('click', close);
        }
      };
      setTimeout(() => document.addEventListener('click', close), 0);
    }
  }

  onTotalMenuKeydown(event: KeyboardEvent): void {
    const items = Array.from(document.querySelectorAll<HTMLButtonElement>('.total-menu .menu-item'));
    const currentIndex = items.findIndex(el => el === document.activeElement);
    if (event.key === 'ArrowRight') {
      items[(currentIndex + 1) % items.length]?.focus();
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
      event.preventDefault();
    } else if (event.key === 'Tab') {
      // keep focus inside
      if (event.shiftKey && currentIndex === 0) {
        items[items.length - 1]?.focus();
        event.preventDefault();
      } else if (!event.shiftKey && currentIndex === items.length - 1) {
        items[0]?.focus();
        event.preventDefault();
      }
    }
  }

  private getUserMake(): 'Tata' | 'Toyota' | 'Eicher' | null {
    if (this.hasRole('TATA')) return 'Tata';
    if (this.hasRole('TOYOTA')) return 'Toyota';
    if (this.hasRole('EICHER')) return 'Eicher';
    return null;
  }

  onTotalVehiclesClick(): void {
    if (this.hasRole('ADMIN')) {
      this.toggleTotalMenu();
      return;
    }
    const userMake = this.getUserMake();
    if (userMake) {
      this.goToMake(userMake);
    }
  }

  goToMake(make: 'Tata' | 'Toyota' | 'Eicher'): void {
    this.totalMenuOpen = false;
    this.router.navigate([`/vehicle-by-make/${make}`]);
  }

  displayedColumns: string[] = [
    'make',
    'model',
    'grade',
    'chassisNumber',
    'engineNumber',
    'fuelType',
    'exteriorColor',
    'status',
    'age',
    'receivedDate'
  ];

  vehicleForm!: FormGroup;
  carDetailsList: VehicleModel[] = [];
  filteredStocksList: VehicleModel[] = [];
  uniqueVehicleModel: VehicleModel[] = [];
  filteredModelStockList: VehicleModel[] = [];
  searchTerm: string = '';
  selectedMake: string = ''; // Selected make for filtering
  successMessage: string = '';
  showPopup: boolean = false;
  showEditPopup: boolean = false;
  editVehicleData: any = {};

  user: UserModel | null = null;
  showLeftScroll: any;
  showRightScroll: any;

  selectedLocation: string | null = null;
  locationVehicles: VehicleModel[] = [];
  showLocationDetails = false;

  locationDataSource!: MatTableDataSource<VehicleModel>;

  ageCounts = { lessThan30: 0, between30And60: 0, greaterThan60: 0 };

  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  ageCountsByModel: { [key: string]: { [key: string]: number } } = {};

  constructor(private fb: FormBuilder,
    private vehicleService: DataService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {

    this.getUniqueModelDetails(); // Fetch unique vehicle models

    // Retrieve the user from localStorage if available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      //console.log('Retrieved User from Storage:', this.user);
    }

    this.getCarDetails();
    this.getAgeCountByModel();
    // Subscribe to the user observable to get the current user
    this.authService.getUser().subscribe((user) => {
      this.user = user;

      // Store the user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(this.user));
    });

  }
  getCarDetails(): void {
    this.vehicleService.getData().subscribe((data: VehicleModel[]) => {
      // Keep only active vehicles in the main list (exclude SOLD)
      this.carDetailsList = (data || []).filter(v => (v.vehicleStatus || '').toLowerCase() !== 'sold');

      // Filter the data based on roles
      if (this.hasRole('ADMIN')) {
        this.filteredStocksList = [...this.carDetailsList]; // Show all active data for ADMIN
      } else if (this.hasRole('TATA')) {
        this.filteredStocksList = this.carDetailsList.filter(car => car.make?.toLowerCase() === 'tata');
      } else if (this.hasRole('TOYOTA')) {
        this.filteredStocksList = this.carDetailsList.filter(car => car.make?.toLowerCase() === 'toyota');
      } else if (this.hasRole('EICHER')) {
        this.filteredStocksList = this.carDetailsList.filter(car => car.make?.toLowerCase() === 'eicher');
      } else {
        this.filteredStocksList = []; // Default to an empty list if no roles match
      }
      this.cdr.markForCheck(); // Notify Angular about data changes
    });
  }

  filterByMake(make: string): void {
    this.selectedMake = make; // Set the selected make
    this.filterVehicles(); // Apply the filter
  }
// Helper method to get object keys
getObjectKeys(obj: any): string[] {
  return Object.keys(obj);
}
  filterVehicles(): void {
    const searchTermLower = (this.searchTerm || '').toLowerCase().trim();
    this.filteredModelStockList = this.uniqueVehicleModel.filter((stock) => {
      const matchesMake = this.selectedMake ? (stock.make || '').toLowerCase() === this.selectedMake.toLowerCase() : true;
      const matchesSearch = (stock.make || '').toLowerCase().includes(searchTermLower) ||
        (stock.model || '').toLowerCase().includes(searchTermLower) ||
        (stock.location || '').toLowerCase().trim().includes(searchTermLower);
      return matchesMake && (searchTermLower ? matchesSearch : true);
    });
  }

  filterStocks(): void {
    const searchTermLower = (this.searchTerm || '').toLowerCase().trim();

    // Apply role-based filtering first
    let roleFilteredList: VehicleModel[] = [];
    if (this.hasRole('ADMIN')) {
      roleFilteredList = [...this.uniqueVehicleModel]; // Show all data for ADMIN
    } else if (this.hasRole('TATA')) {
      roleFilteredList = this.uniqueVehicleModel.filter(car => car.make?.toLowerCase() === 'tata');
    } else if (this.hasRole('TOYOTA')) {
      roleFilteredList = this.uniqueVehicleModel.filter(car => car.make?.toLowerCase() === 'toyota');
    } else if (this.hasRole('EICHER')) {
      roleFilteredList = this.uniqueVehicleModel.filter(car => car.make?.toLowerCase() === 'eicher');
    }

    // Apply search term filtering on the role-filtered list
    this.filteredModelStockList = roleFilteredList.filter((stock) => {
      return (stock.make || '').toLowerCase().includes(searchTermLower) ||
        (stock.model || '').toLowerCase().includes(searchTermLower) ||
        (stock.location || '').toLowerCase().trim().includes(searchTermLower);
    });
  }

  openAddVehiclePopup(): void {
    this.showPopup = true;
    this.vehicleForm.reset();
  }

  closePopup(): void {
    this.showPopup = false;
  }

  openEditVehiclePopup(stock: VehicleModel): void {
    this.editVehicleData = { ...stock }; // Clone the selected stock data
    this.showEditPopup = true;
    console.log("Edit Vehicle Data:", this.editVehicleData); // Debugging log
  }

  closeEditPopup(): void {
    this.showEditPopup = false;
  }

  onSubmit(): void {
    this.vehicleService.addVehicle(this.vehicleForm.value).subscribe(
      () => {
        this.successMessage = 'Vehicle details added successfully!';
        setTimeout(() => {
          this.successMessage = '';
          this.closePopup();
        }, 2000);
        this.getCarDetails();
      },
      (error) => console.error('Error adding vehicle:', error)
    );
  }

  onUpdate(): void {
    if (!this.editVehicleData || !this.editVehicleData.id) {
      console.error('Invalid vehicle data for update');
      return;
    }

    console.log("Sending updated data to backend:", this.editVehicleData); // Debugging log

    this.vehicleService.updateVehicleDetails(this.editVehicleData).subscribe(
      (response) => {
        console.log("Response from backend:", response); // Debugging log
        this.successMessage = 'Vehicle details updated successfully!';
        setTimeout(() => {
          this.successMessage = '';
          this.closeEditPopup();
        }, 2000);
        this.getCarDetails(); // Refresh the list after update
      },
      (error) => {
        console.error('Error updating vehicle:', error); // Debugging log
      }
    );
  }

  onDelete(stock: VehicleModel): void {
    if (!this.hasRole('ADMIN')) {
      alert('Only admins can delete vehicles.');
      return;
    }
    const confirmed = confirm('Are you sure you want to delete this vehicle? This action cannot be undone.');
    if (!confirmed) return;

    this.vehicleService.deleteVehicleDetails(stock.id).subscribe(
      () => {
        this.successMessage = 'Vehicle details deleted successfully!';
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
        this.getCarDetails();
      },
      (error) => console.error('Error deleting vehicle:', error)
    );
  }

  // Returns list filtered by persona and current brand selection (for ADMIN)
  private getContextVehicles(): VehicleModel[] {
    const all = this.carDetailsList || [];
    const isActiveVehicle = (c: VehicleModel) => (c.vehicleStatus || '').toLowerCase() !== 'sold';
    if (this.hasRole('ADMIN')) {
      if (this.selectedMake) {
        return all.filter(c => isActiveVehicle(c) && c.make?.toLowerCase() === this.selectedMake.toLowerCase());
      }
      return all.filter(isActiveVehicle);
    }
    if (this.hasRole('TATA')) return all.filter(c => isActiveVehicle(c) && c.make?.toLowerCase() === 'tata');
    if (this.hasRole('TOYOTA')) return all.filter(c => isActiveVehicle(c) && c.make?.toLowerCase() === 'toyota');
    if (this.hasRole('EICHER')) return all.filter(c => isActiveVehicle(c) && c.make?.toLowerCase() === 'eicher');
    return [];
  }

  getTotalCarsAvailable(): number {
    return this.getContextVehicles().length;
  }

  getCityWiseModelCounts(): { city: string; count: number }[] {
    const filteredList = this.getContextVehicles();

    // Group by city (uppercase) and count vehicles to avoid duplicates
    const cityCounts = filteredList.reduce((acc, car) => {
      const cityUpperCase = car.location ? car.location.toUpperCase().trim() : '';
      if (cityUpperCase) { // Only count non-empty cities
        acc[cityUpperCase] = (acc[cityUpperCase] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });

    return Object.keys(cityCounts).map(city => ({
      city,
      count: cityCounts[city]
    })).sort((a, b) => b.count - a.count);
  }

  logout(): void {
    const token = this.authService.getToken();
    if (token) {
      this.authService.logout().subscribe({
        next: () => {
          this.authService.clearToken();
          this.router.navigate(['/login']); // Redirect to login page
        },
        error: () => {
          console.error('Logout failed');
        }
      });
    } else {
      console.warn('No token found. Redirecting to login.');
      this.router.navigate(['/login']);
    }
  }

  hasRole(role: string): boolean {
    if (this.user?.roles?.includes('ADMIN')) {
      return true; // ADMIN can access all menus
    }
    return this.user?.roles?.includes(role) || false;
  }

  calculateVehicleAge(count: string): AgeResult {
    try {

      // Check if we have a valid date
      if (!count || isNaN(Number(count))) {
        return { days: 0, status: 'recent', label: 'Invalid Date' };
      }

      const parsedCount = parseInt(count.toString(), 10); // For integers
      let status: string;
      let label: string;

      if (parsedCount <= 30) {
        status = 'recent';
        label = 'New Arrival';
      } else if (parsedCount > 30 && parsedCount <=60) {
        status = 'moderate';
        label = 'Medium Age';
      } else {
        status = 'aged';
        label = 'Aged Stock';
      }

      return { days: parsedCount, status, label };
    } catch (error) {
      console.error('Error calculating vehicle age:', error);
      return { days: 0, status: 'recent', label: 'Error' };
    }
  }


  getUniqueModelDetails(): void {
    this.isLoading = true; // Start loading
    this.vehicleService.getUnqiueVehicleModels().subscribe({
      next: (data: VehicleModel[]) => {
        // Use all models from the server response; do not drop models whose representative row is SOLD
        // Counts and totals elsewhere already exclude SOLD
        const list = (data || []);

        // Normalize casing for deduplication (display remains uppercased via template)
        const byKey = new Map<string, VehicleModel>();
        for (const v of list) {
          const normMake = (v.make || '').toUpperCase().trim();
          const normModel = (v.model || '').toUpperCase().trim();
          const normLoc = (v.location || '').toUpperCase().trim();
          const key = `${normMake}|${normModel}`;
          if (!byKey.has(key)) {
            // keep original object but attach normalized fields for display/filtering if needed
            (v as any).normalizedMake = normMake;
            (v as any).normalizedModel = normModel;
            (v as any).normalizedLocation = normLoc;
            byKey.set(key, v);
          }
        }
        this.uniqueVehicleModel = Array.from(byKey.values());

        // Filter the data based on roles
        if (this.hasRole('ADMIN')) {
          this.filteredModelStockList = [...this.uniqueVehicleModel]; // Show all data for ADMIN
        } else if (this.hasRole('TATA')) {
          this.filteredModelStockList = this.uniqueVehicleModel.filter(car => (car.make || '').toLowerCase() === 'tata');
        } else if (this.hasRole('TOYOTA')) {
          this.filteredModelStockList = this.uniqueVehicleModel.filter(car => (car.make || '').toLowerCase() === 'toyota');
        } else if (this.hasRole('EICHER')) {
          this.filteredModelStockList = this.uniqueVehicleModel.filter(car => (car.make || '').toLowerCase() === 'eicher');
        } else {
          this.filteredModelStockList = []; // Default to an empty list if no roles match
        }
        this.cdr.markForCheck(); // Notify Angular about data changes
      },
      error: (err) => {
        console.error('Error fetching vehicle models:', err);
      },
      complete: () => {
        this.isLoading = false; // Stop loading
      }
    });
  }

  // Add this method to your DashboardComponent class
  getModelCount(model: string): number {
    // Apply role-based filtering first
    let filteredList = this.carDetailsList;

    if (this.hasRole('ADMIN')) {
      filteredList = [...this.carDetailsList]; // Show all data for ADMIN
    } else if (this.hasRole('TATA')) {
      filteredList = this.carDetailsList.filter(car => car.make?.toLowerCase() === 'tata');
    } else if (this.hasRole('TOYOTA')) {
      filteredList = this.carDetailsList.filter(car => car.make?.toLowerCase() === 'toyota');
    } else if (this.hasRole('EICHER')) {
      filteredList = this.carDetailsList.filter(car => car.make?.toLowerCase() === 'eicher');
    } else {
      filteredList = []; // Default to empty list if no roles match
    }

    const target = (model || '').toLowerCase();
    return filteredList.filter(car => (car.model || '').toLowerCase() === target && (car.vehicleStatus || '').toLowerCase() !== 'sold').length;
  }

  getAgeCountByModel(): void {
    this.vehicleService.getAgeCountByModel().subscribe((data) => {
      this.ageCountsByModel = data;
    });
}
  // Add this method to get vehicles for a specific location
  getVehiclesByLocation(location: string): void {
    this.selectedLocation = location;

    const targetLocation = (location || '').toLowerCase();

    if (this.hasRole('ADMIN')) {
      const selected = (this.selectedMake || '').toLowerCase();
      this.locationVehicles = this.carDetailsList.filter(car =>
        (car.location || '').toLowerCase() === targetLocation && (!selected || (car.make || '').toLowerCase() === selected) && (car.vehicleStatus || '').toLowerCase() !== 'sold'
      );
    } else if (this.hasRole('TATA')) {
      this.locationVehicles = this.carDetailsList.filter(car =>
        (car.location || '').toLowerCase() === targetLocation && (car.make || '').toLowerCase() === 'tata' && (car.vehicleStatus || '').toLowerCase() !== 'sold'
      );
    } else if (this.hasRole('TOYOTA')) {
      this.locationVehicles = this.carDetailsList.filter(car =>
        (car.location || '').toLowerCase() === targetLocation && (car.make || '').toLowerCase() === 'toyota' && (car.vehicleStatus || '').toLowerCase() !== 'sold'
      );
    } else if (this.hasRole('EICHER')) {
      this.locationVehicles = this.carDetailsList.filter(car =>
        (car.location || '').toLowerCase() === targetLocation && (car.make || '').toLowerCase() === 'eicher' && (car.vehicleStatus || '').toLowerCase() !== 'sold'
      );
    } else {
      this.locationVehicles = []; // Default to an empty list if no roles match
    }

    this.locationDataSource = new MatTableDataSource<VehicleModel>(this.locationVehicles);

    // Show modal immediately
    this.showLocationDetails = true;

    // Set up sorting and pagination immediately after view update
    requestAnimationFrame(() => {
      if (this.paginator && this.sort) {
        this.locationDataSource.paginator = this.paginator;
        this.locationDataSource.sort = this.sort;
      }
    });
  }

  // Add method to close location details - Instant close
  closeLocationDetails(): void {
    this.showLocationDetails = false;
    // Clean up data immediately
    this.selectedLocation = null;
    this.locationVehicles = [];
    this.locationDataSource = new MatTableDataSource<VehicleModel>([]);
  }

  // Method to get paginated vehicles
  getPaginatedVehicles(): VehicleModel[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.locationVehicles.slice(startIndex, startIndex + this.pageSize);
  }

  // Method to handle page changes
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }
  parseToNumber(value: string): number {
    return Number(value);
  }
  ngAfterViewInit() {
    if (this.locationDataSource) {
      this.locationDataSource.paginator = this.paginator;
      this.locationDataSource.sort = this.sort;
    }
  }
  model(model: any) {
    throw new Error('Method not implemented.');
  }

  // Compute age distribution for a given model from active, context-aware vehicles
  private getAgeBucketsForModel(model: string): { lt30: number; b3060: number; gt60: number } {
    const target = (model || '').toLowerCase();
    const vehicles = this.getContextVehicles().filter(v => (v.model || '').toLowerCase() === target);
    let lt30 = 0, b3060 = 0, gt60 = 0;
    for (const v of vehicles) {
      const days = typeof v.age === 'number' ? v.age : Number(v.age || 0);
      if (!isFinite(days)) continue;
      if (days <= 30) lt30++;
      else if (days > 30 && days <= 60) b3060++;
      else if (days > 60) gt60++;
    }
    return { lt30, b3060, gt60 };
  }

  getAgeCountForModel(model: string, bucket: 'lt30' | 'b3060' | 'gt60'): number {
    const b = this.getAgeBucketsForModel(model);
    return bucket === 'lt30' ? b.lt30 : bucket === 'b3060' ? b.b3060 : b.gt60;
  }
}
