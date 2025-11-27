-- Add VIP system to users table
ALTER TABLE users ADD COLUMN is_vip BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN vip_granted_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN vip_granted_by INT NULL;

-- Index for VIP queries
CREATE INDEX idx_users_vip ON users(is_vip);
