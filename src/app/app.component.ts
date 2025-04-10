import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, MatToolbarModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit{
  title = 'vehicle-inventory';
  classList: any;
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
