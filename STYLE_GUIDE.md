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
- **Width**: 240px
- **Phone**: hidden by default, opened via hamburger icon in nav bar (`drawerType="front"`)
- **Tablet / Desktop**: permanently visible (`drawerType="permanent"`), AppHeader spans full width above it
- **Nav items**: My decks (→ Home), New deck (→ CreateDeck)
- **Item text**: 16px, semibold
- **New deck text color**: primary blue `#4a90e2`

### Header
- **Shown on**: tablet and desktop only — phone uses default nav bar with "FlashyCards" text title
- **Height**: 100px
- **Background**: `#fcfdfc` (matches logo background)
- **Bottom border**: 1px, `#e0e0e0`
- **Logo**: left-aligned, 380×88px, tapping navigates to Home
- **Right side**: reserved for global nav links (future)
- **User avatar**: far right of header (future)
- **Logo file**: `assets/Logo.png`

### Buttons
- **Never full width** — buttons should be sized to their content or capped with a max-width
- **Primary action button**: max-width 340px, `alignSelf: 'center'`, `width: '100%'`

### Quiz card
- **Width**: `Math.min(screenWidth - 40, 640px)` — full width on phone, capped on desktop
- **Height**: 45% of screen height
- Uses `useWindowDimensions` (not static `Dimensions`) so it responds to window size

### Learn mode (quiz)
- **Fullscreen** — no nav bar (`headerShown: false`), no sidebar, distraction-free
- **Close button**: top-left corner, ✕ glyph, 20px, color `#888`, padding 8px
- **Exit confirmation**: Alert — "Exit session?" / "Your progress won't be saved." — buttons: Keep going (cancel), Exit (destructive)
- Wrapped in `SafeAreaView` to respect notch / dynamic island on iPhone

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
- Left side (tappable): navigates into quiz; tapping also clears the New badge
- Right side: ellipsis (•••) menu button separated by a vertical divider
- Ellipsis font size: 14px
- Deck name: 1 line max, truncates with ellipsis (`numberOfLines={1}`)
- Meta row (below name): card count + New badge (if applicable)

### New badge
- Shown on decks that have never been opened for a Learn session
- Clears on first Learn session (via action sheet or card tap)
- Auto-expires after 7 days from `createdAt` timestamp
- Style: blue (`#4a90e2`) pill, white text, 11px bold, `paddingHorizontal: 8`, `borderRadius: 10`
- Position: meta row, alongside card count

### Action sheet (ellipsis menu)
- Title: deck name
- Options in order: Learn, Rename, Edit, Delete
- Delete is destructive (red)
- Triggered via native iOS Action Sheet
- Learn option clears New badge before navigating

### Delete confirmation
- Title: `Delete "Deck Name"` using actual deck name
- Body: `Are you sure?`
- Buttons: Cancel, Delete (destructive)

### Quiz card flip
- Animation: scaleX from 1 → 0 → 1 (horizontal squish)
- Front card: white background, dark (`#222`) text
- Back card: primary blue background
  - Question shown at top: 13px, `rgba(255,255,255,0.7)`, max 2 lines
  - Separator: 40% width, 1px, `rgba(255,255,255,0.3)`, 10px vertical margin
  - Answer below: white, dynamic font size

---

## Navigation

- Nav bar titles: Title case
- Back navigation: default iOS behavior
- End screen: no nav bar (headerShown: false)
