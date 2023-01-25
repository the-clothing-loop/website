-- Find chains without a host
SELECT uc.chain_id, c.name, c.address, uc.is_chain_admin, COUNT(uc.id) AS total_users 
FROM chains AS c
JOIN user_chains AS uc ON uc.chain_id = c.id
WHERE c.published = FALSE
GROUP BY c.id
HAVING uc.is_chain_admin = FALSE;

-- Search for users for a chain
SELECT u.id, u.name, u.phone_number, u.email, u.last_signed_in_at, uc.is_chain_admin
FROM users AS u
JOIN user_chains AS uc ON uc.user_id = u.id
WHERE uc.chain_id = 0 AND u.is_email_verified = true
ORDER BY u.last_signed_in_at DESC;
