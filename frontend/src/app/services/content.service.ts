import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContentItem {
  id: number | string;
  tmdbId?: number;
  title?: string;
  name?: string; // TV shows often use 'name' instead of 'title'
  type: 'movie' | 'tv';
  poster_path: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: string[];
  runtime?: number;
  vote_average: number;
  vote_count?: number;
  overview?: string;
  watchProviders?: string[];
  status?: string;
  tagline?: string;
  director?: string;
  creators?: string[];
  writers?: string[];
  cast?: string[];
  crew?: string[];
}

export interface PagedContentResponse {
  results: ContentItem[];
  page: number;
  totalPages: number;
  totalResults: number;
}

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/content`;
  private discoverUrl = `${environment.apiUrl}/discover`;

  getTrending(
    type: 'movie' | 'tv' | 'all' = 'all',
    time: 'day' | 'week' = 'week',
  ): Observable<ContentItem[]> {
    return this.getTrendingPage(type, time, 1).pipe(map((res) => res.results));
  }

  getTrendingPage(
    type: 'movie' | 'tv' | 'all' = 'all',
    time: 'day' | 'week' = 'week',
    page = 1,
  ): Observable<PagedContentResponse> {
    return this.http
      .get<PagedContentResponse>(`${this.apiUrl}/trending?type=${type}&time=${time}&page=${page}`)
      .pipe(
        map((res) => ({
          ...res,
          results: res.results.map((item) => ({
            ...item,
            type: item.type || (type === 'all' ? 'movie' : type),
          })),
        })),
      );
  }

  search(
    query: string,
    page = 1,
    type: 'movie' | 'tv' | 'all' = 'all',
  ): Observable<PagedContentResponse> {
    const encoded = encodeURIComponent(query);
    return this.http
      .get<PagedContentResponse>(`${this.apiUrl}/search?q=${encoded}&page=${page}&type=${type}`)
      .pipe(
        map((res) => ({
          ...res,
          results: res.results.map((item) => ({
            ...item,
            type: item.type || (type === 'all' ? 'movie' : type),
          })),
        })),
      );
  }

  getCatalogPage(type: 'movie' | 'tv', page = 1): Observable<PagedContentResponse> {
    return this.http
      .get<PagedContentResponse>(`${this.apiUrl}/catalog?type=${type}&page=${page}`)
      .pipe(
        map((res) => ({
          ...res,
          results: res.results.map((item) => ({
            ...item,
            type,
          })),
        })),
      );
  }

  getAnime(page = 1): Observable<ContentItem[]> {
    return this.getAnimePage(page).pipe(map((res) => res.results));
  }

  getAnimePage(page = 1): Observable<PagedContentResponse> {
    return this.http.get<PagedContentResponse>(`${this.apiUrl}/anime?page=${page}`).pipe(
      map((res) => ({
        ...res,
        results: res.results.map((item) => ({
          ...item,
          type: item.type || 'tv',
        })),
      })),
    );
  }

  getDetails(type: 'movie' | 'tv', id: number): Observable<ContentItem> {
    return this.http.get<{ content: ContentItem }>(`${this.apiUrl}/${type}/${id}`).pipe(
      map((res) => ({
        ...res.content,
        type: res.content.type || type,
      })),
    );
  }

  getTonightPick(): Observable<{ pick: ContentItem; reason: string }> {
    return this.http.get<{ pick: ContentItem; reason: string }>(`${this.discoverUrl}/tonight`);
  }

  getPopular(type: 'movie' | 'tv'): Observable<ContentItem[]> {
    // Reusing trending for variety or search as needed
    return this.getTrending(type, 'week');
  }
}
