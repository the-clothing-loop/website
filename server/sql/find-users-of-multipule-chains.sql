SELECT u.name, u.email, u.id, j.total
FROM users u
JOIN (
	SELECT uc.user_id AS user_id, COUNT(*) as total 
	FROM user_chains uc
	GROUP BY uc.user_id
	HAVING total > 1
) j
ON u.id = j.user_id;
