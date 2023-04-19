-- ! Warning

-- ! This will remove all data from the local docker database

-- ! Remove "clothingloop." to use elseware

DELETE FROM clothingloop.bags;

DELETE FROM clothingloop.user_chains;

DELETE FROM clothingloop.user_tokens;

DELETE FROM clothingloop.chains;

DELETE FROM clothingloop.mails;

DELETE FROM clothingloop.newsletters;

DELETE FROM clothingloop.payments;

DELETE FROM clothingloop.users;

DELETE FROM clothingloop.events;

ALTER TABLE clothingloop.chains AUTO_INCREMENT=1;

ALTER TABLE clothingloop.mails AUTO_INCREMENT=1;

ALTER TABLE clothingloop.events AUTO_INCREMENT=1;

ALTER TABLE clothingloop.newsletters AUTO_INCREMENT=1;

ALTER TABLE clothingloop.payments AUTO_INCREMENT=1;

ALTER TABLE clothingloop.user_chains AUTO_INCREMENT=1;

ALTER TABLE clothingloop.users AUTO_INCREMENT=1;

ALTER TABLE clothingloop.bags AUTO_INCREMENT=1;