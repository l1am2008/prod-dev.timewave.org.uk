-- Song requests table for user song requests
CREATE TABLE IF NOT EXISTS song_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  requester_name VARCHAR(255) NOT NULL,
  song_title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  message TEXT,
  status ENUM('pending', 'approved', 'rejected', 'played') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
