/**
 * skRoutes Vite Plugin
 *
 * Automatically generates TypeScript configuration files for skRoutes by scanning your SvelteKit routes.
 * Creates both client-side and server-side configurations with proper type inference.
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { skRoutesPlugin } from './src/lib/vite-plugin-skroutes.js';
 *
 * export default defineConfig({
 *   plugins: [
 *     sveltekit(),
 *     skRoutesPlugin({
 *       errorURL: '/error',
 *       unconfiguredParams: 'simple',
 *       unconfiguredSearchParams: 'never'
 *     })
 *   ]
 * });
 * ```
 */

import type { Plugin } from 'vite';
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Strategy for handling TypeScript types of unconfigured route parameters.
 * Controls how parameters are typed when no explicit validation is provided.
 */
type UnconfiguredParamStrategy =
	| 'allowAll' // Record<string, string> - Accepts any string parameters
	| 'never' // {} - No parameters allowed
	| 'simple' // { [key: string]?: string } - Optional string parameters
	| 'strict'; // never - Prevents usage entirely (compile-time error)

/**
 * Strategy for handling TypeScript types of unconfigured search parameters.
 * Controls how search parameters are typed when no explicit validation is provided.
 */
type UnconfiguredSearchParamStrategy =
	| 'allowAll' // Record<string, unknown> - Accepts any search parameters
	| 'never' // {} - No search parameters allowed
	| 'simple' // { [key: string]?: string | string[] } - Optional string/array parameters
	| 'strict'; // never - Prevents usage entirely (compile-time error)

/**
 * Configuration options for the skRoutes Vite plugin.
 */
interface PluginOptions {
	/** Path where the server-side config file will be generated. @default 'src/lib/.generated/skroutes-server-config.ts' */
	serverOutputPath?: string;

	/** Path where the client-side config file will be generated. @default 'src/lib/.generated/skroutes-client-config.ts' */
	clientOutputPath?: string;

	/** Additional import statements to include in generated files. @default [] */
	imports?: string[];

	/** Whether to include server-side files (+page.server.ts, +server.ts) in scanning. @default true */
	includeServerFiles?: boolean;

	/** Manual route configurations to include alongside auto-detected routes. @default {} */
	baseConfig?: Record<string, any>;

	/** URL to redirect to when validation fails. @default '/error' */
	errorURL?: string;

	/** How to type unconfigured route parameters. @default 'allowAll' */
	unconfiguredParams?: UnconfiguredParamStrategy;

	/** How to type unconfigured search parameters. @default 'allowAll' */
	unconfiguredSearchParams?: UnconfiguredSearchParamStrategy;
}

/**
 * Internal interface representing a detected route configuration.
 * Used to track which routes have explicit validation and where they're defined.
 */
interface SchemaDefinition {
	/** The SvelteKit route path (e.g., '/users/[id]') */
	routePath: string;
	/** Absolute file path to the route file */
	filePath: string;
	/** Name of the exported route config (usually '_routeConfig') */
	routeConfig?: string;
	/** Whether this route exports paramsValidation */
	hasParamsValidation?: boolean;
	/** Whether this route exports searchParamsValidation */
	hasSearchParamsValidation?: boolean;
	/** Whether this is a server file (+page.server.ts, +server.ts) */
	isServerFile?: boolean;
	/** File type for better tracking */
	fileType?: 'client' | 'server' | 'api';
}

/**
 * Creates a Vite plugin that automatically generates skRoutes configuration files.
 *
 * ## How It Works
 *
 * 1. **Route Discovery**: Scans your `src/routes` directory for SvelteKit route files
 * 2. **Configuration Detection**: Looks for `_routeConfig` exports in `+page.ts`, `+page.server.ts`, and `+server.ts` files
 * 3. **Smart Defaults**: Automatically generates validation and types for routes without explicit configuration
 * 4. **Type Generation**: Creates TypeScript type mappings for compile-time type safety
 * 5. **Hot Reload**: Regenerates configs when route files change during development
 *
 * ## Generated Files
 *
 * - **Client Config**: Safe for browser use, only imports from client-side files
 * - **Server Config**: Includes server-side routes, should only be used server-side
 *
 * ## Route Configuration
 *
 * Add validation to your routes by exporting `_routeConfig`:
 *
 * ```typescript
 * // src/routes/users/[id]/+page.ts
 * import { z } from 'zod';
 *
 * export const _routeConfig = {
 *   paramsValidation: z.object({ id: z.string().uuid() }).parse,
 *   searchParamsValidation: z.object({ tab: z.enum(['profile', 'settings']).optional() }).parse
 * };
 * ```
 *
 * ## Parameter Type Strategies
 *
 * Control how unconfigured routes are typed:
 *
 * - **`allowAll`** (default): Permissive types like `Record<string, string>`
 * - **`simple`**: Optional parameters like `{ [key: string]?: string }`
 * - **`never`**: Empty object `{}` - no parameters allowed
 * - **`strict`**: TypeScript `never` - prevents usage entirely
 *
 * @param options Configuration options for the plugin
 * @returns A Vite plugin instance
 *
 * @example
 * ```typescript
 * // Basic usage
 * skRoutesPlugin()
 *
 * // With configuration
 * skRoutesPlugin({
 *   errorURL: '/404',
 *   unconfiguredParams: 'strict',
 *   unconfiguredSearchParams: 'simple',
 *   includeServerFiles: false
 * })
 *
 * // With manual route configs
 * skRoutesPlugin({
 *   baseConfig: {
 *     '/api/health': { paramsValidation: undefined, searchParamsValidation: undefined }
 *   }
 * })
 * ```
 */
export function skRoutesPlugin(options: PluginOptions = {}): Plugin {
	const {
		serverOutputPath = 'src/lib/.generated/skroutes-server-config.ts',
		clientOutputPath = 'src/lib/.generated/skroutes-client-config.ts',
		imports = [],
		includeServerFiles = true,
		baseConfig = {},
		errorURL = '/error',
		unconfiguredParams = 'allowAll',
		unconfiguredSearchParams = 'allowAll'
	} = options;
	let root: string;

	return {
		name: 'skroutes-plugin',
		configResolved(config) {
			root = config.root;
		},
		buildStart() {
			// Generate both server and client config files at build start
			generateServerConfigFile();
			generateClientConfigFile();
		},
		async handleHotUpdate({ file, server }) {
			// Regenerate config when page or server files change
			const isRelevantFile =
				(file.includes('+page.') && (file.endsWith('.ts') || file.endsWith('.js'))) ||
				(includeServerFiles &&
					file.includes('+server.') &&
					(file.endsWith('.ts') || file.endsWith('.js')));
			if (isRelevantFile) {
				generateServerConfigFile();
				generateClientConfigFile();
			}
		}
	};

	function generateServerConfigFile(): void {
		const configContent = generateServerConfigModule();
		const configPath = join(root, serverOutputPath);

		// Ensure directory exists
		const configDir = join(root, serverOutputPath.split('/').slice(0, -1).join('/'));
		if (!existsSync(configDir)) {
			mkdirSync(configDir, { recursive: true });
		}

		writeFileSync(configPath, configContent, 'utf-8');
	}

	function generateClientConfigFile(): void {
		const configContent = generateClientConfigModule();
		const configPath = join(root, clientOutputPath);

		// Ensure directory exists
		const configDir = join(root, clientOutputPath.split('/').slice(0, -1).join('/'));
		if (!existsSync(configDir)) {
			mkdirSync(configDir, { recursive: true });
		}

		writeFileSync(configPath, configContent, 'utf-8');
	}

	function generateRelativeImportPath(filePath: string): string {
		// Convert absolute file path to relative import path from the generated config
		const relativePath = filePath.replace(root, '').replace(/\\/g, '/');

		// Remove file extension and convert to import path
		// From src/lib/.generated/ to src/routes/... we need to go up and then down
		const importPath = relativePath.replace(/\.(ts|js)$/, '').replace(/^\/src\//, '../../../src/');

		return importPath;
	}

	function getAllRoutes(): string[] {
		const routes: string[] = [];
		const routesDir = join(root, 'src/routes');

		function walkDirectory(dir: string, relativePath = ''): void {
			if (!existsSync(dir)) return;

			const entries = readdirSync(dir);

			for (const entry of entries) {
				const fullPath = join(dir, entry);
				const stat = statSync(fullPath);

				if (stat.isDirectory()) {
					walkDirectory(fullPath, join(relativePath, entry));
				} else if (
					entry.match(/^\+(page|server)\.(server\.)?[tj]s$/) ||
					entry.match(/^\+page\.svelte$/)
				) {
					const routePath = extractRoutePathFromDirectory(relativePath);
					if (!routes.includes(routePath)) {
						routes.push(routePath);
					}
				}
			}
		}

		walkDirectory(routesDir);
		return routes;
	}

	function getUnconfiguredParamsValidation(strategy: UnconfiguredParamStrategy): string {
		switch (strategy) {
			case 'allowAll':
				return `{
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      }`;
			case 'never':
			case 'strict':
				return `{
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: {} })
        }
      }`;
			case 'simple':
				return `{
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => {
            if (!v || typeof v !== 'object') return { value: {} };
            const result: Record<string, string | undefined> = {};
            for (const [key, val] of Object.entries(v)) {
              result[key] = val ? String(val) : undefined;
            }
            return { value: result };
          }
        }
      }`;
			default:
				return `{
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      }`;
		}
	}

	function getUnconfiguredSearchParamsValidation(
		strategy: UnconfiguredSearchParamStrategy
	): string {
		switch (strategy) {
			case 'allowAll':
				return `{
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      }`;
			case 'never':
			case 'strict':
				return `{
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: {} })
        }
      }`;
			case 'simple':
				return `{
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => {
            if (!v || typeof v !== 'object') return { value: {} };
            const result: Record<string, string | string[] | undefined> = {};
            for (const [key, val] of Object.entries(v)) {
              if (Array.isArray(val)) {
                result[key] = val.map(String);
              } else if (val != null) {
                result[key] = String(val);
              }
            }
            return { value: result };
          }
        }
      }`;
			default:
				return `{
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      }`;
		}
	}

	function generateSmartParamValidation(routePath: string): {
		paramsValidation: string;
		searchParamsValidation: string;
	} {
		// Extract parameter names from route path
		const paramMatches = routePath.match(/\[([^\]]+)\]/g) || [];
		const optionalParamMatches = routePath.match(/\[\[([^\]]+)\]\]/g) || [];

		let paramsValidation: string;

		if (paramMatches.length > 0 || optionalParamMatches.length > 0) {
			// Create a simple validator that just passes through string values
			paramsValidation = `{
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => {
            if (!v || typeof v !== 'object') return { value: {} };
            const result: Record<string, string | undefined> = {};
            ${paramMatches
							.map((match) => {
								const paramName = match.replace(/[\[\]]/g, '');
								if (!optionalParamMatches.some((opt) => opt.includes(paramName))) {
									return `result.${paramName} = String(v.${paramName} || '');`;
								}
								return '';
							})
							.filter(Boolean)
							.join('\n            ')}
            ${optionalParamMatches
							.map((match) => {
								const paramName = match.replace(/[\[\]]/g, '');
								return `result.${paramName} = v.${paramName} ? String(v.${paramName}) : undefined;`;
							})
							.join('\n            ')}
            return { value: result };
          }
        }
      }`;
		} else {
			// Use configured strategy for routes without defined params
			paramsValidation = getUnconfiguredParamsValidation(unconfiguredParams);
		}

		// Search params always use the configured strategy for unconfigured routes
		const searchParamsValidation = getUnconfiguredSearchParamsValidation(unconfiguredSearchParams);

		return { paramsValidation, searchParamsValidation };
	}

	/**
	 * Returns the TypeScript type definition for unconfigured route parameters
	 * based on the selected strategy.
	 */
	function getUnconfiguredParamsType(strategy: UnconfiguredParamStrategy): string {
		switch (strategy) {
			case 'allowAll':
				return 'Record<string, string>';
			case 'never':
				return '{}';
			case 'simple':
				return '{ [key: string]?: string }';
			case 'strict':
				return 'never';
			default:
				return 'Record<string, string>';
		}
	}

	/**
	 * Returns the TypeScript type definition for unconfigured search parameters
	 * based on the selected strategy.
	 */
	function getUnconfiguredSearchParamsType(strategy: UnconfiguredSearchParamStrategy): string {
		switch (strategy) {
			case 'allowAll':
				return 'Record<string, unknown>';
			case 'never':
				return '{}';
			case 'simple':
				return '{ [key: string]?: string | string[] }';
			case 'strict':
				return 'never';
			default:
				return 'Record<string, unknown>';
		}
	}

	/**
	 * Returns the validation type string for unconfigured route parameters
	 * based on the selected strategy. Used in RouteValidationTypeMap.
	 */
	function getUnconfiguredParamsValidationType(strategy: UnconfiguredParamStrategy): string {
		switch (strategy) {
			case 'allowAll':
				return 'StandardSchemaV1<any, Record<string, string>>';
			case 'simple':
				return 'StandardSchemaV1<any, { [key: string]?: string }>';
			case 'never':
				return 'StandardSchemaV1<any, {}>';
			case 'strict':
				return 'StandardSchemaV1<any, never>';
			default:
				return 'StandardSchemaV1<any, Record<string, string>>';
		}
	}

	/**
	 * Returns the validation type string for unconfigured search parameters
	 * based on the selected strategy. Used in RouteValidationTypeMap.
	 */
	function getUnconfiguredSearchParamsValidationType(strategy: UnconfiguredSearchParamStrategy): string {
		switch (strategy) {
			case 'allowAll':
				return 'StandardSchemaV1<any, Record<string, unknown>>';
			case 'simple':
				return 'StandardSchemaV1<any, { [key: string]?: string | string[] }>';
			case 'never':
				return 'StandardSchemaV1<any, {}>';
			case 'strict':
				return 'StandardSchemaV1<any, never>';
			default:
				return 'StandardSchemaV1<any, Record<string, unknown>>';
		}
	}

	function generateSmartParamTypes(routePath: string): {
		paramsType: string;
		searchParamsType: string;
	} {
		// Extract parameter names from route path
		const paramMatches = routePath.match(/\[([^\]]+)\]/g) || [];
		const optionalParamMatches = routePath.match(/\[\[([^\]]+)\]\]/g) || [];

		let paramsType: string;

		if (paramMatches.length === 0 && optionalParamMatches.length === 0) {
			// No params defined in route, use configured strategy
			paramsType = getUnconfiguredParamsType(unconfiguredParams);
		} else {
			// Route has params defined, generate specific types
			const paramTypes: string[] = [];

			// Handle required parameters [id]
			paramMatches.forEach((match) => {
				const paramName = match.replace(/[\[\]]/g, '');
				// Skip if it's an optional parameter (will be handled separately)
				if (!optionalParamMatches.some((opt) => opt.includes(paramName))) {
					paramTypes.push(`${paramName}: string`);
				}
			});

			// Handle optional parameters [[id]]
			optionalParamMatches.forEach((match) => {
				const paramName = match.replace(/[\[\]]/g, '');
				paramTypes.push(`${paramName}?: string`);
			});

			paramsType = `{ ${paramTypes.join('; ')} }`;
		}

		// Search params always use the configured strategy for unconfigured routes
		const searchParamsType = getUnconfiguredSearchParamsType(unconfiguredSearchParams);

		return { paramsType, searchParamsType };
	}

	function generateServerConfigModule(): string {
		const allSchemas = scanForAllSchemas(); // Scan both client and server files
		const allRoutes = getAllRoutes();

		const schemaImports: string[] = [];
		const configEntries: string[] = [];

		// Add base config entries first
		Object.entries(baseConfig).forEach(([routePath, config]) => {
			configEntries.push(`'${routePath}': ${JSON.stringify(config, null, 2).replace(/"/g, '')}`);
		});

		// Add custom imports
		const detectedImports: string[] = [...imports];

		// Process routes with explicit configuration (from both client and server files)
		allSchemas.forEach((schema, index) => {
			const schemaAlias = `routeConfig${index}`;

			// Generate relative import path from the generated config to the page file
			const relativePath = generateRelativeImportPath(schema.filePath);

			if (schema.routeConfig) {
				// Only import if the route config has validation functions that will be used
				const hasUsableValidation = schema.hasParamsValidation || schema.hasSearchParamsValidation;

				if (hasUsableValidation) {
					// Import the entire route config
					schemaImports.push(
						`import { ${schema.routeConfig} as ${schemaAlias} } from '${relativePath}';`
					);
				}

				// Use configured fallback strategies when validators are missing from _routeConfig
				const smartParams = generateSmartParamValidation(schema.routePath);
				const paramsValidation = schema.hasParamsValidation
					? `${schemaAlias}.paramsValidation`
					: smartParams.paramsValidation;
				const searchParamsValidation = schema.hasSearchParamsValidation
					? `${schemaAlias}.searchParamsValidation`
					: smartParams.searchParamsValidation;

				const entry = `'${schema.routePath}': {
          paramsValidation: ${paramsValidation},
          searchParamsValidation: ${searchParamsValidation},
        }`;

				configEntries.push(entry);
			}
		});

		// Process routes without explicit configuration - generate smart defaults
		const routesWithConfig = new Set([
			...Object.keys(baseConfig),
			...allSchemas.map((s) => s.routePath)
		]);
		allRoutes.forEach((routePath) => {
			if (!routesWithConfig.has(routePath)) {
				const smartParams = generateSmartParamValidation(routePath);
				const entry = `'${routePath}': {
          paramsValidation: ${smartParams.paramsValidation},
          searchParamsValidation: ${smartParams.searchParamsValidation},
        }`;
				configEntries.push(entry);
			}
		});

		// Generate all route keys including base config, explicit schemas, and auto-detected routes
		const allRouteKeys = [
			...Object.keys(baseConfig).map((k) => `'${k}'`),
			...allSchemas.map((s) => `'${s.routePath}'`),
			...allRoutes.filter((route) => !routesWithConfig.has(route)).map((r) => `'${r}'`)
		];
		const uniqueRouteKeys = allRouteKeys.filter(
			(key, index) => allRouteKeys.indexOf(key) === index
		);
		const routeKeys = uniqueRouteKeys.join(' | ');

		// Create a map to track the best schema for each route (prefer server files with validation)
		const routeBestSchema = new Map<string, SchemaDefinition>();

		// First pass: collect all schemas and prioritize by type and validation presence
		allSchemas.forEach((schema) => {
			const existing = routeBestSchema.get(schema.routePath);

			if (!existing) {
				routeBestSchema.set(schema.routePath, schema);
			} else {
				// Prefer schemas with more validation, then server files over client files
				const currentPriority =
					(schema.hasParamsValidation ? 2 : 0) +
					(schema.hasSearchParamsValidation ? 1 : 0) +
					(schema.isServerFile ? 0.5 : 0);
				const existingPriority =
					(existing.hasParamsValidation ? 2 : 0) +
					(existing.hasSearchParamsValidation ? 1 : 0) +
					(existing.isServerFile ? 0.5 : 0);

				if (currentPriority > existingPriority) {
					routeBestSchema.set(schema.routePath, schema);
				}
			}
		});

		// Generate type mappings for each route using the best available schema
		const serverTypeMapping: string[] = [];
		let schemaIndex = 0;

		allSchemas.forEach((schema, originalIndex) => {
			const bestSchema = routeBestSchema.get(schema.routePath);

			// Only generate type mapping if this is the best schema for this route
			if (bestSchema === schema) {
				const schemaAlias = `routeConfig${originalIndex}`;

				if (schema.routeConfig) {
					// Use proper type inference with conditional logic, respecting configured strategies
					const smartTypes = generateSmartParamTypes(schema.routePath);
					const paramsType = schema.hasParamsValidation
						? `StandardSchemaV1.InferOutput<typeof ${schemaAlias}.paramsValidation>`
						: smartTypes.paramsType;
					const searchParamsType = schema.hasSearchParamsValidation
						? `StandardSchemaV1.InferOutput<typeof ${schemaAlias}.searchParamsValidation>`
						: smartTypes.searchParamsType;

					serverTypeMapping.push(
						`  '${schema.routePath}': { params: ${paramsType}; searchParams: ${searchParamsType} }`
					);
				}
			}
		});

		// Add base config type mappings
		const baseTypeMapping = Object.keys(baseConfig).map((routePath) => {
			return `  '${routePath}': { params: Record<string, string>; searchParams: Record<string, string | string[]> }`;
		});

		// Add smart default type mappings for routes without explicit config
		const smartTypeMapping = allRoutes
			.filter((route) => !routesWithConfig.has(route))
			.map((routePath) => {
				const smartTypes = generateSmartParamTypes(routePath);
				return `  '${routePath}': { params: ${smartTypes.paramsType}; searchParams: ${smartTypes.searchParamsType} }`;
			});

		const typeMapping = [...baseTypeMapping, ...serverTypeMapping, ...smartTypeMapping].join(';\n');

		// Check if StandardSchemaV1 is used in the type mappings (the only place it's actually needed)
		const usesStandardSchema = typeMapping.includes('StandardSchemaV1');

		const standardSchemaImport = usesStandardSchema
			? "import type { StandardSchemaV1 } from 'skroutes';"
			: '';

		return `// Auto-generated server-side config by skroutes-plugin
// WARNING: This file imports from server files and should only be used server-side
${standardSchemaImport}
${detectedImports.join('\n')}

// Import schema definitions from both client and server files
${schemaImports.join('\n')}

export const serverRouteConfig = {
  ${configEntries.join(',\n  ')}
} as const;

// Export complete route keys for type checking (server has full visibility)
export type ServerRouteKeys = ${routeKeys || 'never'};

// Export complete type mapping for schema inference (server has full visibility)
export type ServerRouteTypeMap = {
${typeMapping}
};

// Convenience type aliases for accessing route param/search param types
export type ServerRouteParams<T extends ServerRouteKeys> = ServerRouteTypeMap[T]['params'];
export type ServerRouteSearchParams<T extends ServerRouteKeys> = ServerRouteTypeMap[T]['searchParams'];

// Export plugin options for reference
export const pluginOptions = ${JSON.stringify({ errorURL }, null, 2)};
`;
	}

	function generateClientConfigModule(): string {
		const clientSchemas = scanForSchemas(); // Only client-side files
		const allServerSchemas = scanForAllSchemas(); // Both client and server files
		const allRoutes = getAllRoutes();

		const schemaImports: string[] = [];
		const typeOnlyImports: string[] = [];
		const configEntries: string[] = [];

		// Add base config entries first
		Object.entries(baseConfig).forEach(([routePath, config]) => {
			configEntries.push(`'${routePath}': ${JSON.stringify(config, null, 2).replace(/"/g, '')}`);
		});

		// Add custom imports
		const detectedImports: string[] = [...imports];

		// Create a map of routes to their best server-side schemas for type information
		const routeToServerSchema = new Map<string, SchemaDefinition>();

		allServerSchemas.forEach((schema) => {
			if (schema.isServerFile && (schema.hasParamsValidation || schema.hasSearchParamsValidation)) {
				const existing = routeToServerSchema.get(schema.routePath);
				if (!existing) {
					routeToServerSchema.set(schema.routePath, schema);
				} else {
					// Prefer schemas with more validation
					const currentPriority =
						(schema.hasParamsValidation ? 2 : 0) + (schema.hasSearchParamsValidation ? 1 : 0);
					const existingPriority =
						(existing.hasParamsValidation ? 2 : 0) + (existing.hasSearchParamsValidation ? 1 : 0);

					if (currentPriority > existingPriority) {
						routeToServerSchema.set(schema.routePath, schema);
					}
				}
			}
		});

		// Process routes with client-side configuration only
		clientSchemas.forEach((schema, index) => {
			const schemaAlias = `routeConfig${index}`;

			// Generate relative import path from the generated config to the page file
			const relativePath = generateRelativeImportPath(schema.filePath);

			if (schema.routeConfig) {
				// Only import if the route config has validation functions that will be used
				const hasUsableValidation = schema.hasParamsValidation || schema.hasSearchParamsValidation;

				if (hasUsableValidation) {
					// Import the entire route config
					schemaImports.push(
						`import { ${schema.routeConfig} as ${schemaAlias} } from '${relativePath}';`
					);
				}

				// Use configured fallback strategies when validators are missing from _routeConfig
				const smartParams = generateSmartParamValidation(schema.routePath);
				const paramsValidation = schema.hasParamsValidation
					? `${schemaAlias}.paramsValidation`
					: smartParams.paramsValidation;
				const searchParamsValidation = schema.hasSearchParamsValidation
					? `${schemaAlias}.searchParamsValidation`
					: smartParams.searchParamsValidation;

				const entry = `'${schema.routePath}': {
          paramsValidation: ${paramsValidation},
          searchParamsValidation: ${searchParamsValidation},
        }`;

				configEntries.push(entry);
			}
		});

		// Process routes without client-side configuration - generate smart defaults
		const routesWithClientConfig = new Set([
			...Object.keys(baseConfig),
			...clientSchemas.map((s) => s.routePath)
		]);
		allRoutes.forEach((routePath) => {
			if (!routesWithClientConfig.has(routePath)) {
				const smartParams = generateSmartParamValidation(routePath);
				const entry = `'${routePath}': {
          paramsValidation: ${smartParams.paramsValidation},
          searchParamsValidation: ${smartParams.searchParamsValidation},
        }`;
				configEntries.push(entry);
			}
		});

		// Generate all route keys including base config, explicit schemas, and auto-detected routes
		const allRouteKeys = [
			...Object.keys(baseConfig).map((k) => `'${k}'`),
			...clientSchemas.map((s) => `'${s.routePath}'`),
			...allRoutes.filter((route) => !routesWithClientConfig.has(route)).map((r) => `'${r}'`)
		];
		const uniqueRouteKeys = allRouteKeys.filter(
			(key, index) => allRouteKeys.indexOf(key) === index
		);
		const routeKeys = uniqueRouteKeys.join(' | ');

		// Add type-only imports for server schemas that have better validation
		const serverSchemaAliases = new Map<string, string>();
		let serverSchemaIndex = 1000; // Use high numbers to avoid conflicts

		routeToServerSchema.forEach((serverSchema, routePath) => {
			const serverAlias = `serverRouteConfig${serverSchemaIndex}`;
			const relativePath = generateRelativeImportPath(serverSchema.filePath);

			typeOnlyImports.push(
				`import type { ${serverSchema.routeConfig} as ${serverAlias} } from '${relativePath}';`
			);
			serverSchemaAliases.set(routePath, serverAlias);
			serverSchemaIndex++;
		});

		// Generate validation type mappings for each route
		const clientValidationTypeMapping = clientSchemas
			.map((schema, index) => {
				const schemaAlias = `routeConfig${index}`;
				const serverSchemaAlias = serverSchemaAliases.get(schema.routePath);
				const serverSchema = routeToServerSchema.get(schema.routePath);

				if (schema.routeConfig) {
					// Generate validation function types (not InferOutput)
					let paramsValidationType: string;
					let searchParamsValidationType: string;

					if (serverSchema && serverSchemaAlias) {
						// Prefer server schema validation types when available
						paramsValidationType =
							serverSchema.hasParamsValidation && !schema.hasParamsValidation
								? `typeof ${serverSchemaAlias}.paramsValidation`
								: schema.hasParamsValidation
									? `typeof ${schemaAlias}.paramsValidation`
									: getUnconfiguredParamsValidationType(unconfiguredParams);

						searchParamsValidationType =
							serverSchema.hasSearchParamsValidation && !schema.hasSearchParamsValidation
								? `typeof ${serverSchemaAlias}.searchParamsValidation`
								: schema.hasSearchParamsValidation
									? `typeof ${schemaAlias}.searchParamsValidation`
									: getUnconfiguredSearchParamsValidationType(unconfiguredSearchParams);
					} else {
						// No server schema or not better, use client schema
						paramsValidationType = schema.hasParamsValidation
							? `typeof ${schemaAlias}.paramsValidation`
							: getUnconfiguredParamsValidationType(unconfiguredParams);
						searchParamsValidationType = schema.hasSearchParamsValidation
							? `typeof ${schemaAlias}.searchParamsValidation`
							: getUnconfiguredSearchParamsValidationType(unconfiguredSearchParams);
					}

					return `  '${schema.routePath}': { paramsValidation: ${paramsValidationType}; searchParamsValidation: ${searchParamsValidationType} }`;
				}
				return null;
			})
			.filter(Boolean);

		// Add base config validation type mappings
		const baseValidationTypeMapping = Object.keys(baseConfig).map((routePath) => {
			return `  '${routePath}': { paramsValidation: ${getUnconfiguredParamsValidationType(unconfiguredParams)}; searchParamsValidation: ${getUnconfiguredSearchParamsValidationType(unconfiguredSearchParams)} }`;
		});

		// Add validation type mappings for routes that don't have client configs but have server configs
		const serverOnlyRoutes = Array.from(routeToServerSchema.keys()).filter(
			(routePath) => !clientSchemas.some((schema) => schema.routePath === routePath)
		);

		const serverOnlyValidationTypeMapping = serverOnlyRoutes
			.map((routePath) => {
				const serverSchema = routeToServerSchema.get(routePath);
				const serverSchemaAlias = serverSchemaAliases.get(routePath);

				if (serverSchema && serverSchemaAlias) {
					// Use server schema validation types for routes without client config
					const paramsValidationType = serverSchema.hasParamsValidation
						? `typeof ${serverSchemaAlias}.paramsValidation`
						: getUnconfiguredParamsValidationType(unconfiguredParams);
					const searchParamsValidationType = serverSchema.hasSearchParamsValidation
						? `typeof ${serverSchemaAlias}.searchParamsValidation`
						: getUnconfiguredSearchParamsValidationType(unconfiguredSearchParams);

					return `  '${routePath}': { paramsValidation: ${paramsValidationType}; searchParamsValidation: ${searchParamsValidationType} }`;
				}
				return null;
			})
			.filter(Boolean);

		// Add validation type mappings for routes without any explicit config
		const smartValidationTypeMapping = allRoutes
			.filter((route) => !routesWithClientConfig.has(route) && !routeToServerSchema.has(route))
			.map((routePath) => {
				return `  '${routePath}': { paramsValidation: ${getUnconfiguredParamsValidationType(unconfiguredParams)}; searchParamsValidation: ${getUnconfiguredSearchParamsValidationType(unconfiguredSearchParams)} }`;
			});

		// Generate type mappings for each route, preferring server schema types when available
		const clientTypeMapping = clientSchemas
			.map((schema, index) => {
				const schemaAlias = `routeConfig${index}`;
				const serverSchemaAlias = serverSchemaAliases.get(schema.routePath);
				const serverSchema = routeToServerSchema.get(schema.routePath);

				if (schema.routeConfig) {
					// Use proper type inference with conditional logic, respecting configured strategies
					const smartTypes = generateSmartParamTypes(schema.routePath);

					// Prefer server schema types if available and better, otherwise use client schema types
					let paramsType: string;
					let searchParamsType: string;

					if (serverSchema && serverSchemaAlias) {
						// Use server schema types when server has better validation
						paramsType =
							serverSchema.hasParamsValidation && !schema.hasParamsValidation
								? `StandardSchemaV1.InferOutput<typeof ${serverSchemaAlias}.paramsValidation>`
								: schema.hasParamsValidation
									? `StandardSchemaV1.InferOutput<typeof ${schemaAlias}.paramsValidation>`
									: smartTypes.paramsType;

						searchParamsType =
							serverSchema.hasSearchParamsValidation && !schema.hasSearchParamsValidation
								? `StandardSchemaV1.InferOutput<typeof ${serverSchemaAlias}.searchParamsValidation>`
								: schema.hasSearchParamsValidation
									? `StandardSchemaV1.InferOutput<typeof ${schemaAlias}.searchParamsValidation>`
									: smartTypes.searchParamsType;
					} else {
						// No server schema or not better, use client schema
						paramsType = schema.hasParamsValidation
							? `StandardSchemaV1.InferOutput<typeof ${schemaAlias}.paramsValidation>`
							: smartTypes.paramsType;
						searchParamsType = schema.hasSearchParamsValidation
							? `StandardSchemaV1.InferOutput<typeof ${schemaAlias}.searchParamsValidation>`
							: smartTypes.searchParamsType;
					}

					return `  '${schema.routePath}': { params: ${paramsType}; searchParams: ${searchParamsType} }`;
				}
				return null;
			})
			.filter(Boolean);

		// Add base config type mappings
		const baseTypeMapping = Object.keys(baseConfig).map((routePath) => {
			return `  '${routePath}': { params: Record<string, string>; searchParams: Record<string, string | string[]> }`;
		});

		// Add type mappings for routes that don't have client configs but might have server configs
		const serverOnlyRoutesForTypeMapping = Array.from(routeToServerSchema.keys()).filter(
			(routePath) => !clientSchemas.some((schema) => schema.routePath === routePath)
		);

		const serverOnlyTypeMapping = serverOnlyRoutesForTypeMapping
			.map((routePath) => {
				const serverSchema = routeToServerSchema.get(routePath);
				const serverSchemaAlias = serverSchemaAliases.get(routePath);

				if (serverSchema && serverSchemaAlias) {
					// Use server schema types for routes without client config
					const paramsType = serverSchema.hasParamsValidation
						? `StandardSchemaV1.InferOutput<typeof ${serverSchemaAlias}.paramsValidation>`
						: generateSmartParamTypes(routePath).paramsType;
					const searchParamsType = serverSchema.hasSearchParamsValidation
						? `StandardSchemaV1.InferOutput<typeof ${serverSchemaAlias}.searchParamsValidation>`
						: generateSmartParamTypes(routePath).searchParamsType;

					return `  '${routePath}': { params: ${paramsType}; searchParams: ${searchParamsType} }`;
				}
				return null;
			})
			.filter(Boolean);

		// Add smart default type mappings for routes without any explicit config
		const smartTypeMapping = allRoutes
			.filter((route) => !routesWithClientConfig.has(route) && !routeToServerSchema.has(route))
			.map((routePath) => {
				const smartTypes = generateSmartParamTypes(routePath);
				return `  '${routePath}': { params: ${smartTypes.paramsType}; searchParams: ${smartTypes.searchParamsType} }`;
			});

		const typeMapping = [
			...baseTypeMapping,
			...clientTypeMapping,
			...serverOnlyTypeMapping,
			...smartTypeMapping
		].join(';\n');
		const validationTypeMapping = [
			...baseValidationTypeMapping,
			...clientValidationTypeMapping,
			...serverOnlyValidationTypeMapping,
			...smartValidationTypeMapping
		].join(';\n');

		// Check if StandardSchemaV1 is used in the type mappings (the only place it's actually needed)
		const usesStandardSchema = typeMapping.includes('StandardSchemaV1');

		const standardSchemaImport = usesStandardSchema
			? "import type { StandardSchemaV1 } from 'skroutes';"
			: '';

		return `// Auto-generated client-side config by skroutes-plugin
// This file only imports from client-side files and can be safely used in the browser
${standardSchemaImport}
${detectedImports.join('\n')}
import type { RouteConfig } from 'skroutes';

// Import schema definitions from client-side page files only
${schemaImports.join('\n')}

// Type-only imports from server files for better type inference
${typeOnlyImports.join('\n')}

// Export validation type mapping for each route
export type RouteValidationTypeMap = {
${validationTypeMapping}
};

export const clientRouteConfig = {
  ${configEntries.join(',\n  ')}
} satisfies RouteConfig as unknown as RouteValidationTypeMap;

// Export route keys for type checking
export type RouteKeys = ${routeKeys || 'never'};

// Export type mapping for schema inference
export type RouteTypeMap = {
${typeMapping}
};

// Convenience type aliases for accessing route param/search param types
export type RouteParams<T extends RouteKeys> = RouteTypeMap[T]['params'];
export type RouteSearchParams<T extends RouteKeys> = RouteTypeMap[T]['searchParams'];


// Export plugin options for reference
export const pluginOptions = ${JSON.stringify({ errorURL }, null, 2)};
`;
	}

	function scanForSchemas(): SchemaDefinition[] {
		const schemas: SchemaDefinition[] = [];
		const routesDir = join(root, 'src/routes');

		function walkDirectory(dir: string, relativePath = ''): void {
			if (!existsSync(dir)) return;

			const entries = readdirSync(dir);

			for (const entry of entries) {
				const fullPath = join(dir, entry);
				const stat = statSync(fullPath);

				if (stat.isDirectory()) {
					walkDirectory(fullPath, join(relativePath, entry));
				} else if (entry.match(/^\+page\.[tj]s$/)) {
					// Only scan client-side page files to avoid server import issues
					const content = readFileSync(fullPath, 'utf-8');
					const routePath = extractRoutePathFromDirectory(relativePath);

					// Look for unified route config
					const routeConfigPattern = /export\s+const\s+_routeConfig\s*=/;
					const routeConfigMatch = content.match(routeConfigPattern);

					if (routeConfigMatch) {
						// Check if paramsValidation and searchParamsValidation exist as properties in _routeConfig
						const hasParamsValidation = /paramsValidation\s*:/gm.test(content);
						const hasSearchParamsValidation = /searchParamsValidation\s*:/gm.test(content);

						schemas.push({
							routePath,
							filePath: fullPath,
							routeConfig: '_routeConfig',
							hasParamsValidation,
							hasSearchParamsValidation
						});
					}
				}
			}
		}

		walkDirectory(routesDir);
		return schemas;
	}

	function scanForAllSchemas(): SchemaDefinition[] {
		const schemas: SchemaDefinition[] = [];
		const routesDir = join(root, 'src/routes');

		function walkDirectory(dir: string, relativePath = ''): void {
			if (!existsSync(dir)) return;

			const entries = readdirSync(dir);

			for (const entry of entries) {
				const fullPath = join(dir, entry);
				const stat = statSync(fullPath);

				if (stat.isDirectory()) {
					walkDirectory(fullPath, join(relativePath, entry));
				} else if (entry.match(/^\+(page|server)\.(server\.)?[tj]s$/)) {
					// Scan both client and server files for server-side config
					const content = readFileSync(fullPath, 'utf-8');
					const routePath = extractRoutePathFromDirectory(relativePath);

					// Look for unified route config
					const routeConfigPattern = /export\s+const\s+_routeConfig\s*=/;
					const routeConfigMatch = content.match(routeConfigPattern);

					if (routeConfigMatch) {
						// Check if paramsValidation and searchParamsValidation exist as properties in _routeConfig
						const hasParamsValidation = /paramsValidation\s*:/gm.test(content);
						const hasSearchParamsValidation = /searchParamsValidation\s*:/gm.test(content);

						// Determine file type and if it's server-side
						const isServerFile = entry.includes('.server.') || entry.includes('+server.');
						const fileType: 'client' | 'server' | 'api' = entry.includes('+server.')
							? 'api'
							: isServerFile
								? 'server'
								: 'client';

						schemas.push({
							routePath,
							filePath: fullPath,
							routeConfig: '_routeConfig',
							hasParamsValidation,
							hasSearchParamsValidation,
							isServerFile,
							fileType
						});
					}
				}
			}
		}

		walkDirectory(routesDir);
		return schemas;
	}

	function extractRoutePathFromDirectory(relativePath: string): string {
		// Convert directory path to SvelteKit route path
		if (!relativePath || relativePath === '') return '/';

		let routePath = '/' + relativePath.replace(/\\/g, '/');

		// Ensure no trailing slash except for root
		if (routePath !== '/' && routePath.endsWith('/')) {
			routePath = routePath.slice(0, -1);
		}

		return routePath;
	}
}
