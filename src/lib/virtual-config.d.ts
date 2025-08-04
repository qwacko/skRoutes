// Type declarations for the virtual skroutes-config module
declare module 'virtual:skroutes-config' {
  import type { RouteConfig } from './skRoutes.js';
  import type { StandardSchemaV1 } from '@standard-schema/spec';
  
  export const routeConfig: RouteConfig;
  export type RouteKeys = string;
  export type RouteTypeMap = Record<string, { params: any; searchParams: any }>;
}