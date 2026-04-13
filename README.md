# 🌾 AgriConnect Market

A mobile-first digital marketplace connecting smallholder farmers in Sub-Saharan Africa to buyers — powered by Nokia CAMARA network APIs.

## Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Mobile     | Expo (React Native), TypeScript, NativeWind     |
| Backend    | Node.js, Express, TypeScript                    |
| Database   | MongoDB (Mongoose)                               |
| Network    | Nokia Network-as-Code (CAMARA APIs)              |
| Styling    | NativeWind (Tailwind CSS for React Native)       |

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Expo CLI (`npx expo`)

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd agriconnect

# Install root dependencies (git hooks, linting)
npm install

# Install mobile and backend dependencies
npm run install:all

# Set up backend env
cp backend/.env.example backend/.env
# Edit .env with your MongoDB URI and Nokia API keys

# Start mobile app (terminal 1)
npm run mobile

# Start backend (terminal 2)
npm run backend
```

## Project Structure

```
agriconnect/
├── mobile/            # Expo React Native app → deploys to Expo
├── backend/           # Express API server → deploys to Render
├── .husky/            # Git hooks (enforced rules)
├── CONTRIBUTING.md    # Branch, commit, and workflow rules
└── package.json       # Root (hooks + shared lint only)
```

## Nokia CAMARA APIs Used

1. **KYC Match** — Farmer identity verification
2. **SIM Swap** — Account fraud protection
3. **Number Verification** — Silent mobile number confirmation
4. **Location Verification** — Farm location authentication
5. **Device Status** — Connectivity-aware UX
6. **QoD (Quality on Demand)** — Reliable transaction sessions

## Git Rules

See [CONTRIBUTING.md](CONTRIBUTING.md) for full details.

- **No direct pushes** to `main` or `dev`
- **Branch format:** `users/<name>/<type>/<description>`
- **Commit format:** `feat: ...`, `fix: ...`, `bugfix: ...`, `chore: ...`, etc.
- **All lint + tests must pass** before push

## Team

**Team Urside** — Africa Ignite Hackathon 2026

## License

MIT
