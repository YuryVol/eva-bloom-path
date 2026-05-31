# Ева (Eva) — Interactive Self-Discovery Journey

**Eva** is a guided, interactive web experience for self-assessment, emotional reflection, and personal growth. Users move through a step-by-step journey: evaluating life spheres, identifying emotional blocks, exploring resistance and fears, working through EMDR-like calming exercises, setting goals, and summarizing their path. The application includes gamification (XP, coins), a virtual companion (Eva), onboarding, authentication, safety/crisis disclaimers, and a shareable results page.

The app is designed with a calming, immersive visual style featuring glassmorphism, ambient backgrounds, smooth animations, and a consistent dark theme.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start v1](https://tanstack.com/start) (full-stack React 19 with SSR/SSG) |
| Build Tool | Vite 7 |
| UI Library | React 19, TypeScript |
| Styling | Tailwind CSS v4 with custom design tokens (`oklch` palette) |
| Component Base | shadcn/ui + Radix UI primitives |
| Animations | Framer Motion |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Backend / Auth | Lovable Cloud (Supabase) — authentication, database, storage |
| Charts | Recharts |
| Carousel | Embla Carousel |
| Package Manager | Bun (preferred) |

---

## Folder Structure

```
├── src/
│   ├── components/
│   │   ├── eva/              # App-specific components (Eva scenes, glass cards, buttons,
│   │   │                       progress bars, sliders, sphere wheel, share dialog, etc.)
│   │   └── ui/               # shadcn/ui base components (button, card, dialog, form, etc.)
│   ├── hooks/                # Reusable React hooks (auth, mobile detection)
│   ├── integrations/
│   │   ├── lovable/          # Lovable-specific integration helpers
│   │   └── supabase/         # Supabase client, auth middleware, auth attacher, types
│   ├── lib/                  # Core logic: stores (Zustand), journey/onboarding types,
│   │                           server functions, utilities
│   ├── routes/               # TanStack Start file-based routes
│   │   ├── _authenticated/   # Protected routes (journey steps, journey layouts)
│   │   │   └── journey/      # All journey steps: assess, current-state, emdr, fears,
│   │   │                       feeling, goal, path, reassess, resistance-shape,
│   │   │                       resistance, spheres, success, summary
│   │   ├── __root.tsx        # Root layout (HTML shell, providers)
│   │   ├── _authenticated.tsx # Auth layout (redirects unauthenticated users)
│   │   ├── about-you.tsx     # Onboarding: about you
│   │   ├── auth-invite.tsx   # Invitation/auth helper
│   │   ├── disclaimer.tsx   # Safety / crisis disclaimer
│   │   ├── index.tsx         # Landing / home page
│   │   ├── intro.tsx         # Onboarding intro
│   │   ├── login.tsx         # Login page
│   │   ├── reset-password.tsx
│   │   ├── to-spheres.tsx    # Transition to spheres
│   │   └── welcome.tsx       # Welcome screen
│   ├── router.tsx            # TanStack Router configuration
│   ├── server.ts             # SSR error wrapper / server entry
│   ├── start.ts              # TanStack Start instance with auth middleware wiring
│   └── styles.css            # Global styles, Tailwind theme tokens
├── public/
│   └── assets/eva/           # SVG illustrations, images, icons for Eva
├── supabase/
│   └── config.toml           # Supabase project configuration
├── .env                      # Environment variables (see below)
├── .env.example              # Example environment variables (for local setup)
├── vite.config.ts            # Vite + TanStack Start configuration
├── wrangler.jsonc            # Cloudflare Workers deployment config
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint configuration
├── .prettierrc               # Prettier configuration
└── README.md                 # This file
```

---

## Local Launch Instructions

### Using Bun (recommended)

```bash
# 1. Install dependencies
bun install

# 2. Start the development server
bun dev
```

The app will be available at `http://localhost:3000` (or the port shown in the terminal).

### Using npm

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

> Note: This project is primarily tested with **Bun**. npm should work for most cases, but if you encounter issues, prefer Bun.

---

## Required Environment Variables

Create a `.env` file in the project root (copy from `.env.example`) and fill in the following:

```env
# Supabase / Lovable Cloud
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_PROJECT_ID="your-project-id"
```

- `SUPABASE_URL` / `VITE_SUPABASE_URL` — your Supabase project URL.
- `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` — the public anon key from your Supabase project settings.
- `VITE_SUPABASE_PROJECT_ID` — your Supabase project ID.

> **Security note:** Never commit the `.env` file to version control. It is already excluded via `.gitignore`.

---

## Excluded Files

The following are **intentionally excluded** from the source archive:

- `node_modules/` — dependencies (install locally)
- `.env` — environment secrets (create manually from `.env.example`)
- `.git/` — Git history
- `dist/`, `build/` — build artifacts
- `*.log`, `.cache/`, `.turbo/`, `.wrangler/` — temporary / cache files
- Lock files (`bun.lockb`, `package-lock.json`) — regenerate with your package manager

---

## Continuing Development

### VS Code

1. Open the project folder in VS Code.
2. Install the recommended extensions: ESLint, Prettier, Tailwind CSS IntelliSense.
3. Run `bun install` in the integrated terminal.
4. Run `bun dev` to start the dev server.

### GitHub

1. Create a new repository on GitHub.
2. Initialize Git in the project folder: `git init`
3. Add all files: `git add .`
4. Commit: `git commit -m "Initial commit"`
5. Add remote and push: `git remote add origin <your-repo-url>` && `git push -u origin main`

### GPT Codex (or other AI coding assistants)

1. Upload or sync the project folder.
2. Provide the AI with the tech stack summary and folder structure above.
3. Key files for understanding the app flow:
   - `src/routes/_authenticated/journey/` — all journey steps
   - `src/lib/journey-store.ts` — journey state logic
   - `src/lib/journey-types.ts` — TypeScript types
   - `src/components/eva/` — reusable UI components

---

## Build for Production

```bash
bun run build
# or
npm run build
```

The output will be in the `dist/` directory, ready for deployment on Cloudflare Workers or other edge-compatible platforms.
