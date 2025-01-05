import { Redis } from 'ioredis'

// 定义数组类型的缓存数据
interface ArrayCacheData<T> {
  data: T[]
}

// 创建 Redis 客户端
const createRedisClient = () => {
  try {
    const client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      enableReadyCheck: true
    })

    client.on('error', (error) => {
      console.error('Redis connection error:', error)
    })

    client.on('connect', () => {
      console.log('Redis connected successfully')
      client.status = 'ready'
    })

    client.on('ready', () => {
      console.log('Redis client is ready')
      client.status = 'ready'
    })

    client.on('end', () => {
      console.log('Redis connection ended')
      client.status = 'end'
    })

    return client
  } catch (error) {
    console.error('Redis initialization error:', error)
    return null
  }
}

const redis = createRedisClient()

// 修改状态检查逻辑
const isRedisReady = () => {
  return redis && (redis.status === 'ready' || redis.status === 'connect')
}

// 设置缓存 - 支持对象和数组
export async function setCache<T>(key: string, data: T | T[], expireTime = 300) {
  try {
    if (!isRedisReady()) {
      console.warn('Redis not ready, skipping cache set')
      return
    }
    const cacheData = Array.isArray(data) ? { data } : data
    await redis!.setex(key, expireTime, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

// 获取缓存 - 支持对象和数组
export async function getCache<T>(key: string): Promise<T | T[] | null> {
  try {
    if (!isRedisReady()) {
      console.warn('Redis not ready, skipping cache get')
      return null
    }
    const data = await redis!.get(key)
    if (!data) return null

    const parsed = JSON.parse(data)
    return (parsed as ArrayCacheData<T>).data || parsed as T
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

// 删除缓存
export async function deleteCache(key: string) {
  try {
    if (!isRedisReady()) {
      console.warn('Redis not ready, skipping cache delete')
      return
    }
    await redis!.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}

// 清除特定前缀的所有缓存
export async function clearCacheByPrefix(prefix: string) {
  try {
    if (!isRedisReady()) {
      console.warn('Redis not ready, skipping cache clear')
      return
    }
    const keys = await redis!.keys(`${prefix}:*`)
    if (keys.length > 0) {
      await redis!.del(...keys)
    }
  } catch (error) {
    console.error('Redis clear error:', error)
  }
}

// 增加计数
export async function incrByCache(key: string, increment: number = 1) {
  try {
    if (!isRedisReady()) {
      console.warn('Redis not ready, skipping increment')
      return null
    }
    return await redis!.incrby(key, increment)
  } catch (error) {
    console.error('Redis increment error:', error)
    return null
  }
} 