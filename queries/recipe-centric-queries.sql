-- This file contains hardcoded examples of the queries involving the Recipe Centric Tables

-- Recipe Queries
---- INSERT
INSERT INTO Recipe (RecipeID, RecipeName, PrivacyLevel, Username) VALUES (1, 'Apple Pie', 'Public', 'Charlie');
---- UPDATE
UPDATE Recipe
SET RecipeName = 'Pumpkin Pie', PrivacyLevel = 'Private'
WHERE RecipeID = 1;
---- DELETE
DELETE FROM Recipe
WHERE RecipeID = 1;
---- Selection
SELECT *
FROM Recipe
WHERE PrivacyLevel = 'Public' AND Username = 'Charlie'
---- Projection
SELECT RecipeName
FROM Recipe
---- JOIN
SELECT DISTINCT rhc.CategoryName
FROM Recipe r
JOIN RecipeHasCategory rhc ON rhc.RecipeID = r.RecipeID
WHERE r.Username = 'Charlie';
---- Aggregation with HAVING 1
SELECT r.*, COUNT(ri.IngredientID) AS NumIngredients
FROM Recipe r
JOIN RecipeIngredient ri ON r.RecipeID = ri.RecipeID
GROUP BY r.RecipeID
HAVING NumIngredients < 5
---- Aggregation with HAVING 2
SELECT r.*, COUNT(rs.StepNumber) AS NumSteps
FROM Recipe r
JOIN RecipeStep rs ON r.RecipeID = rs.RecipeID
GROUP BY r.RecipeID
HAVING NumSteps < 5
---- Division
-- Would be hard to implement but a query that returns all recipes in which the kitchen inventory has all the nessessary ingredients



-- RecipeIngredient Queries
---- INSERT
INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (1, 'Apple', 1, 2, 'pounds');
---- UPDATE
UPDATE RecipeIngredient
SET Amount = 3, UnitOfMeasurement = 'kilograms'
WHERE IngredientID = 1;
---- DELETE
DELETE FROM RecipeIngredient
WHERE IngredientID = 1;
---- Selection
SELECT RecipeID
FROM RecipeIngredient
WHERE IngredientName = 'Apple' AND Amount <= 1 AND UnitOfMeasurement = 'pounds';
---- Projection
SELECT DISTINCT RecipeID
FROM RecipeIngredient
WHERE UnitOfMeasurement = 'kilograms';
---- JOIN
SELECT DISTINCT RecipeID, RecipeName
FROM RecipeIngredient ri
JOIN Recipe r ON r.RecipeID = ri.RecipeID
WHERE IngredientName = 'Apple' OR IngredientName = 'Banana';



-- RecipeStep Queries
---- INSERT
INSERT INTO RecipeStep (RecipeID, StepNumber, StepInformation) VALUES (1, 1, 'Preheat oven to 180 degrees.');
---- UPDATE
UPDATE RecipeStep
SET StepInformation = 'Wash your hands', StepNumber = 2
WHERE RecipeID = 1 AND StepNumber = 1;
---- DELETE
DELETE FROM RecipeStep
WHERE RecipeID = 1 AND StepNumber = 1;
---- Selection
SELECT StepInformation
FROM RecipeStep
WHERE RecipeID = 1 AND StepNumber = 3;
---- Projection
SELECT StepInformation
FROM RecipeStep
WHERE RecipeID = 1;
---- JOIN
SELECT r.*
FROM RecipeStep rs
JOIN Recipe r ON r.RecipeID = rs.RecipeID
EXCEPT
SELECT r.*
FROM RecipeStep rs
JOIN Recipe r ON r.RecipeID = rs.RecipeID
WHERE rs.StepNumber > 5;



-- Category Queries
---- INSERT
INSERT INTO Category (CategoryName, CategoryDescription) VALUES ('Dessert', 'sugar food is served after dinner');
---- UPDATE
UPDATE Category
SET CategoryDescription = 'Desserts are sweet.'
WHERE CategoryName = 'Dessert';
---- DELETE
DELETE FROM Category
WHERE CategoryName = 'Dessert';
---- Selection
SELECT CategoryName
FROM Category
WHERE CategoryName LIKE 'Veg';
---- Projection
SELECT CategoryName
FROM Category;
---- JOIN
SELECT rhc.RecipeID
FROM Category c
JOIN RecipeHasCategory rhc ON c.CategoryName = rhc.CategoryName
WHERE c.CategoryName = 'Dessert'
---- Aggregation with GROUP BY
SELECT c.CategoryName, COUNT(rhc.RecipeID) AS NumRecipes
FROM Category c
JOIN RecipeHasCategory rhc ON c.CategoryName = rhc.CategoryName
GROUP BY c.CategoryName
ORDER BY DESC
---- Nested Aggregation with GROUP BY
SELECT c.CategoryName, COUNT(rhc.RecipeID) AS NumRecipes
FROM Category c
JOIN RecipeHasCategory rhc ON c.CategoryName = rhc.CategoryName
GROUP BY c.CategoryName
HAVING NumRecipes > (
    SELECT AVG(RecipeCount)
    FROM (
        SELECT CategoryName, COUNT(RecipeID) AS RecipeCount
        FROM RecipeHasCategory
        GROUP BY CategoryName   
    ) AS AVGRecipeCount
)



-- RecipeHasCategory Queries
---- INSERT
INSERT INTO RecipeHasCategory (RecipeID, CategoryName) VALUES (1, 'Dessert');
---- UPDATE
-- There isn't a use case in which this table should be updated
---- DELETE
DELETE FROM RecipeHasCategory
WHERE CategoryName = 'Dessert' AND RecipeID = 1;
---- Selection
-- There isn't a use case in which this table should be selected on
---- Projection
-- There isn't a use case in which this table should be projected on
---- JOIN
-- The two join queries this table can do have been done by other tables already (recipe and category)



-- RecipeList Queries
---- INSERT
INSERT INTO RecipeList (RecipeListID, RecipeListName, PrivacyLevel, Username) VALUES (1, 'Healthy Food', 'Public', 'Charlie');
---- UPDATE
UPDATE RecipeList
SET RecipeListName = 'Unhealthy Food', PrivacyLevel = 'Friends Only'
WHERE RecipeListID = 1;
---- DELETE
DELETE FROM RecipeList
WHERE RecipeListID = 1;
---- Selection
SELECT RecipeListName
FROM RecipeList
WHERE Username = 'Charlie';
---- Projection
SELECT DISTINCT Username
FROM RecipeList
---- JOIN
SELECT rlhr.RecipeID
FROM RecipeList rl
JOIN RecipeListHasRecipe rlhr ON rl.RecipeListID = rlhr.RecipeListID
JOIN RecipeHasCategory rhc ON rlhc.RecipeID = rhc.RecipeID
WHERE rhc.CategoryName = 'Vegetarian';



-- RecipeListHasRecipe Queries
---- INSERT
INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALUES (1, 1);
---- UPDATE
-- There isn't a use case in which this table should be updated
---- DELETE
DELETE FROM RecipeListHasRecipe
WHERE RecipeListID = 1 AND RecipeID = 1;
---- Selection
-- There isn't a use case in which this table should be selected on
---- Projection
-- There isn't a use case in which this table should be projected on
---- JOIN
SELECT DISTINCT rl.RecipeListID
FROM RecipeListHasRecipe rlhr
JOIN RecipeList rl ON rlhr.RecipeListID = rl.RecipeListID
