SELECT COUNT(uc.user_id) AS total_hosts, uc.chain_id  FROM user_chains AS uc
WHERE uc.is_chain_admin = TRUE
GROUP BY uc.chain_id 
HAVING total_hosts > 4
