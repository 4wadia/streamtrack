# StreamTrack UI Specifications

> [!CAUTION]
> **MANDATORY**: All agents implementing UI must follow these specifications EXACTLY.
> Deviations require explicit user approval.

---

## Design Philosophy

StreamTrack aims for a **premium streaming experience** inspired by:
- **Apple TV+**: Clean, cinematic hero sections, smooth animations
- **Netflix**: Card-based browsing, dark theme, red accent

**NOT like:**
- ❌ IMDB (cluttered, ad-heavy, outdated)
- ❌ Generic bootstrap sites

---

## Color System

### Primary Colors
```css
:root {
  /* Accent */
  --color-accent: #E50914;           /* Netflix Red - Primary CTA */
  --color-accent-hover: #B20710;     /* Darker red for hover */
  --color-accent-light: #FF2C35;     /* Lighter for highlights */
  
  /* Backgrounds */
  --bg-cinema-black: #0C0C0C;        /* Main background */
  --bg-card: #181818;                /* Card backgrounds */
  --bg-card-hover: #252525;          /* Card hover state */
  --bg-overlay: rgba(0, 0, 0, 0.7);  /* Modal overlays */
  --bg-glass: rgba(24, 24, 24, 0.8); /* Glassmorphism panels */
  
  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #A3A3A3;
  --text-muted: #737373;
  --text-disabled: #525252;
  
  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-card: rgba(255, 255, 255, 0.05);
}
```

### Usage Guidelines
- **Primary CTA buttons**: `--color-accent` background, white text
- **Secondary buttons**: `--bg-glass` with border
- **Cards**: `--bg-card` with `--border-card`
- **Text hierarchy**: Primary → Secondary → Muted

---

## Typography

### Font Stack
```css
:root {
  --font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Roboto', sans-serif;
}
```

### Scale
```css
.text-display-huge { font-size: 4rem; font-weight: 700; }    /* Hero titles */
.text-display-large { font-size: 2.5rem; font-weight: 700; } /* Section titles */
.text-heading { font-size: 1.5rem; font-weight: 600; }       /* Card titles */
.text-body { font-size: 1rem; font-weight: 400; }            /* Body text */
.text-caption { font-size: 0.875rem; font-weight: 400; }     /* Metadata */
.text-small { font-size: 0.75rem; font-weight: 400; }        /* Fine print */
```

---

## Animation System

### Easing Functions
```css
:root {
  --ease-cinema: cubic-bezier(0.16, 1, 0.3, 1);      /* Primary ease */
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);   /* Exits */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);       /* Smooth transitions */
}
```

### Durations
```css
:root {
  --duration-instant: 100ms;     /* Micro-interactions */
  --duration-fast: 150ms;        /* Button states */
  --duration-normal: 300ms;      /* Card hovers, toggles */
  --duration-slow: 500ms;        /* Page transitions */
  --duration-carousel: 1000ms;   /* Carousel crossfade */
}
```

### Standard Transitions
```css
/* Card hover */
.card {
  transition: transform var(--duration-normal) var(--ease-cinema),
              box-shadow var(--duration-normal) var(--ease-cinema);
}
.card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

/* Button states */
.btn {
  transition: background var(--duration-fast) var(--ease-in-out),
              transform var(--duration-fast) var(--ease-in-out);
}
.btn:hover { transform: scale(1.02); }
.btn:active { transform: scale(0.98); }
```

---

## Component Specifications

### Hero Carousel

**Dimensions:**
- Height: `85vh` (fills most of viewport)
- Content positioned bottom 25%

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  [Backdrop Image - Full Width]                         │
│                                                        │
│  ┌─────────────────────────────┐              ●        │
│  │  Title (display-huge)       │              ○        │
│  │  Overview (2-3 lines)       │              ○        │
│  │  [Watch Now] [+ Watchlist]  │              ○        │
│  └─────────────────────────────┘              ○        │
│                                                        │
└────────────────────────────────────────────────────────┘
                                         (indicators right)
```

**Buttons:**
- "Watch Now": White bg, black text, Play icon
- "Add to Watchlist": Gray/glass bg, white text, Plus icon

**Animation:**
- Crossfade between slides: 1s with `--ease-cinema`
- Auto-rotate: 8 seconds per slide

---

### Content Card

**Dimensions:**
- Aspect ratio: 2:3 (movie poster ratio)
- Typical width: 180-200px

**States:**
1. **Default**: Poster image, rounded corners (8px)
2. **Hover**: 
   - Scale to 1.05
   - Show watchlist button (animated plus)
   - Subtle glow effect
3. **In Watchlist**: Checkmark overlay

**Animation (from wishlist.tsx):**
```
Plus → Collapse horizontal line → Rotate to check stem → Draw check tail
```
Port this animation to Angular using `@angular/animations`.

---

### Content Row (Horizontal)

**Layout:**
```
Section Title                                    [→]
────────────────────────────────────────────────────
[Card] [Card] [Card] [Card] [Card] [Card] ...
                      ↔ Horizontal scroll
```

**Features:**
- Section title with optional subtitle (faded)
- Horizontal scroll with momentum
- Arrow buttons for navigation (optional)
- Gap between cards: 16px

---

### Navbar

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  [Logo]                           🔍  📋  👤          │
└────────────────────────────────────────────────────────┘
```

**Style:**
- Fixed position at top
- Glassmorphism background (`backdrop-filter: blur(20px)`)
- Height: 64px
- Border-bottom: subtle `--border-subtle`

**Icons (Lucide):**
- Search: `Search` icon
- Watchlist: `List` or `Bookmark` icon
- Account: `User` or user avatar

---

### Tonight's Pick (Floating Button)

**Position:** Fixed, bottom-right corner (24px from edges)

**Shape:** Squircle (rounded square, border-radius: 16px)

**Size:** 56x56px

**Animation:**
- Subtle pulse when new recommendation
- Scale on hover (1.1)

**On Click:** Open modal with tonight's pick recommendation

---

### Auth Pages (Login/Register)

**Layout:**
- Centered card on dark background
- Max-width: 400px
- Padding: 48px

**Style Reference:** shadcn/ui auth forms

**Components:**
- Input fields with floating labels
- Primary button full-width
- Divider with "or continue with"
- Social login buttons (Google)
- Link to alternate page (login ↔ register)

---

### Watchlist Page

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  My Watchlist                          [Stats] [🎲]   │
├────────────────────────────────────────────────────────┤
│  [All] [Plan to Watch] [Watching] [Completed]         │
│  Type: [All ▼]  Genre: [All ▼]  Sort: [Date ▼]        │
├────────────────────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│  │Card│ │Card│ │Card│ │Card│ │Card│ │Card│            │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘            │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                          │
│  │Card│ │Card│ │Card│ │Card│       ...                │
│  └────┘ └────┘ └────┘ └────┘                          │
└────────────────────────────────────────────────────────┘
```

**Filter Bar:**
- Status tabs: All, Plan to Watch, Watching, Completed
- Dropdowns: Type (Movie/TV), Genre, Sort
- Random button (🎲): Picks random from filtered results

**Stats Button:**
- Opens modal/drawer with statistics
- Animated pie/bar charts

**Card Interactions:**
- Click: Navigate to detail page
- Hover: Show quick actions (status dropdown, remove)
- Status badge visible on card

**Empty State:**
- "Your watchlist is empty"
- CTA: "Discover something to watch"

---

## Icon Library

### Primary: Lucide Angular

```typescript
import { LucideAngularModule, Play, Plus, Search, User, ... } from 'lucide-angular';
```

### Vibe Icons (Replace Emojis)
| Vibe | Emoji (OLD) | Icon (NEW) |
|------|-------------|------------|
| Cozy | 🛋️ | `Coffee` or `Sofa` |
| Intense | ⚡ | `Zap` |
| Mindless | 🍿 | `Popcorn` |
| Thoughtful | 🧠 | `Lightbulb` |
| Dark | 🌙 | `Moon` |
| Funny | 😂 | `Smile` |

### Provider Icons

**Storage:** `/public/icons/providers/` (fallback simple icons do have icon hex color)

**Files:**
- `netflix.svg` (color: #E50914)
- `prime.svg` (color: #00A8E1)
- `jiohotstar.svg` (color: #FF5722)
- `apple.svg` (color: white)
- `sonyliv.svg` (color: custom)

**Selection States:**
- Unselected: Grayscale, 50% opacity
- Selected: Full color of provider brand

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Adjustments
- **Mobile**: Single column cards, hamburger menu
- **Tablet**: 2-3 column grid, visible nav
- **Desktop**: Full horizontal scroll rows, 4+ cards visible

---

## Accessibility

- All interactive elements must be keyboard navigable
- Focus states must be visible
- Color contrast minimum 4.5:1 for text
- Images must have alt text
- Use semantic HTML (`<main>`, `<nav>`, `<section>`)

---

## Performance Targets

- Lighthouse Performance: 90+
- Largest Contentful Paint: < 2.5s
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1
- Images: Use WebP with JPEG fallback
- Animations: 60fps minimum

---

## File Structure

```
frontend/src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   └── services/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── home/
│   │   ├── onboarding/
│   │   ├── search/
│   │   ├── watchlist/
│   │   └── account/
│   └── shared/
│       ├── animations/
│       └── components/
│           ├── hero-carousel/
│           ├── content-card/
│           ├── content-row/
│           ├── navbar/
│           ├── provider-icon/
│           ├── vibe-pill/
│           └── watchlist-button/
├── assets/
│   └── icons/
│       └── providers/
└── styles/
    ├── design-tokens.css
    └── global.css
```
