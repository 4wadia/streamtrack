import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiscoverService } from '../../../core/services/discover.service';

@Component({
  selector: 'app-personalized-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personalized-preview.html',
  styleUrl: './personalized-preview.css',
})
export class PersonalizedPreview implements OnInit {
  private discoverService = inject(DiscoverService);
  private router = inject(Router);

  recommendations = signal<any[]>([]);
  loading = signal(true);

  async ngOnInit() {
    try {
      const results = await this.discoverService.getRecommendations();
      this.recommendations.set(results.slice(0, 4)); // Show top 4
    } catch (error) {
      console.error('Failed to load recommendations', error);
    } finally {
      this.loading.set(false);
    }
  }

  startWatching() {
    this.router.navigate(['/']);
  }

  getImageUrl(path: string | null): string {
    return path ? path : 'assets/placeholder-poster.jpg';
  }
}
