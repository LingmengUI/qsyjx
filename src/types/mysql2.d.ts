declare module 'mysql2/promise' {
  import { Connection, Pool, PoolConnection, PoolOptions } from 'mysql2'
  
  export function createPool(options: PoolOptions): Pool
  export { Connection, Pool, PoolConnection, PoolOptions }
} 