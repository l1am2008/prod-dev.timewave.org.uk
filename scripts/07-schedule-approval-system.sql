-- Add approval system to schedule table
-- Removed IF NOT EXISTS as MySQL doesn't support it for ALTER TABLE ADD COLUMN
ALTER TABLE schedule ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved';
ALTER TABLE schedule ADD COLUMN approved_by INT NULL;
ALTER TABLE schedule ADD COLUMN approved_at TIMESTAMP NULL;
ALTER TABLE schedule ADD COLUMN rejection_reason TEXT NULL;

-- Add foreign key for approved_by
ALTER TABLE schedule ADD CONSTRAINT fk_schedule_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for filtering by approval status
CREATE INDEX idx_approval_status ON schedule(approval_status);
