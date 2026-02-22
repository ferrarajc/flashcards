# FlashyCards Style Guide

## Text & Typography

### Casing
- **Screen headings**: Sentence case (e.g. "My decks", "New deck")
- **Nav bar titles**: Title case (e.g. "FlashyCards", "New Deck")
- **Buttons**: Sentence case (e.g. "New deck", "Save deck")
- **Menu items**: Title case (e.g. "Learn", "Rename", "Delete")
- **Body text / descriptions**: Sentence case

### Alignment
- **Screen headings**: Centered
- **Body text**: Left aligned
- **Card text (quiz)**: Centered

### Font sizes
- **Screen headings**: 28px, bold
- **Deck name (list)**: 18px, semibold
- **Deck count (list)**: 13px, regular
- **Card text (quiz)**: Dynamic, starts at 28px, scales down to fit
- **Body / hint text**: 13–16px, regular
- **Primary buttons**: 18px, semibold

---

## Colors

### Primary palette
- **Primary blue**: `#4a90e2` — buttons, links, back card background
- **App background**: `#f5f5f5`
- **Card background (front)**: `#ffffff`
- **Card background (back)**: `#4a90e2`

### Secondary palette
- **Destructive / delete**: `#cc3333`
- **Secondary text**: `#888888`
- **Divider**: `#e0e0e0`
- **Dark button (quiz Next)**: `#333333`

---

## Responsive Layout

### Breakpoints
- **Phone**: < 600px — full width, hamburger menu for sidebar
- **Tablet**: 600–1024px — sidebar always visible
- **Desktop**: > 1024px — sidebar always visible, wider content area

### Content max-width
- **Main content area**: max 680px, centered within available space
- **Phone**: full width (no max-width cap)

### Sidebar
- **Phone**: hidden by default, opened via hamburger icon
- **Tablet / Desktop**: permanently visible (`drawerType="permanent"`)

### Header
- **Height**: 64px
- **Background**: white, with 1px bottom border (`#e0e0e0`)
- **Logo**: left-aligned, 160×44px on desktop/tablet, 130×36px on phone — tapping navigates to Home
- **Right side**: hamburger icon on phone (3 bars, 22px wide, `#333`), reserved for nav links on desktop/tablet
- **User avatar**: far right of header (future)
- **Logo file**: `assets/Logo.png`

### Buttons
- **Never full width** — buttons should be sized to their content or capped with a max-width
- **Primary action button**: max-width 340px, centered

### Learn mode (quiz)
- **Fullscreen** — no nav bar, no sidebar, distraction-free

---

## Spacing & Layout

### Screen padding
- **Standard screen padding**: 20px

### Cards (deck list)
- **Padding**: 16px
- **Border radius**: 10px
- **Shadow**: opacity 0.1, radius 4

### Cards (quiz)
- **Padding**: 24px
- **Border radius**: 16px
- **Height**: 45% of screen height
- **Shadow**: opacity 0.15, radius 8

### Buttons
- **Primary button border radius**: 12px
- **Primary button padding**: 16px vertical

---

## Components

### Deck list item
- Left side (tappable): navigates into quiz
- Right side: ellipsis (•••) menu button separated by a vertical divider
- Ellipsis font size: 14px

### Action sheet (ellipsis menu)
- Title: deck name
- Options in order: Learn, Rename, Edit, Delete
- Delete is destructive (red)
- Triggered via native iOS Action Sheet

### Delete confirmation
- Title: `Delete "Deck Name"` using actual deck name
- Body: `Are you sure?`
- Buttons: Cancel, Delete (destructive)

### Quiz card flip
- Animation: scaleX from 1 → 0 → 1 (horizontal squish)
- Front card: white background, dark text
- Back card: primary blue background, dark text

---

## Navigation

- Nav bar titles: Title case
- Back navigation: default iOS behavior
- End screen: no nav bar (headerShown: false)
