-- -- This file contains hardcoded examples of the queries involving the Ingredient Centric Tables

-- -- AllergyList Queries
-- ---- INSERT
-- INSERT INTO AllergyList (IngredientListID, PrivacyLevel, ListDescription, Username, ListName) VALUES (1, 'Public', 'Contains nuts', 'Billy', 'Nut Allergy List');
-- ---- UPDATE
-- UPDATE AllergyList
-- SET PrivacyLevel = 'Friends Only', Name = 'New Nut Allergy List'
-- WHERE IngredientListID = 1;
-- ---- DELETE
-- DELETE FROM AllergyList
-- WHERE IngredientListID = 1;
-- ---- Selection
-- SELECT *
-- FROM AllergyList
-- WHERE PrivacyLevel = 'Public' AND Username = 'Billy';
-- ---- Projection
-- SELECT PrivacyLevel
-- FROM AllergyList
-- WHERE Username = 'Billy';
-- ---- Join
-- SELECT *
-- FROM AllergyListHasAllergicIngredient alai
-- JOIN AllergyList ai ON ai.IngredientListID = alai.IngredientListID 
-- WHERE ai.Username = 'Billy';
-- ---- Aggregation with GROUP BY
-- SELECT PrivacyLevel, COUNT(*) AS AllergyPrivacyCount
-- FROM AllergyList
-- GROUP BY PrivacyLevel;
-- ---- Aggregation with HAVING
-- SELECT PrivacyLevel, MAX(LENGTH(Description)) as md
-- FROM AllergyList
-- GROUP BY PrivacyLevel
-- HAVING MAX(LENGTH(Description)) > 50;
-- ---- Nested Aggregation with GROUP BY TODO
-- ---- Division TODO

-- -- AllergicIngredient Queries
-- ---- INSERT
-- INSERT INTO AllergicIngredient(IngredientID, Name)
-- VALUES (123, 'Peanut');
-- ---- UPDATE
-- UPDATE AllergicIngredient
-- SET Name = 'Peanut Butter'
-- WHERE IngredientID = 123;
-- ---- DELETE
-- DELETE FROM AllergicIngredient 
-- WHERE IngredientID = 123;
-- ---- Selection
-- SELECT Name
-- FROM AllergicIngredient
-- WHERE Name = 'Peanut';
-- ---- Projection
-- SELECT DISTINCT Name
-- FROM AllergicIngredient;
-- ---- Join
-- SELECT DISTINCT IngredientID 
-- FROM AllergicIngredient ai 
-- JOIN AllergyListHasAllergicIngredient alai ON alai.IngredientID = ai.IngredientID
-- WHERE ai.Name = 'Peanut';
-- ---- Aggregation with GROUP BY
-- SELECT Name, COUNT(*) AS Occurrences
-- FROM AllergicIngredient
-- GROUP BY Name;
-- ---- Aggregation with HAVING
-- SELECT Name, MAX(LENGTH(Name)) AS mn
-- FROM AllergicIngredient
-- GROUP BY Name
-- HAVING MAX(LENGTH(Name)) > 5;
-- ---- Nested Aggregation with GROUP BY TODO
-- ---- Division TODO


-- -- AllergyListHasAllergicIngredient Queries
-- INSERT INTO AllergyListHasAllergicIngredient(IngredientListID, IngredientID, Severity)
-- VALUES (123, 456, 5);
-- ---- UPDATE
-- UPDATE AllergyListHasAllergicIngredient
-- SET IngredientListID = 908, IngredientID = 306
-- WHERE Severity = 5;
-- ---- Projection
-- SELECT Severity
-- FROM AllergyListHasAllergicIngredient
-- WHERE IngredientListID = 306;
-- ---- Join
-- SELECT IngredientID, Severity
-- FROM AllergicIngredient ai 
-- JOIN KitchenInventory ki ON ki.IngredientID = ai.IngredientID
-- WHERE Severity = 5;
-- ---- Aggregation with GROUP BY
-- SELECT IngredientListID, AVG(Severity) As Aseverity
-- FROM AllergyListHasAllergicIngredient
-- GROUP BY IngredientListID;
-- ---- Aggregation with HAVING
-- SELECT IngredientID, Severity
-- FROM AllergyListHasAllergicIngredient
-- HAVING Severity > 5;
-- ---- Nested Aggregation with GROUP BY TODO
-- ---- Division TODO

-- -- KitchenInventory Queries
-- INSERT INTO KitchenInventory(IngredientListID, PrivacyLevel, ExpiryDateThreshold,
-- Username, DateAndTimeLastUpdated, Name)
-- VALUES (6, 'Private', 5, 'Charlie', TIMESTAMP '2024-09-09 11:02:03', 'Charlies First House');
-- ---- UPDATE
-- UPDATE KitchenInventory 
-- SET IngredientListID = 5, PrivacyLevel = 'Public'
-- WHERE Name = 'Charlies First House';
-- ---- Projection
-- SELECT DISTINCT PrivacyLevel 
-- FROM KitchenInventory 
-- WHERE PrivacyLevel = 'Public'
-- ---- Join 
-- SELECT IngredientListID, PrivacyLevel
-- FROM AllergyListHasAllergicIngredient alai 
-- JOIN KitchenInventory ki ON ki.IngredientListID = alai.IngredientListID 
-- WHERE PrivacyLevel = 'Public'
-- ---- Aggregation with GROUP BY
-- SELECT PrivacyLevel, COUNT(IngredientListID) AS ListCount
-- FROM KitchenInventory
-- GROUP BY PrivacyLevel
-- ---- Aggregation with HAVING 
-- SELECT Username, COUNT(*) AS InventoryCount
-- FROM KitchenInventory
-- GROUP BY Username
-- HAVING COUNT(*) > 3;
-- ---- Nested Aggregation with GROUP BY TODO
-- ---- Division TODO TODO

-- -- KitchenIngredientPerishableDate Queries
-- INSERT INTO KitchenIngredientPerishableDate (DatePurchased, ShelfLife, ExpiryDate)
-- VALUES (TIMESTAMP '2024-01-01 10:00:00', 3, TIMESTAMP '2024-01-04 10:00:00');
-- ---- UPDATE
-- UPDATE KitchenIngredientPerishableDate 
-- SET ShelfLife = 4; 
-- ---- Projection 
-- SELECT ShelfLife 
-- FROM KitchenIngredientPerishableDate
-- WHERE ExpiryDate = TIMESTAMP '2024-01-04 10:00:00' AND DatePurchased = TIMESTAMP '2024-01-01 10:00:00';
-- ---- Join 
-- SELECT DatePurchased, ShelfLife
-- FROM KitchenIngredient ki
-- JOIN KitchenIngredientPerishableDate kipd ON ki.DatePurchased = kipd.DatePurchased
-- WHERE kipd.ShelfLife = 4
-- GROUP BY ki.DatePurchased, kipd.ShelfLife
-- ORDER BY ki.DatePurchased DESC;
-- ---- Aggregation with GROUP BY
-- SELECT ShelfLife, COUNT(*) AS IngredientCount
-- FROM KitchenIngredientPerishableDate
-- GROUP BY ShelfLife;
-- ---- Aggregation with HAVING
-- SELECT DatePurchased, COUNT(*) AS IngredientCount, MAX(ExpiryDate) As MaxExpiryDate
-- FROM KitchenIngredientPerishableDate
-- GROUP BY DatePurchased
-- HAVING COUNT(*) > 1;
-- ---- Nested Aggregation with GROUP BY TODO
-- ---- Division TODO

-- -- KitchenIngredient Queries
-- INSERT INTO KitchenIngredient (DatePurchased, ShelfLife, IngredientID, Name,
-- IngredientListID, Amount, UnitOfMeasurement) VALUES
-- (TIMESTAMP '2024-01-01 10:00:00', 3, 1, 'Tomato', 1, 5, 'piece');
-- ---- UPDATE
-- UPDATE KitchenIngredient 
-- SET Name = 'Apple'
-- WHERE Name = 'Tomato';
-- ---- Projection 
-- SELECT UnitOfMeasurement, Amount
-- FROM KitchenIngredient 
-- WHERE UnitOfMeasurement = 'piece' AND Name = 'Apple'
-- ---- Join 
-- SELECT ki.IngredientListID, ki.Name AS IngredientName, kinv.PrivacyLevel
-- FROM KitchenIngredient ki
-- JOIN KitchenInventory kinv
-- ON ki.IngredientListID = kinv.IngredientListID;
-- ---- Aggregation with GROUP BY
-- SELECT UnitOfMeasurement, SUM(Amount) AS UnitCount
-- FROM KitchenIngredient
-- GROUP BY UnitOfMeasurement;
-- ---- Aggregation with HAVING
-- SELECT IngredientListID, UnitOfMeasurement, COUNT(*) AS IngredientCount
-- FROM KitchenIngredient
-- GROUP BY IngredientListID, UnitOfMeasurement
-- HAVING COUNT(*) > 3;
-- ---- Nested Aggregation with GROUP BY TODO
-- ---- Division TODO

