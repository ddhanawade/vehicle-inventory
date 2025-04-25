import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, NgModule } from '@angular/core';
import { FormsModule, NgSelectOption } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, MatToolbarModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit{
  title = 'vehicle-inventory';

  classList: any;

  isNavCollapsed = false; // State to track whether the nav bar is collapsed

  toggleNav() {
    this.isNavCollapsed = !this.isNavCollapsed; // Toggle the nav bar visibility
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
