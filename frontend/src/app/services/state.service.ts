import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  activePill = signal('All');
  selectedProviderId = signal<number | null>(null);
  selectedWatchRegion = signal('IN');
  activeVibe = signal<string | null>(null);
  searchQuery = signal('');
}
