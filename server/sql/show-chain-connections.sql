SELECT COUNT(users.id) AS participants, COUNT(ua.id) AS admins, chains.name, chains.id, chains.uid
FROM chains
LEFT JOIN user_chains AS uc ON uc.chain_id = chains.id
LEFT JOIN users ON users.id = uc.user_id 
 JOIN users AS ua ON ua.id = uc.user_id AND uc.is_chain_admin = TRUE  
WHERE chains.id = 0