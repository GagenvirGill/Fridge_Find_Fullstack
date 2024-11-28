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



// ----------------------------------------------------------
// Recipe Centric methods

// Display all Recipes
async function fetchAndDisplayRecipes() {
    const response = await fetch('/all-recipes', {
        method: 'GET'
    });

    const responseData = await response.json();
    const recipeContent = responseData.data;

    const tableElement = document.getElementById('recipe');
    const tableBody = tableElement.querySelector('tbody');
    const messageElement = document.getElementById('showAllRecipesResultMsg');

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    if (responseData.success) {
        messageElement.textContent = `Successfully retreived all Recipes`;
    } else {
        messageElement.textContent = `An unexpected error occured while retreiving all Recipes`;
    }

    recipeContent.forEach(recipe => {
        const row = tableBody.insertRow();
        recipe.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function fetchAndDisplaySimpleOrComplicatedRecipes(event) {
    event.preventDefault();

    const difficultySelection = document.getElementById('difficulty');
    const difficultyValue = difficultySelection.value;
    const tableElement = document.getElementById('simpleOrComplicatedRecipesTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/simple-or-complicated-recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Difficulty: difficultyValue
        })
    });

    simpleOrComplicatedRecipesResultMsg

    const responseData = await response.json();
    const filteredRecipes = responseData.data;

    const messageElement = document.getElementById('simpleOrComplicatedRecipesResultMsg');
    if (responseData.success) {
        messageElement.textContent = `Successfully retreived all ${difficultyValue} Recipes`;
    } else {
        messageElement.textContent = `An unexpected error occured while retreiving all ${difficultyValue} Recipes`;
    }

    tableBody.innerHTML = '';

    filteredRecipes.forEach(recipe => {
        const row = tableBody.insertRow();
        recipe.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function fetchAndDisplayCategories() {
    const response = await fetch('/all-categories', {
        method: 'GET'
    });

    const responseData = await response.json();
    const categoryContent = responseData.data;

    const categoriesSelectBar = document.getElementById('filterRecipesCategories');
    categoriesSelectBar.innerHTML = '';

    const messageElement = document.getElementById('filterRecipesByCategoryFormResultMsg');
    if (responseData.success) {
        messageElement.textContent = `Successfully retreived all Categories`;
    } else {
        messageElement.textContent = `An unexpected error occured while retreiving all Categories`;
    }

    categoryContent.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoriesSelectBar.appendChild(option);
    });
}

async function fetchAndDisplayFilteredRecipes(event) {
    event.preventDefault();

    const categoriesSelectBar = document.getElementById('filterRecipesCategories');
    const tableElement = document.getElementById('filteredRecipeTable');
    const tableBody = tableElement.querySelector('tbody');

    const selectedCategories = Array.from(categoriesSelectBar.selectedOptions).map(option => option.value);

    const response = await fetch('/filtered-recipes-by-category', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Categories: selectedCategories
        })
    });

    const responseData = await response.json();
    const filteredRecipes = responseData.data;

    const messageElement = document.getElementById('filterRecipesByCategoryTableResultMsg');
    if (responseData.success && filteredRecipes.length != 0) {
        messageElement.textContent = `Successfully retreived all Recipes by the selected Categories`;
    } else if (responseData.success && filteredRecipes.length == 0) {
        messageElement.textContent = `There aren't any Recipes in any of the selected Categories`;
    } else {
        messageElement.textContent = `An unexpected error occured while retreiving Recipes in those Categories`;
    }

    tableBody.innerHTML = '';

    filteredRecipes.forEach(recipe => {
        const row = tableBody.insertRow();
        recipe.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function fetchAndDisplayRecipeLists() {
    const response = await fetch('/all-recipe-lists', {
        method: 'GET'
    });

    const responseData = await response.json();
    const recipeListContent = responseData.data;

    const recipeListSelectBar = document.getElementById('filterRecipesRecipeLists');
    recipeListSelectBar.innerHTML = '';

    const messageElement = document.getElementById('filterRecipesByRecipeListFormResultMsg');
    if (responseData.success) {
        messageElement.textContent = `Successfully retreived all Recipe Lists`;
    } else {
        messageElement.textContent = `An unexpected error occured while retreiving all Recipe Lists`;
    }

    recipeListContent.forEach(recipeList => {
        const recipeListFormatted = `ID: ${recipeList[0]} - \'${recipeList[1]}\' by ${recipeList[3]} - ${recipeList[2]}`

        const option = document.createElement('option');
        option.value = recipeList[0];
        option.textContent = recipeListFormatted;
        recipeListSelectBar.appendChild(option);
    });
}

async function fetchAndDisplayRecipesByRecipeList(event) {
    event.preventDefault();

    const recipeListSelectBar = document.getElementById('filterRecipesRecipeLists');
    const tableElement = document.getElementById('filteredByRecipeListTable');
    const tableBody = tableElement.querySelector('tbody');
    const selectedRecipeList = recipeListSelectBar.value;

    const tableResponse = await fetch(`/filter-recipes-by-recipe-list?RecipeListID=${selectedRecipeList}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const tableResponseData = await tableResponse.json();
    const recipesContent = tableResponseData.data;

    const listValuesResponse = await fetch(`/recipe-list-value?RecipeListID=${selectedRecipeList}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const listValuesResponseData = await listValuesResponse.json();
    const recipeListValues = listValuesResponseData.data;

    const messageElement = document.getElementById('recipesByRecipeListMsg');
    if (recipesContent.length > 0) {
        messageElement.textContent = `\'${recipeListValues[0][1]}\' Recipes by ${recipeListValues[0][2]} Successfully Retreived`
        fetchTableData();
    } else if (tableResponseData.success) {
        messageElement.textContent = "There are no Recipes in the given list"
    } else {
        messageElement.textContent = "An unexpected error occured while retreiving all Recipes in that Recipe List";
    }

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    recipesContent.forEach(recipe => {
        const row = tableBody.insertRow();
        recipe.forEach((field, index) => {
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

    messageElement.textContent = responseData.message;
    fetchTableData();
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

    messageElement.textContent = responseData.message;
    fetchTableData();
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

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function fetchAndDisplayARecipesIngredients(event) {
    event.preventDefault();

    const tableElement = document.getElementById('recipesIngredients');
    const tableBody = tableElement.querySelector('tbody');
    const recipeIDValue = document.getElementById('getRecipeIDForItsIngredients').value;

    const tableResponse = await fetch(`/recipe-ingredients-for-recipe?RecipeID=${recipeIDValue}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const tableResponseData = await tableResponse.json();
    const recipeIngredientsContent = tableResponseData.data;

    const messageElement = document.getElementById('recipesIngredientsNameMsg');
    messageElement.textContent = tableResponseData.message;
    fetchTableData();

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

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function updateRecipeIngredient(event) {
    event.preventDefault();

    const recipeIngredientIDValue = document.getElementById('updateRecipeIngredientID').value;
    const recipeIDValue = document.getElementById('updateRecipeIngredientRecipeID').value;
    const newRecipeIngredientNameValue = document.getElementById('updateRecipeIngredientName').value;
    const newRecipeIngredientAmountValue = document.getElementById('updateRecipeIngredientAmount').value;
    const newRecipeIngredientUnitValue = document.getElementById('updateRecipeIngredientUnit').value;

    const response = await fetch('/update-recipe-ingredient', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeIngredientID: recipeIngredientIDValue,
            RecipeID: recipeIDValue,
            RecipeIngredientName: newRecipeIngredientNameValue,
            Amount: newRecipeIngredientAmountValue,
            UnitOfMeasurement: newRecipeIngredientUnitValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateRecipeIngredientResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function deleteRecipeIngredient(event) {
    event.preventDefault();

    const recipeIngredientIDValue = document.getElementById('deleteRecipeIngredientID').value;
    const recipeIDValue = document.getElementById('deleteRecipeIngredientRecipeID').value;

    const response = await fetch('/delete-recipe-ingredient', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeIngredientID: recipeIngredientIDValue,
            RecipeID: recipeIDValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteRecipeIngredientResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function fetchAndDisplayARecipesSteps(event) {
    event.preventDefault();

    const tableElement = document.getElementById('recipesSteps');
    const tableBody = tableElement.querySelector('tbody');
    const recipeIDValue = document.getElementById('getRecipeIDForItsSteps').value;

    const tableResponse = await fetch(`/recipe-steps-for-recipe?RecipeID=${recipeIDValue}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const tableResponseData = await tableResponse.json();
    const recipeStepContent = tableResponseData.data;

    const messageElement = document.getElementById('recipesStepsNameMsg');
    messageElement.textContent = tableResponseData.message;
    fetchTableData();

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    recipeStepContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function insertRecipeStep(event) {
    event.preventDefault();

    const recipeIDValue = document.getElementById('insertRecipeStepsRecipeID').value;
    const recipeStepNumberValue = document.getElementById('insertRecipeStepNumber').value;
    const recipeStepInformation = document.getElementById('insertRecipeStepInformation').value;

    const response = await fetch('/insert-recipe-step', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeID: recipeIDValue,
            StepNumber: recipeStepNumberValue,
            StepInformation: recipeStepInformation
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertRecipeStepResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function updateRecipeStep(event) {
    event.preventDefault();

    const recipeIDValue = document.getElementById('updateRecipeStepsRecipeID').value;
    const oldRecipeStepNumberValue = document.getElementById('updateOldRecipeStepNumber').value;
    const newRecipeStepNumberValue = document.getElementById('updateNewRecipeStepNumber').value;
    const newRecipeStepInformation = document.getElementById('updateRecipeStepInformation').value;

    const response = await fetch('/update-recipe-step', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeID: recipeIDValue,
            OldStepNumber: oldRecipeStepNumberValue,
            NewStepNumber: newRecipeStepNumberValue,
            NewStepInformation: newRecipeStepInformation
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateRecipeStepResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function deleteRecipeStep(event) {
    event.preventDefault();

    const recipeStepNumberValue = document.getElementById('deleteRecipeStepNumber').value;
    const recipeIDValue = document.getElementById('deleteRecipeStepsRecipeID').value;

    const response = await fetch('/delete-recipe-step', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeID: recipeIDValue,
            StepNumber: recipeStepNumberValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteRecipeStepResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function insertCategory(event) {
    event.preventDefault();

    const categoryNameValue = document.getElementById('insertCategoryName').value;
    const categoryDescriptionValue = document.getElementById('insertCategoryDescription').value;

    const response = await fetch('/insert-category', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            CategoryName: categoryNameValue,
            categoryDescription: categoryDescriptionValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertCategoryResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function updateCategory(event) {
    event.preventDefault();

    const categoryNameValue = document.getElementById('updateCategoryName').value;
    const newCategoryDescriptionValue = document.getElementById('updateCategoryDescription').value;

    const response = await fetch('/update-category', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            CategoryName: categoryNameValue,
            NewCategoryDescription: newCategoryDescriptionValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateCategoryResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function deleteCategory(event) {
    event.preventDefault();

    const categoryNameValue = document.getElementById('deleteCategoryName').value;

    const response = await fetch('/delete-category', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            CategoryName: categoryNameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteCategoryResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function insertRecipeIntoCategory(event) {
    event.preventDefault();

    const recipeIDValue = document.getElementById('insertRecipeToCategoryRecipeID').value;
    const categoryNameValue = document.getElementById('insertRecipeToCategoryName').value;

    const response = await fetch('/insert-recipe-into-category', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeID: recipeIDValue,
            CategoryName: categoryNameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('addARecipeToCategoryResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function deleteRecipeFromCategory(event) {
    event.preventDefault();

    const recipeIDValue = document.getElementById('deleteRecipeFromCategoryRecipeID').value;
    const categoryNameValue = document.getElementById('deleteRecipeFromCategoryName').value;

    const response = await fetch('/delete-recipe-from-category', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeID: recipeIDValue,
            CategoryName: categoryNameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteARecipeFromCategoryResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function insertRecipeList(event) {
    event.preventDefault();

    const recipeListIDValue = document.getElementById('insertRecipeListID').value;
    const recipeListNameValue = document.getElementById('insertRecipeListName').value;
    const recipeListPrivacyLevelValue = document.getElementById('insertRecipeListPrivacyLevel').value;
    const recipeListUsernameValue = document.getElementById('insertRecipeListUsername').value;

    const response = await fetch('/insert-recipe-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeListID: recipeListIDValue,
            RecipeListName: recipeListNameValue,
            PrivacyLevel: recipeListPrivacyLevelValue,
            Username: recipeListUsernameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertRecipeListResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function updateRecipeList(event) {
    event.preventDefault();

    const recipeListIDValue = document.getElementById('updateRecipeListID').value;
    const recipeListNameValue = document.getElementById('updateRecipeListName').value;
    const recipeListPrivacyLevelValue = document.getElementById('updateRecipeListPrivacyLevel').value;

    const response = await fetch('/update-recipe-list', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeListID: recipeListIDValue,
            RecipeListName: recipeListNameValue,
            PrivacyLevel: recipeListPrivacyLevelValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateRecipeListResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function deleteRecipeList(event) {
    event.preventDefault();

    const recipeListIDValue = document.getElementById('deleteRecipeListID').value;

    const response = await fetch('/delete-recipe-list', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeListID: recipeListIDValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteRecipeListUpdateMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function insertRecipeToRecipeList(event) {
    event.preventDefault();

    const recipeIDValue = document.getElementById('insertRecipeToRecipeListRecipeID').value;
    const recipeListIDValue = document.getElementById('insertRecipeToRecipeListID').value;

    const response = await fetch('/insert-recipe-into-recipe-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeID: recipeIDValue,
            RecipeListID: recipeListIDValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertRecipeToRecipeListResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}

async function deleteRecipeFromRecipeList(event) {
    event.preventDefault();

    const recipeIDValue = document.getElementById('deleteRecipeFromRecipeListRecipeID').value;
    const recipeListIDValue = document.getElementById('deleteRecipeFromRecipeListID').value;

    const response = await fetch('/delete-recipe-from-recipe-list', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RecipeID: recipeIDValue,
            RecipeListID: recipeListIDValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteRecipeFromRecipeListResultMsg');

    messageElement.textContent = responseData.message;
    fetchTableData();
}


// ----------------------------------------------------------
// Ingredient Centric methods

// AllergicIngredient
async function fetchAndDisplayAllergicIngredient() {
    const response = await fetch('/allergic-ingredient', {
        method: 'GET'
    });

    const responseData = await response.json();
    const allergicIngredientContent = responseData.data;

    const tableElement = document.getElementById('allergicingredient'); // from index.html tag
    const tableBody = tableElement.querySelector('tbody');

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    allergicIngredientContent.forEach(allergicingredient => {
        const row = tableBody.insertRow();
        allergicingredient.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function insertAllergicIngredient(event) {
    event.preventDefault();

    const allergicIngredientID = Number(document.getElementById('insertAllergicIngredientID').value);
    const allergicIngredientName = document.getElementById('insertAllergicIngredientName').value;

    const response = await fetch('/insert-allergic-ingredient', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            IngredientID: allergicIngredientID, // Here
            IngredientName: allergicIngredientName,
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertAllergicIngredientResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Allergic Ingredient data inserted successfully!";
        fetchTableData(); // here
        //fetchAndDisplayAllergicIngredient();
    } else {
        messageElement.textContent = "Error inserting Allergic Ingredient data!";
    }
}

async function updateAllergicIngredient(event) {
    event.preventDefault();

    const allergicIngredientIDValue = Number(document.getElementById('updateAllergicIngredientID').value);
    const allergicIngredientNameValue = document.getElementById('updateAllergicIngredientName').value;

    const response = await fetch('/update-allergic-ingredient', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            IngredientID: allergicIngredientIDValue,
            IngredientName: allergicIngredientNameValue,
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateAllergicIngredientResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Allergic Ingredient updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating Allergic Ingredient!";
    }
}

async function deleteAllergicIngredient(event) {
    event.preventDefault();

    const allergicIngredientIDDelete = Number(document.getElementById('deleteAllergicIngredientID').value);

    const response = await fetch('/delete-allergic-ingredient', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            IngredientID: allergicIngredientIDDelete,
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteAllergicIngredientResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Allergic Ingredient deleted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error deleting Allergic Ingredient!";
    }
}


// AllergyList
async function fetchAndDisplayAllergyList() {
    const response = await fetch('/allergy-list', {
        method: 'GET'
    });

    const responseData = await response.json();
    const allergyListContent = responseData.data;

    const tableElement = document.getElementById('allergylist'); // from index.html tag
    const tableBody = tableElement.querySelector('tbody');

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    allergyListContent.forEach(allergylist => {
        const row = tableBody.insertRow();
        allergylist.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// IngredientListID, PrivacyLevel, ListDescription, Username, ListName
async function insertAllergyList(event) {
    event.preventDefault();

    const allergyListIngredientListID = Number(document.getElementById('insertAllergyListIngredientListID').value);
    const allergyListPrivacyLevel = document.getElementById('insertAllergyListPrivacyLevel').value;
    const allergyListListDescription = document.getElementById('insertAllergyListListDescription').value;
    const allergyListUsername = document.getElementById('insertAllergyListUsername').value;
    const allergyListName = document.getElementById('insertAllergyListName').value;


    const response = await fetch('/insert-allergy-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            IngredientListID: allergyListIngredientListID,
            PrivacyLevel: allergyListPrivacyLevel,
            ListDescription: allergyListListDescription, 
            Username: allergyListUsername,
            ListName: allergyListName,
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertAllergyListResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Allergic Ingredient data inserted successfully!";
        fetchTableData(); 
    } else {
        messageElement.textContent = "Error inserting Allergic Ingredient data!";
    }
}

 // Gives me an error - number TODO
 // IngredientListID, PrivacyLevel, ListDescription, Username, ListName
async function updateAllergyList(event) {
    event.preventDefault();

    const allergyListIngredientListIDValue = Number(document.getElementById('updateAllergyListIngredientListID').value);
    const allergyListPrivacyLevelValue = document.getElementById('updateAllergyListPrivacyLevel').value;
    const allergyListListDescriptionValue = document.getElementById('updateAllergyListListDescription').value;
    const allergyListUsernameValue = document.getElementById('updateAllergyListUsername').value;
    const allergyListNameValue = document.getElementById('updateAllergyListName').value;

    const response = await fetch('/update-allergy-list', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            IngredientListID: allergyListIngredientListIDValue,
            PrivacyLevel: allergyListPrivacyLevelValue,
            ListDescription: allergyListListDescriptionValue, 
            Username: allergyListUsernameValue,
            ListName: allergyListNameValue,
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateAllergyListResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Allergy List updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating Allergy List!";
    }
}

async function deleteAllergyList(event) {
    event.preventDefault();

    const allergyListIDDelete = Number(document.getElementById('deleteAllergyListIngredientListID').value);

    const response = await fetch('/delete-allergy-list', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            IngredientListID: allergyListIDDelete,
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteAllergyListResultMsg');

    if (responseData.success) {
        messageElement.textContent = "AllergyList deleted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error deleting AllergyList!";
    }
}


async function projectAllergyList(event) {
    event.preventDefault();

    const projectionAllergyListValue = document.getElementById('projectAllergyListUserInput').value;

    const response = await fetch('/project-allergy-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userInput: projectionAllergyListValue, // HERE
        }),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('projectAllergyListResultMsg');

    if (response.ok) {
        messageElement.textContent = "AllergyList projected successfully!";
        const resultHTML = `<pre>${JSON.stringify(responseData, null, 2)}</pre>`;
        messageElement.innerHTML = resultHTML;
    } else {
        console.error('Error fetching projection:', error);
        const messageElement = document.getElementById('projectAllergyListResultMsg');
        messageElement.textContent = `Unexpected error: ${error.message}`;
    }
}

async function groupByAllergyList(event) {
    event.preventDefault();

    // Get values directly from the form elements
    const groupByAllergyListValue = document.getElementById('groupByAllergyListUserInput').value;
    const groupByAllergyListAggregation = document.getElementById('groupByAllergyListAggregation').value;

    const response = await fetch('/group-allergy-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userInputGroupBy: groupByAllergyListValue,
            userInputAggregation: groupByAllergyListAggregation,
        }),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('groupByAllergyListResultMsg');

    if (response.ok) {
        messageElement.textContent = "AllergyList grouped successfully!";
        const resultHTML = `<pre>${JSON.stringify(responseData, null, 2)}</pre>`;
        messageElement.innerHTML = resultHTML;
    } else {
        console.error('Error fetching group by result:', responseData.error);
        messageElement.textContent = `Unexpected error: ${responseData.error}`;
    }
}


// async function groupByAllergyList(event) {
//     event.preventDefault();

//     const groupByAllergyListValue = document.getElementById('groupByAllergyListUserInput').value;
//     const groupByAllergyListAggregation = document.getElementById('groupByAllergyListAggregation').value;

//     const response = await fetch('/group-allergy-list', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             userInputGroupBy: groupByAllergyListValue,
//             userInputAggregation: groupByAllergyListAggregation,
//         }),
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('groupByAllergyListResultMsg');

//     if (response.ok) {
//         messageElement.textContent = "AllergyList grouped successfully!";
//         const resultHTML = `<pre>${JSON.stringify(responseData, null, 2)}</pre>`;
//         messageElement.innerHTML = resultHTML;
//     } else {
//         console.error('Error fetching group by result:', responseData.error);
//         messageElement.textContent = `Unexpected error: ${responseData.error}`;
//     }
// }


// async function groupByAllergyList(event) {
//     event.preventDefault();

//     const groupByAllergyListValue = document.getElementById('groupByAllergyListUserInputElement').value;
//     const groupByAllergyListAggregation = document.getElementById('groupByAllergyListUserInputAggregation').value;

//     const response = await fetch('/group-allergy-list', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             userInputGroupBy: groupByAllergyListValue, // HERE
//             userInputAggregation: groupByAllergyListAggregation,
//         }),
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('groupByAllergyListResultMsg');

//     if (response.ok) {
//         messageElement.textContent = "AllergyList grouped successfully!";
//         const resultHTML = `<pre>${JSON.stringify(responseData, null, 2)}</pre>`;
//         messageElement.innerHTML = resultHTML;
//     } else {
//         console.error('Error fetching projection:', error);
//         const messageElement = document.getElementById('groupByAllergyListResultMsg');
//         messageElement.textContent = `Unexpected error: ${error.message}`;
//     }
// }





// KitchenIngredient
async function fetchAndDisplayKitchenIngredient() {
    const response = await fetch('/kitchen-ingredient', {
        method: 'GET'
    });

    const responseData = await response.json();
    const kitchenIngredientContent = responseData.data;

    const tableElement = document.getElementById('kitcheningredient'); // from index.html tag
    const tableBody = tableElement.querySelector('tbody');

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    kitchenIngredientContent.forEach(kitcheningredient => {
        const row = tableBody.insertRow();
        kitcheningredient.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}



// // kitchenIngredient
// // DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement
// async function insertKitchenIngredient(event) {
//     event.preventDefault();

//     //const datePurchased = document.getElementById('insertKitchenIngredientDatePurchased').value;
//     //const formattedDatePurchased = new Date(datePurchased).toISOString().slice(0, 19).replace('T', ' ');
//     //const formattedDatePurchased = moment(datePurchased).format('YYYY-MM-DD HH:mm:ss');

//     const kitchenIngredientDatePurchased = Datetime(document.getElementById('insertKitchenIngredientDatePurchased').value);
//     // const kitchenIngredientDatePurchased = document.getElementById('insertKitchenIngredientDatePurchased').value);
//     const kitchenIngredientShelfLife = Number(document.getElementById('insertKitchenIngredientShelfLife').value);
//     const kitchenIngredientIngredientID = Number(document.getElementById('insertKitchenIngredientIngredientID').value);
//     const kitchenIngredientIngredientName = document.getElementById('insertKitchenIngredientIngredientName').value;
//     const kitchenIngredientIngredientListID = Number(document.getElementById('insertKitchenIngredientIngredientListID').value);
//     const kitchenIngredientAmount = Number(document.getElementById('insertKitchenIngredientAmount').value);
//     const kitchenIngredientUnitOfMeasurement = document.getElementById('insertKitchenIngredientUnitOfMeasurement').value;

//     console.log({
//         DatePurchased: formattedDatePurchased,
//         ShelfLife: kitchenIngredientShelfLife,
//         IngredientID: kitchenIngredientIngredientID,
//         IngredientName: kitchenIngredientIngredientName,
//         IngredientListID: kitchenIngredientIngredientListID,
//         Amount: kitchenIngredientAmount,
//         UnitOfMeasurement: kitchenIngredientUnitOfMeasurement,
//     });

//     const response = await fetch('/insert-kitchen-ingredient', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             DatePurchased: kitchenIngredientDatePurchased,
//             ShelfLife: kitchenIngredientShelfLife,
//             IngredientID: kitchenIngredientIngredientID,
//             IngredientName: kitchenIngredientIngredientName,
//             IngredientListID: kitchenIngredientIngredientListID,
//             Amount: kitchenIngredientAmount,
//             UnitOfMeasurement: kitchenIngredientUnitOfMeasurement,
//         })
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('insertKitchenIngredientResultMsg');

//     if (responseData.success) {
//         messageElement.textContent = "Kitchen Ingredient data inserted successfully!";
//         fetchTableData(); 
//     } else {
//         messageElement.textContent = "Error inserting Kitchen Ingredient data!";
//     }
// }

// async function updateKitchenIngredient(event) {
//     event.preventDefault();

    
//     const datePurchased2 = document.getElementById('updateKitchenIngredientDatePurchased').value;
//     // const formattedDatePurchased = new Date(datePurchased).toISOString().slice(0, 19).replace('T', ' ');
//     const formattedDatePurchased2 = moment(datePurchased2).format('YYYY-MM-DD HH:mm:ss');

//     const kitchenIngredientDatePurchasedValue = formattedDatePurchased2;
//     const kitchenIngredientShelfLifeValue = Number(document.getElementById('updateKitchenIngredientShelfLife').value);
//     const kitchenIngredientIngredientIDValue = Number(document.getElementById('updateKitchenIngredientIngredientID').value);
//     const kitchenIngredientIngredientNameValue = document.getElementById('updateKitchenIngredientIngredientName').value;
//     const kitchenIngredientIngredientListIDValue = Number(document.getElementById('updateKitchenIngredientIngredientListID').value);
//     const kitchenIngredientAmountValue = Number(document.getElementById('updateKitchenIngredientAmount').value);
//     const kitchenIngredientUnitOfMeasuremenValue = document.getElementById('updateKitchenIngredientUnitOfMeasurement').value;

//     const response = await fetch('/update-kitchen-ingredient', {
//         method: 'PATCH',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             DatePurchased: kitchenIngredientDatePurchasedValue,
//             ShelfLife: kitchenIngredientShelfLifeValue,
//             IngredientID: kitchenIngredientIngredientIDValue,
//             IngredientName: kitchenIngredientIngredientNameValue,
//             IngredientListID: kitchenIngredientIngredientListIDValue,
//             Amount: kitchenIngredientAmountValue,
//             UnitOfMeasurement: kitchenIngredientUnitOfMeasuremenValue,
//         })
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('updateKitchenIngredientResultMsg');

//     if (responseData.success) {
//         messageElement.textContent = "Kitchen Ingredient updated successfully!";
//         fetchTableData();
//     } else {
//         messageElement.textContent = "Error updating Kitchen Ingredient!";
//     }
// }

// async function deleteKitchenIngredient(event) {
//     event.preventDefault();

//     const kitchenIngredientIngredientIDDelete = Number(document.getElementById('deleteKitchenIngredientIngredientID').value);
//     const kitchenIngredientIngredientListIDDelete = Number(document.getElementById('deleteKitchenIngredientIngredientListID').value);


//     const response = await fetch('/delete-kitchen-ingredient', {
//         method: 'DELETE',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             IngredientID: kitchenIngredientIngredientIDDelete,
//             IngredientListID: kitchenIngredientIngredientListIDDelete,
//         })
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('deleteKitchenIngredientResultMsg');

//     if (responseData.success) {
//         messageElement.textContent = "Kitchen Ingredient deleted successfully!";
//         fetchTableData();
//     } else {
//         messageElement.textContent = "Error deleting Kitchen Ingredient!";
//     }
// }

// AllergyListHasAllergicIngredient
async function fetchAndDisplayAllergyListHasAllergicIngredient() {
    const response = await fetch('/allergy-list-has-allergic-ingredient', {
        method: 'GET'
    });

    const responseData = await response.json();
    const allergyListHasAllergicIngredientContent = responseData.data;

    const tableElement = document.getElementById('allergylisthasallergicingredient'); // from index.html tag
    const tableBody = tableElement.querySelector('tbody');

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    allergyListHasAllergicIngredientContent.forEach(allergylisthasallergicingredient => {
        const row = tableBody.insertRow();
        allergylisthasallergicingredient.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// IngredientListID, IngredientID, Severity
// async function insertAllergyListHasAllergicIngredient(event) {
//     event.preventDefault();

//     const allergyListHasAllergicIngredientIngredientListID = Number(document.getElementById('insertAllergyListHasAllergicIngredientIngredientListID').value);
//     const allergyListHasAllergicIngredientIngredientID = Number(document.getElementById('insertAllergyListHasAllergicIngredientIngredientID').value);
//     const allergyListHasAllergicIngredientSeverity = Number(document.getElementById('insertAllergyListHasAllergicIngredientSeverity').value);


//     const response = await fetch('/insert-allergy-list-has-allergic-ingredient', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             IngredientListID: allergyListHasAllergicIngredientIngredientListID,
//             IngredientID: allergyListHasAllergicIngredientIngredientID,
//             Severity: allergyListHasAllergicIngredientSeverity, 
//         })
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('insertAllergyListHasAllergicIngredientResultMsg');

//     if (responseData.success) {
//         messageElement.textContent = "AllergyListHasAllergicIngredient data inserted successfully!";
//         fetchTableData(); 
//     } else {
//         messageElement.textContent = "Error inserting AllergyListHasAllergicIngredient data!";
//     }
// }

// async function updateAllergyListHasAllergicIngredient(event) {
//     event.preventDefault();

//     const allergyListHasAllergicIngredientIngredientListIDValue = Number(document.getElementById('updateAllergyListHasAllergicIngredientIngredientListID').value);
//     const allergyListHasAllergicIngredientIngredientIDValue = Number(document.getElementById('updateAllergyListHasAllergicIngredientIngredientID').value);
//     const allergyListHasAllergicIngredientSeverityValue = Number(document.getElementById('updateAllergyListHasAllergicIngredientSeverity').value);

//     const response = await fetch('/update-allergy-list-has-allergic-ingredient', {
//         method: 'PATCH',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             IngredientListID: allergyListHasAllergicIngredientIngredientListIDValue,
//             IngredientID: allergyListHasAllergicIngredientIngredientIDValue,
//             Severity: allergyListHasAllergicIngredientSeverityValue, 
//         })
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('updateAllergyListHasAllergicIngredientResultMsg');

//     if (responseData.success) {
//         messageElement.textContent = "AllergyListHasAllergicIngredient updated successfully!";
//         fetchTableData();
//     } else {
//         messageElement.textContent = "Error updating AllergyListHasAllergicIngredient!";
//     }
// }

// async function deleteAllergyListHasAllergicIngredient(event) {
//     event.preventDefault();

//     const allergyListHasAllergicIngredientIngredientListIDDelete = Number(document.getElementById('deleteAllergyListHasAllergicIngredientIngredientListID').value);
//     const allergyListHasAllergicIngredientIngredientIDDelete = Number(document.getElementById('deleteAllergyListHasAllergicIngredientIngredientID').value);

//     const response = await fetch('/delete-kitchen-ingredient', {
//         method: 'DELETE',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             IngredientID: allergyListHasAllergicIngredientIngredientListIDDelete,
//             IngredientListID: allergyListHasAllergicIngredientIngredientIDDelete,
//         })
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('deleteAllergyListHasAllergicIngredientResultMsg');

//     if (responseData.success) {
//         messageElement.textContent = "AllergyListHasAllergicIngredient deleted successfully!";
//         fetchTableData();
//     } else {
//         messageElement.textContent = "Error deleting AllergyListHasAllergicIngredient!";
//     }
// }




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

    // user centric


    // recipe centric
    document.getElementById("insertRecipe").addEventListener("submit", insertRecipe);
    document.getElementById("updateRecipe").addEventListener("submit", updateRecipe);
    document.getElementById("deleteRecipe").addEventListener("submit", deleteRecipe);
    document.getElementById("fetchARecipesIngredients").addEventListener("submit", fetchAndDisplayARecipesIngredients);
    document.getElementById("insertRecipeIngredient").addEventListener("submit", insertRecipeIngredient);
    document.getElementById("updateRecipeIngredient").addEventListener("submit", updateRecipeIngredient);
    document.getElementById("deleteRecipeIngredient").addEventListener("submit", deleteRecipeIngredient);
    document.getElementById("fetchARecipesStep").addEventListener("submit", fetchAndDisplayARecipesSteps);
    document.getElementById("insertRecipeStep").addEventListener("submit", insertRecipeStep);
    document.getElementById("updateRecipeStep").addEventListener("submit", updateRecipeStep);
    document.getElementById("deleteRecipeStep").addEventListener("submit", deleteRecipeStep);
    document.getElementById("insertCategory").addEventListener("submit", insertCategory);
    document.getElementById("updateCategory").addEventListener("submit", updateCategory);
    document.getElementById("deleteCategory").addEventListener("submit", deleteCategory);
    document.getElementById("insertRecipeToCategory").addEventListener("submit", insertRecipeIntoCategory);
    document.getElementById("deleteRecipeFromCategory").addEventListener("submit", deleteRecipeFromCategory);
    document.getElementById("filterRecipesForm").addEventListener("submit", fetchAndDisplayFilteredRecipes);
    document.getElementById("filterByRecipeListForm").addEventListener("submit", fetchAndDisplayRecipesByRecipeList);
    document.getElementById("insertRecipeList").addEventListener("submit", insertRecipeList);
    document.getElementById("updateRecipeList").addEventListener("submit", updateRecipeList);
    document.getElementById("deleteRecipeList").addEventListener("submit", deleteRecipeList);
    document.getElementById("insertRecipeToRecipeList").addEventListener("submit", insertRecipeToRecipeList);
    document.getElementById("deleteRecipeFromRecipeList").addEventListener("submit", deleteRecipeFromRecipeList);
    document.getElementById("simpleOrComplicatedRecipes").addEventListener("submit", fetchAndDisplaySimpleOrComplicatedRecipes);


    // ingredient centric
    document.getElementById("insertAllergicIngredient").addEventListener("submit", insertAllergicIngredient);
    document.getElementById("updateAllergicIngredient").addEventListener("submit", updateAllergicIngredient);
    document.getElementById("deleteAllergicIngredient").addEventListener("submit", deleteAllergicIngredient);

    document.getElementById("insertAllergyList").addEventListener("submit", insertAllergyList);
    document.getElementById("updateAllergyList").addEventListener("submit", updateAllergyList);
    document.getElementById("deleteAllergyList").addEventListener("submit", deleteAllergyList);

    document.getElementById("projectAllergyList").addEventListener("submit", projectAllergyList);
    document.getElementById("groupByAllergyList").addEventListener("submit", groupByAllergyList);

    // document.getElementById("insertKitchenIngredient").addEventListener("submit", insertKitchenIngredient);
    // document.getElementById("updateKitchenIngredient").addEventListener("submit", updateKitchenIngredient);
    // document.getElementById("deleteKitchenIngredient").addEventListener("submit", deleteKitchenIngredient);

    // document.getElementById("insertAllergyListHasAllergicIngredient").addEventListener("submit", insertAllergyListHasAllergicIngredient);
    // document.getElementById("updateAllergyListHasAllergicIngredient").addEventListener("submit", updateAllergyListHasAllergicIngredient);
    // document.getElementById("deleteAllergyListHasAllergicIngredient").addEventListener("submit", deleteAllergyListHasAllergicIngredient);



    // general
    document.getElementById("resetTables").addEventListener("click", resetTables);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    // Recipe Centric
    fetchAndDisplayCategories();
    fetchAndDisplayRecipeLists();
    fetchAndDisplayRecipes();
    fetchAndDisplayFilteredRecipes();
    // Ingredient Centric
    fetchAndDisplayAllergicIngredient();
    fetchAndDisplayAllergyList();
    fetchAndDisplayKitchenIngredient();
    fetchAndDisplayAllergyListHasAllergicIngredient();
}
