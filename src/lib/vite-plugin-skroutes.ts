import type { Plugin } from 'vite';
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface PluginOptions {
  serverOutputPath?: string;
  clientOutputPath?: string;
  imports?: string[];
  includeServerFiles?: boolean;
  baseConfig?: Record<string, any>;
  errorURL?: string;
}

interface SchemaDefinition {
  routePath: string;
  filePath: string;
  routeConfig?: string;
}

export function skRoutesPlugin(options: PluginOptions = {}): Plugin {
  const {
    serverOutputPath = 'src/lib/.generated/skroutes-server-config.ts',
    clientOutputPath = 'src/lib/.generated/skroutes-client-config.ts',
    imports = [],
    includeServerFiles = true,
    baseConfig = {},
    errorURL = '/error'
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
      const isRelevantFile = (
        (file.includes('+page.') && (file.endsWith('.ts') || file.endsWith('.js'))) ||
        (includeServerFiles && file.includes('+server.') && (file.endsWith('.ts') || file.endsWith('.js')))
      );
      if (isRelevantFile) {
        generateServerConfigFile();
        generateClientConfigFile();
        // Trigger module update for auto-skroutes
        const autoSkroutesModule = await server.moduleGraph.getModuleByUrl('/src/lib/auto-skroutes.ts');
        if (autoSkroutesModule) {
          server.reloadModule(autoSkroutesModule);
        }
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
    
    // Also generate/update the auto-skroutes wrapper
    generateAutoSkRoutesWrapper();
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
        } else if (entry.match(/^\+(page|server)\.(server\.)?[tj]s$/) || entry.match(/^\+page\.svelte$/)) {
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

  function generateSmartParamValidation(routePath: string): { paramsValidation: string; searchParamsValidation: string } {
    // Extract parameter names from route path
    const paramMatches = routePath.match(/\[([^\]]+)\]/g) || [];
    const optionalParamMatches = routePath.match(/\[\[([^\]]+)\]\]/g) || [];
    
    let paramsValidation = 'undefined';
    
    if (paramMatches.length > 0 || optionalParamMatches.length > 0) {
      // Create a simple validator that just passes through string values
      paramsValidation = `{
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => {
            if (!v || typeof v !== 'object') return { value: {} };
            const result: Record<string, string | undefined> = {};
            ${paramMatches.map(match => {
              const paramName = match.replace(/[\[\]]/g, '');
              if (!optionalParamMatches.some(opt => opt.includes(paramName))) {
                return `result.${paramName} = String(v.${paramName} || '');`;
              }
              return '';
            }).filter(Boolean).join('\n            ')}
            ${optionalParamMatches.map(match => {
              const paramName = match.replace(/[\[\]]/g, '');
              return `result.${paramName} = v.${paramName} ? String(v.${paramName}) : undefined;`;
            }).join('\n            ')}
            return { value: result };
          }
        }
      }`;
    }
    
    // Always provide empty search params validation
    const searchParamsValidation = `{
      '~standard': {
        version: 1,
        vendor: 'skroutes',
        validate: (v: any) => ({ value: v || {} })
      }
    }`;
    
    return { paramsValidation, searchParamsValidation };
  }

  function generateSmartParamTypes(routePath: string): { paramsType: string } {
    // Extract parameter names from route path
    const paramMatches = routePath.match(/\[([^\]]+)\]/g) || [];
    const optionalParamMatches = routePath.match(/\[\[([^\]]+)\]\]/g) || [];
    
    if (paramMatches.length === 0 && optionalParamMatches.length === 0) {
      return { paramsType: 'Record<string, string>' };
    }
    
    const paramTypes: string[] = [];
    
    // Handle required parameters [id]
    paramMatches.forEach(match => {
      const paramName = match.replace(/[\[\]]/g, '');
      // Skip if it's an optional parameter (will be handled separately)
      if (!optionalParamMatches.some(opt => opt.includes(paramName))) {
        paramTypes.push(`${paramName}: string`);
      }
    });
    
    // Handle optional parameters [[id]]
    optionalParamMatches.forEach(match => {
      const paramName = match.replace(/[\[\]]/g, '');
      paramTypes.push(`${paramName}?: string`);
    });
    
    return { paramsType: `{ ${paramTypes.join('; ')} }` };
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
        // Import the entire route config
        schemaImports.push(`import { ${schema.routeConfig} as ${schemaAlias} } from '${relativePath}';`);
        
        const entry = `'${schema.routePath}': {
          paramsValidation: ${schemaAlias}.paramsValidation,
          searchParamsValidation: ${schemaAlias}.searchParamsValidation,
        }`;
        
        configEntries.push(entry);
      }
    });

    // Process routes without explicit configuration - generate smart defaults
    const routesWithConfig = new Set([...Object.keys(baseConfig), ...allSchemas.map(s => s.routePath)]);
    allRoutes.forEach(routePath => {
      if (!routesWithConfig.has(routePath)) {
        const smartParams = generateSmartParamValidation(routePath);
        const entry = `'${routePath}': {
          paramsValidation: ${smartParams.paramsValidation},
          searchParamsValidation: ${smartParams.searchParamsValidation},
        }`;
        configEntries.push(entry);
      }
    });

    return `// Auto-generated server-side config by skroutes-plugin
// WARNING: This file imports from server files and should only be used server-side
import type { StandardSchemaV1 } from '@standard-schema/spec';
${detectedImports.join('\n')}

// Import schema definitions from both client and server files
${schemaImports.join('\n')}

export const serverRouteConfig = {
  ${configEntries.join(',\n  ')}
} as const;

// Export plugin options for reference
export const pluginOptions = ${JSON.stringify({ errorURL }, null, 2)};
`;
  }

  function generateClientConfigModule(): string {
    const clientSchemas = scanForSchemas(); // Only client-side files
    const allRoutes = getAllRoutes();
    
    const schemaImports: string[] = [];
    const configEntries: string[] = [];
    
    // Add base config entries first
    Object.entries(baseConfig).forEach(([routePath, config]) => {
      configEntries.push(`'${routePath}': ${JSON.stringify(config, null, 2).replace(/"/g, '')}`);
    });

    // Add custom imports
    const detectedImports: string[] = [...imports];

    // Process routes with client-side configuration only
    clientSchemas.forEach((schema, index) => {
      const schemaAlias = `routeConfig${index}`;
      
      // Generate relative import path from the generated config to the page file
      const relativePath = generateRelativeImportPath(schema.filePath);
      
      if (schema.routeConfig) {
        // Import the entire route config
        schemaImports.push(`import { ${schema.routeConfig} as ${schemaAlias} } from '${relativePath}';`);
        
        const entry = `'${schema.routePath}': {
          paramsValidation: ${schemaAlias}.paramsValidation,
          searchParamsValidation: ${schemaAlias}.searchParamsValidation,
        }`;
        
        configEntries.push(entry);
      }
    });

    // Process routes without client-side configuration - generate smart defaults
    const routesWithClientConfig = new Set([...Object.keys(baseConfig), ...clientSchemas.map(s => s.routePath)]);
    allRoutes.forEach(routePath => {
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
      ...Object.keys(baseConfig).map(k => `'${k}'`),
      ...clientSchemas.map(s => `'${s.routePath}'`),
      ...allRoutes.filter(route => !routesWithClientConfig.has(route)).map(r => `'${r}'`)
    ];
    const uniqueRouteKeys = allRouteKeys.filter((key, index) => allRouteKeys.indexOf(key) === index);
    const routeKeys = uniqueRouteKeys.join(' | ');
    
    // Generate type mappings for each route
    const clientTypeMapping = clientSchemas.map((schema, index) => {
      const schemaAlias = `routeConfig${index}`;
      
      if (schema.routeConfig) {
        // Use proper type inference
        const paramsType = `StandardSchemaV1.InferOutput<typeof ${schemaAlias}.paramsValidation>`;
        const searchParamsType = `StandardSchemaV1.InferOutput<typeof ${schemaAlias}.searchParamsValidation>`;
        
        return `  '${schema.routePath}': { params: ${paramsType}; searchParams: ${searchParamsType} }`;
      }
      return null;
    }).filter(Boolean);
    
    // Add base config type mappings
    const baseTypeMapping = Object.keys(baseConfig).map(routePath => {
      return `  '${routePath}': { params: Record<string, string>; searchParams: Record<string, string | string[]> }`;
    });
    
    // Add smart default type mappings for routes without explicit config
    const smartTypeMapping = allRoutes.filter(route => !routesWithClientConfig.has(route)).map(routePath => {
      const smartTypes = generateSmartParamTypes(routePath);
      return `  '${routePath}': { params: ${smartTypes.paramsType}; searchParams: Record<string, unknown> }`;
    });
    
    const typeMapping = [...baseTypeMapping, ...clientTypeMapping, ...smartTypeMapping].join(';\n');

    return `// Auto-generated client-side config by skroutes-plugin
// This file only imports from client-side files and can be safely used in the browser
import type { StandardSchemaV1 } from '@standard-schema/spec';
${detectedImports.join('\n')}

// Import schema definitions from client-side page files only
${schemaImports.join('\n')}

export const clientRouteConfig = {
  ${configEntries.join(',\n  ')}
} as const;

// Export route keys for type checking
export type RouteKeys = ${routeKeys || 'never'};

// Export type mapping for schema inference
export type RouteTypeMap = {
${typeMapping}
};

// Convenience type aliases for accessing route param/search param types
export type RouteParams<T extends RouteKeys> = RouteTypeMap[T]['params'];
export type RouteSearchParams<T extends RouteKeys> = RouteTypeMap[T]['searchParams'];

// Re-export types for convenience
export type { RouteConfig } from '../skRoutes.js';

// Export plugin options for reference
export const pluginOptions = ${JSON.stringify({ errorURL }, null, 2)};
`;
  }

  function generateAutoSkRoutesWrapper(): void {
    const wrapperPath = join(root, 'src/lib/auto-skroutes.ts');
    const clientConfigPath = clientOutputPath.replace('src/lib/', './').replace('.ts', '.js');
    
    const wrapperContent = `import { skRoutes } from './skRoutes.js';
import { 
  clientRouteConfig, 
  type RouteKeys, 
  type RouteTypeMap, 
  type RouteParams,
  type RouteSearchParams,
  pluginOptions 
} from '${clientConfigPath}';

export type { RouteKeys, RouteTypeMap, RouteParams, RouteSearchParams };

export function createAutoSkRoutes(
  options?: {
    config?: Record<string, any>;
    errorURL?: string;
  }
) {
  const finalConfig = {
    ...clientRouteConfig,
    ...(options?.config || {})
  };
  
  return skRoutes({
    config: finalConfig,
    errorURL: options?.errorURL || pluginOptions.errorURL || '/error'
  });
}

// Create typed versions of the functions with route key validation and type inference
const defaultInstance = createAutoSkRoutes();

// Wrap the functions to provide type-safe route ID checking and schema type inference
export const urlGenerator = defaultInstance.urlGenerator;

export function pageInfo<Address extends RouteKeys>(
  routeId: Address,
  pageInfo: { params: Record<string, string>; url: { search: string } }
): {
  current: {
    address: Address;
    url: string;
    error: boolean;
    params: RouteTypeMap[Address]['params'];
    searchParams: RouteTypeMap[Address]['searchParams'];
  };
  updateParams: (opts: {
    params?: Partial<RouteTypeMap[Address]['params']>;
    searchParams?: Partial<RouteTypeMap[Address]['searchParams']>;
  }) => any;
} {
  return defaultInstance.pageInfo(routeId, pageInfo) as any;
}

export function pageInfoStore<Address extends RouteKeys>(config: {
  routeId: Address;
  pageInfo: import('svelte/store').Readable<{
    params: Record<string, string>;
    url: { search: string };
  }>;
  updateDelay?: number;
  onUpdate: (newUrl: string) => unknown;
}) {
  return defaultInstance.pageInfoStore(config);
}
`;
    
    writeFileSync(wrapperPath, wrapperContent, 'utf-8');
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
            schemas.push({
              routePath,
              filePath: fullPath,
              routeConfig: '_routeConfig'
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
            schemas.push({
              routePath,
              filePath: fullPath,
              routeConfig: '_routeConfig'
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