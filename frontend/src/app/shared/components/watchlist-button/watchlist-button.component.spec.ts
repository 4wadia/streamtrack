import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WatchlistButtonComponent } from './watchlist-button.component';

describe('WatchlistButtonComponent', () => {
    let component: WatchlistButtonComponent;
    let fixture: ComponentFixture<WatchlistButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WatchlistButtonComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(WatchlistButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should default to unchecked state', () => {
        expect(component.checked()).toBe(false);
    });

    it('should default size to "default"', () => {
        expect(component.size).toBe('default');
    });

    describe('isChecked input', () => {
        it('should set checked state via isChecked setter', () => {
            component.isChecked = true;
            expect(component.checked()).toBe(true);
        });

        it('should set checked state to false via isChecked setter', () => {
            component.isChecked = true;
            component.isChecked = false;
            expect(component.checked()).toBe(false);
        });
    });

    describe('svgSize', () => {
        it('should return 20 for sm size', () => {
            component.size = 'sm';
            expect(component.svgSize).toBe(20);
        });

        it('should return 32 for lg size', () => {
            component.size = 'lg';
            expect(component.svgSize).toBe(32);
        });

        it('should return 26 for default size', () => {
            component.size = 'default';
            expect(component.svgSize).toBe(26);
        });
    });

    describe('host class bindings', () => {
        it('should have size-sm class when size is sm', () => {
            component.size = 'sm';
            expect(component.isSm).toBe(true);
            expect(component.isDefault).toBe(false);
            expect(component.isLg).toBe(false);
        });

        it('should have size-default class when size is default', () => {
            component.size = 'default';
            expect(component.isDefault).toBe(true);
            expect(component.isSm).toBe(false);
            expect(component.isLg).toBe(false);
        });

        it('should have size-lg class when size is lg', () => {
            component.size = 'lg';
            expect(component.isLg).toBe(true);
            expect(component.isSm).toBe(false);
            expect(component.isDefault).toBe(false);
        });
    });

    describe('toggle', () => {
        it('should toggle from false to true', () => {
            const event = new MouseEvent('click');
            component.toggle(event);
            expect(component.checked()).toBe(true);
        });

        it('should toggle from true to false', () => {
            component.isChecked = true;
            const event = new MouseEvent('click');
            component.toggle(event);
            expect(component.checked()).toBe(false);
        });

        it('should emit checkedChange with new value', () => {
            const emitted: boolean[] = [];
            component.checkedChange.subscribe((v: boolean) => emitted.push(v));

            const event = new MouseEvent('click');
            component.toggle(event);

            expect(emitted).toEqual([true]);
        });

        it('should not toggle while animating', () => {
            component.isAnimating.set(true);
            const event = new MouseEvent('click');
            component.toggle(event);
            expect(component.checked()).toBe(false);
        });

        it('should set isAnimating to true on toggle', () => {
            const event = new MouseEvent('click');
            component.toggle(event);
            expect(component.isAnimating()).toBe(true);
        });
    });
});
