import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome {
  private router = inject(Router);

  getStarted() {
    localStorage.setItem('isFirstVisit', 'false');
    this.router.navigate(['/register']);
  }
}
