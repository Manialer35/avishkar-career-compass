
-- Function to increment the download count for study materials
CREATE OR REPLACE FUNCTION increment_material_downloads(material_id UUID) 
RETURNS void AS $$
BEGIN
    UPDATE study_materials 
    SET download_count = COALESCE(download_count, 0) + 1 
    WHERE id = material_id;
END;
$$ LANGUAGE plpgsql;
