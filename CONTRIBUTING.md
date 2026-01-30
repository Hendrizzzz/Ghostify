# Contributing to Ghostify

Thanks for your interest in contributing! Here's how you can help.

## Reporting Bugs

Found something broken? [Open an issue](../../issues/new) with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser version and OS

## Suggesting Features

Have an idea? [Open an issue](../../issues/new) and describe:
- The problem you're trying to solve
- How you envision the solution
- Why this would benefit other users

## Submitting Code

1. Fork the repo
2. Create a branch: `git checkout -b fix/your-fix` or `feature/your-feature`
3. Make your changes in the `dist/` folder
4. Test on both Instagram and Messenger
5. Submit a PR with a clear description

## Finding New Patterns

When Instagram/Messenger updates break the extension:

1. Enable debug mode:
   ```javascript
   localStorage.setItem('GHOSTIFY_DEBUG', 'true');
   ```
2. Open the browser console
3. Perform the action that should be blocked (read a message, etc.)
4. Look for `🕵️ Ghostify Inspector` logs
5. Find the new pattern and submit a PR updating `patterns.json`

## Code Style

- No unnecessary comments
- Keep functions small and focused
- Test before submitting

## Questions?

Open an issue with the `question` label.
