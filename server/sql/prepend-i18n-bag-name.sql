UPDATE bags b
    JOIN user_chains bag_chain ON 
        b.user_chain_id = bag_chain.id
    JOIN user_chains uc ON
        bag_chain.chain_id = uc.chain_id AND uc.is_chain_admin = 1
    JOIN users u ON
        uc.user_id = u.id AND LENGTH(u.i18n) = 2
SET b.number = IF(
    LENGTH(b.number) < 7 AND (
        (u.i18n = 'nl' AND LEFT(b.number, 4) != 'Tas ') OR 
        (u.i18n = 'fr' AND LEFT(b.number, 4) != 'Sac ') OR 
        (u.i18n NOT IN ('nl', 'fr') AND LEFT(b.number, 4) != 'Bag ')
    ),
        CASE
            WHEN u.i18n = 'nl' THEN CONCAT('Tas ', b.number)
            WHEN u.i18n = 'fr' THEN CONCAT('Sac ', b.number)
            ELSE CONCAT('Bag ', b.number)
        END,
        b.number
);
