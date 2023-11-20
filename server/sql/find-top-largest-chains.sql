SELECT COUNT(uc.chain_id) AS amount_participants, c.id AS chain_id, c.name AS chain_name, c.address AS address
FROM chains AS c
LEFT JOIN user_chains AS uc ON c.id = uc.chain_id
GROUP BY uc.chain_id
ORDER BY amount_participants DESC;