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
    const users = await appService.fetchUserFromDb();
    res.json({ data: users });
});

router.post('/insert-user', async (req, res) => {
    const { Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel } = req.body;
    const insertResult = await appService.insertUser(Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete('/delete-user', async (req, res) => {
    const { Username } = req.body;
    const deleteResult = await appService.deleteUser(Username);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.patch('/update-user', async (req, res) => {
    const { Username, newProfilePicture, newEmail, newFullName, newDefaultPrivacyLevel } = req.body;
    const updateResult = await appService.updateUser(Username, newProfilePicture, newEmail, newFullName, newDefaultPrivacyLevel);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/view-user', async (req, res) => {
    const { Username } = req.query;
    const user = await appService.viewUser(Username);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

router.get('/friends-with-everyone', async (req, res) => {
    const socialButterflies = await appService.viewUsersWhoAreFriendsWithEveryone();
    res.json({ data: socialButterflies });
});

// ----------------------------------------------------------
// Friends

router.get('/friends', async (req, res) => {
    const { username } = req.query;
    const friends = await appService.fetchFriends(username);
    res.json({ data: friends });
});

router.post('/insert-friend', async (req, res) => {
    const { username1, username2 } = req.body;
    const insertResult = await appService.insertFriend(username1, username2);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete('/delete-friend', async (req, res) => {
    const { username1, username2 } = req.body;
    const deleteResult = await appService.deleteFriend(username1, username2);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/are-they-friends', async (req, res) => {
    const { username1, username2 } = req.query;
    const areFriends = await appService.areTheyFriends(username1, username2);
    res.json({ areFriends });
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
    const insertResult = await appService.insertNotificationMessage(username, messageText);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
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
    const insertResult = await appService.insertNotification(notificationID, username);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
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
    const tableContent = await appService.fetchRecipeFromDb();
    res.json({ data: tableContent });
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