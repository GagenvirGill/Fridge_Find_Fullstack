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

router.get('/all-recipes', async (req, res) => {
    const returnValue = await appService.fetchRecipeFromDb();
    res.json(returnValue);
});

router.post('/simple-or-complicated-recipes', async (req, res) => {
    const { Difficulty } = req.body;
    const returnValue = await appService.fetchSimpleOrComplicatedRecipesFromDb(Difficulty);
    res.json(returnValue);
});

router.get('/all-categories', async (req, res) => {
    const returnValue = await appService.fetchCategoryFromDb();
    res.json(returnValue);
});

router.post('/filtered-recipes-by-category', async (req, res) => {
    const { Categories } = req.body;
    const returnValue = await appService.fetchRecipesByCategoryFromDb(Categories);
    res.json(returnValue);
});

router.get('/all-recipe-lists', async (req, res) => {
    const returnValue = await appService.fetchRecipeListFromDb();
    res.json(returnValue);
});

router.get('/filter-recipes-by-recipe-list', async (req, res) => {
    const { RecipeListID } = req.query;
    const returnValue = await appService.fetchRecipesByRecipeListFromDb(RecipeListID);
    res.json(returnValue);
});

router.post("/insert-recipe", async (req, res) => {
    const { RecipeID, RecipeName, PrivacyLevel, Username } = req.body;
    const returnValue = await appService.insertRecipe(RecipeID, RecipeName, PrivacyLevel, Username);
    res.json(returnValue);
});

router.patch("/update-recipe", async (req, res) => {
    const { RecipeID, NewRecipeName, NewPrivacyLevel } = req.body;
    const returnValue = await appService.updateRecipe(RecipeID, NewRecipeName, NewPrivacyLevel);
    res.json(returnValue);
});

router.delete("/delete-recipe", async (req, res) => {
    const { RecipeID } = req.body;
    const returnValue = await appService.deleteRecipe(RecipeID);
    res.json(returnValue);
});

router.get("/recipe-ingredients-for-recipe", async (req, res) => {
    const { RecipeID } = req.query;
    const returnValue = await appService.fetchRecipeIngredientsForRecipeFromDb(RecipeID);
    res.json(returnValue);
});

router.post("/insert-recipe-ingredient", async (req, res) => {
    const { RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement } = req.body;
    const returnValue = await appService.insertRecipeIngredient(RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement);
    res.json(returnValue);
});

router.patch("/update-recipe-ingredient", async (req, res) => {
    const { RecipeIngredientID, RecipeID, RecipeIngredientName, Amount, UnitOfMeasurement } = req.body;
    const returnValue = await appService.updateRecipeIngredient(RecipeIngredientID, RecipeID, RecipeIngredientName, Amount, UnitOfMeasurement);
    res.json(returnValue);
});

router.delete("/delete-recipe-ingredient", async (req, res) => {
    const { RecipeIngredientID, RecipeID } = req.body;
    const returnValue = await appService.deleteRecipeIngredient(RecipeIngredientID, RecipeID);
    res.json(returnValue);
});

router.get("/recipe-steps-for-recipe", async (req, res) => {
    const { RecipeID } = req.query;
    const returnValue = await appService.fetchRecipeStepsForRecipe(RecipeID);
    res.json(returnValue);
});

router.post("/insert-recipe-step", async (req, res) => {
    const { RecipeID, StepNumber, StepInformation } = req.body;
    const returnValue = await appService.insertRecipeStep(RecipeID, StepNumber, StepInformation);
    res.json(returnValue);
});

router.patch("/update-recipe-step", async (req, res) => {
    const { RecipeID, OldStepNumber, NewStepNumber, NewStepInformation } = req.body;
    const returnValue = await appService.updateRecipeStep(RecipeID, OldStepNumber, NewStepNumber, NewStepInformation);
    res.json(returnValue);
});

router.delete("/delete-recipe-step", async (req, res) => {
    const { RecipeID, StepNumber } = req.body;
    const returnValue = await appService.deleteRecipeStep(RecipeID, StepNumber);
    res.json(returnValue);
});

router.post("/insert-category", async (req, res) => {
    const { CategoryName, CategoryDescription } = req.body;
    const returnValue = await appService.insertCategory(CategoryName, CategoryDescription);
    res.json(returnValue);
});

router.patch("/update-category", async (req, res) => {
    const { CategoryName, NewCategoryDescription } = req.body;
    const returnValue = await appService.updateCategory(CategoryName, NewCategoryDescription);
    res.json(returnValue);
});

router.delete("/delete-category", async (req, res) => {
    const { CategoryName } = req.body;
    const returnValue = await appService.deleteCategory(CategoryName);
    res.json(returnValue);
});

router.post("/insert-recipe-into-category", async (req, res) => {
    const { RecipeID, CategoryName } = req.body;
    const returnValue = await appService.insertRecipeIntoCategory(RecipeID, CategoryName);
    res.json(returnValue);
});

router.delete("/delete-recipe-from-category", async (req, res) => {
    const { RecipeID, CategoryName } = req.body;
    const returnValue = await appService.deleteRecipeFromCategory(RecipeID, CategoryName);
    res.json(returnValue);
});

router.get("/recipe-list-value", async (req, res) => {
    const { RecipeListID } = req.query;
    const recipeListValues = await appService.fetchRecipeList(RecipeListID);
    res.json({ data: recipeListValues })
});

router.post("/insert-recipe-list", async (req, res) => {
    const { RecipeListID, RecipeListName, PrivacyLevel, Username } = req.body;
    const returnValue = await appService.insertRecipeList(RecipeListID, RecipeListName, PrivacyLevel, Username);
    res.json(returnValue);
});

router.patch("/update-recipe-list", async (req, res) => {
    const { RecipeListID, RecipeListName, PrivacyLevel } = req.body;
    const returnValue = await appService.updateRecipeList(RecipeListID, RecipeListName, PrivacyLevel);
    res.json(returnValue);
});

router.delete("/delete-recipe-list", async (req, res) => {
    const { RecipeListID } = req.body;
    const returnValue = await appService.deleteRecipeList(RecipeListID);
    res.json(returnValue);
});

router.post("/insert-recipe-into-recipe-list", async (req, res) => {
    const { RecipeID, RecipeListID } = req.body;
    const returnValue = await appService.insertRecipeIntoRecipeList(RecipeID, RecipeListID);
    res.json(returnValue);
});

router.delete("/delete-recipe-from-recipe-list", async (req, res) => {
    const { RecipeID, RecipeListID } = req.body;
    const returnValue = await appService.deleteRecipeFromRecipeList(RecipeID, RecipeListID);
    res.json(returnValue);
});

// ----------------------------------------------------------
// Ingredient Centric endpoints

// AllergicIngredient 
router.get('/allergic-ingredient', async (req, res) => {
    const tableContent = await appService.fetchAllergicIngredientFromDb();
    res.json({ data: tableContent });
});

router.post("/insert-allergic-ingredient", async (req, res) => {
    const { IngredientID, IngredientName } = req.body;
    try {
        const insertResult = await appService.insertAllergicIngredient(IngredientID, IngredientName);
        if (insertResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.patch("/update-allergic-ingredient", async (req, res) => {
    const { IngredientID, IngredientName } = req.body;
    try {
        const updateResult = await appService.updateAllergicIngredient(IngredientID, IngredientName);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete("/delete-allergic-ingredient", async (req, res) => {
    const { IngredientID } = req.body;
    try {
        const deleteResult = await appService.deleteAllergicIngredient(IngredientID);
        if (deleteResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// AllergyList 
router.get('/allergy-list', async (req, res) => {
    const tableContent = await appService.fetchAllergyListFromDb();
    res.json({ data: tableContent });
});

router.post("/insert-allergy-list", async (req, res) => {
    const { IngredientListID, PrivacyLevel, ListDescription, Username, ListName } = req.body;
    try {
         const insertResult = await appService.insertAllergyList(IngredientListID, PrivacyLevel, ListDescription, Username, ListName);
         if (insertResult) {
             res.json({ success: true });
         } else {
             res.status(500).json({ success: false });
         }
     } catch (error) { 
         res.status(500).json({ success: false, error: error.message });
     }
 });

router.patch("/update-allergy-list", async (req, res) => {
    const { IngredientListID, PrivacyLevel, ListDescription, Username, ListName } = req.body;
    try {
        // const updateResult = await appService.updateAllergyList(IngredientListID, PrivacyLevel, ListDescription, Username, ListName);
        const updateResult = await appService.updateAllergyList(IngredientListID, PrivacyLevel, ListDescription, Username, ListName);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete("/delete-allergy-list", async (req, res) => {
    const { IngredientListID } = req.body;
    try {
        const deleteResult = await appService.deleteAllergyList(IngredientListID);
        if (deleteResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/project-allergy-list", async (req, res) => {
    const { userInput } = req.body;

    if (!userInput) {
        return res.status(400).json({ error: "User Input is required." });
    }

    try {
        const projectedElement = await appService.projectAllergyList(userInput);
        res.json(projectedElement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/group-allergy-list', async (req, res) => {
    const { userInputGroupBy, userInputAggregation } = req.body;

    if (!userInputGroupBy || !userInputAggregation) {
        return res.status(400).json({ error: 'User Input is required.' });
    }

    const validAggregations = ['MAX', 'MIN', 'AVG', 'SUM'];  // Add more as needed
    if (!validAggregations.includes(userInputAggregation)) {
        return res.status(400).json({ error: `Invalid aggregation function` });
    }

    try {
        const groupByElement = await appService.groupByAllergyList(userInputGroupBy, userInputAggregation);
        res.json(groupByElement);
    } catch (error) {
        res.status(500).json({ error: 'Error grouping Allergy List.' });
    }
});








// KitchenIngredient
// router.get('/kitchen-ingredient', async (req, res) => {
//     const tableContent = await appService.fetchKitchenIngredientFromDb();
//     res.json({ data: tableContent });
// });

// // Gives me an error - TODO
// router.post("/insert-kitchen-ingredient", async (req, res) => {
//    const { DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement } = req.body;
//    try {
//         const insertResult = await appService.insertKitchenIngredient(DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement);
//         if (insertResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false });
//         }
//     } catch (error) { 
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// // Gives me an error - TODO
// router.patch("/update-kitchen-ingredient", async (req, res) => {
//     const { DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement } = req.body;
//     try {
//         const updateResult = await appService.updateKitchenIngredient(DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement);
//         if (updateResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// router.delete("/delete-kitchen-ingredient", async (req, res) => {
//     const { IngredientID, IngredientListID  } = req.body;
//     try {
//         const deleteResult = await appService.deleteAllergyList(IngredientID, IngredientListID);
//         if (deleteResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// AllergyListHasAllergicIngredient
router.get('/allergy-list-has-allergic-ingredient', async (req, res) => {
    const tableContent = await appService.fetchAllergyListHasAllergicIngredientFromDb();
    res.json({ data: tableContent });
});

// router.post("/insert-allergy-list-has-allergic-ingredient", async (req, res) => {
//     const { IngredientListID, IngredientID, Severity } = req.body;
//     try {
//          const insertResult = await appService.insertAllergicIngredient(IngredientListID, IngredientID, Severity);
//          if (insertResult) {
//              res.json({ success: true });
//          } else {
//              res.status(500).json({ success: false });
//          }
//      } catch (error) { 
//          res.status(500).json({ success: false, error: error.message });
//      }
//  });

//  router.patch("/update-allergy-list-has-allergic-ingredient", async (req, res) => {
//     const { IngredientListID, IngredientID, Severity } = req.body;
//     try {
//         const updateResult = await appService.updateKitchenIngredient(IngredientListID, IngredientID, Severity);
//         if (updateResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// router.delete("/delete-allergy-list-has-allergic-ingredient", async (req, res) => {
//     const { IngredientListID, IngredientID } = req.body;
//     try {
//         const deleteResult = await appService.deleteAllergyList(IngredientListID, IngredientID);
//         if (deleteResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });


// KitchenInventory

// KitchenIngredientPerishableDate







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