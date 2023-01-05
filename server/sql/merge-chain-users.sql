-- Move users from one chain to another, then delete empty chain

-- Move users to new chain
UPDATE user_chains
SET chain_id = <new>
WHERE chain_id = <old>;

-- Delete participant duplicate of a host
DELETE FROM user_chains
WHERE user_id IN (
	SELECT uc2.user_id
	FROM user_chains AS uc2
	WHERE uc2.is_chain_admin = TRUE
		AND uc2.chain_id = <new>
   )
	AND is_chain_admin = FALSE
	AND chain_id = <new>;

-- Delete all duplicates
DELETE uc1 FROM user_chains AS uc1
INNER JOIN user_chains AS uc2
WHERE uc1.id < uc2.id 
	AND uc1.chain_id = uc2.chain_id 
	AND uc1.user_id = uc2.user_id;

-- Test: find duplicates, this should return empty
SELECT id, CONCAT(user_id, "_",chain_id) AS uniq
FROM user_chains
GROUP BY uniq
HAVING COUNT(uniq) > 1;

-- Test: show amount of rows in old user_chains, this should return 0
SELECT COUNT(*)
FROM user_chains
WHERE chain_id = <old>

-- Delete old chain
DELETE FROM user_chains WHERE user_chains.chain_id = <old>;
DELETE FROM chains WHERE chains.id = <old>;
