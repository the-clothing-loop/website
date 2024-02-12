UPDATE bags AS b
SET b.number = CASE
    WHEN LENGTH(b.number) > 4
        AND LEFT(b.number, 4) = 'Tas '
        AND LEFT(b.number, 4) = 'Sac '
        AND LEFT(b.number, 4) = 'Bag '
    THEN
        SUBSTR(b.number, 5)
    ELSE b.number
END;
