-- Add approval system to schedule table
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved';
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS approved_by INT NULL;
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

-- Add foreign key for approved_by
ALTER TABLE schedule ADD CONSTRAINT fk_schedule_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for filtering by approval status
CREATE INDEX IF NOT EXISTS idx_approval_status ON schedule(approval_status);
