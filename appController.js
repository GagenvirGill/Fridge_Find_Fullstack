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
    // const { Username, Email, FullName, DefaultPrivacyLevel } = req.body;
    // if (!Username) {
    //     return res.status(400).json({ success: false, message: "Missing required fields: Username" });
    // }
    // const insertResult = await appService.insertUser(Username, Email, FullName, DefaultPrivacyLevel);
    // if (insertResult) {
    //     res.json({ success: true });
    // } else {
    //     res.status(500).json({ success: false });
    // }
    try {
        const { Username, Email, FullName, DefaultPrivacyLevel } = req.body;
        if (!Username) {
            return res.status(400).json({ success: false, message: 'Missing required fields: Username.' });
        }
        const success = await appService.insertUser(Username, Email, FullName, DefaultPrivacyLevel);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to insert user' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// router.delete('/delete-user', async (req, res) => {
//     const { Username } = req.body;
//     const returnValue = await appService.deleteUser(Username);
//     res.json(returnValue);
// });

router.delete('/delete-user', async (req, res) => {
    try {
        const { Username } = req.body;
        if (!Username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const returnValue = await appService.deleteUser(Username);
        if (returnValue.success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: "Failed to update user." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


router.patch('/update-user', async (req, res) => {
    const { Username, NewEmail, NewFullName, NewDefaultPrivacyLevel } = req.body;
    if (!Username) {
        return res.status(400).json({ success: false, message: "Username is required for update." });
    }
    try {
        const updateResult = await appService.updateUser(Username, NewEmail, NewFullName, NewDefaultPrivacyLevel);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: "Failed to update user." });
        }
    } catch (error) {
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
        res.status(500).json({ success: false, message: "Error fetching public users." });
    }
});

router.get('/friends-with-everyone', async (req, res) => {
    try {
        const usersWhoAreFriendsWithEveryone = await appService.viewUsersWhoAreFriendsWithEveryone();
        if (usersWhoAreFriendsWithEveryone.length > 0) {
            res.json({ success: true, data: usersWhoAreFriendsWithEveryone });
        } else {
            res.status(404).json({ success: false, message: "No users who are friends with everyone found.", data: [] });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching users who are friends with everyone.", data: [] });
    }
});

// ----------------------------------------------------------
// Friends
// router.get('/friendships', async (req, res) => {
//     try {
//         const friends = await appService.fetchFriendshipsFromDb();
//         res.json({ data: friends });
//     } catch (error) {
//         console.error('Error fetching friendships:', error);
//         res.status(500).json({ success: false, message: "Internal server error." });
//     }
// });

// Working in progress!!

// router.get('/are-they-friends', async (req, res) => {
//     const { username1, username2 } = req.query;
//     if (!username1 || !username2) {
//         return res.status(400).json({
//             success: false,
//             message: "Both 'username1' and 'username2' are required."
//         });
//     }
//     try {
//         const areFriends = await appService.areTheyFriends(username1, username2);
//         res.json({ success: true, areFriends });
//     } catch (error) {
//         console.error('Error checking friendship:', error);
//         res.status(500).json({ success: false, message: "Internal server error." });
//     }
// });

// router.post('/insert-friend', async (req, res) => {
//     const { username1, username2 } = req.body;

//     if (!username1 || !username2) {
//         return res.status(400).json({
//             success: false,
//             message: "Both 'username1' and 'username2' are required."
//         });
//     }
//     if (username1 === username2) {
//         return res.status(400).json({
//             success: false,
//             message: "'username1' and 'username2' cannot be the same."
//         });
//     }

//     try {
//         const insertResult = await appService.insertFriend(username1, username2);
//         if (insertResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false, message: "Failed to insert friend relationship." });
//         }
//     } catch (error) {
//         console.error('Error inserting friend:', error);
//         res.status(500).json({ success: false, message: "Internal server error." });
//     }
// });

// router.delete('/delete-friend', async (req, res) => {
//     const { username1, username2 } = req.body;
//     if (!username1 || !username2) {
//         return res.status(400).json({
//             success: false,
//             message: "Both 'username1' and 'username2' are required."
//         });
//     }
//     try {
//         const deleteResult = await appService.deleteFriend(username1, username2);
//         if (deleteResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false, message: "Failed to delete friend relationship." });
//         }
//     } catch (error) {
//         console.error('Error deleting friend:', error);
//         res.status(500).json({ success: false, message: "Internal server error." });
//     }
// });

// ----------------------------------------------------------
// NotificationMessage

// router.get('/notifications', async (req, res) => {
//     const { username } = req.query;

//     if (!username) {
//         return res.status(400).json({
//             success: false,
//             message: "Username is required.",
//         });
//     }

//     try {
//         const notifications = await appService.fetchNotificationForExpiringIngredients(username);
//         if (notifications.length > 0) {
//             res.json({ success: true, data: notifications });
//         } else {
//             res.status(404).json({ success: false, message: "No notifications found for the user." });
//         }
//     } catch (error) {
//         console.error('Error fetching notifications:', error);
//         res.status(500).json({ success: false, message: "Internal server error." });
//     }
// });


// router.get('/notifications/details', async (req, res) => {
//     const { notificationID } = req.query;

//     if (!notificationID) {
//         return res.status(400).json({
//             success: false,
//             message: "Notification ID is required.",
//         });
//     }

//     try {
//         const details = await appService.fetchNotificationDetails(notificationID);
//         res.json({ success: true, data: details });
//     } catch (error) {
//         console.error('Error fetching notification details:', error);
//         res.status(500).json({ success: false, message: "Error fetching notification details." });
//     }
// });


// router.delete('/notification', async (req, res) => {
//     const { notificationID } = req.body;

//     if (!notificationID) {
//         return res.status(400).json({
//             success: false,
//             message: "Notification ID is required.",
//         });
//     }

//     try {
//         await appService.deleteNotification(notificationID);
//         res.json({ success: true, message: "Notification deleted successfully." });
//     } catch (error) {
//         console.error('Error deleting notification:', error);
//         res.status(500).json({ success: false, message: "Error deleting notification." });
//     }
// });

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

// router.post("/insert-recipe", async (req, res) => {
//     const { RecipeID, RecipeName, PrivacyLevel, Username } = req.body;
//     const returnValue = await appService.insertRecipe(RecipeID, RecipeName, PrivacyLevel, Username);
//     res.json(returnValue);
// });

router.post('/insert-recipe', async (req, res) => {
    const { RecipeID, RecipeName, PrivacyLevel, Username } = req.body;
    if (!RecipeID) {
        return res.status(400).json({ success: false, message: 'Missing required fields: RecipeID' });
    }
    try {
        const insertResult = await appService.insertRecipe(RecipeID, RecipeName, PrivacyLevel, Username);
        if (insertResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to insert recipe' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// router.patch("/update-recipe", async (req, res) => {
//     const { RecipeID, NewRecipeName, NewPrivacyLevel } = req.body;
//     const returnValue = await appService.updateRecipe(RecipeID, NewRecipeName, NewPrivacyLevel);
//     res.json(returnValue);
// });

router.patch('/update-recipe', async (req, res) => {
    const { RecipeID, NewRecipeName, NewPrivacyLevel } = req.body;
    if (!RecipeID) {
        return res.status(400).json({ success: false, message: 'RecipeID is required for update.' });
    }

    try {
        const updateResult = await appService.updateRecipe(RecipeID, NewRecipeName, NewPrivacyLevel);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update recipe.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// router.delete("/delete-recipe", async (req, res) => {
//     const { RecipeID } = req.body;
//     const returnValue = await appService.deleteRecipe(RecipeID);
//     res.json(returnValue);
// });

router.delete('/delete-recipe', async (req, res) => {
    try {
        const { RecipeID } = req.body;
        if (!RecipeID) {
            return res.status(400).json({ error: 'RecipeID is required.' });
        }

        const returnValue = await appService.deleteRecipe(RecipeID);
        if (returnValue.success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete recipe.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.get("/recipe-ingredients-for-recipe", async (req, res) => {
    const { RecipeID } = req.query;
    const returnValue = await appService.fetchRecipeIngredientsForRecipeFromDb(RecipeID);
    res.json(returnValue);
});

// router.post("/insert-recipe-ingredient", async (req, res) => {
//     const { RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement } = req.body;
//     const returnValue = await appService.insertRecipeIngredient(RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement);
//     res.json(returnValue);
// });

router.post('/insert-recipe-ingredient', async (req, res) => {
    const { RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement } = req.body;
    if (!RecipeIngredientID || !RecipeID) {
        return res.status(400).json({ success: false, message: 'Missing required fields: RecipeIngredientID and RecipeID' });
    }

    const insertResult = await appService.insertRecipeIngredient(RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to insert recipe ingredient' });
    }
});


// router.patch("/update-recipe-ingredient", async (req, res) => {
//     const { RecipeIngredientID, RecipeID, RecipeIngredientName, Amount, UnitOfMeasurement } = req.body;
//     const returnValue = await appService.updateRecipeIngredient(RecipeIngredientID, RecipeID, RecipeIngredientName, Amount, UnitOfMeasurement);
//     res.json(returnValue);
// });

router.patch('/update-recipe-ingredient', async (req, res) => {
    const { RecipeIngredientID, RecipeID, RecipeIngredientName, Amount, UnitOfMeasurement } = req.body;

    if (!RecipeIngredientID || !RecipeID) {
        return res.status(400).json({ success: false, message: 'RecipeIngredientID and RecipeID are required for update.' });
    }

    try {
        const updateResult = await appService.updateRecipeIngredient(RecipeIngredientID, RecipeID, RecipeIngredientName, Amount, UnitOfMeasurement);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update recipe ingredient.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// router.delete("/delete-recipe-ingredient", async (req, res) => {
//     const { RecipeIngredientID, RecipeID } = req.body;
//     const returnValue = await appService.deleteRecipeIngredient(RecipeIngredientID, RecipeID);
//     res.json(returnValue);
// });

router.delete('/delete-recipe-ingredient', async (req, res) => {
    try {
        const { RecipeIngredientID, RecipeID } = req.body;
        if (!RecipeIngredientID || !RecipeID) {
            return res.status(400).json({ error: 'RecipeIngredientID and RecipeID are required.' });
        }

        const returnValue = await appService.deleteRecipeIngredient(RecipeIngredientID, RecipeID);
        if (returnValue.success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete recipe ingredient.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


router.get("/recipe-steps-for-recipe", async (req, res) => {
    const { RecipeID } = req.query;
    const returnValue = await appService.fetchRecipeStepsForRecipe(RecipeID);
    res.json(returnValue);
});

// router.post("/insert-recipe-step", async (req, res) => {
//     const { RecipeID, StepNumber, StepInformation } = req.body;
//     const returnValue = await appService.insertRecipeStep(RecipeID, StepNumber, StepInformation);
//     res.json(returnValue);
// });

router.post('/insert-recipe-step', async (req, res) => {
    const { RecipeID, StepNumber, StepInformation } = req.body;
    if (!RecipeID || !StepNumber) {
        return res.status(400).json({ success: false, message: 'Missing required fields: RecipeID and StepNumber' });
    }

    const insertResult = await appService.insertRecipeStep(RecipeID, StepNumber, StepInformation);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to insert recipe step' });
    }
});


// router.patch("/update-recipe-step", async (req, res) => {
//     const { RecipeID, OldStepNumber, NewStepNumber, NewStepInformation } = req.body;
//     const returnValue = await appService.updateRecipeStep(RecipeID, OldStepNumber, NewStepNumber, NewStepInformation);
//     res.json(returnValue);
// });

router.patch('/update-recipe-step', async (req, res) => {
    const { RecipeID, OldStepNumber, NewStepNumber, NewStepInformation } = req.body;

    if (!RecipeID) {
        return res.status(400).json({ success: false, message: 'RecipeID is required for update.' });
    }

    try {
        const updateResult = await appService.updateRecipeStep(RecipeID, OldStepNumber, NewStepNumber, NewStepInformation);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update recipe step.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// router.delete("/delete-recipe-step", async (req, res) => {
//     const { RecipeID, StepNumber } = req.body;
//     const returnValue = await appService.deleteRecipeStep(RecipeID, StepNumber);
//     res.json(returnValue);
// });

router.delete('/delete-recipe-step', async (req, res) => {
    try {
        const { RecipeID, StepNumber } = req.body;
        if (!RecipeID || !StepNumber) {
            return res.status(400).json({ error: 'RecipeID and StepNumber are required' });
        }

        const returnValue = await appService.deleteRecipeStep(RecipeID, StepNumber);
        if (returnValue.success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete recipe step.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// router.post("/insert-category", async (req, res) => {
//     const { CategoryName, CategoryDescription } = req.body;
//     const returnValue = await appService.insertCategory(CategoryName, CategoryDescription);
//     res.json(returnValue);
// });

router.post('/insert-category', async (req, res) => {
    const { CategoryName, CategoryDescription } = req.body;
    if (!CategoryName) {
        return res.status(400).json({ success: false, message: 'Missing required fields: CategoryName' });
    }

    const insertResult = await appService.insertCategory(CategoryName, CategoryDescription);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to insert category' });
    }
});

// router.patch("/update-category", async (req, res) => {
//     const { CategoryName, NewCategoryDescription } = req.body;
//     const returnValue = await appService.updateCategory(CategoryName, NewCategoryDescription);
//     res.json(returnValue);
// });

router.patch('/update-category', async (req, res) => {
    const { CategoryName, NewCategoryDescription } = req.body;

    if (!CategoryName) {
        return res.status(400).json({ success: false, message: 'CategoryName is required for update.' });
    }

    try {
        const updateResult = await appService.updateCategory(CategoryName, NewCategoryDescription);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update category.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// router.delete("/delete-category", async (req, res) => {
//     const { CategoryName } = req.body;
//     const returnValue = await appService.deleteCategory(CategoryName);
//     res.json(returnValue);
// });

router.delete('/delete-category', async (req, res) => {
    try {
        const { CategoryName } = req.body;
        if (!CategoryName) {
            return res.status(400).json({ error: 'CategoryName is required' });
        }

        const returnValue = await appService.deleteCategory(CategoryName);
        if (returnValue.success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete category.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// router.post("/insert-recipe-into-category", async (req, res) => {
//     const { RecipeID, CategoryName } = req.body;
//     const returnValue = await appService.insertRecipeIntoCategory(RecipeID, CategoryName);
//     res.json(returnValue);
// });

router.post('/insert-recipe-into-category', async (req, res) => {
    const { RecipeID, CategoryName } = req.body;
    if (!RecipeID || !CategoryName) {
        return res.status(400).json({ success: false, message: 'Missing required fields: RecipeID or CategoryName' });
    }

    const insertResult = await appService.insertRecipeIntoCategory(RecipeID, CategoryName);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to insert recipe into category' });
    }
});


// router.delete("/delete-recipe-from-category", async (req, res) => {
//     const { RecipeID, CategoryName } = req.body;
//     const returnValue = await appService.deleteRecipeFromCategory(RecipeID, CategoryName);
//     res.json(returnValue);
// });

router.delete('/delete-recipe-from-category', async (req, res) => {
    try {
        const { RecipeID, CategoryName } = req.body;
        if (!RecipeID || !CategoryName) {
            return res.status(400).json({ error: 'RecipeID and CategoryName are required' });
        }

        const returnValue = await appService.deleteRecipeFromCategory(RecipeID, CategoryName);
        if (returnValue.success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete recipe from category.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});



router.get("/recipe-list-value", async (req, res) => {
    const { RecipeListID } = req.query;
    const recipeListValues = await appService.fetchRecipeList(RecipeListID);
    res.json({ data: recipeListValues })
});

// router.post("/insert-recipe-list", async (req, res) => {
//     const { RecipeListID, RecipeListName, PrivacyLevel, Username } = req.body;
//     const returnValue = await appService.insertRecipeList(RecipeListID, RecipeListName, PrivacyLevel, Username);
//     res.json(returnValue);
// });

router.post('/insert-recipe-list', async (req, res) => {
    const { RecipeListID, RecipeListName, PrivacyLevel, Username } = req.body;
    if (!RecipeListID) {
        return res.status(400).json({ success: false, message: 'Missing required fields: RecipeListID' });
    }

    const insertResult = await appService.insertRecipeList(RecipeListID, RecipeListName, PrivacyLevel, Username);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to insert recipe list' });
    }
});

// router.patch("/update-recipe-list", async (req, res) => {
//     const { RecipeListID, RecipeListName, PrivacyLevel } = req.body;
//     const returnValue = await appService.updateRecipeList(RecipeListID, RecipeListName, PrivacyLevel);
//     res.json(returnValue);
// });

router.patch('/update-recipe-list', async (req, res) => {
    const { RecipeListID, RecipeListName, PrivacyLevel } = req.body;

    if (!RecipeListID) {
        return res.status(400).json({ success: false, message: 'RecipeListID is required for update.' });
    }

    try {
        const updateResult = await appService.updateRecipeList(RecipeListID, RecipeListName, PrivacyLevel);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update recipe list.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// router.delete("/delete-recipe-list", async (req, res) => {
//     const { RecipeListID } = req.body;
//     const returnValue = await appService.deleteRecipeList(RecipeListID);
//     res.json(returnValue);
// });

router.delete('/delete-recipe-list', async (req, res) => {
    try {
        const { RecipeListID } = req.body;
        if (!RecipeListID) {
            return res.status(400).json({ error: 'RecipeListID is required' });
        }

        const returnValue = await appService.deleteRecipeList(RecipeListID);
        if (returnValue.success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete recipe list.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// router.post("/insert-recipe-into-recipe-list", async (req, res) => {
//     const { RecipeID, RecipeListID } = req.body;
//     const returnValue = await appService.insertRecipeIntoRecipeList(RecipeID, RecipeListID);
//     res.json(returnValue);
// });

router.post('/insert-recipe-into-recipe-list', async (req, res) => {
    const { RecipeID, RecipeListID } = req.body;
    if (!RecipeID || !RecipeListID) {
        return res.status(400).json({ success: false, message: 'Missing required fields: RecipeID or RecipeListID' });
    }

    const insertResult = await appService.insertRecipeIntoRecipeList(RecipeID, RecipeListID);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// router.delete("/delete-recipe-from-recipe-list", async (req, res) => {
//     const { RecipeID, RecipeListID } = req.body;
//     const returnValue = await appService.deleteRecipeFromRecipeList(RecipeID, RecipeListID);
//     res.json(returnValue);
// });

router.delete('/delete-recipe-from-recipe-list', async (req, res) => {
    try {
        const { RecipeID, RecipeListID } = req.body;
        if (!RecipeID || !RecipeListID) {
            return res.status(400).json({ error: 'RecipeID and RecipeListID are required' });
        }

        const returnValue = await appService.deleteRecipeFromRecipeList(RecipeID, RecipeListID);
        if (returnValue.success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete recipe from recipe list.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});



// ----------------------------------------------------------
// Ingredient Centric endpoints

// AllergicIngredient 
router.get('/allergic-ingredient', async (req, res) => {
    const tableContent = await appService.fetchAllergicIngredientFromDb();
    res.json({ data: tableContent });
});

// router.post("/insert-allergic-ingredient", async (req, res) => {
//     const { IngredientID, IngredientName } = req.body;
//     try {
//         const insertResult = await appService.insertAllergicIngredient(IngredientID, IngredientName);
//         if (insertResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

router.post("/insert-allergic-ingredient", async (req, res) => {
    const { IngredientID, IngredientName } = req.body;

    if (!IngredientID) {
        return res.status(400).json({ success: false, message: 'Missing required fields: IngredientID' });
    }

    try {
        const insertResult = await appService.insertAllergicIngredient(IngredientID, IngredientName);
        if (insertResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to insert allergic ingredient.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// router.patch("/update-allergic-ingredient", async (req, res) => {
//     const { IngredientID, IngredientName } = req.body;
//     try {
//         const updateResult = await appService.updateAllergicIngredient(IngredientID, IngredientName);
//         if (updateResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

router.patch("/update-allergic-ingredient", async (req, res) => {
    const { IngredientID, IngredientName } = req.body;

    if (!IngredientID) {
        return res.status(400).json({ success: false, message: 'Missing required fields: IngredientID' });
    }

    try {
        const updateResult = await appService.updateAllergicIngredient(IngredientID, IngredientName);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update allergic ingredient.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// router.delete("/delete-allergic-ingredient", async (req, res) => {
//     const { IngredientID } = req.body;
//     try {
//         const deleteResult = await appService.deleteAllergicIngredient(IngredientID);
//         if (deleteResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

router.delete("/delete-allergic-ingredient", async (req, res) => {
    const { IngredientID } = req.body;

    if (!IngredientID) {
        return res.status(400).json({ success: false, message: 'IngredientID is required for deletion.' });
    }

    try {
        const deleteResult = await appService.deleteAllergicIngredient(IngredientID);
        if (deleteResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete allergic ingredient.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// AllergyList 
router.get('/allergy-list', async (req, res) => {
    const tableContent = await appService.fetchAllergyListFromDb();
    res.json({ data: tableContent });
});

// router.post("/insert-allergy-list", async (req, res) => {
//     const { IngredientListID, PrivacyLevel, ListDescription, Username, ListName } = req.body;
//     try {
//         const insertResult = await appService.insertAllergyList(IngredientListID, PrivacyLevel, ListDescription, Username, ListName);
//         if (insertResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

router.post("/insert-allergy-list", async (req, res) => {
    const { IngredientListID, PrivacyLevel, ListDescription, Username, ListName } = req.body;

    if (!IngredientListID) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: IngredientListID"
        });
    }

    try {
        const insertResult = await appService.insertAllergyList(IngredientListID, PrivacyLevel, ListDescription, Username, ListName);
        if (insertResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to insert allergy list.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// router.patch("/update-allergy-list", async (req, res) => {
//     const { IngredientListID, PrivacyLevel, ListDescription, Username, ListName } = req.body;
//     try {
//         // const updateResult = await appService.updateAllergyList(IngredientListID, PrivacyLevel, ListDescription, Username, ListName);
//         const updateResult = await appService.updateAllergyList(IngredientListID, PrivacyLevel, ListDescription, Username, ListName);
//         if (updateResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

router.patch("/update-allergy-list", async (req, res) => {
    const { IngredientListID, PrivacyLevel, ListDescription, Username, ListName } = req.body;

    if (!IngredientListID) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: IngredientListID"
        });
    }

    try {
        const updateResult = await appService.updateAllergyList(IngredientListID, PrivacyLevel, ListDescription, Username, ListName);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update allergy list.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// router.delete("/delete-allergy-list", async (req, res) => {
//     const { IngredientListID } = req.body;
//     try {
//         const deleteResult = await appService.deleteAllergyList(IngredientListID);
//         if (deleteResult) {
//             res.json({ success: true });
//         } else {
//             res.status(500).json({ success: false });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

router.delete("/delete-allergy-list", async (req, res) => {
    const { IngredientListID } = req.body;

    if (!IngredientListID) {
        return res.status(400).json({
            success: false,
            message: "IngredientListID is required to delete the allergy list."
        });
    }

    try {
        const deleteResult = await appService.deleteAllergyList(IngredientListID);
        if (deleteResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete allergy list.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


router.post("/project-allergy-list", async (req, res) => {
    const { userInput } = req.body;

    if (!userInput) {
        return res.status(400).json({ error: "User Input is required." });
    }

    try {
        const projectedElement = await appService.fetchAllergyListByProjectFromDb(userInput);
        res.json(projectedElement);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


router.get('/count-privacy', async (req, res) => {
    try {
        const privacyLevelCounts = await appService.countPrivacyLevels();

        if (privacyLevelCounts) {
            res.json({ success: true, data: privacyLevelCounts });
        } else {
            res.status(404).json({ success: false, message: "No privacy level counts found." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.get('/having-allergy-list', async (req, res) => {
    try {
        const havingCounts = await appService.havingAllergyList();

        if (havingCounts) {
            res.json({ success: true, data: havingCounts });
        } else {
            res.status(404).json({ success: false, message: "Having aggregation failed." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.get('/allergy-list-group-by-privacy', async (req, res) => {
    const returnValue = await appService.fetchAllergyListPrivacyLevelCounts();
    res.json(returnValue);
});

router.get('/num-allergies-per-user-having', async (req, res) => {
    const returnValue = await appService.fetchNumAllergiesPerUserHaving();
    res.json(returnValue);
});


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