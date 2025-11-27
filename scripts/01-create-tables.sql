-- Users table for authentication and basic user info
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(500),
  role ENUM('user', 'staff', 'admin', 'super_admin') DEFAULT 'user',
  staff_role VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  newsletter_subscribed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Staff encoders table (links to AzuraCast encoders)
CREATE TABLE IF NOT EXISTS staff_encoders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  encoder_id VARCHAR(100) NOT NULL,
  encoder_password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_encoder (user_id),
  INDEX idx_encoder_id (encoder_id)
);

-- Live sessions tracking
CREATE TABLE IF NOT EXISTS live_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  encoder_id VARCHAR(100) NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  is_live BOOLEAN DEFAULT TRUE,
  listeners_peak INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_live (is_live)
);

-- Newsletter subscribers (for non-registered users)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribe_token VARCHAR(255) UNIQUE,
  INDEX idx_email (email)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token)
);

-- Song history cache
CREATE TABLE IF NOT EXISTS song_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  artwork_url VARCHAR(500),
  played_at TIMESTAMP NOT NULL,
  duration INT,
  INDEX idx_played_at (played_at)
);
