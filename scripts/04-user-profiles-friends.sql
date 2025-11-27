-- Add favorite song fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_song_title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_song_artist VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_song_itunes_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_song_artwork VARCHAR(500);

-- User friendships table
CREATE TABLE IF NOT EXISTS user_friends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  friend_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_friendship (user_id, friend_id),
  INDEX idx_user_id (user_id),
  INDEX idx_friend_id (friend_id),
  INDEX idx_status (status)
);

-- Profile views tracking (optional for analytics)
CREATE TABLE IF NOT EXISTS profile_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id INT NOT NULL,
  viewer_id INT,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_profile_id (profile_id),
  INDEX idx_viewed_at (viewed_at)
);
