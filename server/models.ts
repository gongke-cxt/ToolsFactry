import mysql from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2/promise'

const DB_CONFIG = {
  host: process.env.DB_HOST || 'rm-bp1ca97z1od2pb14zwo.mysql.rds.aliyuncs.com',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'gk_reader',
  password: process.env.DB_PASSWORD || 'gk_reader2026',
  database: process.env.DB_NAME || 'cxt_rpa',
}

let pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 10000,
    })
  }
  return pool
}

export interface ModelProvider {
  id: number
  providerId: string
  providerName: string
  priority: number
  status: 'active' | 'inactive'
  apiKey: string
  endpoint: string
  extraConfig: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export async function getActiveModels(): Promise<ModelProvider[]> {
  const [rows] = await getPool().query<RowDataPacket[]>(
    'SELECT * FROM model_providers WHERE status = ? ORDER BY priority ASC',
    ['active'],
  )
  return rows.map((r) => ({
    id: r.id as number,
    providerId: r.provider_id as string,
    providerName: r.provider_name as string,
    priority: r.priority as number,
    status: r.status as 'active' | 'inactive',
    apiKey: r.api_key as string,
    endpoint: r.endpoint as string,
    extraConfig: typeof r.extra_config === 'string' ? JSON.parse(r.extra_config) : (r.extra_config as Record<string, unknown>),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }))
}
