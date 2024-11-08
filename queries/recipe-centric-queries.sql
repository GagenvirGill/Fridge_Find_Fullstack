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



-- RecipeHasCategory Queries
---- INSERT
INSERT INTO RecipeHasCategory (RecipeID, CategoryName) VALUES (1, 'Dessert');
---- UPDATE
-- There isn't a use case in which this table should be updated
---- DELETE
DELETE FROM RecipeHasCategory
WHERE CategoryName = 'Dessert' AND RecipeID = 1;



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



-- RecipeListHasRecipes Queries
---- INSERT
INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALES (1, 1);
---- UPDATE
-- There isn't a use case in which this table should be updated
---- DELETE
DELETE FROM RecipeListHasRecipe
WHERE RecipeListID = 1 AND RecipeID = 1;
