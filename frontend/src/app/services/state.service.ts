import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  activePill = signal('All');
  activeVibe = signal<string | null>(null);
  searchQuery = signal('');
}
