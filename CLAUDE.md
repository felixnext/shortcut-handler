# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application built with the T3 Stack template. The project uses TypeScript with strict mode enabled and is configured for modern web development.

## Essential Commands

```bash
# Development
pnpm dev              # Start development server with Turbo

# Build & Production
pnpm build            # Build for production
pnpm start            # Start production server
pnpm preview          # Build and start production server

# Code Quality
pnpm check            # Run Biome linter/formatter checks
pnpm check:write      # Auto-fix Biome issues
pnpm typecheck        # Run TypeScript type checking
```

## Architecture & Structure

The application is organized as a monorepo with the main Next.js app in the `/shortcuts` directory:

- **App Router**: Uses Next.js 15 App Router (located in `/shortcuts/src/app/`)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Type Safety**: TypeScript with strict mode, enforced via `pnpm typecheck`
- **Code Quality**: Biome for linting, formatting, and import sorting (replaces ESLint/Prettier)
- **Environment Variables**: Validated at build time using Zod schemas in `/shortcuts/src/env.js`

## Key Technical Decisions

1. **Package Manager**: Uses pnpm (not npm or yarn)
2. **Linting/Formatting**: Uses Biome instead of ESLint/Prettier - always run `pnpm check:write` before committing
3. **Environment Validation**: All env vars must be defined in `/shortcuts/src/env.js` with Zod schemas
4. **Import Paths**: Uses `~/*` for absolute imports from `/shortcuts/src/`

## Development Workflow

When making changes:
1. Always work within the `/shortcuts` directory for application code
2. Run `pnpm typecheck` to ensure type safety
3. Run `pnpm check:write` to format code before committing
4. Environment variables must be added to both `.env` and validated in `src/env.js`