-- Migration: Progress Photos
-- Stores progress photos for athletes with metadata

CREATE TABLE IF NOT EXISTS progress_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    
    -- Photo metadata
    photo_date DATE NOT NULL,
    category ENUM('frente', 'costas', 'lateral_esquerda', 'lateral_direita', 'outro') DEFAULT 'frente',
    
    -- File info
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size INT, -- in bytes (after compression)
    original_size INT, -- in bytes (before compression)
    mime_type VARCHAR(50) DEFAULT 'image/jpeg',
    
    -- Dimensions
    width INT,
    height INT,
    
    -- Optional measurements at time of photo
    weight DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    
    -- Notes
    notes TEXT,
    
    -- Privacy
    is_private BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_progress_photos_athlete ON progress_photos(athlete_id);
CREATE INDEX idx_progress_photos_date ON progress_photos(photo_date);
CREATE INDEX idx_progress_photos_category ON progress_photos(category);
