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
- **Brand indigo**: `#4F46E5` — app bar, deck accent strips, links, active states
- **Accent amber**: `#F59E0B` — primary CTA buttons ("+ New deck"), "Cards" in wordmark
- **App background**: `#F5F4FF` — light lavender (ScreenContainer)
- **Card background (front)**: `#ffffff`
- **Card background (back / learn answer)**: `#5b6cdb`
- **Primary text**: `#1E1B4B` — deep indigo; used on key headings and deck names

### Secondary palette
- **Destructive / delete**: `#e05252`
- **Secondary text**: `#888888`
- **Divider**: `#e0e0e0`
- **Success / got it**: `#4caf50`
- **Trophy — bronze**: `#cd7f32`
- **Trophy — silver**: `#a8a9ad`
- **Trophy — gold**: `#ffd700`

---

## Responsive Layout

### Breakpoints
- **Phone**: < 600px — full width, hamburger menu for sidebar
- **Tablet**: 600–1024px — sidebar always visible
- **Desktop**: > 1024px — sidebar always visible, wider content area

### Content max-width
- **Main content area**: max 680px, centered within available space
- **Phone**: full width (no max-width cap)

### App bar
- **Shown on**: every screen except fullscreen flows (`headerShown: false`)
- **Height**: 58px
- **Background**: brand indigo `#4F46E5`
- **Wordmark**: "Flashy" in white + "Cards" in amber `#F59E0B`, 22px, weight 800; always centered; tapping navigates to Home
- **Left slot**: white back arrow (`Ionicons arrow-back`, 24px) on inner screens; white hamburger (`Ionicons menu`, 26px) on Home/phone; empty on Home/desktop
- **Right slot**: reserved for future actions
- **Component**: `components/AppHeader.js` (exports `BRAND` and `ACCENT` constants)

### Sidebar
- **Width**: 240px
- **Phone**: hidden by default, opened via hamburger in app bar
- **Tablet / Desktop**: permanently visible below the app bar
- **Sections**: "MY DECKS" section label (10px, uppercase, letter-spacing 1.2) above nav items
- **Nav items**: icon + label, 15px semibold; My decks (`albums-outline`) → Home; New deck (`add-circle-outline`) → NewDeck
- **Icon color**: brand indigo `#4F46E5`

### Buttons
- **Never full width** — buttons should be sized to their content or capped with a max-width
- **Primary action button**: max-width 340px, `alignSelf: 'center'`, `width: '100%'`

### Quiz card
- **Width**: `Math.min(screenWidth - 40, 640px)` — full width on phone, capped on desktop
- **Height**: 45% of screen height
- Uses `useWindowDimensions` (not static `Dimensions`) so it responds to window size

### Learn mode
- **Fullscreen** — no app bar (`headerShown: false`), no sidebar, distraction-free
- **Close button**: `Ionicons close`, 24px, color `#aaa`, absolute top-right of header; opens confirmation modal (not Alert — unreliable on web)
- **Exit confirmation modal**: title "🐔 Bok bok!", body "Giving up already? Your progress on this round won't be saved."; buttons: "Keep going" (indigo filled), "Quit" (red outline)
- Wrapped in `SafeAreaView`

### Learn mode — deck info box
- Bordered box (`borderWidth: 1.5`, `borderColor: #d0d0d0`, `borderRadius: 12`, white bg) centered in header
- Contains: deck name (17px, weight 700) / subtitle "{N} cards, {N} left to learn" (12px, `#aaa`, `numberOfLines={1}`) / trophy icon row
- Trophies: `Ionicons trophy` (filled+colored) or `trophy-outline` (grey `#ccc`); earned trophies show tooltip on hover (web) or tap (mobile)
- Trophy tooltip: floats above icon, white card with shadow, trophy name (14px bold) + description (12px muted)

### Learn mode — prompt
- Typewriter animation: types character-by-character at 75ms/char (~3s for a 40-char tip)
- Pauses 10s after full message, then advances to next tip; rotation is continuous across card changes
- Tips source: `docs/memory-tips.md` (keep in sync with `MEMORY_TIPS` array in `LearnScreen.js`)
- Answer face shows "Did you get it?" instantly (no typewriter)

### Learn mode — layout (top to bottom)
1. Header: deck info box + close button
2. Prompt row
3. Flashcard (question or answer face)
4. Action buttons (Skip / Flip on question face; I didn't get it / I got it on answer face)
5. Horizontal rule divider
6. Stats row: "I didn't get" (red) / learned % (large, center) / "I did get" (green)

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
- Left accent strip: 4px wide, brand indigo `#4F46E5`, full card height (`alignSelf: 'stretch'`); card uses `overflow: 'hidden'`
- Left side (tappable): navigates to ModeSelect; tapping also clears the New badge
- Right side: ellipsis (•••) menu button separated by a vertical divider
- Ellipsis font size: 14px
- Deck name: 17px, weight 700, color `#1E1B4B`; 1 line max, truncates with ellipsis
- Meta row (below name): card count + New badge + earned trophy icons (if applicable)

### New badge
- Shown on decks that have never been opened for a Learn session
- Clears on first Learn session (via action sheet or card tap)
- Auto-expires after 7 days from `createdAt` timestamp
- Style: brand indigo (`#4F46E5`) pill, white text, 11px bold, `paddingHorizontal: 8`, `borderRadius: 10`
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

---

## UX Principles

### Never provide a one-tap escape from unsaved work
Creation and editing flows must not expose a prominent, easily-tappable action (e.g. an ✕ button) that silently discards all unsaved content. Such an action is too easy to trigger accidentally and destroys user work without recourse.

**Rule:** In any screen where the user is creating or editing content, the only top-level exit must be the intentional save action (e.g. "Done"). If a back/close affordance is provided alongside unsaved content, it must require explicit confirmation (e.g. an Alert with a destructive "Discard" option) before discarding. When in doubt, auto-save or keep the draft.

---

## Manual Deck Creation Screen

### Layout
- No nav bar (`headerShown: false`) — screen manages its own header
- Header: left spacer (mirrors Done width) | centered editable deck name | Done button
- Card fills all remaining vertical space below header (`flex: 1`)
- No action bar, no tab switcher, no dot indicators

### Swipe model
Pages cycle: Card 1 front → Card 1 back → Card 2 front → Card 2 back → … → Add card page
- Total pages = `cards.length * 2 + 1`
- Swiping right advances through front/back pairs, ending at the Add card page
- Add card page: plain background, centered dashed-border "+ Add card" button

### Navigation arrows
- Circular white buttons (40×40, `borderRadius: 20`), shadow, `rgba(255,255,255,0.92)` background
- Floating on top of card, vertically centered in card area via absolute positioning
- Left arrow at `left: 8`, right arrow at `right: 8` within the card area
- Card horizontal padding is 56px to keep card content clear of arrows
- Left arrow disabled (opacity 0.25) on first page; right arrow disabled on last page

### Card surface
- Front: white (`#FFFFFF`) background, dark (`#222`) text
- Back: primary blue (`#4a90e2`) background, white text
- Back face shows front question text (13px, `rgba(255,255,255,0.65)`) + separator above answer input
- TextInput fills card (`flex: 1`), multiline, scrollable for long content, top-aligned
- Placeholders: "Type a question" (front) / "Type an answer" (back)

### Card chrome
- Top-right: `•••` ellipsis tapping opens action sheet — "Delete card" (destructive) + "Cancel"
- Bottom-left: `x/y` counter (12px, semibold, low-opacity) showing current card / total cards
- If only one card and Delete is chosen: clears the card's text rather than removing it

### Saving
- Done validates at least one non-empty card; saves `frontColor: '#FFFFFF'`, `backColor: '#4a90e2'`, `isNew: true`, `createdAt`
- Navigates to Home on success; no chicken/confirmation message
