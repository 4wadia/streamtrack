import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface StreamingService {
    id: string;
    name: string;
    providerId: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    /**
     * Get list of all supported streaming services
     */
    async getAvailableServices(): Promise<StreamingService[]> {
        try {
            const response = await firstValueFrom(
                this.http.get<{ services: StreamingService[] }>(
                    `${environment.apiUrl}/user/services/available`
                )
            );
            return response?.services || [];
        } catch (error) {
            console.error('Error fetching available services:', error);
            return [];
        }
    }

    /**
     * Get current user's selected streaming services
     */
    async getUserServices(): Promise<string[]> {
        try {
            const token = await this.authService.getIdToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await firstValueFrom(
                this.http.get<{ services: string[] }>(
                    `${environment.apiUrl}/user/services`,
                    { headers: this.getAuthHeaders(token) }
                )
            );
            return response?.services || [];
        } catch (error) {
            console.error('Error fetching user services:', error);
            return [];
        }
    }

    /**
     * Update user's selected streaming services
     */
    async updateUserServices(services: string[]): Promise<boolean> {
        try {
            const token = await this.authService.getIdToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            await firstValueFrom(
                this.http.put<{ message: string; services: string[] }>(
                    `${environment.apiUrl}/user/services`,
                    { services },
                    { headers: this.getAuthHeaders(token) }
                )
            );
            return true;
        } catch (error) {
            console.error('Error updating user services:', error);
            return false;
        }
    }

    /**
     * Update user's processed genres
     */
    async updateUserGenres(genres: number[]): Promise<boolean> {
        try {
            const token = await this.authService.getIdToken();
            if (!token) throw new Error('Not authenticated');

            await firstValueFrom(
                this.http.put(
                    `${environment.apiUrl}/user/genres`,
                    { genres },
                    { headers: this.getAuthHeaders(token) }
                )
            );
            return true;
        } catch (error) {
            console.error('Error updating user genres:', error);
            return false;
        }
    }

    private getAuthHeaders(token: string): HttpHeaders {
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }
}
