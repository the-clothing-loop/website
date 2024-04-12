-- Amount of users active in last 7 days
SELECT COUNT(*) FROM users
WHERE last_signed_in_at > NOW() - INTERVAL 7 DAY;