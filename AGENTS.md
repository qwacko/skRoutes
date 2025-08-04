# AGENTS.md - Development Guidelines for skRoutes

## Commands
- **Build**: `pnpm build` (builds and packages library)
- **Test**: `pnpm test` (runs all Vitest tests)
- **Test single file**: `pnpm test src/lib/skRoutes.test.ts`
- **Type check**: `pnpm check`
- **Lint**: `pnpm lint` (Prettier + ESLint)
- **Format**: `pnpm format`

## Code Style
- **Formatting**: Tabs, single quotes, no trailing commas, 100 char width
- **Imports**: Use `.js` extensions for local imports (e.g., `'./helpers.js'`)
- **Types**: Strict TypeScript, prefer interfaces over types for objects
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces
- **Functions**: Export functions with explicit return types when complex
- **Error handling**: Use validation schemas (Zod/Standard Schema) for runtime validation

## Architecture
- Core library in `src/lib/skRoutes.ts` with helper utilities in `src/lib/helpers.ts`
- Route configuration uses Standard Schema V1 interface for validation
- Export main API through `src/lib/index.ts`
- Tests use Vitest framework with `.test.ts` suffix