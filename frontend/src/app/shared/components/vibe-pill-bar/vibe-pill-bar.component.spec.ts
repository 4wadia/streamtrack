import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VibePillBarComponent, Vibe } from './vibe-pill-bar.component';
import { Coffee, Zap, Gamepad2, Lightbulb, Moon, Smile, Sparkles } from 'lucide-angular';

const mockVibes: Vibe[] = [
    { id: 'cozy', name: 'Cozy', icon: 'coffee', color: '#f59e0b', description: 'Warm & comfortable' },
    { id: 'intense', name: 'Intense', icon: 'zap', color: '#ef4444', description: 'High intensity' },
    { id: 'mindless', name: 'Mindless', icon: 'gamepad-2', color: '#8b5cf6', description: 'Just chill' },
    { id: 'thoughtful', name: 'Thoughtful', icon: 'lightbulb', color: '#06b6d4', description: 'Deep thinking' },
    { id: 'dark', name: 'Dark', icon: 'moon', color: '#1e1b4b', description: 'Dark content' },
    { id: 'funny', name: 'Funny', icon: 'smile', color: '#84cc16', description: 'Comedy' },
];

describe('VibePillBarComponent', () => {
    let component: VibePillBarComponent;
    let fixture: ComponentFixture<VibePillBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VibePillBarComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(VibePillBarComponent);
        component = fixture.componentInstance;
        component.vibes = mockVibes;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should default selectedVibe to null', () => {
        expect(component.selectedVibe()).toBeNull();
    });

    describe('getIcon', () => {
        it('should return Coffee icon for cozy vibe', () => {
            expect(component.getIcon('Cozy')).toBe(Coffee);
        });

        it('should return Zap icon for intense vibe', () => {
            expect(component.getIcon('Intense')).toBe(Zap);
        });

        it('should return Gamepad2 icon for mindless vibe', () => {
            expect(component.getIcon('Mindless')).toBe(Gamepad2);
        });

        it('should return Lightbulb icon for thoughtful vibe', () => {
            expect(component.getIcon('Thoughtful')).toBe(Lightbulb);
        });

        it('should return Moon icon for dark vibe', () => {
            expect(component.getIcon('Dark')).toBe(Moon);
        });

        it('should return Smile icon for funny vibe', () => {
            expect(component.getIcon('Funny')).toBe(Smile);
        });

        it('should return Sparkles for unknown vibe name', () => {
            expect(component.getIcon('Unknown')).toBe(Sparkles);
        });
    });

    describe('selectVibe', () => {
        it('should select a vibe when none is selected', () => {
            component.selectVibe('cozy');
            expect(component.selectedVibe()).toBe('cozy');
        });

        it('should emit vibeChange with id when selecting', () => {
            const emitted: string[] = [];
            component.vibeChange.subscribe((v: string) => emitted.push(v));

            component.selectVibe('intense');

            expect(emitted).toEqual(['intense']);
        });

        it('should deselect when clicking the same vibe', () => {
            component.selectVibe('cozy');
            component.selectVibe('cozy');
            expect(component.selectedVibe()).toBeNull();
        });

        it('should emit empty string when deselecting', () => {
            const emitted: string[] = [];
            component.vibeChange.subscribe((v: string) => emitted.push(v));

            component.selectVibe('cozy');
            component.selectVibe('cozy');

            expect(emitted).toEqual(['cozy', '']);
        });

        it('should switch selection to another vibe', () => {
            component.selectVibe('cozy');
            component.selectVibe('dark');
            expect(component.selectedVibe()).toBe('dark');
        });
    });

    describe('initialVibe input', () => {
        it('should set selectedVibe from initialVibe input', () => {
            component.initialVibe = 'funny';
            expect(component.selectedVibe()).toBe('funny');
        });

        it('should not change selectedVibe for null initialVibe', () => {
            component.selectVibe('cozy');
            component.initialVibe = null;
            expect(component.selectedVibe()).toBe('cozy');
        });
    });

    describe('template rendering', () => {
        it('should render a pill button for each vibe', () => {
            const el: HTMLElement = fixture.nativeElement;
            const pills = el.querySelectorAll('.vibe-pill');
            expect(pills.length).toBe(mockVibes.length);
        });

        it('should add selected class to the active vibe pill', () => {
            component.selectVibe('cozy');
            fixture.detectChanges();

            const el: HTMLElement = fixture.nativeElement;
            const pills = el.querySelectorAll('.vibe-pill');
            expect(pills[0].classList.contains('selected')).toBe(true);
        });
    });
});
