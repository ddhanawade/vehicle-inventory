import { Component, inject, Inject, OnInit } from '@angular/core';
import { DataService } from '../../services/DataService';
import { VehicleModel } from '../../models/VehicleModel';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit{
  isNavCollapsed = false;
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
