import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

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
  castMembers?: CastMember[];
  trailer?: TrailerInfo | null;
  similar?: PagedContentResponse;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  profile_url: string | null;
}

export interface TrailerInfo {
  key: string;
  name: string;
  site: string;
  type: string;
  url: string;
  embedUrl: string;
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
  private api = inject(ApiService);
  private contentPath = '/content';
  private discoverPath = '/discover';

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
    return this.api
      .get<PagedContentResponse>(`${this.contentPath}/trending?type=${type}&time=${time}&page=${page}`)
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
    const encoded = encodeURIComponent(query.trim());
    return this.api
      .get<PagedContentResponse>(
        `${this.contentPath}/search?query=${encoded}&page=${page}&type=${type}`,
      )
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

  getMoviesPage(page = 1): Observable<PagedContentResponse> {
    return this.api.get<PagedContentResponse>(`${this.contentPath}/movies?page=${page}`).pipe(
      map((res) => ({
        ...res,
        results: res.results.map((item) => ({
          ...item,
          type: 'movie' as const,
        })),
      })),
    );
  }

  getTvShowsPage(page = 1): Observable<PagedContentResponse> {
    return this.api.get<PagedContentResponse>(`${this.contentPath}/tv-shows?page=${page}`).pipe(
      map((res) => ({
        ...res,
        results: res.results.map((item) => ({
          ...item,
          type: 'tv' as const,
        })),
      })),
    );
  }

  getCatalogPage(type: 'movie' | 'tv', page = 1): Observable<PagedContentResponse> {
    if (type === 'movie') {
      return this.getMoviesPage(page);
    }

    if (type === 'tv') {
      return this.getTvShowsPage(page);
    }

    return this.api
      .get<PagedContentResponse>(`${this.contentPath}/catalog?type=${type}&page=${page}`)
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
    return this.api.get<PagedContentResponse>(`${this.contentPath}/anime?page=${page}`).pipe(
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
    return this.api.get<{ content: ContentItem }>(`${this.contentPath}/${type}/${id}`).pipe(
      map((res) => ({
        ...res.content,
        type: res.content.type || type,
        castMembers: (res.content as any).castMembers || (res.content as any).cast || [],
      })),
    );
  }

  getMovieDetails(id: number): Observable<ContentItem> {
    return this.api.get<{ content: ContentItem }>(`${this.contentPath}/movie/${id}`).pipe(
      map((res) => ({
        ...res.content,
        type: 'movie',
        castMembers: (res.content as any).castMembers || (res.content as any).cast || [],
      })),
    );
  }

  getTvDetails(id: number): Observable<ContentItem> {
    return this.api.get<{ content: ContentItem }>(`${this.contentPath}/tv/${id}`).pipe(
      map((res) => ({
        ...res.content,
        type: 'tv',
        castMembers: (res.content as any).castMembers || (res.content as any).cast || [],
      })),
    );
  }

  getSimilar(type: 'movie' | 'tv', id: number, page = 1): Observable<PagedContentResponse> {
    return this.api
      .get<PagedContentResponse>(`${this.contentPath}/${type}/${id}/similar?page=${page}`)
      .pipe(
        map((res) => ({
          ...res,
          results: res.results.map((item) => ({
            ...item,
            type: item.type || type,
          })),
        })),
      );
  }

  getTonightPick(): Observable<{ pick: ContentItem; reason: string }> {
    return this.api.get<{ pick: ContentItem; reason: string }>(`${this.discoverPath}/tonight`);
  }

  getPopular(type: 'movie' | 'tv'): Observable<ContentItem[]> {
    // Reusing trending for variety or search as needed
    return this.getTrending(type, 'week');
  }
}
