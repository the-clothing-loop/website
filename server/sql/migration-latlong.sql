--- Latitude Longitude have been added incorrectly

--- Users
ALTER TABLE users ADD COLUMN longitude_migration double AFTER longitude;
ALTER TABLE users ADD COLUMN latitude_migration double AFTER latitude;

UPDATE users SET longitude_migration = latitude, latitude_migration = longitude
WHERE longitude > latitude;

UPDATE users SET longitude = longitude_migration, latitude = latitude_migration
WHERE longitude_migration IS NOT NULL OR latitude_migration IS NOT NULL;

ALTER TABLE users DROP COLUMN longitude_migration;
ALTER TABLE users DROP COLUMN latitude_migration;


-- Find incorrect dutch latlong values
SELECT id, name, latitude, longitude,address, updated_at FROM users WHERE (
	latitude>1 AND latitude<9
AND
	longitude>48 AND longitude<55
)
ORDER BY updated_at DESC;