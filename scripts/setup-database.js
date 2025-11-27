#!/usr/bin/env node

// Helper script to setup the database
const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")
require("dotenv").config({ path: ".env.local" })

async function setupDatabase() {
  try {
    console.log("Connecting to database...")

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number.parseInt(process.env.DB_PORT || "3306"),
      multipleStatements: true,
    })

    console.log("✓ Connected to database")

    // Read SQL file
    const sqlFile = path.join(__dirname, "01-create-tables.sql")
    const sql = fs.readFileSync(sqlFile, "utf8")

    console.log("Running database migrations...")

    await connection.query(sql)

    console.log("✓ Database setup complete!")
    console.log("\nTables created:")
    console.log("  - users")
    console.log("  - staff_profiles")
    console.log("  - azuracast_encoders")
    console.log("  - broadcast_sessions")
    console.log("  - newsletter_subscribers")
    console.log("\nNext steps:")
    console.log("  1. Run: npm run create-admin <email> <username> <password>")
    console.log("  2. Start the app: pm2 start ecosystem.config.js")

    await connection.end()
  } catch (error) {
    console.error("Error setting up database:", error.message)
    process.exit(1)
  }
}

setupDatabase()
