import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ContentCardComponent, ContentItem } from './content-card.component';
import { WatchlistService } from '../../../core/services/watchlist.service';

const mockContent: ContentItem = {
    id: '1',
    tmdbId: 550,
    type: 'movie',
    title: 'Fight Club',
    overview: 'An insomniac office worker forms an underground fight club.',
    posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdropPath: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    releaseDate: '1999-10-15',
    rating: 8.4,
    voteCount: 26280,
    genreIds: [18, 53, 35]
};

describe('ContentCardComponent', () => {
    let component: ContentCardComponent;
    let fixture: ComponentFixture<ContentCardComponent>;
    let mockWatchlistService: any;

    beforeEach(async () => {
        mockWatchlistService = {
            isInWatchlist: vi.fn().mockReturnValue(false),
            addToWatchlist: vi.fn().mockReturnValue(of({ item: {} }))
        };

        await TestBed.configureTestingModule({
            imports: [ContentCardComponent],
            providers: [
                { provide: WatchlistService, useValue: mockWatchlistService },
                provideRouter([])
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ContentCardComponent);
        component = fixture.componentInstance;
        component.content = mockContent;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getYear', () => {
        it('should extract year from releaseDate', () => {
            component.content = { ...mockContent, releaseDate: '1999-10-15' };
            expect(component.getYear()).toBe('1999');
        });

        it('should return empty string when releaseDate is missing', () => {
            component.content = { ...mockContent, releaseDate: '' };
            expect(component.getYear()).toBe('');
        });

        it('should return empty string when content is undefined', () => {
            component.content = undefined;
            expect(component.getYear()).toBe('');
        });
    });

    describe('isAdded signal', () => {
        it('should default to false', () => {
            expect(component.isAdded()).toBe(false);
        });
    });

    describe('onAddToWatchlist', () => {
        it('should call addToWatchlist and set isAdded to true on success', () => {
            const event = new MouseEvent('click');
            component.onAddToWatchlist(event);

            expect(mockWatchlistService.addToWatchlist).toHaveBeenCalledWith({
                contentId: mockContent.id,
                title: mockContent.title,
                type: mockContent.type,
                posterPath: mockContent.posterPath,
                status: 'want'
            });
            expect(component.isAdded()).toBe(true);
        });

        it('should not call addToWatchlist when already added', () => {
            component.isAdded.set(true);
            const event = new MouseEvent('click');
            component.onAddToWatchlist(event);

            expect(mockWatchlistService.addToWatchlist).not.toHaveBeenCalled();
        });

        it('should not call addToWatchlist when content is undefined', () => {
            component.content = undefined;
            const event = new MouseEvent('click');
            component.onAddToWatchlist(event);

            expect(mockWatchlistService.addToWatchlist).not.toHaveBeenCalled();
        });

        it('should set isAdded back to false on error', () => {
            const { throwError } = require('rxjs');
            mockWatchlistService.addToWatchlist.mockReturnValue(throwError(() => new Error('fail')));

            const event = new MouseEvent('click');
            component.onAddToWatchlist(event);

            expect(component.isAdded()).toBe(false);
        });
    });

    describe('isLoading input', () => {
        it('should default to false', () => {
            expect(component.isLoading).toBe(false);
        });

        it('should render skeleton when isLoading is true', () => {
            component.isLoading = true;
            fixture.changeDetectorRef.detectChanges();
            const el: HTMLElement = fixture.nativeElement;
            expect(el.querySelector('.skeleton-card')).toBeTruthy();
        });
    });

    describe('template rendering', () => {
        it('should render content card when not loading and content provided', () => {
            const el: HTMLElement = fixture.nativeElement;
            expect(el.querySelector('.content-card')).toBeTruthy();
        });

        it('should render title text', () => {
            const el: HTMLElement = fixture.nativeElement;
            const title = el.querySelector('.title');
            expect(title?.textContent?.trim()).toBe('Fight Club');
        });

        it('should render poster image when posterPath is provided', () => {
            const el: HTMLElement = fixture.nativeElement;
            const img = el.querySelector('img.poster');
            expect(img).toBeTruthy();
        });

        it('should render placeholder icon when posterPath is null', () => {
            component.content = { ...mockContent, posterPath: null };
            fixture.changeDetectorRef.detectChanges();
            const el: HTMLElement = fixture.nativeElement;
            expect(el.querySelector('.poster-placeholder')).toBeTruthy();
        });
    });
});
