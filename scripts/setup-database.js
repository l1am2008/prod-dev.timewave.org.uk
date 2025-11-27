#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" })
const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")

async function setupDatabase() {
  let connection

  try {
    console.log("Connecting to database...")
    console.log(`Host: ${process.env.DB_HOST}`)
    console.log(`Database: ${process.env.DB_NAME}`)
    console.log(`User: ${process.env.DB_USER}`)

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
      multipleStatements: true,
    })

    console.log("✓ Connected to database successfully\n")

    // Read SQL file
    const sqlFile = path.join(__dirname, "01-create-tables.sql")

    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL file not found: ${sqlFile}`)
    }

    const sql = fs.readFileSync(sqlFile, "utf8")

    console.log("Running database migrations...")

    await connection.query(sql)

    console.log("\n✅ Database setup complete!")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("Tables created:")
    console.log("  ✓ users")
    console.log("  ✓ staff_encoders")
    console.log("  ✓ live_sessions")
    console.log("  ✓ newsletter_subscribers")
    console.log("  ✓ password_resets")
    console.log("  ✓ song_history")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    console.log("Next steps:")
    console.log("  1. Create super admin:")
    console.log("     npm run create-admin <email> <username> <password>")
    console.log("  2. Build the application:")
    console.log("     npm run build")
    console.log("  3. Start with PM2:")
    console.log("     pm2 start ecosystem.config.js\n")
  } catch (error) {
    console.error("\n❌ Error setting up database:")
    console.error(error.message)

    if (error.code === "ECONNREFUSED") {
      console.error("\nDatabase connection refused. Please check:")
      console.error("1. Database credentials in .env.local are correct")
      console.error("2. Database server is running and accessible")
      console.error("3. Your server IP is whitelisted in cPanel MySQL Remote Hosts")
      console.error("4. Firewall allows connection to MySQL port (usually 3306)")
    } else if (error.code === "ER_DBACCESS_DENIED_ERROR") {
      console.error("\nAccess denied. Please verify:")
      console.error("1. Database credentials are correct")
      console.error("2. User has proper permissions on the database")
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("\nDatabase does not exist. Please:")
      console.error("1. Create the database in cPanel MySQL Databases")
      console.error("2. Ensure the database name matches DB_NAME in .env.local")
    }

    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log("Database connection closed.")
    }
  }
}

setupDatabase()
