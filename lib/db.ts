import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export function getDb() {
  if (!pool) {
    const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required database environment variables: ${missingVars.join(", ")}. ` +
          `Please check your .env.local file.`,
      )
    }

    console.log("[v0] Creating database connection pool with:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
    })

    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        connectTimeout: 10000,
        acquireTimeout: 10000,
      })

      pool
        .getConnection()
        .then((connection) => {
          console.log("[v0] Database connection successful")
          connection.release()
        })
        .catch((error) => {
          console.error("[v0] Database connection test failed:", error.message)
        })
    } catch (error) {
      console.error("[v0] Failed to create database pool:", error)
      throw error
    }
  }
  return pool
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const db = getDb()
    const [rows] = await db.execute(sql, params)
    return rows as T[]
  } catch (error: any) {
    console.error("[v0] Database query error:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      sql: sql,
    })
    throw error
  }
}
