import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiscoverService } from '../../../core/services/discover.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-genre-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './genre-selection.html',
  styleUrl: './genre-selection.css',
})
export class GenreSelection implements OnInit {
  private discoverService = inject(DiscoverService);
  private userService = inject(UserService);
  private router = inject(Router);

  genres = signal<{ id: number; name: string }[]>([]);
  selectedGenres = signal<number[]>([]);
  loading = signal(true);
  saving = signal(false);

  async ngOnInit() {
    try {
      const genres = await this.discoverService.getGenres();
      this.genres.set(genres);
    } catch (error) {
      console.error('Failed to load genres', error);
    } finally {
      this.loading.set(false);
    }
  }

  toggleGenre(id: number) {
    this.selectedGenres.update(current => {
      if (current.includes(id)) {
        return current.filter(g => g !== id);
      } else {
        return [...current, id];
      }
    });
  }

  async saveAndContinue() {
    if (this.selectedGenres().length === 0) return;

    this.saving.set(true);
    const success = await this.userService.updateUserGenres(this.selectedGenres());

    if (success) {
      this.router.navigate(['/onboarding/preview']);
    } else {
      console.error('Failed to save genres');
    }
    this.saving.set(false);
  }
}
