import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WatchlistTabsComponent, WatchlistTab } from './watchlist-tabs.component';

describe('WatchlistTabsComponent', () => {
    let component: WatchlistTabsComponent;
    let fixture: ComponentFixture<WatchlistTabsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WatchlistTabsComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(WatchlistTabsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should default activeTab to "all"', () => {
        expect(component.activeTab).toBe('all');
    });

    it('should have four tabs defined', () => {
        expect(component.tabs.length).toBe(4);
        const ids = component.tabs.map(t => t.id);
        expect(ids).toContain('all');
        expect(ids).toContain('want');
        expect(ids).toContain('watching');
        expect(ids).toContain('watched');
    });

    it('should emit activeTabChange when a tab is clicked', () => {
        const emitted: WatchlistTab[] = [];
        component.activeTabChange.subscribe((tab: WatchlistTab) => emitted.push(tab));

        component.activeTabChange.emit('watching');

        expect(emitted).toEqual(['watching']);
    });

    it('should display tab labels in the template', () => {
        const el: HTMLElement = fixture.nativeElement;
        const buttons = el.querySelectorAll('button');
        expect(buttons.length).toBe(4);
    });

    it('should show count badge when count is provided', () => {
        component.counts = { all: 5, want: 2, watching: 1, watched: 2 };
        fixture.changeDetectorRef.detectChanges();
        const el: HTMLElement = fixture.nativeElement;
        const countSpans = el.querySelectorAll('span span');
        expect(countSpans.length).toBeGreaterThan(0);
    });

    it('should accept different activeTab values', () => {
        component.activeTab = 'watching';
        fixture.changeDetectorRef.detectChanges();
        expect(component.activeTab).toBe('watching');
    });
});
