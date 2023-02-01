-- List users of chain by ID
SELECT uc.chain_id, uc.is_chain_admin, users.id, users.email, users.name, users.is_email_verified 
FROM users
LEFT JOIN user_chains AS uc ON uc.user_id = users.id
WHERE uc.chain_id = 28;