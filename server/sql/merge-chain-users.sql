-- Move users from one chain to another, then delete empty chain

-- Update users is_chain_admin status

UPDATE user_chains as uc
SET uc.is_chain_admin = TRUE
WHERE
    uc.chain_id = @to
    AND uc.user_id IN (
        SELECT uc2.user_id
        FROM user_chains AS uc2
        WHERE
            uc2.chain_id = @from
            AND uc2.is_chain_admin = TRUE
    );

-- Move users to new chain who aren't already joined to the other chain

UPDATE user_chains AS uc
SET uc.chain_id = @to
WHERE
    uc.chain_id = @from
    AND uc.user_id NOT IN (
        SELECT uc2.user_id
        FROM user_chains as uc2
        WHERE
            uc2.chain_id = @to
    );

-- Delete old chain

DELETE FROM bags
WHERE user_chain_id IN (
        SELECT id
        FROM user_chains
        WHERE chain_id = @from
    );

DELETE FROM user_chains WHERE user_chains.chain_id = @from;

DELETE FROM chains WHERE chains.id = @from;