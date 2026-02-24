# FlashyCards — Product Documentation

## Vision

Flashcards are a proven, highly effective tool for a specific kind of learning: rote memorization. It may not be the most conceptually rich form of study, but there is a clear and important place for it — vocabulary, science concepts, algebra axioms, foreign languages, and more. The problem is that creating physical flashcards is time-consuming. **FlashyCards exists to make creating and using study tools so simple that the effort barrier disappears entirely.**

---

## Target Users

### Current focus
| Persona | Description |
|---------|-------------|
| **Parents** | Making study tools with or for school-age children. Value simplicity and speed of creation. |
| **Students** | Self-directed learners building their own study materials. Likely to use CSV import for efficiency. |
| **Teachers / Tutors / Instructors** | Creating decks for a class or group. Need sharing capabilities to distribute to students. |

### Future expansion
| Persona | Description |
|---------|-------------|
| **Lifelong learners** | Curiosity-driven users, not studying for a test. Comparable to Brilliant or The Great Courses audience. |
| **Social / trivia fans** | Users who want to play with flashcards in multiplayer or party game formats. |

---

## Jobs To Be Done

> "When I'm preparing my child (or myself) to study a topic, I want to create effective study materials as quickly as possible, so that more time is spent learning and less time is spent on preparation."

Secondary jobs:
- A teacher wants to create a deck once and share it with an entire class.
- A student wants to import content from an external source (e.g., a vocabulary list) without typing every card by hand.
- A trivia enthusiast wants to share a deck with friends and play together.

---

## Deck Creation Methods

### 1. Manual entry *(current)*
Type cards one by one in the UI. Good for:
- First-time users exploring the app
- Small, quick decks
- Understanding how the product works

Limitation: Too laborious for regular or power users.

### 2. CSV upload *(current)*
Upload a two-column CSV (front, back). Good for:
- Power users who create decks frequently
- Content created externally — including LLM-generated CSVs (e.g., point an AI at a vocabulary page and ask it to produce the CSV)
- Teachers building large decks efficiently

### 3. AI-assisted creation *(future)*
Bring LLM-powered deck generation into the app itself — e.g., paste a URL or text and have FlashyCards generate the cards. Removes the need for any external tooling.

---

## Sharing Model — Maturity Stages

The sharing capability needs to grow in step with the user base and use cases.

### Stage 1 — Personal use *(current)*
Decks are created for and used by the individual who created them. No sharing.

### Stage 2 — Direct sharing *(near-term)*
A creator (teacher, tutor, parent) can share a specific deck with specific people (students, children). Access is controlled — not public.

### Stage 3 — Public library *(long-term)*
Decks can be published to a global, searchable corpus. Requires:
- Content classification / tagging
- Search and discovery
- Moderation

---

## Competitive Landscape

| Product | Space |
|---------|-------|
| Anki, Quizlet | Direct: digital flashcard tools |
| Brilliant, The Great Courses | Adjacent: curiosity / lifelong learning market |
| Kahoot, Jackbox | Adjacent: social / trivia / party game formats |

FlashyCards starts in the study tool space and has a path to expand into curiosity learning and social gameplay as the product matures.

---

## Open Questions
- What is the right sharing UX for Stage 2? (Link sharing? Username-based? QR code?)
- How do we handle deck discovery and quality in a public library?
- What multiplayer formats make sense for the trivia/party game use case?
