-- find duplicates by latitude and longitude
SELECT uc.total as total_participants ,a.name as chain_name, a.id as chain_id, a.latitude, a.longitude, a.published
FROM chains a
JOIN (
	SELECT latitude, longitude, COUNT(*) as total
	FROM chains 
	GROUP BY longitude, longitude
	HAVING count(*) > 1
) b
ON a.latitude > b.latitude - 0.12 AND a.latitude < b.latitude + 0.12
AND a.longitude > b.longitude - 0.12 AND a.longitude < b.longitude + 0.12
LEFT JOIN (
	SELECT COUNT(*) as total, chain_id, user_id
	FROM user_chains
	GROUP BY chain_id
) AS uc
ON uc.chain_id = a.id
WHERE a.latitude != 0 AND a.longitude != 0
ORDER BY a.latitude DESC;
