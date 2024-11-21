-- This file contains hardcoded examples of the queries involving the Ingredient Centric Tables

-- AllergyList Queries
---- INSERT
INSERT INTO AllergyList (IngredientListID, PrivacyLevel, Description, Username, Name) VALUES (1, 'Public', 'Contains nuts', 'Billy', 'Nut Allergy List');
---- UPDATE
UPDATE AllergyList
SET PrivacyLevel = 'Friends Only', Name = 'New Nut Allergy List'
WHERE IngredientListID = 1;
---- DELETE
DELETE FROM AllergyList
WHERE IngredientListID = 1;
---- Selection
SELECT *
FROM AllergyList
WHERE PrivacyLevel = 'Public' AND Username = 'Billy';
---- Projection
SELECT PrivacyLevel
FROM AllergyList
WHERE Username = 'Billy';
---- Join
SELECT *
FROM AllergyListHasAllergicIngredient alai
JOIN AllergyList ai ON ai.IngredientListID = alai.IngredientListID 
WHERE ai.Username = 'Billy';
---- Aggregation with GROUP BY
---- Aggregation with HAVING
---- Nested Aggregation with GROUP BY
---- Division TODO

-- AllergicIngredient Queries
---- INSERT
INSERT INTO AllergicIngredient(IngredientID, Name)
VALUES (123, 'Peanut');
---- UPDATE
UPDATE AllergicIngredient
SET Name = 'Peanut Butter'
WHERE IngredientID = 123;
---- DELETE
DELETE FROM AllergicIngredient 
WHERE IngredientID = 123;
---- Selection
SELECT Name
FROM AllergicIngredient
WHERE Name = 'Peanut';
---- Projection
SELECT DISTINCT Name
FROM AllergicIngredient;
---- Join
SELECT DISTINCT IngredientID 
FROM AllergicIngredient ai 
JOIN AllergyListHasAllergicIngredient alai ON alai.IngredientID = ai.IngredientID
WHERE ai.Name = 'Peanut';
---- Aggregation with GROUP BY
---- Aggregation with HAVING
---- Nested Aggregation with GROUP BY
---- Division TODO


-- AllergyListHasAllergicIngredient Queries
INSERT INTO AllergyListHasAllergicIngredient(IngredientListID, IngredientID, Severity)
VALUES (123, 456, 5);
---- UPDATE
UPDATE AllergyListHasAllergicIngredient
SET IngredientListID = 908, IngredientID = 306
WHERE Severity = 5;
---- Projection
SELECT Severity
FROM AllergyListHasAllergicIngredient
WHERE IngredientListID = 306;
---- Join
SELECT IngredientID, Severity
FROM AllergicIngredient ai 
JOIN KitchenInventory ki ON ki.IngredientID = ai.IngredientID
WHERE Severity = 5;
---- Aggregation with GROUP BY
---- Aggregation with HAVING
---- Nested Aggregation with GROUP BY
---- Division TODO

-- KitchenInventory Queries
INSERT INTO KitchenInventory(IngredientListID, PrivacyLevel, ExpiryDateThreshold,
Username, DateAndTimeLastUpdated, Name)
VALUES (6, 'Private', 5, 'Charlie', TIMESTAMP '2024-09-09 11:02:03', 'Charlies First House');
---- UPDATE
UPDATE KitchenInventory 
SET IngredientListID = 5, PrivacyLevel = 'Public'
WHERE Name = 'Charlies First House';
---- Projection
SELECT DISTINCT PrivacyLevel 
FROM KitchenInventory 
WHERE PrivacyLevel = 'Public'
---- Join 
SELECT IngredientListID, PrivacyLevel
FROM AllergyListHasAllergicIngredient alai 
JOIN KitchenInventory ki ON ki.IngredientListID = alai.IngredientListID 
WHERE PrivacyLevel = 'Public'
---- Aggregation with GROUP BY
---- Aggregation with HAVING
---- Nested Aggregation with GROUP BY
---- Division TODO

-- KitchenIngredientPerishableDate Queries
INSERT INTO KitchenIngredientPerishableDate (DatePurchased, ShelfLife, ExpiryDate)
VALUES (TIMESTAMP '2024-01-01 10:00:00', 3, TIMESTAMP '2024-01-04 10:00:00');
---- UPDATE
UPDATE KitchenIngredientPerishableDate 
SET ShelfLife = 4; 
---- Projection 
SELECT ShelfLife 
FROM KitchenIngredientPerishableDate
WHERE ExpiryDate = TIMESTAMP '2024-01-04 10:00:00' AND DatePurchased = TIMESTAMP '2024-01-01 10:00:00';
---- Join 
SELECT DatePurchased, ShelfLife
FROM KitchenIngredient ki
JOIN KitchenIngredientPerishableDate kipd ON ki.DatePurchased = kipd.DatePurchased
WHERE kipd.ShelfLife = 4
GROUP BY ki.DatePurchased, kipd.ShelfLife
ORDER BY ki.DatePurchased DESC;
---- Aggregation with GROUP BY
---- Aggregation with HAVING
---- Nested Aggregation with GROUP BY
---- Division TODO

-- KitchenIngredient Queries
INSERT INTO KitchenIngredient (DatePurchased, ShelfLife, IngredientID, Name,
IngredientListID, Amount, UnitOfMeasurement) VALUES
(TIMESTAMP '2024-01-01 10:00:00', 3, 1, 'Tomato', 1, 5, 'piece');
---- UPDATE
UPDATE KitchenIngredient 
SET Name = 'Apple'
WHERE Name = 'Tomato';
---- Projection 
SELECT UnitOfMeasurement, Amount
FROM KitchenIngredient 
WHERE UnitOfMeasurement = 'piece' AND Name = 'Apple'
---- Join 
-- Select IngredientListID, IngredientI

