SELECT user_chains.is_chain_admin, chains.*
FROM chains
LEFT JOIN user_chains ON user_chains.chain_id = chains.id
LEFT JOIN users ON users.id = user_chains.user_id
WHERE users.email = "test@example.com";
