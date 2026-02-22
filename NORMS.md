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

## Testing
- Always test on device before approving a PR
- Test before merging, not after

## Style guide
- See STYLE_GUIDE.md for UI and copy standards
- **The style guide must be kept up to date at all times**
- Any design decision made during development must be recorded in STYLE_GUIDE.md
- Style guide updates should be committed in the same PR as the change that prompted them
- When iterating on UI during a PR review, update the style guide before merging
