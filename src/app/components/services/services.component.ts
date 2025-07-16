import { Component, inject, Inject, OnInit } from '@angular/core';
import { DataService } from '../../services/DataService';
import { VehicleModel } from '../../models/VehicleModel';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  imports: [RouterLink, CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit{
  isNavCollapsed = false;
  
  // Interactive header properties
  isHeaderHovered = false;
  showSubtitle = false;
  
  // Interactive service section properties
  isInventoryHovered = false;
  isUploadHovered = false;
  isReportingHovered = false;
  isSupportHovered = false;
  
  // Hover tracking for sub-items
  hoveredReportButton: string | null = null;
  hoveredFeature: string | null = null;
  hoveredMethod: string | null = null;
  hoveredChannel: string | null = null;
  
  // Sparkle animation data
  sparkles = [
    { x: 15, y: 20, delay: 0 },
    { x: 85, y: 30, delay: 1 },
    { x: 25, y: 70, delay: 2 },
    { x: 75, y: 65, delay: 0.5 },
    { x: 45, y: 15, delay: 1.5 },
    { x: 65, y: 85, delay: 2.5 }
  ];

  ngOnInit(): void {
    this.getCarDetails();
    // Show subtitle after a delay
    setTimeout(() => {
      this.showSubtitle = true;
    }, 1000);
  }

  vehicleService = inject(DataService);

  carDetailsList : VehicleModel [] = [];

  getCarDetails(){
      this.vehicleService.getData().subscribe((result : any)=>{
          this.carDetailsList = result;
      })
  }

  // Interactive header methods
  onHeaderHover() {
    this.isHeaderHovered = true;
  }

  onHeaderLeave() {
    this.isHeaderHovered = false;
  }

  // Inventory Management section methods
  onInventoryHover() {
    this.isInventoryHovered = true;
  }

  onInventoryLeave() {
    this.isInventoryHovered = false;
    this.hoveredFeature = null;
  }

  onFeatureHover(feature: string) {
    this.hoveredFeature = feature;
  }

  onFeatureLeave() {
    this.hoveredFeature = null;
  }

  // Bulk Upload section methods
  onUploadHover() {
    this.isUploadHovered = true;
  }

  onUploadLeave() {
    this.isUploadHovered = false;
    this.hoveredMethod = null;
  }

  onMethodHover(method: string) {
    this.hoveredMethod = method;
  }

  onMethodLeave() {
    this.hoveredMethod = null;
  }

  // Reporting section methods
  onReportingHover() {
    this.isReportingHovered = true;
  }

  onReportingLeave() {
    this.isReportingHovered = false;
    this.hoveredReportButton = null;
  }

  onReportButtonHover(reportType: string) {
    this.hoveredReportButton = reportType;
  }

  onReportButtonLeave() {
    this.hoveredReportButton = null;
  }

  // Customer Support section methods
  onSupportHover() {
    this.isSupportHovered = true;
  }

  onSupportLeave() {
    this.isSupportHovered = false;
    this.hoveredChannel = null;
  }

  onChannelHover(channel: string) {
    this.hoveredChannel = channel;
  }

  onChannelLeave() {
    this.hoveredChannel = null;
  }

}
