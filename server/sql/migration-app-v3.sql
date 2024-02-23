-- Fix bag colors
UPDATE bags
SET color = CASE
   WHEN LOWER(color) = "#ef953d" THEN "#C9843E"
   WHEN LOWER(color) = "#f4b63f" THEN "#AD8F22"
   WHEN LOWER(color) = "#a6c665" THEN "#79A02D"
   WHEN LOWER(color) = "#7ecfe0" THEN "#199FBA"
   WHEN LOWER(color) = "#89b3d9" THEN "#6494C2"
   WHEN LOWER(color) = "#dab5d6" THEN "#B37EAD"
   WHEN LOWER(color) = "#ecbbd0" THEN "#F57BB0"
   WHEN LOWER(color) = "#dc77a3" THEN "#A35C7B"
   WHEN LOWER(color) = "#e39aa1" THEN "#E38C95"
   WHEN LOWER(color) = "#a5a5a5" THEN "#7D7D7D"
   ELSE UPPER(color)
END;

-- Remove bag name prefix
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
