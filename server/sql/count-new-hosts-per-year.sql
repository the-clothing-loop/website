-- How many hosts there where average in 2023

-- hosts
SELECT COUNT(DISTINCT uc.user_id) FROM user_chains AS uc
WHERE YEAR(uc.created_at) <= "2023"
AND uc.user_id IN (
	SELECT DISTINCT uc2.id FROM user_chains AS uc2 WHERE uc2.is_chain_admin = TRUE
);

-- not hosts
SELECT COUNT(DISTINCT uc.user_id) FROM user_chains AS uc
WHERE YEAR(uc.created_at) <= "2023"
AND uc.user_id NOT IN (
	SELECT DISTINCT uc2.id FROM user_chains AS uc2 WHERE uc2.is_chain_admin = TRUE
);