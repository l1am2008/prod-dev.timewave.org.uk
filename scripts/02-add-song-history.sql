-- Add song history tracking table
CREATE TABLE IF NOT EXISTS song_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  song_title VARCHAR(255) NOT NULL,
  song_artist VARCHAR(255) NOT NULL,
  song_album VARCHAR(255),
  album_art_url TEXT,
  played_at DATETIME NOT NULL,
  duration INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_played_at (played_at)
);

-- Add song requests table
CREATE TABLE IF NOT EXISTS song_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  requester_name VARCHAR(100),
  song_title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255),
  message TEXT,
  status ENUM('pending', 'approved', 'rejected', 'played') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Add active users tracking
CREATE TABLE IF NOT EXISTS active_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_listening BOOLEAN DEFAULT TRUE,
  UNIQUE KEY unique_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_last_seen (last_seen)
);
