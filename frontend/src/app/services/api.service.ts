import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(endpoint: string, options?: ApiOptions): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, options).pipe(
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, body: any, options?: ApiOptions): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, options).pipe(
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, body: any, options?: ApiOptions): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, options).pipe(
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string, options?: ApiOptions): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, options).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // Log auth service availability warnings but don't swallow the error.
    if (error.status === 503 || error.status === 401) {
      console.warn('Auth service unavailable or unauthenticated, running in guest mode or redirecting');
    }
    
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else {
        errorMessage = `Server Error: ${error.status}\nMessage: ${error.message}`;
      }
    }
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
