import { Injectable, computed, signal } from '@angular/core';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface StoredAuthUser extends AuthUser {
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersStorageKey = 'stream-auth-users';
  private sessionStorageKey = 'stream-auth-session';

  private currentUserSignal = signal<AuthUser | null>(this.restoreSession());

  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => !!this.currentUserSignal());

  signup(payload: { name: string; email: string; password: string }): AuthUser {
    const name = payload.name.trim();
    const email = this.normalizeEmail(payload.email);
    const password = payload.password;

    if (!name) {
      throw new Error('Name is required.');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const users = this.loadUsers();
    if (users.some((user) => user.email === email)) {
      throw new Error('An account with this email already exists.');
    }

    const user: StoredAuthUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    this.saveUsers(users);
    this.setSession(user.id);
    this.currentUserSignal.set(this.toAuthUser(user));

    return this.toAuthUser(user);
  }

  login(payload: { email: string; password: string }): AuthUser {
    const email = this.normalizeEmail(payload.email);
    const password = payload.password;

    if (!this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!password) {
      throw new Error('Password is required.');
    }

    const user = this.loadUsers().find((existing) => existing.email === email);
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password.');
    }

    this.setSession(user.id);
    this.currentUserSignal.set(this.toAuthUser(user));
    return this.toAuthUser(user);
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.sessionStorageKey);
    }
    this.currentUserSignal.set(null);
  }

  private restoreSession(): AuthUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const userId = localStorage.getItem(this.sessionStorageKey);
    if (!userId) {
      return null;
    }

    const user = this.loadUsers().find((item) => item.id === userId);
    if (!user) {
      localStorage.removeItem(this.sessionStorageKey);
      return null;
    }

    return this.toAuthUser(user);
  }

  private loadUsers(): StoredAuthUser[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const raw = localStorage.getItem(this.usersStorageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(this.isStoredAuthUser);
    } catch {
      return [];
    }
  }

  private saveUsers(users: StoredAuthUser[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(this.usersStorageKey, JSON.stringify(users));
  }

  private setSession(userId: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(this.sessionStorageKey, userId);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private toAuthUser(user: StoredAuthUser): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  private isStoredAuthUser(value: unknown): value is StoredAuthUser {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const user = value as Partial<StoredAuthUser>;
    return (
      typeof user.id === 'string' &&
      typeof user.name === 'string' &&
      typeof user.email === 'string' &&
      typeof user.password === 'string' &&
      typeof user.createdAt === 'string'
    );
  }
}
