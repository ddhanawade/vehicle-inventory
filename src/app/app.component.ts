import { CommonModule, PlatformLocation } from '@angular/common';
import { AfterViewInit, Component, NgModule, OnInit } from '@angular/core';
import { FormsModule, NgSelectOption } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, MatToolbarModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnInit {
  title = 'vehicle-inventory';

  private history: string[] = [];

  constructor(
    private router: Router,
    private location: Location,
    private platformLocation: PlatformLocation
  ) {
    // Prevent back navigation
    this.platformLocation.onPopState(() => {
      history.forward();
    });
  }

  classList: any;

  isNavCollapsed = false; // State to track whether the nav bar is collapsed

  toggleNav() {
    this.isNavCollapsed = !this.isNavCollapsed; // Toggle the nav bar visibility
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  ngAfterViewInit() {
    // Mobile menu toggle
    document.getElementById('mobile-menu')?.addEventListener('click', function() {
        const navUl = document.querySelector('nav ul');
        navUl?.classList.toggle('show');
    });

    // Add active class on navigation links
    const currentLocation = location.pathname;
    const menuItems = document.querySelectorAll('.nav-link');
    menuItems.forEach(item => {
      if (item.getAttribute('href') === currentLocation) {
        item.classList.add('active');
      }

      item.addEventListener('click', () => {
        menuItems.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }
}
