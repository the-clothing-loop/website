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