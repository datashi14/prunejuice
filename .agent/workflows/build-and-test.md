---
description: How to build and test the Prune Juice application
---

# Build and Test Workflow

Use this workflow to ensure that the application is correctly integrated and ready for release.

## 1. Validate Fork Integrity

Ensure all open-source forks (Penpot, Fooocus) are correctly placed.

```bash
python scripts/validate-forks.py
```

## 2. Run Backend Tests

Verify the AI optimization and bridge logic.

```bash
python scripts/test-backend.py
```

## 3. Run Frontend Tests

Verify the UI components and React logic.

```bash
cd desktop-app
npm test
```

## 4. Full Build Test

Verify the installer can be compiled successfully.

```bash
cd desktop-app
npm run build
```

## 5. Deployment

Check the GitHub Actions status at `https://github.com/datashi14/prunejuice/actions` before merging to `main`.
