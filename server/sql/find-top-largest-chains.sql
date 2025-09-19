--Order chains by size
SELECT
  COUNT(uc.chain_id) AS amount_participants,
  c.id AS chain_id,
  c.name AS chain_name,
  c.address AS address
FROM
  chains AS c
  LEFT JOIN user_chains AS uc ON c.id = uc.chain_id
  AND uc.is_approved = TRUE
GROUP BY
  uc.chain_id
ORDER BY
  amount_participants DESC;


-- Select chains with >1 participant
SELECT
  COUNT(uc.chain_id) AS amount_participants,
  c.id AS chain_id,
  c.name AS chain_name,
  c.address AS address
FROM
  chains AS c
LEFT JOIN user_chains AS uc 
  ON c.id = uc.chain_id
  AND uc.is_approved = TRUE
GROUP BY
  c.id, c.name, c.address
HAVING
  COUNT(uc.chain_id) > 1  -- only chains with >1 participant
ORDER BY
  amount_participants DESC;
