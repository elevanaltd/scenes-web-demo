-- Rename tracking_type to movement_type in shots table
-- This is a forward-only migration using single-step RENAME for safety

ALTER TABLE shots RENAME COLUMN tracking_type TO movement_type;

-- Add comment to document the column purpose
COMMENT ON COLUMN shots.movement_type IS 'Type of camera movement (Tracking, Establishing, Standard, Photos). Determines which additional fields are required.';
