import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    // Optional: Redirect if already visited?
    // For now, valid to visit /welcome manually
  }

  getStarted() {
    localStorage.setItem('isFirstVisit', 'false');
    this.router.navigate(['/register']);
  }
}
