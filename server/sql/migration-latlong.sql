-- Latitude Longitude have been added incorrectly

-- Users
ALTER TABLE users ADD COLUMN longitude_migration double AFTER longitude;
ALTER TABLE users ADD COLUMN latitude_migration double AFTER latitude;

-- Reset latlong_migration columns if zero to null
UPDATE users SET longitude_migration = NULL, latitude_migration = NULL
WHERE longitude_migration = 0 AND latitude_migration = 0;

-- Reverse columns
UPDATE users SET longitude_migration = latitude, latitude_migration = longitude;

-- !Reset all latlong_migration columns!
UPDATE users SET longitude_migration = NULL, latitude_migration = NULL
WHERE longitude_migration IS NOT NULL OR latitude_migration IS NOT NULL;

-- Remove latlong_migration columns
ALTER TABLE users DROP COLUMN longitude_migration;
ALTER TABLE users DROP COLUMN latitude_migration;


-- Find incorrect dutch latlong values
SELECT id, name, latitude, longitude,address, updated_at FROM users WHERE (
	latitude>1 AND latitude<9
AND
	longitude>48 AND longitude<55
)
ORDER BY updated_at DESC;

-- Find latlong_migration columns todos
SELECT id, name, address, latitude, latitude_migration, longitude, longitude_migration FROM users WHERE latitude_migration IS NOT NULL;