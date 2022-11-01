UPDATE user_chains
SET user_chains.is_chain_admin = TRUE
WHERE user_chains.chain_id = 0
AND user_chains.user_id = 0;
