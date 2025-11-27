require("dotenv").config({ path: ".env.local" })
const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")

async function createAdmin() {
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.error("Usage: npm run create-admin <email> <username> <password>")
    console.error("Example: npm run create-admin admin@timewave.uk admin MySecurePass123")
    process.exit(1)
  }

  const [email, username, password] = args

  if (!email || !username || !password) {
    console.error("Error: All fields are required (email, username, password)")
    process.exit(1)
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    console.error("Error: Invalid email format")
    process.exit(1)
  }

  // Validate password strength
  if (password.length < 8) {
    console.error("Error: Password must be at least 8 characters long")
    process.exit(1)
  }

  let connection

  try {
    console.log("Connecting to database...")

    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    })

    console.log("Connected to database successfully")

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      "SELECT id, email, username FROM users WHERE email = ? OR username = ?",
      [email, username],
    )

    if (existingUsers.length > 0) {
      console.error(`Error: User with email "${email}" or username "${username}" already exists`)
      process.exit(1)
    }

    // Hash password
    console.log("Hashing password...")
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert super admin
    console.log("Creating super admin account...")
    const [result] = await connection.execute(
      `INSERT INTO users (email, username, password_hash, role, is_verified, created_at, updated_at) 
       VALUES (?, ?, ?, 'super_admin', TRUE, NOW(), NOW())`,
      [email, username, passwordHash],
    )

    console.log("\n✅ Super admin account created successfully!")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log(`Email:    ${email}`)
    console.log(`Username: ${username}`)
    console.log(`Role:     super_admin`)
    console.log(`User ID:  ${result.insertId}`)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    console.log("You can now login at: http://your-domain:3030/admin")
  } catch (error) {
    console.error("\n❌ Error creating admin account:")
    console.error(error.message)

    if (error.code === "ECONNREFUSED") {
      console.error("\nDatabase connection refused. Please check:")
      console.error("1. Database credentials in .env.local")
      console.error("2. Database server is running")
      console.error("3. Firewall allows connection to database")
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      console.error("\nDatabase tables do not exist. Please run:")
      console.error("npm run setup-db")
    }

    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

createAdmin()
