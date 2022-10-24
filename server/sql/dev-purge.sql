-- ! Warning
-- ! This will remove all data from the selected database

DELETE FROM user_chains;
DELETE FROM user_tokens;
DELETE FROM chains;
DELETE FROM mails;
DELETE FROM newsletters;
DELETE FROM payments;
DELETE FROM users;

ALTER TABLE clothingloop.chains AUTO_INCREMENT=1;
ALTER TABLE clothingloop.mails AUTO_INCREMENT=1;
ALTER TABLE clothingloop.newsletters AUTO_INCREMENT=1;
ALTER TABLE clothingloop.payments AUTO_INCREMENT=1;
ALTER TABLE clothingloop.user_chains AUTO_INCREMENT=1;
ALTER TABLE clothingloop.users AUTO_INCREMENT=1;
