-- Add permissions columns to users table
ALTER TABLE users ADD COLUMN can_create_shows BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN can_create_articles BOOLEAN DEFAULT FALSE;

-- Update existing staff and admin users to have show permissions
UPDATE users SET can_create_shows = TRUE WHERE role IN ('staff', 'admin', 'super_admin');

-- Create news articles table
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT NULL,
  approved_at TIMESTAMP NULL,
  rejection_reason TEXT NULL,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_approval_status (approval_status),
  INDEX idx_slug (slug),
  INDEX idx_published_at (published_at)
);
