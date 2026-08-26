# Zenplay Frontend

Aura Frontend is the React application for the Aura project. It provides the user interface for authentication, playlist-based YouTube library management, favorites, and in-browser playback controls.

The application is built with `React`, `TypeScript`, and `Vite`, and uses `Tailwind CSS` with `shadcn/ui`-style components for the interface layer. It communicates with the Rust backend over HTTP and relies on cookie-based authentication.

## What This Application Does

- Presents login and signup flows for user authentication
- Protects application routes based on the current authenticated session
- Displays a personal YouTube library grouped by playlist labels
- Supports system views for:
  - `All` saved items
  - `Favorites`
- Allows users to:
  - add a YouTube URL with a custom title
  - assign the item to an existing playlist label
  - create a new playlist label while saving
  - rename playlist labels
  - move saved items between playlist labels
  - update saved item titles
  - mark and unmark favorites
  - delete saved items
- Provides embedded YouTube playback with:
  - play selected item
  - play current view
  - loop selected item
  - loop current list

## Frontend Responsibilities

This project is responsible for:

- rendering the authenticated application shell
- managing client-side route protection
- calling backend APIs with `credentials: "include"`
- reflecting backend playlist and item state in the UI
- controlling the browser-side YouTube iframe player

This project does not:

- manage database access directly
- issue or validate JWTs itself
- persist auth state outside the backend-managed cookie

## Core Screens

- `Login`
- `Signup`
- `Home`
- `Not Found`

The home screen is the primary working area and includes:

- playlist navigation sidebar
- add-item form
- player panel
- current-view library list

## API Integration

The frontend expects the backend to expose endpoints for:

- signup, login, logout, and current-session lookup
- label listing and rename
- item listing, creation, update, and deletion

The API base URL is configured through:

- `VITE_API_BASE_URL`

See [.env.example](./.env.example)

## Local Development

1. Copy `.env.example` to `.env`
2. Set `VITE_API_BASE_URL` to the running backend URL
3. Install dependencies
4. Start the development server

```bash
pnpm install
pnpm dev
```

Default local API target:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Available Scripts

- `pnpm dev` starts the Vite development server
- `pnpm build` creates a production build
- `pnpm preview` serves the production build locally
- `pnpm lint` runs ESLint

## Technology Stack

- `React 19`
- `TypeScript`
- `Vite`
- `React Router`
- `Tailwind CSS`
- `shadcn/ui` patterns
- `Lucide React`

## Notes

- Authentication depends on the backend sending and accepting cookies correctly
- The frontend should use the same host convention consistently in development, for example `localhost` everywhere instead of mixing `localhost` and `127.0.0.1`
- This frontend is intended to be deployed separately from the backend
