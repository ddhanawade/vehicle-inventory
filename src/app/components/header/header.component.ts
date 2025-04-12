import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isNavCollapsed = false; // State to track whether the nav bar is collapsed

  toggleNav() {
    this.isNavCollapsed = !this.isNavCollapsed; // Toggle the nav bar visibility
  }

}
