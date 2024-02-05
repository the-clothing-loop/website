UPDATE bags AS b
    JOIN (
        SELECT b.id AS bag_id, u.id AS user_id, u.i18n,
        ROW_NUMBER() OVER (PARTITION BY b.id ORDER BY FIELD(LOWER(u.i18n), 'en', 'fr', 'nl') DESC) AS row_num
        FROM bags b
            JOIN user_chains bag_chain ON b.user_chain_id = bag_chain.id
            JOIN user_chains uc ON bag_chain.chain_id = uc.chain_id AND uc.is_chain_admin = 1
            LEFT JOIN users u ON uc.user_id = u.id
    ) AS ru ON b.id = ru.bag_id
SET b.number = CASE
    WHEN LENGTH(b.number) < 7 AND (
        LEFT(b.number, 4) != 'Tas ' AND
        LEFT(b.number, 4) != 'Sac ' AND
        LEFT(b.number, 4) != 'Bag ')
    THEN
        CASE
            WHEN LOWER(ru.i18n) = 'en' THEN CONCAT('Bag ', b.number)
            WHEN LOWER(ru.i18n) = 'fr' THEN CONCAT('Sac ', b.number)
            ELSE CONCAT('Tas ', b.number)
        END
    ELSE b.number
END;

-- Find all bags from outside the netherlands that have the Dutch bag prefix
SELECT b.*, c.country_code FROM bags AS b
LEFT JOIN user_chains AS uc ON uc.id = b.user_chain_id
LEFT JOIN chains AS c ON c.id = uc.chain_id
WHERE country_code != "NL" AND country_code != "BE" AND LEFT(b.number, 4) = "Tas ";