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
  // New unified format support
  routeConfig?: string;
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
  
  function generateRelativeImportPath(filePath: string): string {
    // Convert absolute file path to relative import path from the generated config
    const relativePath = filePath.replace(root, '').replace(/\\/g, '/');
    
    // Remove file extension and convert to import path
    // From src/lib/.generated/ to src/routes/... we need to go up and then down
    const importPath = relativePath.replace(/\.(ts|js)$/, '').replace(/^\/src\//, '../../../src/');
    
    return importPath;
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
    
    const schemaImports: string[] = [];
    const configEntries: string[] = [];
    
    // Add base config entries first
    Object.entries(baseConfig).forEach(([routePath, config]) => {
      configEntries.push(`'${routePath}': ${JSON.stringify(config, null, 2).replace(/"/g, '')}`);
    });

    // Add custom imports
    const detectedImports: string[] = [...imports];

    schemas.forEach((schema, index) => {
      const schemaAlias = `routeConfig${index}`;
      
      // Generate relative import path from the generated config to the page file
      const relativePath = generateRelativeImportPath(schema.filePath);
      
      if (schema.routeConfig) {
        // New unified format - import the entire route config
        schemaImports.push(`import { ${schema.routeConfig} as ${schemaAlias} } from '${relativePath}';`);
        
        const entry = `'${schema.routePath}': {
          paramsValidation: ${schemaAlias}.paramsValidation,
          searchParamsValidation: ${schemaAlias}.searchParamsValidation,
        }`;
        
        configEntries.push(entry);
      } else {
        // Legacy format - import individual schemas
        const imports: string[] = [];
        if (schema.paramsSchema) {
          imports.push(`${schema.paramsSchema} as ${schemaAlias}_params`);
        }
        if (schema.searchParamsSchema) {
          imports.push(`${schema.searchParamsSchema} as ${schemaAlias}_searchParams`);
        }
        
        if (imports.length > 0) {
          schemaImports.push(`import { ${imports.join(', ')} } from '${relativePath}';`);
        }

        const entry = `'${schema.routePath}': {
          ${schema.paramsSchema ? `paramsValidation: ${schemaAlias}_params,` : ''}
          ${schema.searchParamsSchema ? `searchParamsValidation: ${schemaAlias}_searchParams,` : ''}
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
      const schemaAlias = `routeConfig${index}`;
      
      if (schema.routeConfig) {
        // New unified format - use proper type inference without fallback unions
        const paramsType = `StandardSchemaV1.InferOutput<typeof ${schemaAlias}.paramsValidation>`;
        const searchParamsType = `StandardSchemaV1.InferOutput<typeof ${schemaAlias}.searchParamsValidation>`;
        
        return `  '${schema.routePath}': { params: ${paramsType}; searchParams: ${searchParamsType} }`;
      } else {
        // Legacy format
        const paramsType = schema.paramsSchema 
          ? `StandardSchemaV1.InferOutput<typeof ${schemaAlias}_params>`
          : 'Record<string, string>';
        const searchParamsType = schema.searchParamsSchema
          ? `StandardSchemaV1.InferOutput<typeof ${schemaAlias}_searchParams>`
          : 'Record<string, string | string[]>';
        
        return `  '${schema.routePath}': { params: ${paramsType}; searchParams: ${searchParamsType} }`;
      }
    });
    
    // Add base config type mappings (simplified for now)
    const baseTypeMapping = Object.keys(baseConfig).map(routePath => {
      return `  '${routePath}': { params: Record<string, string>; searchParams: Record<string, string | string[]> }`;
    });
    
    const typeMapping = [...baseTypeMapping, ...autoTypeMapping].join(';\n');
    
    // Generate validator objects for each route
    const routeValidators = schemas.map((schema, index) => {
      const schemaAlias = `routeConfig${index}`;
      
      if (schema.routeConfig) {
        // New unified format
        return `  '${schema.routePath}': {
    paramsValidator: ${schemaAlias}.paramsValidation,
    searchParamsValidator: ${schemaAlias}.searchParamsValidation,
  }`;
      } else {
        // Legacy format
        return `  '${schema.routePath}': {
    paramsValidator: ${schema.paramsSchema ? `${schemaAlias}_params` : 'undefined'},
    searchParamsValidator: ${schema.searchParamsSchema ? `${schemaAlias}_searchParams` : 'undefined'},
  }`;
      }
    });

    return `// Auto-generated by skroutes-plugin
// WARNING: Do not import from this file in route files to avoid circular dependencies
import type { StandardSchemaV1 } from '@standard-schema/spec';
${detectedImports.join('\n')}

// Import schema definitions from page files
${schemaImports.join('\n')}

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
  const schemaAlias = `routeConfig${index}`;
  if (schema.routeConfig) {
    return `  '${schema.routePath}': { paramsValidator: typeof ${schemaAlias}.paramsValidation; searchParamsValidator: typeof ${schemaAlias}.searchParamsValidation }`;
  } else {
    const paramsValidator = schema.paramsSchema ? `typeof ${schemaAlias}_params` : 'undefined';
    const searchParamsValidator = schema.searchParamsSchema ? `typeof ${schemaAlias}_searchParams` : 'undefined';
    return `  '${schema.routePath}': { paramsValidator: ${paramsValidator}; searchParamsValidator: ${searchParamsValidator} }`;
  }
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
          const routeConfigPattern = /export\s+const\s+_routeConfig\s*=/;
          const routeConfigMatch = content.match(routeConfigPattern);
          
          if (routeConfigMatch) {
            // New unified format
            schemas.push({
              routePath,
              filePath: fullPath,
              routeConfig: '_routeConfig'
            });
          } else {
            // Legacy format - look for separate schema exports
            const paramsPattern = new RegExp(`export\\s+const\\s+${schemaExportName}\\s*=`);
            const searchParamsPattern = new RegExp(`export\\s+const\\s+${searchParamsExportName}\\s*=`);
            
            const paramsMatch = content.match(paramsPattern);
            const searchParamsMatch = content.match(searchParamsPattern);

            if (paramsMatch || searchParamsMatch) {
              schemas.push({
                routePath,
                filePath: fullPath,
                paramsSchema: paramsMatch ? schemaExportName : undefined,
                searchParamsSchema: searchParamsMatch ? searchParamsExportName : undefined
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