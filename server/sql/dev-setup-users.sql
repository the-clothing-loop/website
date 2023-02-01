-- Run `dev-purge.sql` and `make generate-fake-data` before running for the best result

UPDATE users SET email = "admin@example.com", name = "Admin", is_root_admin = TRUE WHERE id = 1;
UPDATE users SET email = "host@example.com", name = "Host" WHERE id = 2;
UPDATE user_chains SET is_chain_admin = TRUE, is_approved = TRUE WHERE user_id = 2;
UPDATE users SET email = "user@example.com", name = "Participant" WHERE id = 3;
UPDATE user_chains SET is_chain_admin = FALSE, is_approved = TRUE WHERE user_id = 3;
