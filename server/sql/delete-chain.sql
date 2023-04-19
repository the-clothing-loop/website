DELETE FROM bags
WHERE user_chain_id IN (
        SELECT id
        FROM user_chains
        WHERE chain_id = 0
    );

DELETE FROM user_chains WHERE user_chains.chain_id = 0;

DELETE FROM chains WHERE chains.id = 0;