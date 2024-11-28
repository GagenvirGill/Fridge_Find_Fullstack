/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
        .then((text) => {
            statusElem.textContent = text;
        })
        .catch((error) => {
            statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
        });
}

// ----------------------------------------------------------
// User Centric methods
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('appUser');
    const tableBody = tableElement.querySelector('tbody');

    try {
        const response = await fetch('/users', { method: 'GET' });
        const responseData = await response.json();
        const users = responseData.data;

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        users.forEach(user => {
            const row = tableBody.insertRow();
            user.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Error fetching users.');
    }
}

async function insertUser(event) {
    event.preventDefault();

    const username = document.getElementById('insertUsername').value;
    // const profilePicture = document.getElementById('insertProfilePicture').value;
    const email = document.getElementById('insertEmail').value;
    const fullName = document.getElementById('insertFullName').value;
    const privacyLevel = document.getElementById('insertUserPrivacyLevel').value;

    if (!username || !email || !fullName || !privacyLevel) {
        alert('All fields are required!');
        return;
    }

    try {
        const response = await fetch('/insert-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Username: username,
                // ProfilePicture: profilePicture || null,
                Email: email,
                FullName: fullName,
                DefaultPrivacyLevel: privacyLevel,
            }),
        });

        const responseData = await response.json();
        const messageElement = document.getElementById('insertUserResultMsg');

        if (responseData.success) {
            messageElement.textContent = 'User inserted successfully!';
            await fetchAndDisplayUsers();
        } else {
            messageElement.textContent = 'Error inserting user.';
        }
    } catch (error) {
        console.error('Error inserting user:', error);
        alert('Error inserting user.');
    }
}

async function updateUser(event) {
    event.preventDefault();

    const username = document.getElementById('updateUsername').value;
    // const newProfilePicture = document.getElementById('updateProfilePicture').value;
    const newEmail = document.getElementById('updateEmail').value;
    const newFullName = document.getElementById('updateFullName').value;
    const newPrivacyLevel = document.getElementById('updateUserPrivacyLevel').value;

    if (!username) {
        alert('Username is required for updating.');
        return;
    }

    try {
        const response = await fetch('/update-user', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Username: username,
                // NewProfilePicture: newProfilePicture,
                NewEmail: newEmail,
                NewFullName: newFullName,
                NewDefaultPrivacyLevel: newPrivacyLevel,
            }),
        });

        const responseData = await response.json();
        const messageElement = document.getElementById('updateUserResultMsg');

        if (responseData.success) {
            messageElement.textContent = 'User updated successfully!';
            fetchAndDisplayUsers();
        } else {
            messageElement.textContent = 'Error updating user.';
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Error updating user.');
    }
}

async function deleteUser(event) {
    event.preventDefault();

    const username = document.getElementById('deleteUsername').value;

    try {
        const response = await fetch('/delete-user', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Username: username }),
        });

        const responseData = await response.json();
        const messageElement = document.getElementById('deleteUserResultMsg');

        if (responseData.success) {
            messageElement.textContent = 'User deleted successfully!';
            fetchAndDisplayUsers();
        } else {
            messageElement.textContent = 'Error deleting user.';
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user.');
    }
}

async function fetchAndDisplayPublicUsers() {
    const tableElement = document.getElementById('fetchPublicUser');
    const tableBody = tableElement.querySelector('tbody');

    try {
        const response = await fetch('/public-users', { method: 'GET' });
        const responseData = await response.json();
        const users = responseData.data;

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        users.forEach(user => {
            const row = tableBody.insertRow();
            user.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error('Error fetching public users:', error);
        alert('Error fetching public users.');
    }
}

async function fetchAndDisplayUsersWhoAreFriendsWithEveryone() {
    const tableElement = document.getElementById('fetchUsersWhoAreFriendsWithEveryone');
    const tableBody = tableElement.querySelector('tbody');

    try {
        const response = await fetch('/friends-with-everyone', { method: 'GET' });
        const responseData = await response.json();
        const users = responseData.data;

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        users.forEach(user => {
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            cell.textContent = user;
        });
    } catch (error) {
        console.error('Error fetching users who are friends with everyone:', error);
        alert('Error fetching users who are friends with everyone.');
    }
}

// async function fetchAndDisplayFriendships() {
//     const tableElement = document.getElementById('friendships');
//     const tableBody = tableElement.querySelector('tbody');

//     try {
//         const response = await fetch('/friendships', { method: 'GET' });
//         const responseData = await response.json();
//         const friendships = responseData.data;

//         if (tableBody) {
//             tableBody.innerHTML = '';
//         }

//         friendships.forEach(friendship => {
//             const row = tableBody.insertRow();
//             friendship.forEach((field, index) => {
//                 const cell = row.insertCell(index);
//                 cell.textContent = field;
//             });
//         });
//     } catch (error) {
//         console.error('Error fetching friendships:', error);
//         alert('Error fetching friendships.');
//     }
// }

async function insertFriend(event) {
    event.preventDefault();

    const username1 = document.getElementById('insertFriendUsername1').value;
    const username2 = document.getElementById('insertFriendUsername2').value;

    if (!username1 || !username2) {
        alert('Both usernames are required to add a friend!');
        return;
    }

    try {
        const response = await fetch('/insert-friend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username1, username2 }),
        });

        const responseData = await response.json();
        const messageElement = document.getElementById('insertFriendResultMsg');

        if (responseData.success) {
            messageElement.textContent = 'Friend added successfully!';
        } else {
            messageElement.textContent = 'Error adding friend.';
        }
    } catch (error) {
        console.error('Error inserting friend:', error);
        alert('Error inserting friend.');
    }
}

async function deleteFriend(event) {
    event.preventDefault();

    const username1 = document.getElementById('deleteFriendUsername1').value;
    const username2 = document.getElementById('deleteFriendUsername2').value;

    if (!username1 || !username2) {
        alert('Both usernames are required to delete a friend!');
        return;
    }

    try {
        const response = await fetch('/delete-friend', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username1, username2 }),
        });

        const responseData = await response.json();
        const messageElement = document.getElementById('deleteFriendResultMsg');

        if (responseData.success) {
            messageElement.textContent = 'Friend deleted successfully!';
        } else {
            messageElement.textContent = 'Error deleting friend.';
        }
    } catch (error) {
        console.error('Error deleting friend:', error);
        alert('Error deleting friend.');
    }
}

async function areTheyFriends(event) {
    event.preventDefault();

    const username1 = document.getElementById('checkFriendsUsername1').value;
    const username2 = document.getElementById('checkFriendsUsername2').value;

    if (!username1 || !username2) {
        alert('Both usernames are required to check friendship!');
        return;
    }

    try {
        const response = await fetch(`/are-they-friends?username1=${username1}&username2=${username2}`, {
            method: 'GET',
        });

        const responseData = await response.json();
        const messageElement = document.getElementById('checkFriendsResultMsg');
        messageElement.textContent = responseData.areFriends
            ? `${username1} and ${username2} are friends.`
            : `${username1} and ${username2} are not friends.`;
    } catch (error) {
        console.error('Error checking friendship:', error);
        alert('Error checking friendship.');
    }
}

// Working in progress!!
// async function fetchAndDisplayNotifications() {
//     const username = document.getElementById('showUsersNotifications').value;
//     if (!username) {
//         alert('Please enter a username.');
//         return;
//     }

//     const response = await fetch(`/notifications?username=${username}`);
//     const data = await response.json();
//     console.log("API Response Data:", data);
//     console.log("Notification Array:", data.data);
//     data.data.forEach((notification, index) => {
//         console.log(`Notification ${index + 1}:`, notification);
//     });


//     if (data.success) {
//         const tableBody = document.getElementById('notificationsList').querySelector('tbody');
//         tableBody.innerHTML = '';
//         document.getElementById('notificationsUsername').style.display = 'block';
//         document.getElementById('currentUsername').textContent = username;
//         document.getElementById('notificationsList').style.display = 'table';

//         data.data.forEach(notification => {
//             const row = tableBody.insertRow();
//             row.insertCell(0).textContent = notification[0] || 'N/A'; // NotificationID
//             row.insertCell(1).textContent = notification[1] || 'N/A'; // DateAndTimeSent
//             row.insertCell(2).textContent = notification[3] || 0;     // ExpiringCount

//             const showButton = row.insertCell(3).appendChild(document.createElement('button'));
//             showButton.textContent = 'Show';
//             showButton.onclick = () => fetchNotificationDetails(notification[0]);

//             const deleteButton = row.insertCell(4).appendChild(document.createElement('button'));
//             deleteButton.textContent = 'Delete';
//             deleteButton.onclick = () => deleteNotification(notification[0]);
//         });

//     } else {
//         alert('Error fetching notifications.');
//     }
// }

// async function fetchNotificationDetails(notificationID) {
//     const response = await fetch(`/notifications/details?notificationID=${notificationID}`);
//     const data = await response.json();

//     if (data.success) {
//         const tableBody = document.getElementById('notificationDetailsBody');
//         tableBody.innerHTML = '';
//         document.getElementById('notificationDetails').style.display = 'block';
//         document.getElementById('detailsNotificationID').textContent = notificationID;

//         data.data.forEach(detail => {
//             const row = tableBody.insertRow();
//             row.insertCell(0).textContent = detail.ListName;
//             row.insertCell(1).textContent = detail.IngredientName;
//             row.insertCell(2).textContent = detail.Amount;
//             row.insertCell(3).textContent = detail.UnitOfMeasurement;
//             row.insertCell(4).textContent = detail.ExpiryDate;
//         });
//     } else {
//         alert('Error fetching notification details.');
//     }
// }

// async function deleteNotification(notificationID) {
//     const response = await fetch('/notifications', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ notificationID }),
//     });

//     const data = await response.json();
//     if (data.success) {
//         alert('Notification deleted successfully.');
//         fetchAndDisplayNotifications();
//     } else {
//         alert('Error deleting notification.');
//     }
// }

// ----------------------------------------------------------
// Recipe Centric methods

// Display all Recipes
async function fetchAndDisplayRecipes() {
    const tableElement = document.getElementById('recipe');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/recipe', {
        method: 'GET'
    });

    const responseData = await response.json();
    const recipeContent = responseData.data;

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    recipeContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Inserts new records into the recipe table.
async function insertRecipe(event) {
    event.preventDefault();

    const recipeIDValue = document.getElementById('insertRecipeID').value;
    const recipeNameValue = document.getElementById('insertRecipeName').value;
    const privacyLevelValue = document.getElementById('insertPrivacyLevel').value;
    const usernameValue = document.getElementById('insertUsername').value;

    const response = await fetch('/insert-recipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeID: recipeIDValue,
            RecipeName: recipeNameValue,
            PrivacyLevel: privacyLevelValue,
            Username: usernameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertRecipeResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Recipe Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting Recipe data!";
    }
}

// Updates recipe.
async function updateRecipe(event) {
    event.preventDefault();

    const recipeIDValue = document.getElementById('updateRecipeID').value;
    const newRecipeNameValue = document.getElementById('updateRecipeName').value;
    const newPrivacyLevelValue = document.getElementById('updatePrivacyLevel').value;

    const response = await fetch('/update-recipe', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeID: recipeIDValue,
            NewRecipeName: newRecipeNameValue,
            NewPrivacyLevel: newPrivacyLevelValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateRecipeResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Recipe updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating recipe!";
    }
}

async function deleteRecipe(event) {
    event.preventDefault();

    const recipeIDValue = document.getElementById('deleteRecipeID').value;

    const response = await fetch('/delete-recipe', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeID: recipeIDValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteRecipeResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Recipe deleted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error deleting recipe!";
    }
}

async function fetchAndDisplayARecipesIngredients(event) {
    event.preventDefault();

    const tableElement = document.getElementById('recipesIngredients');
    const tableBody = tableElement.querySelector('tbody');
    const recipeIDValue = document.getElementById('getRecipeIDForItsIngredients').value;

    const tableResponse = await fetch(`/recipe-ingredient-for-recipe?RecipeID=${recipeIDValue}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const tableResponseData = await tableResponse.json();

    const nameResponse = await fetch(`/recipe-name?RecipeID=${recipeIDValue}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const nameResponseData = await nameResponse.json();

    const recipeIngredientsContent = tableResponseData.data;
    const recipeName = nameResponseData.RecipeName;

    const messageElement = document.getElementById('recipesIngredientsNameMsg');
    if (recipeName.length > 0) {
        messageElement.textContent = `${recipeName} Ingredients Successfully Retrieved`;
    } else {
        messageElement.textContent = "Error getting the ingredients";
    }

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    recipeIngredientsContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            if (index == 2 || index == 4) {
                return;
            } else if (index == 3) {
                const combinedFields = `${field} ${user[4]}`
                const cell = row.insertCell(index - 1);
                cell.textContent = combinedFields;
            } else {
                const cell = row.insertCell(index);
                cell.textContent = field;
            }
        });
    });
}

async function insertRecipeIngredient(event) {
    event.preventDefault();

    const recipeIngredientIDValue = document.getElementById('insertRecipeIngredientID').value;
    const recipeIngredientNameValue = document.getElementById('insertRecipeIngredientName').value;
    const recipeIngredientsRecipeIDValue = document.getElementById('insertRecipeIngredientsRecipeID').value;
    const recipeIngredientAmountValue = document.getElementById('insertRecipeIngredientAmount').value;
    const recipeIngredientUnitValue = document.getElementById('insertRecipeIngredientUnit').value;

    const response = await fetch('/insert-recipe-ingredient', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeIngredientID: recipeIngredientIDValue,
            RecipeIngredientName: recipeIngredientNameValue,
            RecipeID: recipeIngredientsRecipeIDValue,
            Amount: recipeIngredientAmountValue,
            UnitOfMeasurement: recipeIngredientUnitValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertRecipeIngredientResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Recipe Ingredient Data inserted successfully!";
    } else {
        messageElement.textContent = "Error inserting Recipe Ingredient Data";
    }
}


// ----------------------------------------------------------
// Ingredient Centric methods



// ----------------------------------------------------------
// General Methods

// This function resets or initializes all of the tables.
async function resetTables() {
    const response = await fetch("/initiate-tables", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetTablesResultMsg');
        messageElement.textContent = "All tables initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating tables!");
    }
}


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function () {
    checkDbConnection();
    fetchTableData();
    // document.getElementById("resetDemotable").addEventListener("click", resetDemotable);
    // document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);
    // document.getElementById("updataNameDemotable").addEventListener("submit", updateNameDemotable);
    // document.getElementById("countDemotable").addEventListener("click", countDemotable);

    // user centric
    document.getElementById('insertUserForm').addEventListener('submit', insertUser);
    document.getElementById('updateUserForm').addEventListener('submit', updateUser);
    document.getElementById('deleteUserForm').addEventListener('submit', deleteUser);

    document.getElementById('insertFriendForm').addEventListener('submit', insertFriend);
    document.getElementById('deleteFriendForm').addEventListener('submit', deleteFriend);
    document.getElementById('areTheyFriendsForm').addEventListener('submit', areTheyFriends);

    // document.getElementById('fetchNotificationMessagesBtn').addEventListener('click', fetchAndDisplayNotificationMessages);
    // document.getElementById('insertNotificationMessageForm').addEventListener('submit', insertNotificationMessage);
    // document.getElementById('deleteNotificationMessageForm').addEventListener('submit', deleteNotificationMessage);
    //
    // document.getElementById('fetchNotificationsBtn').addEventListener('click', fetchAndDisplayNotifications);
    // document.getElementById('insertNotificationForm').addEventListener('submit', insertNotification);
    // document.getElementById('deleteNotificationForm').addEventListener('submit', deleteNotification);

    // recipe centric

    document.getElementById("insertRecipe").addEventListener("submit", insertRecipe);
    document.getElementById("updateRecipe").addEventListener("submit", updateRecipe);
    document.getElementById("deleteRecipe").addEventListener("submit", deleteRecipe);
    document.getElementById("fetchARecipesIngredients").addEventListener("submit", fetchAndDisplayARecipesIngredients);
    document.getElementById("insertRecipeIngredient").addEventListener("submit", insertRecipeIngredient);

    // ingredient centric

    // general
    document.getElementById("resetTables").addEventListener("click", resetTables);
};

// General function to refresh the displayed table data.
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayUsers();
    fetchAndDisplayPublicUsers();
    fetchAndDisplayUsersWhoAreFriendsWithEveryone();
    // fetchAndDisplayFriendships();
    // fetchAndDisplayNotifications();
    fetchAndDisplayRecipes();
}
