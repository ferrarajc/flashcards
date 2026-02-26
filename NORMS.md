# FlashyCards Development Norms

## Git workflow

### Branches
- Create a branch for every fix or feature
- Branch naming: `fix/issue-number-short-description` or `feature/short-description`
- Delete branches after merging

### Commits
- Commit frequently and granularly — one logical change per commit
- Each commit should represent a single, working change
- Write descriptive commit messages in imperative form (e.g. "Add ellipsis menu to deck cards")
- Reference issue numbers in commit messages where applicable (e.g. "Fix #5: ...")

### Pull Requests
- Always open a PR — never commit directly to master
- PR title should be descriptive (it becomes the squash commit message on master)
- Add a progress log comment to the PR documenting iterations during review
- **Merge strategy: Squash and merge** — squashes all branch commits into one clean commit on master
- Test on device before approving and merging

### Issues
- Talk through problems before creating tickets
- Issue descriptions should include: problem, proposed solution, files affected
- Close issues with a comment explaining how they were resolved

### Ticket scope
- **One behavior per ticket.** A ticket should change one thing the user can observe — not a screen, not a feature area, one behavior.
- If a ticket requires changing more than 2–3 files or touches more than one UI component, it is probably too large. Split it.
- New screens ship as a minimal skeleton first (layout + navigation wired up, no polish). Follow-up tickets add each distinct behavior.
- Visual polish (spacing, sizing, color) is a separate ticket from logic (saving, navigation, validation).
- If a PR review requires more than two rounds of "also change X", the ticket was too broad. Retroactively split future work more aggressively.

## Testing

### Automated tests (Jest)
- **Claude runs `npm run test:log` before opening every PR.** This writes verbose results to `test-results.log`, which Claude then reads to verify all tests pass. If any test fails, Claude fixes it before opening the PR.
- Write tests for any new pure logic: utility functions, hooks, data transformations
- Write tests for edge cases that are easy to miss on device (empty states, boundary values, error paths)
- Test files live in `__tests__/`, named `<Subject>.test.js`
- Tests cover logic, not layout — visual/layout issues still require device testing
- `test-results.log` and `coverage/` are gitignored — never commit them

### Test scripts
| Command | Use |
|---|---|
| `npm test` | Quick pass/fail check |
| `npm run test:log` | Verbose output written to `test-results.log` (Claude uses this) |
| `npm run test:coverage` | Coverage report — run occasionally to find gaps |

### Device testing
- Always test on device before approving a PR
- Test before merging, not after

## Style guide
- See STYLE_GUIDE.md for UI and copy standards
- **The style guide must be kept up to date at all times**
- Any design decision made during development must be recorded in STYLE_GUIDE.md
- Style guide updates should be committed in the same PR as the change that prompted them
- When iterating on UI during a PR review, update the style guide before merging
