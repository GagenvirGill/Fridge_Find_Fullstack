const oracledb = require('oracledb');
const fs = require('fs');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

// ----------------------------------------------------------
// User Centric service



// ----------------------------------------------------------
// Recipe Centric service

async function fetchRecipeFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Recipe');

        console.log('Fetched Recipes Successfully');
        return result.rows;
    }).catch((error) => {
        console.error('Database error:', error);
        return [];
    });
}

async function fetchSimpleOrComplicatedRecipesFromDb(Difficulty) {
    return await withOracleDB(async (connection) => {
        let query = `SELECT r.*, (SELECT COUNT(*) FROM RecipeIngredient ri WHERE ri.RecipeID = r.RecipeID), (SELECT COUNT(*) FROM RecipeStep rs WHERE rs.RecipeID = r.RecipeID) FROM Recipe r WHERE (SELECT COUNT(*) FROM RecipeIngredient ri WHERE ri.RecipeID = r.RecipeID) `;

        if (Difficulty === 'Simple') {
            query += `< `;
        } else if (Difficulty === 'Complicated') {
            query += `> `;
        }

        query += `(SELECT AVG(IngredientCount) FROM (SELECT COUNT(*) AS IngredientCount FROM RecipeIngredient GROUP BY RecipeID)) AND (SELECT COUNT(*) FROM RecipeStep rs WHERE rs.RecipeID = r.RecipeID) `;

        if (Difficulty === 'Simple') {
            query += `< `;
        } else if (Difficulty === 'Complicated') {
            query += `> `;
        }

        query += `(SELECT AVG(StepCount) FROM (SELECT COUNT(*) AS StepCount FROM RecipeStep GROUP BY RecipeID))`;

        const result = await connection.execute(query);

        console.log(`Fetched ${Difficulty} Recipes Successfully`);
        return result.rows;
    }).catch((error) => {
        console.error('Database error:', error);
        return [];
    });
}

async function fetchCategoryFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT CategoryName FROM Category');

        console.log('Fetched Categories Successfully');
        return result.rows;
    }).catch((error) => {
        console.error('Database error:', error);
        return [];
    });
}

async function fetchFilteredRecipesFromDb(Categories) {
    return await withOracleDB(async (connection) => {
        const bindVariables = {};

        let formattedValues = Categories.map((category, index) => `:Category${index}`).join(', ');

        Categories.forEach((category, index) => {
            bindVariables[`Category${index}`] = category;
        });

        const query = `
            SELECT rhc.CategoryName, r.*
            FROM Recipe r
            JOIN RecipeHasCategory rhc ON r.RecipeID = rhc.RecipeID
            WHERE rhc.CategoryName IN (${formattedValues})
        `;

        const result = await connection.execute(query, bindVariables);

        console.log('Fetched Filtered Recipes Successfully');
        return result.rows;
    }).catch((error) => {
        console.error('Database error:', error);
        return [];
    });
}

async function fetchRecipeListFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM RecipeList');

        console.log('Fetched Recipe Lists Successfully');
        return result.rows;
    }).catch((error) => {
        console.error('Database error:', error);
        return [];
    });
}

async function fetchRecipesByRecipeListFromDb(RecipeListID) {
    return await withOracleDB(async (connection) => {
        console.log(RecipeListID);
        const query = `
            SELECT r.*
            FROM Recipe r
            JOIN RecipeListHasRecipe rlhr ON r.RecipeID = rlhr.RecipeID
            WHERE rlhr.RecipeListID=:RecipeListID
        `;

        const result = await connection.execute(query, [RecipeListID]);

        console.log('Fetched Recipes by Recipe List Successfully');
        return result.rows;
    }).catch((error) => {
        console.error('Database error:', error);
        return [];
    });
}

async function insertRecipe(RecipeID, RecipeName, PrivacyLevel, Username) {
    // validate username
    const isUsernameValid = await validateUsername(Username);

    // If it doesnt return false
    if (!isUsernameValid) {
        return false;
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Recipe(RecipeID, RecipeName, PrivacyLevel, Username) VALUES(: RecipeID, : RecipeName, : PrivacyLevel, : Username)`,
            [RecipeID, RecipeName, PrivacyLevel, Username],
            { autoCommit: true }
        );

        console.log('Inserted Recipe Successfully');
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function updateRecipe(RecipeID, NewRecipeName, NewPrivacyLevel) {
    let query = `UPDATE Recipe SET`;
    let queryParams = [];

    if (NewRecipeName == "" && NewPrivacyLevel != "Do Not Change") {
        query += `PrivacyLevel =: NewPrivacyLevel`;
        queryParams.push(NewPrivacyLevel);
    } else if (NewRecipeName != "" && NewPrivacyLevel == "Do Not Change") {
        query += `RecipeName =: NewRecipeName`;
        queryParams.push(NewRecipeName);
    } else {
        query += `RecipeName =: NewRecipeName, PrivacyLevel =: NewPrivacyLevel`;
        queryParams.push(NewRecipeName);
        queryParams.push(NewPrivacyLevel);
    }

    query += ` WHERE RecipeID =: RecipeID`;
    queryParams.push(RecipeID);

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            query,
            queryParams,
            { autoCommit: true }
        );

        console.log('Updated Recipe Successfully');
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function deleteRecipe(RecipeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM Recipe WHERE RecipeID=:RecipeID',
            [RecipeID],
            { autoCommit: true }
        );

        console.log('Deleted Recipe Successfully');
        return result.rowsAffected && result.rowsAffected > 0;;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function fetchRecipeIngredientsForRecipeFromDb(RecipeID) {
    const intRecipeID = parseInt(RecipeID, 10);

    if (isNaN(intRecipeID)) {
        console.log('invalid Recipe ID')
        return false;
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT ri.*
        FROM RecipeIngredient ri 
            JOIN Recipe r ON r.RecipeID = ri.RecipeID 
            WHERE ri.RecipeID =: RecipeID`,
            [intRecipeID]
        );

        console.log('Fetched Recipe Ingredients for Recipe Successfully');
        return result.rows;
    }).catch((error) => {
        console.error('Database error:', error);
        return [];
    });
}

async function fetchRecipesName(RecipeID) {
    const intRecipeID = parseInt(RecipeID, 10);

    if (isNaN(intRecipeID)) {
        console.log('invalid Recipe ID')
        return false;
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT RecipeName
            FROM Recipe
            WHERE RecipeID =: RecipeID`,
            [intRecipeID]
        );

        console.log('Fetched a Recipes Name Succesfully');
        return result.rows;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function insertRecipeIngredient(RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeIngredient(IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES(: RecipeIngredientID, : RecipeIngredientName, : RecipeID, : Amount, : UnitOfMeasurement)`,
            [RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement],
            { autoCommit: true }
        );

        console.log('Inserted Recipe Ingredient Successfully');
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function updateRecipeIngredient(RecipeIngredientID, RecipeID, NewRecipeIngredientName, NewAmount, NewUnitOfMeasurement) {
    let queryParams = [];
    let querySetClauses = [];

    if (NewRecipeIngredientName != "") {
        querySetClauses.push(`IngredientName =: NewRecipeIngredientName`);
        queryParams.push(NewRecipeIngredientName);
    }
    if (NewAmount != "") {
        querySetClauses.push(`Amount =: NewAmount`);
        queryParams.push(NewAmount);
    }
    if (NewUnitOfMeasurement != "Do Not Change") {
        querySetClauses.push(`UnitOfMeasurement =: NewUnitOfMeasurement`);
        queryParams.push(NewUnitOfMeasurement);
    }

    let query = `UPDATE RecipeIngredient SET`;
    query += querySetClauses.join(`, `);
    query += ` WHERE IngredientID =: RecipeIngredientID AND RecipeID =: RecipeID`;
    queryParams.push(RecipeIngredientID);
    queryParams.push(RecipeID);

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            query,
            queryParams,
            { autoCommit: true }
        );

        console.log('Updated Recipe Ingredient Successfully');
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function deleteRecipeIngredient(RecipeIngredientID, RecipeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM RecipeIngredient WHERE IngredientID=:RecipeIngredientID AND RecipeID=:RecipeID',
            [RecipeIngredientID, RecipeID],
            { autoCommit: true }
        );
        console.log('Deleted Recipe Ingredient Successfully');
        return result.rowsAffected && result.rowsAffected > 0;;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function fetchRecipeStepsForRecipe(RecipeID) {
    const intRecipeID = parseInt(RecipeID, 10);

    if (isNaN(intRecipeID)) {
        return false;
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT rs.*
        FROM RecipeStep rs 
            JOIN Recipe r ON r.RecipeID = rs.RecipeID 
            WHERE rs.RecipeID =: RecipeID`,
            [intRecipeID]
        );

        console.log('Fetched Recipe Steps for Recipe Successfully');
        return result.rows;
    }).catch((error) => {
        console.error('Database error:', error);
        return [];
    });
}

async function insertRecipeStep(RecipeID, StepNumber, StepInformation) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeStep(RecipeID, StepNumber, StepInformation) VALUES(: RecipeID, : StepNumber, : StepInformation)`,
            [RecipeID, StepNumber, StepInformation],
            { autoCommit: true }
        );

        console.log('Inserted Recipe Step Successfully');
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function updateRecipeStep(RecipeID, OldStepNumber, NewStepNumber, NewStepInformation) {
    let queryParams = [];
    let querySetClauses = [];

    if (NewStepNumber != "") {
        querySetClauses.push(`StepNumber =: NewStepNumber`);
        queryParams.push(NewStepNumber);
    }
    if (NewStepInformation != "") {
        querySetClauses.push(`StepInformation =: NewStepInformation`);
        queryParams.push(NewStepInformation);
    }

    let query = `UPDATE RecipeStep SET`;
    query += querySetClauses.join(`, `);
    query += ` WHERE StepNumber =: OldStepNumber AND RecipeID =: RecipeID`;
    queryParams.push(OldStepNumber);
    queryParams.push(RecipeID);

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            query,
            queryParams,
            { autoCommit: true }
        );

        console.log('Updated Recipe Step Successfully')
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function deleteRecipeStep(RecipeID, StepNumber) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM RecipeStep WHERE StepNumber=:StepNumber AND RecipeID=:RecipeID',
            [StepNumber, RecipeID],
            { autoCommit: true }
        );

        console.log('Deleted Recipe Step Successfully');
        return result.rowsAffected && result.rowsAffected > 0;;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function insertCategory(CategoryName, CategoryDescription) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Category(CategoryName, CategoryDescription) VALUES(: CategoryName, : CategoryDescription)`,
            [CategoryName, CategoryDescription],
            { autoCommit: true }
        );

        console.log('Inserted Category Successfully');
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function updateCategory(CategoryName, NewCategoryDescription) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Category SET CategoryDescription =: NewCategoryDescription WHERE CategoryName =: CategoryName`,
            [NewCategoryDescription, CategoryName],
            { autoCommit: true }
        );

        console.log('Updated Category Successfully');
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function deleteCategory(CategoryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM Category WHERE CategoryName=:CategoryName',
            [CategoryName],
            { autoCommit: true }
        );

        console.log('Deleted Category Successfully');
        return result.rowsAffected && result.rowsAffected > 0;;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function insertRecipeIntoCategory(RecipeID, CategoryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeHasCategory(RecipeID, CategoryName) VALUES(: RecipeID, : CategoryName)`,
            [RecipeID, CategoryName],
            { autoCommit: true }
        );

        console.log('Inserted Recipe into Category Successfully');
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function deleteRecipeFromCategory(RecipeID, CategoryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM RecipeHasCategory WHERE RecipeID=:RecipeID AND CategoryName=:CategoryName',
            [RecipeID, CategoryName],
            { autoCommit: true }
        );

        console.log('Deleted Recipe from Category Successfully');
        return result.rowsAffected && result.rowsAffected > 0;;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function fetchRecipeList(RecipeListID) {
    const intRecipeListID = parseInt(RecipeListID, 10);

    if (isNaN(intRecipeListID)) {
        console.log('invalid Recipe List ID')
        return false;
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT RecipeListID, RecipeListName, Username
            FROM RecipeList
            WHERE RecipeListID =: RecipeListID`,
            [intRecipeListID]
        );

        console.log('Fetched a Recipe Lists Values Succesfully');
        return result.rows;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function insertRecipeList(RecipeListID, RecipeListName, PrivacyLevel, Username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeList(RecipeListID, RecipeListName, PrivacyLevel, Username) VALUES(:RecipeListID, :RecipeListName, :PrivacyLevel, :Username)`,
            [RecipeListID, RecipeListName, PrivacyLevel, Username],
            { autoCommit: true }
        );

        console.log('Inserted Recipe List Successfully');
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function updateRecipeList(RecipeListID, RecipeListName, PrivacyLevel) {
    return await withOracleDB(async (connection) => {
        let queryParams = [];
        let querySetClauses = [];

        if (RecipeListName != "") {
            querySetClauses.push(`RecipeListName =: RecipeListName`);
            queryParams.push(RecipeListName);
        }
        if (PrivacyLevel != "Do Not Change") {
            querySetClauses.push(`PrivacyLevel =: PrivacyLevel`);
            queryParams.push(PrivacyLevel);
        }

        let query = `UPDATE RecipeList SET `;
        query += querySetClauses.join(`, `);
        query += ` WHERE RecipeListID =: RecipeListID`;
        queryParams.push(RecipeListID);

        const result = await connection.execute(
            query,
            queryParams,
            { autoCommit: true }
        );

        console.log('Updated Recipe List Successfully');
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function deleteRecipeList(RecipeListID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM RecipeList WHERE RecipeListID=:RecipeListID',
            [RecipeListID],
            { autoCommit: true }
        );

        console.log('Deleted Recipe List Successfully');
        return result.rowsAffected && result.rowsAffected > 0;;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function insertRecipeIntoRecipeList(RecipeID, RecipeListID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeListHasRecipe(RecipeListID, RecipeID) VALUES(: RecipeListID, : RecipeID)`,
            [RecipeListID, RecipeID],
            { autoCommit: true }
        );

        console.log('Inserted Recipe into Recipe List Successfully');
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function deleteRecipeFromRecipeList(RecipeID, RecipeListID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM RecipeListHasRecipe WHERE RecipeID=:RecipeID AND RecipeListID=:RecipeListID',
            [RecipeID, RecipeListID],
            { autoCommit: true }
        );

        console.log('Deleted Recipe from Recipe List Successfully');
        return result.rowsAffected && result.rowsAffected > 0;;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}


// ----------------------------------------------------------
// Ingredient Centric service

// AllergicIngredient
async function fetchAllergicIngredientFromDb() {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute('SELECT * FROM AllergicIngredient');
            return result.rows;
        });
    } catch(error) {
        console.error('Database error:', error);
        return [];
    }
}

async function insertAllergicIngredient(IngredientID, IngredientName) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                `INSERT INTO AllergicIngredient(IngredientID, IngredientName) VALUES (:IngredientID, :IngredientName)`,
                [IngredientID, IngredientName],
                { autoCommit: true }
            );

            console.log('Inserted AllergicIngredient Successfully')
            return result.rowsAffected && result.rowsAffected > 0;
        });
    } catch(error) {
        console.error('Database error:', error);
        return false;
    }
}

async function updateAllergicIngredient(IngredientID, newIngredientName) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                `UPDATE AllergicIngredient 
                 SET IngredientName = :newIngredientName
                 WHERE IngredientID = :IngredientID`,
                 [newIngredientName, IngredientID],
                { autoCommit: true }
            );

            console.log('Updated Allergic Ingredient Successfully')
            return result.rowsAffected && result.rowsAffected > 0;
        });
    } catch(error) {
        console.error('Database error:', error);
        return false;
    };
}

async function deleteAllergicIngredient(IngredientID) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                'DELETE FROM AllergicIngredient WHERE IngredientID=:IngredientID',
                [IngredientID],
                { autoCommit: true }
            );
            console.log('Deleted Allergic Ingredient Successfully')
            return result.rowsAffected && result.rowsAffected > 0;;
        });
    } catch(error) {
        console.error('Database error:', error);
        return false;
    }
}

// AllergyList
async function fetchAllergyListFromDb() {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute('SELECT * FROM AllergyList');
            return result.rows;
        });
    } catch(error) {
        console.error('Database error:', error);
        return [];
    }
}

// IngredientListID, PrivacyLevel, ListDescription, Username, ListName
async function insertAllergyList(IngredientListID, PrivacyLevel, ListDescription, Username, ListName) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                `INSERT INTO AllergyList(IngredientListID, PrivacyLevel, ListDescription, Username, ListName) 
                VALUES (:IngredientListID, :PrivacyLevel, :ListDescription, :Username, :ListName)`,
                [IngredientListID, PrivacyLevel, ListDescription, Username, ListName],
                { autoCommit: true }
            );

            console.log('Inserted AllergyList Successfully')
            return result.rowsAffected && result.rowsAffected > 0;
        });
    } catch(error) {
        console.error('Database error:', error);
        return false;
    }
}

 // Gives me an error - number TODO
async function updateAllergyList(IngredientListID, newPrivacyLevel, newListDescription, newUsername, newListName) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                `UPDATE AllergyList 
                 SET PrivacyLevel = :newPrivacyLevel, ListDescription = :newListDescription, Username = :newUsername, ListName = :newListName
                 WHERE IngredientListID = :IngredientListID`,
                 [IngredientListID, newPrivacyLevel, newListDescription, newUsername, newListName],
                { autoCommit: true }
            );

            console.log('Updated AllergyList Successfully')
            return result.rowsAffected && result.rowsAffected > 0;
        });
    } catch(error) {
        console.error('Database error:', error);
        return false;
    };
}

async function deleteAllergyList(IngredientListID) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                'DELETE FROM AllergyList WHERE IngredientListID=:IngredientListID',
                [IngredientListID],
                { autoCommit: true }
            );
            console.log('Deleted AllergyList Successfully')
            return result.rowsAffected && result.rowsAffected > 0;;
        });
    } catch(error) {
        console.error('Database error:', error);
        return false;
    }
}

// KitchenIngredient
async function fetchKitchenIngredientFromDb() {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute('SELECT * FROM KitchenIngredient');
            return result.rows;
        });
    } catch(error) {
        console.error('Database error:', error);
        return [];
    }
}

async function insertKitchenIngredient(DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement) {
    try {
        const formattedDatePurchased = moment(DatePurchased).utcOffset(0).format('YYYY-MM-DD HH:mm:ss');

        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                `INSERT INTO KitchenIngredient(DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement) 
                VALUES (:DatePurchased, :ShelfLife, :IngredientID, :IngredientName, :IngredientListID, :Amount, :UnitOfMeasurement)`,
                [DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement],
                { autoCommit: true }
            );

            console.log('Inserted Kitchen Ingredient Successfully')
            return result.rowsAffected && result.rowsAffected > 0;
        });
    } catch(error) {
        console.error('Database error:', error);
        return false;
    }
}

async function updateKitchenIngredient(newDatePurchased, newShelfLife, IngredientID, newIngredientName, IngredientListID, newAmount, newUnitOfMeasurement) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                `UPDATE KitchenIngredient 
                 SET DatePurchased = :newDatePurchased, ShelfLife = :newShelfLife, IngredientName = :newIngredientName, Amount = :newAmount, UnitOfMeasurement =: newUnitOfMeasurement
                 WHERE IngredientID = :IngredientID AND IngredientListID = :IngredientListID`,
                 [newDatePurchased, newShelfLife, IngredientID, newIngredientName, IngredientListID, newAmount, newUnitOfMeasurement],
                { autoCommit: true }
            );

            console.log('Updated Kitchen Ingredient Successfully')
            return result.rowsAffected && result.rowsAffected > 0;
        });
    } catch(error) {
        console.error('Database error:', error);
        return false;
    };
}

async function deleteKitchenIngredient(IngredientID, IngredientListID) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                'DELETE FROM KitchenIngredient WHERE IngredientID=:IngredientID AND IngredientListID = :IngredientListID',
                [IngredientID, IngredientListID],
                { autoCommit: true }
            );
            console.log('Deleted KitchenIngredient Successfully')
            return result.rowsAffected && result.rowsAffected > 0;;
        });
    } catch(error) {
        console.error('Database error:', error);
        return false;
    }
}


// ----------------------------------------------------------
// General service methods

async function validateUsername(Username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(*) AS count FROM AppUser WHERE Username =: Username`,
            [Username]
        )

        console.log('Username Validated Successfully');
        return result.rows[0][0] > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function initiateTables() {
    return await withOracleDB(async (connection) => {
        const initializationQueries = fs.readFileSync('database_initialization.sql', 'utf8')
            .split(';')
            .map(query => query.trim())
            .filter(query => query.length > 0);

        for (const query of initializationQueries) {
            try {
                await connection.execute(query)
            } catch (err) {
                console.log(`An error executing query" ${query}`);
                console.log(err);
            }
        }

        console.log('Database Tables Initialized Successfully');
        return true;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}


// ----------------------------------------------------------

module.exports = {
    testOracleConnection,
    // User Centric


    // Recipe Centric
    fetchRecipeFromDb,
    fetchSimpleOrComplicatedRecipesFromDb,
    fetchCategoryFromDb,
    fetchFilteredRecipesFromDb,
    fetchRecipeListFromDb,
    fetchRecipesByRecipeListFromDb,
    insertRecipe,
    updateRecipe,
    deleteRecipe,
    fetchRecipeIngredientsForRecipeFromDb,
    fetchRecipesName,
    insertRecipeIngredient,
    updateRecipeIngredient,
    deleteRecipeIngredient,
    fetchRecipeStepsForRecipe,
    insertRecipeStep,
    updateRecipeStep,
    deleteRecipeStep,
    insertCategory,
    updateCategory,
    deleteCategory,
    insertRecipeIntoCategory,
    deleteRecipeFromCategory,
    fetchRecipeList,
    insertRecipeList,
    updateRecipeList,
    deleteRecipeList,
    insertRecipeIntoRecipeList,
    deleteRecipeFromRecipeList,

    // Ingredient Centric
    fetchAllergicIngredientFromDb,
    insertAllergicIngredient,
    updateAllergicIngredient,
    deleteAllergicIngredient,
    fetchAllergyListFromDb, 
    insertAllergyList,
    updateAllergyList,
    deleteAllergyList,
    fetchKitchenIngredientFromDb,
    insertKitchenIngredient,
    deleteKitchenIngredient,

    // General
    validateUsername,
    initiateTables,
};