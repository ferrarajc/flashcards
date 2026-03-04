// FlashyCards design tokens — single source of truth for the "Electric" palette.
// Import what you need: import { colors, shadows, radius } from '../constants/theme';

export const colors = {
  // Brand
  brand:       '#4F46E5',   // indigo — app bar, accent strips, links
  accent:      '#F59E0B',   // amber  — primary CTAs, "Cards" in wordmark

  // Backgrounds
  background:  '#F5F4FF',   // light lavender — page background (ScreenContainer)
  surface:     '#FFFFFF',   // white — cards, modals, input fields

  // Text
  textPrimary:   '#1E1B4B', // deep indigo — headings, deck names
  textSecondary: '#888888', // mid grey  — subtitles, meta
  textMuted:     '#AAAAAA', // light grey — hints, placeholders

  // Borders & dividers
  border:      '#E0E0E0',
  borderLight: '#EEEEEE',

  // Semantic
  danger:  '#E05252',       // red   — destructive actions, "didn't get it"
  success: '#4CAF50',       // green — "got it", completion

  // Flashcard back face
  cardBack: '#5B6CDB',      // blue-indigo — answer side of every card

  // Trophy tiers
  trophy: {
    bronze: '#CD7F32',
    silver: '#A8A9AD',
    gold:   '#FFD700',
  },
};

export const shadows = {
  // Deck list cards, tooltips
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  // Quiz / learn flashcards
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  // Elevated surfaces (manual create card)
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  // Overlay panels (mobile sidebar, tooltips)
  overlay: {
    shadowColor: '#000',
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const radius = {
  sm:   8,    // inputs, small buttons, sidebar items
  md:   12,   // option rows, primary buttons, modals
  lg:   16,   // flashcards
  pill: 100,  // learn mode action buttons (Skip / Flip / Got it)
  badge: 10,  // New badge, tooltips
};
