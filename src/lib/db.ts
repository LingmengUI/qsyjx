import mysql from 'mysql2/promise'
import type { Pool } from 'mysql2/promise'
import type { RowDataPacket, FieldPacket } from 'mysql2'

// 创建连接池 - 使用基本配置避免警告
const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// 保留所有表创建 SQL
export const createApiKeysTableSQL = `
CREATE TABLE IF NOT EXISTS api_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(64) NOT NULL UNIQUE,
  user_id INT,
  plan ENUM('basic', 'pro', 'enterprise') NOT NULL DEFAULT 'basic',
  total_quota INT NOT NULL DEFAULT 1000,
  remaining_quota INT NOT NULL DEFAULT 1000,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`

export const createUsageLogsTableSQL = `
CREATE TABLE IF NOT EXISTS usage_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(64) NOT NULL,
  user_id INT,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  request_url TEXT,
  response_status INT,
  INDEX idx_user_date (user_id, used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`

export const createUsersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar VARCHAR(255),
  role ENUM('admin', 'user') NOT NULL,
  api_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`

export const createVerifyCodesTableSQL = `
CREATE TABLE IF NOT EXISTS verify_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`

export const createUsageStatsTableSQL = `
CREATE TABLE IF NOT EXISTS usage_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  total_requests INT NOT NULL DEFAULT 0,
  UNIQUE KEY idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`

export const createSystemSettingsTableSQL = `
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`

export const initSystemSettingsSQL = `
INSERT IGNORE INTO system_settings (setting_key, value) VALUES 
('tutorial', '<h2>使用教程</h2><p>1. 复制视频链接</p><p>2. 粘贴到输入框</p><p>3. 点击解析按钮</p>'),
('faq', '<h2>常见问题</h2><p><strong>Q: 为什么解析失败？</strong></p><p>A: 请检查链接是否正确，或者尝试其他解析通道。</p>'),
('contact_email', 'support@example.com'),
('announcement', '<p>欢迎使用解析助手！</p>')
`

// 统计数据接口
interface UsageStats extends RowDataPacket {
  todayRequests: number
  totalRequests: number
  totalQuota: number
}

// 统计查询函数
export async function getUsageStats() {
  const result = await pool.query<UsageStats[]>(`
    SELECT 
      (SELECT COUNT(*) FROM usage_logs WHERE DATE(used_at) = CURDATE()) as todayRequests,
      (SELECT COUNT(*) FROM usage_logs) as totalRequests,
      (SELECT COALESCE(SUM(total_quota), 0) FROM api_keys) as totalQuota
  `)

  const [rows] = result as unknown as [UsageStats[], FieldPacket[]]
  return rows[0]
}

export { pool } 