-- This file contains hardcoded examples of the queries involving the User Centric Tables

-- AppUser Queries
---- INSERT
INSERT INTO AppUser (Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel)
VALUES ('TestingUsername1', EMPTY_BLOB(), 'testinguser1@students.ubc.ca', 'TestingFullName1', 'Private');
INSERT INTO AppUser (Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel)
VALUES ('TestingUsername2', EMPTY_BLOB(), 'testinguser2@students.ubc.ca', 'TestingFullName2', 'Friends Only');
INSERT INTO AppUser (Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel)
VALUES ('TestingUsername3', EMPTY_BLOB(), 'testinguser3@students.ubc.ca', 'TestingFullName3', 'Friends Only');
---- UPDATE
UPDATE AppUser
SET DefaultPrivacyLevel = 'Public',
    ProfilePicture = HEXTORAW('54657375')
WHERE Username = 'TestingUsername1';
---- DELETE
DELETE FROM AppUser
WHERE Username = 'TestingUsername1';
---- SELECTION
SELECT Username, FullName, Email
FROM AppUser
WHERE DefaultPrivacyLevel = 'Public';

-- Friends Queries
---- INSERT
INSERT INTO Friends (Username1, Username2, DateAndTimeCreated)
VALUES ('TestingUsername2','TestingUsername3', TIMESTAMP '2024-11-15 10:00:00');
---- UPDATE
/**
    There'll be no such case.
    Because DateAndTimeCreated should be immutable to preserve the historical accuracy.
 */
---- DELETE
DELETE FROM Friends
WHERE Username1 = 'TestingUsername2' AND Username2 = 'TestingUsername3';
---- SELECTION
/**
  retrieve friends of 'TestingUsername2'
 */
SELECT Username2 AS Friend
FROM Friends
WHERE Username1 = 'TestingUsername2'
UNION
SELECT Username1 AS Friend
FROM Friends
WHERE Username2 = 'TestingUsername2';
---- DIVISION
/**
  Users who are friends with all other users.
 */
SELECT f1.Username1
FROM Friends f1
WHERE NOT EXISTS (
    SELECT au.Username
    FROM AppUser au
    WHERE au.Username != f1.Username1
      AND NOT EXISTS (
          SELECT 1
          FROM Friends f2
          WHERE (f2.Username1 = f1.Username1 AND f2.Username2 = au.Username)
             OR (f2.Username2 = f1.Username1 AND f2.Username1 = au.Username)
      )
);

-- NotificationMessage Queries
---- INSERT
INSERT INTO NotificationMessage (Username, DateAndTimeSent, MessageText)
VALUES ('TestingUsername1', TIMESTAMP '2024-11-15 10:00:00', 'This is a test notification.');
---- UPDATE
/**
    There'll be no such case.
 */
---- DELETE
DELETE FROM NotificationMessage
WHERE Username = 'TestingUsername1'
  AND DateAndTimeSent = TIMESTAMP '2024-11-15 10:00:00';
--- SELECTION
/**
  Retrieve all notification messages sent to a specific user after a certain date.
 */
SELECT DateAndTimeSent, MessageText
FROM NotificationMessage
WHERE Username = 'TestingUsername1'
  AND DateAndTimeSent > TIMESTAMP '2024-11-01 00:00:00';

-- Notifications Queries
---- INSERT
INSERT INTO Notifications (NotificationID, DateAndTimeSent, Username)
VALUES (1, TIMESTAMP '2024-11-15 10:00:00','TestingUsername1');
---- UPDATE
/**
    There'll be no such case.
 */
---- DELETE
DELETE FROM Notifications
WHERE NotificationID = 1;
--- SELECTION
SELECT NotificationID, DateAndTimeSent
FROM Notifications
WHERE Username = 'TestingUsername1'
  AND DateAndTimeSent BETWEEN TIMESTAMP '2024-11-01 00:00:00' AND TIMESTAMP '2024-11-30 23:59:59';

