import type { Plugin } from 'vite';
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface PluginOptions {
  outputPath?: string;
  schemaExportName?: string;
  searchParamsExportName?: string;
  imports?: string[];
  includeServerFiles?: boolean;
  baseConfig?: Record<string, any>;
  errorURL?: string;
}

interface SchemaDefinition {
  routePath: string;
  filePath: string;
  // Legacy format support
  paramsSchema?: string;
  searchParamsSchema?: string;
  paramsSchemaCode?: string;
  searchParamsSchemaCode?: string;
  // New unified format support
  routeConfig?: string;
  routeConfigCode?: string;
  // Error handlers
  onParamsErrorCode?: string;
  onSearchParamsErrorCode?: string;
}

export function skRoutesPlugin(options: PluginOptions = {}): Plugin {
  const {
    outputPath = 'src/lib/.generated/skroutes-config.ts',
    schemaExportName = '_paramsSchema',
    searchParamsExportName = '_searchParamsSchema',
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
      // Generate the config file at build start
      generateConfigFile();
    },
    async handleHotUpdate({ file, server }) {
      // Regenerate config when page or server files change
      const isRelevantFile = (
        (file.includes('+page.') && (file.endsWith('.ts') || file.endsWith('.js'))) ||
        (includeServerFiles && file.includes('+server.') && (file.endsWith('.ts') || file.endsWith('.js')))
      );
      if (isRelevantFile) {
        generateConfigFile();
        // Trigger module update for auto-skroutes
        const autoSkroutesModule = await server.moduleGraph.getModuleByUrl('/src/lib/auto-skroutes.ts');
        if (autoSkroutesModule) {
          server.reloadModule(autoSkroutesModule);
        }
      }
    }
  };

  function generateConfigFile(): void {
    const configContent = generateConfigModule();
    const configPath = join(root, outputPath);
    
    // Ensure directory exists
    const configDir = join(root, outputPath.split('/').slice(0, -1).join('/'));
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    
    writeFileSync(configPath, configContent, 'utf-8');
    
    // Also generate/update the auto-skroutes wrapper
    generateAutoSkRoutesWrapper();
  }
  
  function generateAutoSkRoutesWrapper(): void {
    const wrapperPath = join(root, 'src/lib/auto-skroutes.ts');
    const relativePath = outputPath.replace('src/lib/', './').replace('.ts', '.js');
    
    const wrapperContent = `import { skRoutes } from './skRoutes.js';
import { 
  routeConfig, 
  routeValidators,
  type RouteKeys, 
  type RouteTypeMap, 
  type RouteValidatorMap,
  type RouteParams,
  type RouteSearchParams,
  pluginOptions 
} from '${relativePath}';

export type { RouteKeys, RouteTypeMap, RouteValidatorMap, RouteParams, RouteSearchParams };

export function createAutoSkRoutes(
  options?: {
    config?: Record<string, any>;
    errorURL?: string;
  }
) {
  const finalConfig = {
    ...routeConfig,
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

export function serverPageInfo<Address extends RouteKeys>(
  routeId: Address,
  data: {
    params: Record<string, string>;
    url: { search: string };
    route: { id: Address };
  }
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
  return defaultInstance.serverPageInfo(routeId, data) as any;
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

// Route validation access function
export function routeInfo<Address extends RouteKeys>(routeId: Address): {
  paramsValidator: RouteValidatorMap[Address]['paramsValidator'];
  searchParamsValidator: RouteValidatorMap[Address]['searchParamsValidator'];
  paramsType: RouteTypeMap[Address]['params'];
  searchParamsType: RouteTypeMap[Address]['searchParams'];
} {
  const validators = routeValidators[routeId];
  return {
    paramsValidator: validators.paramsValidator as any,
    searchParamsValidator: validators.searchParamsValidator as any,
    paramsType: {} as RouteTypeMap[Address]['params'],
    searchParamsType: {} as RouteTypeMap[Address]['searchParams']
  };
}
`;
    
    writeFileSync(wrapperPath, wrapperContent, 'utf-8');
  }

  function generateConfigModule(): string {
    const schemas = scanForSchemas();
    
    const schemaDefinitions: string[] = [];
    const configEntries: string[] = [];
    
    // Add base config entries first
    Object.entries(baseConfig).forEach(([routePath, config]) => {
      configEntries.push(`'${routePath}': ${JSON.stringify(config, null, 2).replace(/"/g, '')}`);
    });

    // Auto-detect needed imports
    const needsZodImport = schemas.some(s => 
      s.paramsSchemaCode?.includes('z.') || s.searchParamsSchemaCode?.includes('z.')
    );
    
    const detectedImports: string[] = [];
    if (needsZodImport) detectedImports.push("import { z } from 'zod';");
    
    // Add custom imports
    imports.forEach(imp => {
      if (!detectedImports.includes(imp)) {
        detectedImports.push(imp);
      }
    });

    schemas.forEach((schema, index) => {
      const schemaAlias = `autoSchema${index}`;
      
      if (schema.routeConfigCode) {
        // New unified format
        schemaDefinitions.push(`const ${schemaAlias}_config = ${schema.routeConfigCode};`);
        
        const entry = `'${schema.routePath}': {
          paramsValidation: ${schemaAlias}_config.params,
          searchParamsValidation: ${schemaAlias}_config.searchParams,
          onParamsError: ${schemaAlias}_config.onParamsError,
          onSearchParamsError: ${schemaAlias}_config.onSearchParamsError,
          meta: ${schemaAlias}_config.meta,
        }`;
        
        configEntries.push(entry);
      } else {
        // Legacy format
        if (schema.paramsSchemaCode) {
          schemaDefinitions.push(`const ${schemaAlias}_params = ${schema.paramsSchemaCode};`);
        }
        if (schema.searchParamsSchemaCode) {
          schemaDefinitions.push(`const ${schemaAlias}_searchParams = ${schema.searchParamsSchemaCode};`);
        }

        const entry = `'${schema.routePath}': {
          ${schema.paramsSchemaCode ? `paramsValidation: ${schemaAlias}_params,` : ''}
          ${schema.searchParamsSchemaCode ? `searchParamsValidation: ${schemaAlias}_searchParams,` : ''}
        }`;
        
        configEntries.push(entry);
      }
    });

    // Generate all route keys including base config and auto-detected
    const allRouteKeys = [
      ...Object.keys(baseConfig).map(k => `'${k}'`),
      ...schemas.map(s => `'${s.routePath}'`)
    ];
    const uniqueRouteKeys = allRouteKeys.filter((key, index) => allRouteKeys.indexOf(key) === index);
    const routeKeys = uniqueRouteKeys.join(' | ');
    
    // Generate type mappings for each route
    const autoTypeMapping = schemas.map((schema, index) => {
      const schemaAlias = `autoSchema${index}`;
      
      if (schema.routeConfigCode) {
        // New unified format
        const paramsType = `StandardSchemaV1.InferOutput<typeof ${schemaAlias}_config.params> | Record<string, string>`;
        const searchParamsType = `StandardSchemaV1.InferOutput<typeof ${schemaAlias}_config.searchParams> | Record<string, string | string[]>`;
        
        return `  '${schema.routePath}': { params: ${paramsType}; searchParams: ${searchParamsType} }`;
      } else {
        // Legacy format
        const paramsType = schema.paramsSchemaCode 
          ? `StandardSchemaV1.InferOutput<typeof ${schemaAlias}_params>`
          : 'Record<string, string>';
        const searchParamsType = schema.searchParamsSchemaCode
          ? `StandardSchemaV1.InferOutput<typeof ${schemaAlias}_searchParams>`
          : 'Record<string, string | string[]>';
        
        return `  '${schema.routePath}': { params: ${paramsType}; searchParams: ${searchParamsType} }`;
      }
    });
    
    // Add base config type mappings (simplified for now)
    const baseTypeMapping = Object.keys(baseConfig).map(routePath => {
      return `  '${routePath}': { params: any; searchParams: any }`;
    });
    
    const typeMapping = [...baseTypeMapping, ...autoTypeMapping].join(';\n');
    
    // Generate validator objects for each route
    const routeValidators = schemas.map((schema, index) => {
      const schemaAlias = `autoSchema${index}`;
      
      if (schema.routeConfigCode) {
        // New unified format
        return `  '${schema.routePath}': {
    paramsValidator: ${schemaAlias}_config.params,
    searchParamsValidator: ${schemaAlias}_config.searchParams,
    onParamsError: ${schemaAlias}_config.onParamsError,
    onSearchParamsError: ${schemaAlias}_config.onSearchParamsError,
  }`;
      } else {
        // Legacy format
        return `  '${schema.routePath}': {
    paramsValidator: ${schema.paramsSchemaCode ? `${schemaAlias}_params` : 'undefined'},
    searchParamsValidator: ${schema.searchParamsSchemaCode ? `${schemaAlias}_searchParams` : 'undefined'},
  }`;
      }
    });

    return `// Auto-generated by skroutes-plugin
import type { StandardSchemaV1 } from '@standard-schema/spec';
${detectedImports.join('\n')}

// Inline schema definitions (extracted from page files)
${schemaDefinitions.join('\n')}

export const routeConfig = {
  ${configEntries.join(',\n  ')}
} as const;

// Export validators for direct access
export const routeValidators = {
${routeValidators.join(',\n')}
} as const;

// Export route keys for type checking
export type RouteKeys = ${routeKeys || 'never'};

// Export type mapping for schema inference
export type RouteTypeMap = {
${typeMapping}
};

// Export validator type mapping
export type RouteValidatorMap = {
${schemas.map((schema, index) => {
  const schemaAlias = `autoSchema${index}`;
  const paramsValidator = schema.paramsSchemaCode ? `typeof ${schemaAlias}_params` : 'undefined';
  const searchParamsValidator = schema.searchParamsSchemaCode ? `typeof ${schemaAlias}_searchParams` : 'undefined';
  return `  '${schema.routePath}': { paramsValidator: ${paramsValidator}; searchParamsValidator: ${searchParamsValidator} }`;
}).join(';\n')}
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
        } else if (entry.match(/^\+(page|server)\.(server\.)?[tj]s$/)) {
          const content = readFileSync(fullPath, 'utf-8');
          const routePath = extractRoutePathFromDirectory(relativePath);
          
          // Look for new unified route config first
          const routeConfigPattern = /export\s+const\s+_routeConfig\s*=\s*([^;]+);/;
          const routeConfigMatch = content.match(routeConfigPattern);
          
          if (routeConfigMatch) {
            // New unified format
            schemas.push({
              routePath,
              filePath: fullPath,
              routeConfig: '_routeConfig',
              routeConfigCode: routeConfigMatch[1]?.trim() || '{ /* unified config detected */ }'
            });
          } else {
            // Legacy format - look for separate schema exports
            const paramsPattern = new RegExp(`export\\s+const\\s+${schemaExportName}\\s*=\\s*([^;]+);`);
            const searchParamsPattern = new RegExp(`export\\s+const\\s+${searchParamsExportName}\\s*=\\s*([^;]+);`);
            
            const paramsMatch = content.match(paramsPattern);
            const searchParamsMatch = content.match(searchParamsPattern);

            if (paramsMatch || searchParamsMatch) {
              schemas.push({
                routePath,
                filePath: fullPath,
                paramsSchema: paramsMatch ? schemaExportName : undefined,
                searchParamsSchema: searchParamsMatch ? searchParamsExportName : undefined,
                paramsSchemaCode: paramsMatch ? paramsMatch[1].trim() : undefined,
                searchParamsSchemaCode: searchParamsMatch ? searchParamsMatch[1].trim() : undefined
              });
            }
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