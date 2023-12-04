UPDATE bags AS b
SET user_chain_id = (
	SELECT uc.id FROM user_chains AS uc
	WHERE uc.is_chain_admin IS TRUE
		AND uc.is_approved IS TRUE
		AND uc.chain_id = (
			SELECT uc2.chain_id FROM user_chains AS uc2
			WHERE uc2.id = b.user_chain_id
		)
	ORDER BY
     uc.user_id != 0 DESC,
     uc.user_id
	LIMIT 1
)
WHERE b.user_chain_id IN (
	SELECT id FROM user_chains WHERE user_id = 0
);

DELETE FROM bags
WHERE user_chain_id IN (
        SELECT id
        FROM user_chains
        WHERE user_id = 0
    );

DELETE FROM user_chains WHERE user_chains.user_id = 0;

DELETE FROM user_tokens WHERE user_tokens.user_id = 0;

UPDATE events SET user_id = (
    SELECT id FROM users WHERE is_root_admin = 1 LIMIT 1
) WHERE user_id = 0;

DELETE FROM users WHERE users.id = 0;