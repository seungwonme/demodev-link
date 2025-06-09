-- Add description column to links table
ALTER TABLE links 
ADD COLUMN description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN links.description IS 'Optional description for the link to provide context';

-- Update existing links with a default description based on their URL (optional)
UPDATE links 
SET description = 'Link to ' || original_url 
WHERE description IS NULL;