import { Component, inject, Inject, OnInit } from '@angular/core';
import { DataService } from '../../services/DataService';
import { VehicleModel } from '../../models/VehicleModel';

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit{
  
  ngOnInit(): void {
    this.getCarDetails();
  }

  vehicleService = inject(DataService);

  carDetailsList : VehicleModel [] = [];

  getCarDetails(){
      this.vehicleService.getData().subscribe((result : any)=>{
          this.carDetailsList = result;
      })
  }

}
