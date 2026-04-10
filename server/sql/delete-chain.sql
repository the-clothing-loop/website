DELETE FROM bags
WHERE user_chain_id IN (
        SELECT id
        FROM user_chains
        WHERE chain_id = 0
    );

DELETE FROM bulky_items
WHERE user_chain_id IN (
        SELECT id
        FROM user_chains
        WHERE chain_id = 0
    );

DELETE FROM chat_messages
WHERE chat_channel_id IN (
        SELECT id
        FROM chat_channels
        WHERE chain_id = 0
    );

DELETE FROM chat_channels WHERE chain_id = 0;

DELETE FROM user_chains WHERE user_chains.chain_id = 0;

DELETE FROM chains WHERE chains.id = 0;
