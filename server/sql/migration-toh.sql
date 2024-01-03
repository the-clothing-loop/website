--- Migrations for Terms of Hosts

--- Draft all Loops where the host has not accepted the toh


--- List Loops where only some hosts have not accepted the toh (should be run 40 days after ToH start)
SELECT c.id, c.name,
   JSON_ARRAYAGG(CONCAT("host id: ",h.id," name: ", h.name," accepted_toh: ", COALESCE(accepted_toh, 0))) AS hosts
FROM chains AS c
JOIN user_chains AS uch ON uch.chain_id = c.id AND uch.is_chain_admin = TRUE
LEFT JOIN users AS h ON h.id = uch.user_id AND COALESCE(h.accepted_toh, 0) != TRUE
WHERE published = TRUE
GROUP BY c.id
HAVING (
 SELECT COUNT(uc.chain_id) FROM user_chains AS uc
      JOIN users AS u ON u.id = uc.user_id
      WHERE uc.is_chain_admin = TRUE AND uc.is_approved = TRUE AND uc.chain_id = c.id AND u.accepted_toh = TRUE
   ) > 0
   AND (
 SELECT COUNT(uc.chain_id) FROM user_chains AS uc
      JOIN users AS u ON u.id = uc.user_id
      WHERE uc.is_chain_admin = TRUE AND uc.is_approved = TRUE AND uc.chain_id = c.id AND COALESCE(u.accepted_toh, 0) != TRUE
   ) > 0;