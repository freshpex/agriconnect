# Contributing to AgriConnect Market

## Getting Started

1. Clone the repository
2. Run `npm install` at the root (installs git hooks)
3. Run `npm run install:all` (installs mobile + backend dependencies)
4. Copy `backend/.env.example` to `backend/.env` and fill in values
5. Start developing:
   - **Mobile:** `npm run mobile`
   - **Backend:** `npm run backend`

---

## Branch Strategy

### Protected Branches
- `main` — Production-ready code. **No direct pushes allowed.**
- `dev` — Integration branch. **No direct pushes allowed.**

All changes must go through **pull requests** to the **dev** branch.

### Branch Naming Convention (Enforced)

```
users/<your-name>/<type>/<short-description>
```

| Type       | When to use                                  |
|------------|----------------------------------------------|
| `feature`  | New feature                                  |
| `bugfix`   | Bug fix                                      |
| `fix`      | Quick fix / patch                            |
| `hotfix`   | Urgent production fix                        |
| `chore`    | Maintenance, dependency updates              |
| `refactor` | Code restructuring without behavior change   |
| `docs`     | Documentation only                           |
| `test`     | Adding or updating tests                     |
| `ci`       | CI/CD pipeline changes                       |

**Examples:**
```
users/enoch/feature/add-farmer-registration
users/amina/bugfix/fix-listing-crash
users/kola/chore/update-dependencies
users/sara/docs/update-api-readme
```

⚠️ Pushes from branches that don't follow this format will be **rejected**.

---

## Commit Message Format (Enforced)

We use [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>: <short description>
```

### Allowed Types

| Type       | Description                          |
|------------|--------------------------------------|
| `feat`     | A new feature                        |
| `fix`      | A bug fix                            |
| `bugfix`   | A bug fix (alias)                    |
| `hotfix`   | Urgent fix                           |
| `docs`     | Documentation changes                |
| `style`    | Formatting, no code change           |
| `refactor` | Code change with no new feature/fix  |
| `perf`     | Performance improvement              |
| `test`     | Adding/updating tests                |
| `build`    | Build system or dependencies         |
| `ci`       | CI/CD changes                        |
| `chore`    | Other changes                        |
| `revert`   | Revert a previous commit             |

### Examples
```
feat: add farmer onboarding screen
fix: resolve listing price calculation error
bugfix: correct SIM swap check timeout
chore: update mongoose to v8.13
docs: add API usage section to README
refactor: extract location service into module
test: add unit tests for KYC verification
```

⚠️ Commits that don't follow this format will be **rejected**.

---

## Pre-commit Checks (Automated)

On every commit, the following checks run automatically:

1. **ESLint** — Lints all staged `.ts` / `.tsx` files
2. **Prettier** — Formats all staged files
3. **Commitlint** — Validates commit message format

If any check fails, the commit is rejected until you fix the issues.

---

## Pre-push Checks (Automated)

On every push, the following checks run automatically:

1. **Branch name validation** — Must follow `users/<name>/<type>/<desc>`
2. **Protected branch check** — Rejects pushes to `main` / `dev`
3. **Lint** — Full project lint
4. **Tests** — All tests must pass

If any check fails, the push is rejected until you fix the issues.

---

## Project Structure

```
agriconnect/
├── mobile/              # Expo React Native app (TypeScript + NativeWind) → deploys to Expo
│   ├── App.tsx
│   ├── src/
│   ├── global.css
│   ├── tailwind.config.js
│   ├── metro.config.js
│   └── package.json     # Independent — has its own deps
├── backend/             # Express API (TypeScript + MongoDB) → deploys to Render
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── config/
│       ├── database/
│       ├── models/
│       └── routes/
│   └── package.json     # Independent — has its own deps
├── .husky/              # Git hooks (pre-commit, commit-msg, pre-push)
├── eslint.config.js
├── .prettierrc
├── commitlint.config.js
├── package.json         # Root — git hooks + shared lint/format only
└── CONTRIBUTING.md
```

---

## Workflow Summary

```
1. git checkout dev
2. git pull origin dev
3. git checkout -b users/your-name/feature/what-you-are-building
4. ... make changes ...
5. git add .
6. git commit -m "feat: describe your change"      ← commitlint checks here
7. git push origin users/your-name/feature/what-you-are-building  ← pre-push checks here
8. Open a Pull Request to dev
```
