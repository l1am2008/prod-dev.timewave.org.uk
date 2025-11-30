-- Create site_settings table for storing global configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default theme setting
INSERT INTO site_settings (setting_key, setting_value) VALUES ('active_theme', 'default')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
