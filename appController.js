const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

// ----------------------------------------------------------
// User Centric endpoints



// ----------------------------------------------------------
// Recipe Centric endpoints

router.get('/recipe', async (req, res) => {
    const recipeContent = await appService.fetchRecipeFromDb();
    res.json({ data: recipeContent });
});

router.get('/category', async (req, res) => {
    const categoryContent = await appService.fetchCategoryFromDb();
    res.json({ data: categoryContent });
});

router.post('/filtered-recipes', async (req, res) => {
    const { Categories } = req.body;
    const fetchResult = await appService.fetchFilteredRecipesFromDb(Categories);
    res.json({ data: fetchResult });
});

router.get('/recipe-list', async (req, res) => {
    const recipeListContent = await appService.fetchRecipeListFromDb();
    res.json({ data: recipeListContent });
});

router.get('/filter-by-recipe-list', async (req, res) => {
    const { RecipeListID } = req.query;
    const fetchResult = await appService.fetchRecipesByRecipeListFromDb(RecipeListID);
    res.json({ data: fetchResult });
});

router.post("/insert-recipe", async (req, res) => {
    const { RecipeID, RecipeName, PrivacyLevel, Username } = req.body;
    const insertResult = await appService.insertRecipe(RecipeID, RecipeName, PrivacyLevel, Username);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.patch("/update-recipe", async (req, res) => {
    const { RecipeID, NewRecipeName, NewPrivacyLevel } = req.body;
    const updateResult = await appService.updateRecipe(RecipeID, NewRecipeName, NewPrivacyLevel);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete("/delete-recipe", async (req, res) => {
    const { RecipeID } = req.body;
    const deleteResult = await appService.deleteRecipe(RecipeID);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get("/recipe-ingredient-for-recipe", async (req, res) => {
    const { RecipeID } = req.query;
    const tableContent = await appService.fetchRecipeIngredientsForRecipeFromDb(RecipeID);
    res.json({ data: tableContent });
});

router.get("/recipe-name", async (req, res) => {
    const { RecipeID } = req.query;
    const recipeName = await appService.fetchRecipesName(RecipeID);
    res.json({ RecipeName: recipeName })
});

router.post("/insert-recipe-ingredient", async (req, res) => {
    const { RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement } = req.body;
    const insertResult = await appService.insertRecipeIngredient(RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.patch("/update-recipe-ingredient", async (req, res) => {
    const { RecipeIngredientID, RecipeID, RecipeIngredientName, Amount, UnitOfMeasurement } = req.body;
    const updateResult = await appService.updateRecipeIngredient(RecipeIngredientID, RecipeID, RecipeIngredientName, Amount, UnitOfMeasurement);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete("/delete-recipe-ingredient", async (req, res) => {
    const { RecipeIngredientID, RecipeID } = req.body;
    const deleteResult = await appService.deleteRecipeIngredient(RecipeIngredientID, RecipeID);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get("/recipe-step-for-recipe", async (req, res) => {
    const { RecipeID } = req.query;
    const tableContent = await appService.fetchRecipeStepsForRecipe(RecipeID);
    res.json({ data: tableContent });
});

router.post("/insert-recipe-step", async (req, res) => {
    const { RecipeID, StepNumber, StepInformation } = req.body;
    const insertResult = await appService.insertRecipeStep(RecipeID, StepNumber, StepInformation);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.patch("/update-recipe-step", async (req, res) => {
    const { RecipeID, OldStepNumber, NewStepNumber, NewStepInformation } = req.body;
    const updateResult = await appService.updateRecipeStep(RecipeID, OldStepNumber, NewStepNumber, NewStepInformation);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete("/delete-recipe-step", async (req, res) => {
    const { RecipeID, StepNumber } = req.body;
    const deleteResult = await appService.deleteRecipeStep(RecipeID, StepNumber);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-category", async (req, res) => {
    const { CategoryName, CategoryDescription } = req.body;
    const insertResult = await appService.insertCategory(CategoryName, CategoryDescription);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.patch("/update-category", async (req, res) => {
    const { CategoryName, NewCategoryDescription } = req.body;
    const updateResult = await appService.updateCategory(CategoryName, NewCategoryDescription);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete("/delete-category", async (req, res) => {
    const { CategoryName } = req.body;
    const deleteResult = await appService.deleteCategory(CategoryName);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-recipe-into-category", async (req, res) => {
    const { RecipeID, CategoryName } = req.body;
    const insertResult = await appService.insertRecipeIntoCategory(RecipeID, CategoryName);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete("/delete-recipe-from-category", async (req, res) => {
    const { RecipeID, CategoryName } = req.body;
    const deleteResult = await appService.deleteRecipeFromCategory(RecipeID, CategoryName);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get("/recipe-list-value", async (req, res) => {
    const { RecipeListID } = req.query;
    const recipeListValues = await appService.fetchRecipeList(RecipeListID);
    res.json({ data: recipeListValues })
});

router.post("/insert-recipe-list", async (req, res) => {
    const { RecipeListID, RecipeListName, PrivacyLevel, Username } = req.body;
    const insertResult = await appService.insertRecipeList(RecipeListID, RecipeListName, PrivacyLevel, Username);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.patch("/update-recipe-list", async (req, res) => {
    const { RecipeListID, RecipeListName, PrivacyLevel } = req.body;
    const updateResult = await appService.updateRecipeList(RecipeListID, RecipeListName, PrivacyLevel);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete("/delete-recipe-list", async (req, res) => {
    const { RecipeListID } = req.body;
    const deleteResult = await appService.deleteRecipeList(RecipeListID);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-recipe-into-recipe-list", async (req, res) => {
    const { RecipeID, RecipeListID } = req.body;
    const insertResult = await appService.insertRecipeIntoRecipeList(RecipeID, RecipeListID);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete("/delete-recipe-from-recipe-list", async (req, res) => {
    const { RecipeID, RecipeListID } = req.body;
    const deleteResult = await appService.deleteRecipeFromRecipeList(RecipeID, RecipeListID);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// Ingredient Centric endpoints



// ----------------------------------------------------------
// General endpoints

router.post("/initiate-tables", async (req, res) => {
    const initiateResult = await appService.initiateTables();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});



// ----------------------------------------------------------

module.exports = router;