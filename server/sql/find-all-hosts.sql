-- Find all hosts that have an email address

SELECT
    u.email,
    uc.is_chain_admin
FROM users AS u
    JOIN user_chains AS uc ON uc.user_id = u.id
        AND uc.is_chain_admin = TRUE
GROUP BY u.id
HAVING u.email is not NULL



-- Hosts active in YEAR
SELECT COUNT(DISTINCT uc.user_id) AS active_hosts_2024
FROM user_chains AS uc
WHERE uc.is_chain_admin = TRUE
  AND uc.created_at < DATE('2025-01-01');
