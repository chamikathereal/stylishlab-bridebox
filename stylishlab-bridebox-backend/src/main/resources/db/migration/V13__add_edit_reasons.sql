-- Add edit audit fields to expenses table
ALTER TABLE expenses 
ADD COLUMN last_edit_reason VARCHAR(100),
ADD COLUMN last_edit_note TEXT;
