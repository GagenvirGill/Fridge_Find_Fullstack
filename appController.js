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

// AppUser
router.get('/users', async (req, res) => {
    try {
        const users = await appService.fetchUserFromDb();
        res.json({ data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.post('/insert-user', async (req, res) => {
    const { Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel } = req.body;
    if (!Username || !Email || !FullName) {
        return res.status(400).json({ success: false, message: "Missing required fields: Username, Email, or FullName" });
    }
    const insertResult = await appService.insertUser(Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete('/delete-user', async (req, res) => {
    const { Username } = req.body;
    if (!Username) {
        return res.status(400).json({ success: false, message: "Username is required." });
    }
    try {
        const deleteResult = await appService.deleteUser(Username);
        if (deleteResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: "Failed to delete user." });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.patch('/update-user', async (req, res) => {
    const { Username, newProfilePicture, newEmail, newFullName, newDefaultPrivacyLevel } = req.body;
    if (!Username) {
        return res.status(400).json({ success: false, message: "Username is required for update." });
    }
    try {
        const updateResult = await appService.updateUser(Username, newProfilePicture, newEmail, newFullName, newDefaultPrivacyLevel);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: "Failed to update user." });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.get('/public-users', async (req, res) => {
    try {
        const publicUsers = await appService.viewUsersWithPublicPrivacy();
        if (publicUsers.length > 0) {
            res.json({ success: true, data: publicUsers });
        } else {
            res.status(404).json({ success: false, message: "No public users found." });
        }
    } catch (error) {
        console.error('Error fetching public users:', error);
        res.status(500).json({ success: false, message: "Error fetching public users." });
    }
});

router.get('/friends-with-everyone', async (req, res) => {
    try {
        const usersWhoAreFriendsWithEveryone = await appService.viewUsersWhoAreFriendsWithEveryone();
        res.json({ success: true, data: usersWhoAreFriendsWithEveryone });
    } catch (error) {
        console.error('Error fetching social butterflies:', error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// ----------------------------------------------------------
// Friends

router.get('/friends', async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ success: false, message: "Username is required." });
    }
    try {
        const friends = await appService.fetchFriends(username);
        res.json({ success: true, data: friends });
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.post('/insert-friend', async (req, res) => {
    const { username1, username2 } = req.body;

    if (!username1 || !username2) {
        return res.status(400).json({
            success: false,
            message: "Both 'username1' and 'username2' are required."
        });
    }
    if (username1 === username2) {
        return res.status(400).json({
            success: false,
            message: "'username1' and 'username2' cannot be the same."
        });
    }

    try {
        const insertResult = await appService.insertFriend(username1, username2);
        if (insertResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: "Failed to insert friend relationship." });
        }
    } catch (error) {
        console.error('Error inserting friend:', error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.delete('/delete-friend', async (req, res) => {
    const { username1, username2 } = req.body;
    if (!username1 || !username2) {
        return res.status(400).json({
            success: false,
            message: "Both 'username1' and 'username2' are required."
        });
    }
    try {
        const deleteResult = await appService.deleteFriend(username1, username2);
        if (deleteResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: "Failed to delete friend relationship." });
        }
    } catch (error) {
        console.error('Error deleting friend:', error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.get('/are-they-friends', async (req, res) => {
    const { username1, username2 } = req.query;
    if (!username1 || !username2) {
        return res.status(400).json({
            success: false,
            message: "Both 'username1' and 'username2' are required."
        });
    }
    try {
        const areFriends = await appService.areTheyFriends(username1, username2);
        res.json({ success: true, areFriends });
    } catch (error) {
        console.error('Error checking friendship:', error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// ----------------------------------------------------------
// NotificationMessage

router.get('/notification-messages', async (req, res) => {
    const { username } = req.query;
    const messages = await appService.fetchNotificationMessages(username);
    res.json({ data: messages });
});

router.post('/insert-notification-message', async (req, res) => {
    const { username, messageText } = req.body;

    if (!username || !messageText) {
        return res.status(400).json({
            success: false,
            message: "Both 'username' and 'messageText' are required."
        });
    }

    try {
        const insertResult = await appService.insertNotificationMessage(username, messageText);
        if (insertResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: "Failed to insert notification message." });
        }
    } catch (error) {
        console.error('Error inserting notification message:', error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


router.delete('/delete-notification-message', async (req, res) => {
    const { username, dateAndTimeSent } = req.body;
    const deleteResult = await appService.deleteNotificationMessage(username, dateAndTimeSent);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// Notifications

router.get('/notifications', async (req, res) => {
    const { username } = req.query;
    const notifications = await appService.fetchNotifications(username);
    res.json({ data: notifications });
});

router.post('/insert-notification', async (req, res) => {
    const { notificationID, username } = req.body;

    if (!notificationID || !username) {
        return res.status(400).json({
            success: false,
            message: "Both 'notificationID' and 'username' are required."
        });
    }

    try {
        const insertResult = await appService.insertNotification(notificationID, username);
        if (insertResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: "Failed to insert notification." });
        }
    } catch (error) {
        console.error('Error inserting notification:', error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


router.delete('/delete-notification', async (req, res) => {
    const { notificationID } = req.body;
    const deleteResult = await appService.deleteNotification(notificationID);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// Recipe Centric endpoints

router.get('/recipe', async (req, res) => {
    const recipeContent = await appService.fetchRecipeFromDb();
    res.json({ data: recipeContent });
});

router.post('/simple-or-complicated-recipes', async (req, res) => {
    const { Difficulty } = req.body;
    const easyRecipesContent = await appService.fetchSimpleOrComplicatedRecipesFromDb(Difficulty);
    res.json({ data: easyRecipesContent });
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