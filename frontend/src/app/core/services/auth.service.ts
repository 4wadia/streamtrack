import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    initializeApp,
    FirebaseApp
} from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    User as FirebaseUser,
    Auth
} from 'firebase/auth';
import { environment } from '../../../environments/environment';

export interface User {
    firebaseUid: string;
    email: string;
    name?: string;
    services: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private app: FirebaseApp;
    private auth: Auth;

    // Signals for reactive state
    private _user = signal<User | null>(null);
    private _firebaseUser = signal<FirebaseUser | null>(null);
    private _loading = signal<boolean>(true);
    private _error = signal<string | null>(null);

    // Public computed signals
    readonly user = this._user.asReadonly();
    readonly isAuthenticated = computed(() => !!this._firebaseUser());
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    constructor() {
        // Initialize Firebase
        this.app = initializeApp(environment.firebase);
        this.auth = getAuth(this.app);

        // Listen for auth state changes
        onAuthStateChanged(this.auth, async (firebaseUser) => {
            this._firebaseUser.set(firebaseUser);

            if (firebaseUser) {
                await this.syncUserWithBackend();
            } else {
                this._user.set(null);
            }

            this._loading.set(false);
        });
    }

    /**
     * Sign in with email and password
     */
    async login(email: string, password: string): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        try {
            const credential = await signInWithEmailAndPassword(this.auth, email, password);
            console.log('Firebase login successful:', credential.user.email);

            // Sync with backend
            await this.syncUserWithBackend();
        } catch (error: any) {
            console.error('Login error:', error);
            this._error.set(this.getErrorMessage(error.code));
            throw error;
        } finally {
            this._loading.set(false);
        }
    }

    /**
     * Sign in with Google
     */
    async loginWithGoogle(): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        try {
            const provider = new GoogleAuthProvider();
            const credential = await signInWithPopup(this.auth, provider);
            console.log('Google login successful:', credential.user.email);

            // Sync with backend
            await this.syncUserWithBackend();
        } catch (error: any) {
            console.error('Google login error:', error);
            this._error.set(this.getErrorMessage(error.code));
            throw error;
        } finally {
            this._loading.set(false);
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email: string): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        try {
            await sendPasswordResetEmail(this.auth, email);
            console.log('Password reset email sent to:', email);
        } catch (error: any) {
            console.error('Password reset error:', error);
            this._error.set(this.getErrorMessage(error.code));
            throw error;
        } finally {
            this._loading.set(false);
        }
    }

    /**
     * Create a new account with email and password
     */
    async register(email: string, password: string, name?: string): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        try {
            const credential = await createUserWithEmailAndPassword(this.auth, email, password);
            console.log('Firebase registration successful:', credential.user.email);

            // Register with backend
            const token = await credential.user.getIdToken();
            const response = await this.http.post<{ user: User }>(
                `${environment.apiUrl}/auth/register`,
                { name },
                { headers: { Authorization: `Bearer ${token}` } }
            ).toPromise();

            if (response?.user) {
                this._user.set(response.user);
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            this._error.set(this.getErrorMessage(error.code));
            throw error;
        } finally {
            this._loading.set(false);
        }
    }

    /**
     * Sign out current user
     */
    async logout(): Promise<void> {
        try {
            await signOut(this.auth);
            this._user.set(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    /**
     * Get current Firebase ID token for API calls
     */
    async getIdToken(): Promise<string | null> {
        const currentUser = this._firebaseUser();
        if (!currentUser) return null;

        try {
            return await currentUser.getIdToken();
        } catch (error) {
            console.error('Error getting ID token:', error);
            return null;
        }
    }

    /**
     * Sync Firebase user with backend MongoDB
     */
    private async syncUserWithBackend(): Promise<void> {
        const firebaseUser = this._firebaseUser();
        if (!firebaseUser) return;

        try {
            const token = await firebaseUser.getIdToken();
            const response = await this.http.post<{ user: User }>(
                `${environment.apiUrl}/auth/login`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            ).toPromise();

            if (response?.user) {
                this._user.set(response.user);
            }
        } catch (error) {
            console.error('Error syncing with backend:', error);
        }
    }

    /**
     * Convert Firebase error codes to user-friendly messages
     */
    private getErrorMessage(code: string): string {
        const messages: Record<string, string> = {
            'auth/email-already-in-use': 'This email is already registered.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/popup-closed-by-user': 'Sign in was cancelled.',
            'auth/cancelled-popup-request': 'Sign in was cancelled.'
        };
        return messages[code] || 'An error occurred. Please try again.';
    }
}
