-- Find chains without a host
SELECT UNIQUE(c.id), c.name, c.address
FROM chains AS c
JOIN user_chains AS uc ON uc.chain_id = c.id
WHERE c.id NOT IN (
SELECT UNIQUE(c2.id)  FROM chains AS c2
INNER JOIN user_chains AS uc2 ON c2.id = uc2.chain_id 
WHERE uc2.is_chain_admin = TRUE
);


-- Search for users for a chain
SELECT u.id, u.name, u.phone_number, u.email, u.last_signed_in_at, uc.is_chain_admin
FROM user_chains AS uc
JOIN users AS u ON uc.user_id = u.id
WHERE uc.chain_id = 12 AND u.is_email_verified = true
ORDER BY u.last_signed_in_at DESC;
