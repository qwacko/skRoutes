# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

skRoutes is a SvelteKit library that provides typesafe URL generation and state management for SvelteKit applications. It allows treating URLs as first-class state stores with validation using Zod schemas.

## Core Architecture

### Main Components

- **`src/lib/skRoutes.ts`**: Core library implementation containing the `skRoutes` higher-order function and all main functionality
- **`src/lib/helpers.ts`**: Utility functions for URL parameter handling, object merging, and search parameter conversion
- **`src/lib/index.ts`**: Library entry point that exports the main API
- **`src/routes/routeConfig.ts`**: Example configuration showing how to set up route definitions with validation

### Key Concepts

The library centers around a configuration-driven approach where routes are defined with optional parameter and search parameter validation functions. The `skRoutes` function returns:

- `urlGenerator`: Creates typesafe URLs with validated parameters
- `pageInfo`: Client-side route information and URL updating utilities
- `serverPageInfo`: Server-side equivalent of pageInfo
- `pageInfoStore`: Reactive store with debounced URL updates

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Build library and package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm check

# Linting and formatting
pnpm lint
pnpm format
```

## Testing

- Tests use Vitest framework
- Test files: `src/**/*.{test,spec}.{js,ts}`
- Run tests with `pnpm test`

## Package Structure

This is a SvelteKit library package that:

- Exports to `dist/` directory
- Uses `svelte-package` for building
- Supports Svelte 5.x as peer dependency
- Uses TypeScript with strict type checking

## Route Configuration Pattern

Routes are defined with address patterns (SvelteKit route syntax) and optional validation:

```typescript
config: {
  '/[id]': {
    paramsValidation: z.object({ id: z.string() }).parse
  },
  '/server/[id]': {
    paramsValidation: z.object({ id: z.string() }).parse,
    searchParamsValidation: z.object({ data: z.string().optional() }).parse
  }
}
```

Error handling uses an `errorURL` that receives error messages as query parameters when validation fails.
