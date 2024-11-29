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
async function fetchUserFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM AppUser');
        return result.rows;
    }).catch((error) => {
        console.error('Error fetching users:', error);
        return [];
    });
}

async function insertUser(Username, Email, FullName, DefaultPrivacyLevel) {
    if (!Username || !Email || !FullName) {
        throw new Error('Required fields (Username, Email, FullName) are missing');
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO AppUser(Username, Email, FullName, DefaultPrivacyLevel) VALUES (:Username, :Email, :FullName, :DefaultPrivacyLevel)`,
            [Username, Email, FullName, DefaultPrivacyLevel || 'Private'],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Error inserting user:', error);
        return false;
    });
}

async function deleteUser(Username) {
    const isUsernameValid = await validateUsername(Username);
    if (!isUsernameValid) {
        return { success: false, message: `This username does not exist` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM AppUser WHERE Username=:Username',
            [Username],
            { autoCommit: true }
        );
        console.log('Deleted AppUser Successfully')
        return { success: result.rowsAffected && result.rowsAffected > 0 };
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function updateUser(Username, NewEmail, NewFullName, NewDefaultPrivacyLevel) {
    const isUsernameValid = await validateUsername(Username);

    if (!isUsernameValid) {
        return { success: false, message: `This username does not exist` };
    }

    let queryParams = [];
    let querySetClauses = [];

    if (NewEmail != "") {
        querySetClauses.push(`Email =: NewEmail`);
        queryParams.push(NewEmail);
    }
    if (NewFullName != "") {
        querySetClauses.push(`FullName =: NewFullName`);
        queryParams.push(NewFullName);
    }
    if (NewDefaultPrivacyLevel != "Do Not Change") {
        querySetClauses.push(`DefaultPrivacyLevel =: NewDefaultPrivacyLevel`);
        queryParams.push(NewDefaultPrivacyLevel);
    }

    let query = `UPDATE AppUser SET `;
    query += querySetClauses.join(`, `);
    query += ` WHERE Username =: Username`;
    queryParams.push(Username);

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            query,
            queryParams,
            { autoCommit: true }
        );

        console.log('Updated User Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully updated User` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while updating User` };
    });
}



async function viewUsersWithPublicPrivacy() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT Username, Email, FullName
             FROM AppUser
             WHERE DefaultPrivacyLevel = 'Public'`
        );

        return result.rows;
    }).catch((error) => {
        console.error('Error fetching users with public privacy level:', error);
        return [];
    });
}

async function viewUsersWhoAreFriendsWithEveryone() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT u.Username
             FROM AppUser u
             WHERE NOT EXISTS (
                 SELECT a.Username
                 FROM AppUser a
                 WHERE a.Username != u.Username
                   AND NOT EXISTS (
                     SELECT 1
                     FROM Friends f
                     WHERE (f.Username1 = u.Username AND f.Username2 = a.Username)
                        OR (f.Username1 = a.Username AND f.Username2 = u.Username)
                 )
             )`
        );
        return result.rows;
    }).catch((error) => {
        console.error('Error fetching users who are friends with everyone:', error);
        return [];
    });
}

// async function insertFriend(username1, username2) {
//     if (!username1 || !username2) {
//         throw new Error("Both 'username1' and 'username2' are required.");
//     }
//     if (username1 === username2) {
//         throw new Error("'username1' and 'username2' cannot be the same.");
//     }

//     return await withOracleDB(async (connection) => {
//         const result = await connection.execute(
//             `INSERT INTO Friends (Username1, Username2, DateAndTimeCreated)
//              VALUES (:username1, :username2, SYSTIMESTAMP)`,
//             [username1, username2],
//             { autoCommit: true }
//         );

//         return result.rowsAffected && result.rowsAffected > 0;
//     }).catch((error) => {
//         console.error('Error inserting friend:', error);
//         return false;
//     });
// }

// async function deleteFriend(username1, username2) {
//     return await withOracleDB(async (connection) => {
//         const result = await connection.execute(
//             `DELETE FROM Friends
//              WHERE (Username1 = :username1 AND Username2 = :username2)
//                 OR (Username1 = :username2 AND Username2 = :username1)`,
//             [username1, username2],
//             { autoCommit: true }
//         );

//         return result.rowsAffected && result.rowsAffected > 0;
//     }).catch((error) => {
//         console.error('Error deleting friend:', error);
//         return false;
//     });
// }

// async function areTheyFriends(username1, username2) {
//     return await withOracleDB(async (connection) => {
//         const result = await connection.execute(
//             `SELECT * FROM Friends
//              WHERE (Username1 = :username1 AND Username2 = :username2)
//                 OR (Username1 = :username2 AND Username2 = :username1)`,
//             [username1, username2]
//         );

//         return result.rows.length > 0;
//     }).catch((error) => {
//         console.error('Error checking friend relationship:', error);
//         return false;
//     });
// }

// ----------------------------------------------------------
// Recipe Centric service

async function fetchRecipeFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Recipe');

        console.log('Fetched Recipes Successfully');
        return { success: true, data: result.rows };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, data: [] };
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
        return { success: true, data: result.rows };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, data: [] };
    });
}

async function fetchCategoryFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT CategoryName FROM Category');

        console.log('Fetched Categories Successfully');
        return { success: true, data: result.rows };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, data: [] };
    });
}

async function fetchRecipesByCategoryFromDb(Categories) {
    return await withOracleDB(async (connection) => {
        // NOTE: Do not need to check that the categories exist as we dynamically display
        //       all existing categories to the user in the select bar
        //       so therefore all categories submitted to this method, are guaranteed to exist
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
        return { success: true, data: result.rows };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, data: [] };
    });
}

async function fetchRecipeListFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM RecipeList');

        console.log('Fetched Recipe Lists Successfully');
        return { success: true, data: result.rows };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, data: [] };
    });
}

async function fetchRecipesByRecipeListFromDb(RecipeListID) {
    return await withOracleDB(async (connection) => {
        // NOTE: Do not need to check that the RecipeListID exists as we dynamically display
        //       all existing RecipeLists to the user in the select bar
        //       so therefore all RecipeListIDs that are submitted to this method, are guaranteed to exist

        const query = `
            SELECT r.*
            FROM Recipe r
            JOIN RecipeListHasRecipe rlhr ON r.RecipeID = rlhr.RecipeID
            WHERE rlhr.RecipeListID=:RecipeListID
        `;

        const result = await connection.execute(query, [RecipeListID]);

        console.log('Fetched Recipes by Recipe List Successfully');
        return { success: true, data: result.rows };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, data: [] };
    });
}

async function insertRecipe(RecipeID, RecipeName, PrivacyLevel, Username) {
    const isUsernameValid = await validateUsername(Username);
    if (!isUsernameValid) {
        return { success: false, message: `A User with the Username \'${Username}\' does not exist` };
    }

    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' already exists` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Recipe(RecipeID, RecipeName, PrivacyLevel, Username) VALUES(: RecipeID, : RecipeName, : PrivacyLevel, : Username)`,
            [RecipeID, RecipeName, PrivacyLevel, Username],
            { autoCommit: true }
        );

        console.log('Inserted Recipe Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully created \'${RecipeName}\' Recipe` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while creating the Recipe` };
    });
}

async function updateRecipe(RecipeID, NewRecipeName, NewPrivacyLevel) {
    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    let query = `UPDATE Recipe SET `;
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
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully updated Recipe with ID \'${RecipeID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while updating the Recipe` };
    });
}

async function deleteRecipe(RecipeID) {
    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM Recipe WHERE RecipeID=:RecipeID',
            [RecipeID],
            { autoCommit: true }
        );

        console.log('Deleted Recipe Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully deleted Recipe with ID \'${RecipeID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while deleting the Recipe` };
    });
}

async function fetchRecipeIngredientsForRecipeFromDb(RecipeID) {
    const intRecipeID = parseInt(RecipeID, 10);
    if (isNaN(intRecipeID)) {
        console.log('invalid Recipe ID')
        return { success: false, message: `Invalid Recipe ID: \'${RecipeID}\'`, data: [] };
    }

    const isRecipeIDValid = await validateRecipeID(intRecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${intRecipeID}\' does not exist`, data: [] };
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
        return {
            success: result.rowsAffected && result.rowsAffected > 0,
            message: `Successfully retreived the ingredients for the Recipe with ID \'${intRecipeID}\'`,
            data: result.rows
        };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while retreiving the ingredients for the Recipe`, data: [] };
    });
}

async function insertRecipeIngredient(RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement) {
    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    const isRecipeIngredientIDValid = await validateRecipeIngredientID(RecipeIngredientID, RecipeID);
    if (isRecipeIngredientIDValid) {
        return { success: false, message: `A Recipe Ingredient with ID \'${RecipeIngredientID}\' already exists for the Recipe with ID \'${RecipeID}\'` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeIngredient(IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES(: RecipeIngredientID, : RecipeIngredientName, : RecipeID, : Amount, : UnitOfMeasurement)`,
            [RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement],
            { autoCommit: true }
        );

        console.log('Inserted Recipe Ingredient Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully created \'${RecipeIngredientName}\' Recipe Ingredient` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while creating the Recipe Ingredient` };
    });
}

async function updateRecipeIngredient(RecipeIngredientID, RecipeID, NewRecipeIngredientName, NewAmount, NewUnitOfMeasurement) {
    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    const isRecipeIngredientIDValid = await validateRecipeIngredientID(RecipeIngredientID, RecipeID);
    if (!isRecipeIngredientIDValid) {
        return { success: false, message: `A Recipe Ingredient with ID \'${RecipeIngredientID}\' for the Recipe with ID \'${RecipeID}\' does not exist` };
    }

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

    let query = `UPDATE RecipeIngredient SET `;
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
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully updated Recipe Ingredient with ID \'${RecipeIngredientID}\' for the Recipe with ID \'${RecipeID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while updating the Recipe Ingredient` };
    });
}

async function deleteRecipeIngredient(RecipeIngredientID, RecipeID) {
    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    const isRecipeIngredientIDValid = await validateRecipeIngredientID(RecipeIngredientID, RecipeID);
    if (!isRecipeIngredientIDValid) {
        return { success: false, message: `A Recipe Ingredient with ID \'${RecipeIngredientID}\' for the Recipe with ID \'${RecipeID}\' does not exist` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM RecipeIngredient WHERE IngredientID=:RecipeIngredientID AND RecipeID=:RecipeID',
            [RecipeIngredientID, RecipeID],
            { autoCommit: true }
        );
        console.log('Deleted Recipe Ingredient Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully deleted Recipe Ingredient with ID \'${RecipeIngredientID}\' for the Recipe with ID \'${RecipeID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while deleting the Recipe Ingredient` };
    });
}

async function fetchRecipeStepsForRecipe(RecipeID) {
    const intRecipeID = parseInt(RecipeID, 10);
    if (isNaN(intRecipeID)) {
        console.log('invalid Recipe ID')
        return { success: false, message: `Invalid Recipe ID: \'${RecipeID}\'`, data: [] };
    }

    const isRecipeIDValid = await validateRecipeID(intRecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${intRecipeID}\' does not exist`, data: [] };
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
        return {
            success: result.rowsAffected && result.rowsAffected > 0,
            message: `Successfully retreived the steps for the Recipe with ID \'${intRecipeID}\'`,
            data: result.rows
        };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while retreiving the steps for the Recipe`, data: [] };
    });
}

async function insertRecipeStep(RecipeID, StepNumber, StepInformation) {
    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    const isRecipeStepValid = await validateRecipeStep(StepNumber, RecipeID);
    if (isRecipeStepValid) {
        return { success: false, message: `A Recipe Step with Step Number \'${StepNumber}\' already exists for the Recipe with ID \'${RecipeID}\'` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeStep(RecipeID, StepNumber, StepInformation) VALUES(: RecipeID, : StepNumber, : StepInformation)`,
            [RecipeID, StepNumber, StepInformation],
            { autoCommit: true }
        );

        console.log('Inserted Recipe Step Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully created Recipe Step with Step Number \'${StepNumber}\' for Recipe with ID \'${RecipeID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while creating the recipe step` };
    });
}

async function updateRecipeStep(RecipeID, OldStepNumber, NewStepNumber, NewStepInformation) {
    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    const isOldRecipeStepValid = await validateRecipeStep(OldStepNumber, RecipeID);
    if (!isOldRecipeStepValid) {
        return { success: false, message: `A Recipe Step with Step Number \'${OldStepNumber}\' for the Recipe with ID \'${RecipeID}\' does not exist` };
    }

    const isNewRecipeStepValid = await validateRecipeStep(NewStepNumber, RecipeID);
    if (isNewRecipeStepValid) {
        return { success: false, message: `A Recipe Step with Step Number \'${NewStepNumber}\' already exists for the Recipe with ID \'${RecipeID}\'` };
    }

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

    let query = `UPDATE RecipeStep SET `;
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
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully updated Recipe Step with Step Number \'${OldStepNumber}\' for the Recipe with ID \'${RecipeID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while updating the Recipe Step` };
    });
}

async function deleteRecipeStep(RecipeID, StepNumber) {
    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    const isOldRecipeStepValid = await validateRecipeStep(StepNumber, RecipeID);
    if (!isOldRecipeStepValid) {
        return { success: false, message: `A Recipe Step with Step Number \'${StepNumber}\' for the Recipe with ID \'${RecipeID}\' does not exist` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM RecipeStep WHERE StepNumber=:StepNumber AND RecipeID=:RecipeID',
            [StepNumber, RecipeID],
            { autoCommit: true }
        );

        console.log('Deleted Recipe Step Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully deleted Recipe Step with Step Number \'${StepNumber}\' for the Recipe with ID \'${RecipeID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while deleting the Recipe Step` };
    });
}

async function insertCategory(CategoryName, CategoryDescription) {
    const isCategoryNameValid = await validateCategoryName(CategoryName);
    if (isCategoryNameValid) {
        return { success: false, message: `A Category with Category Name \'${CategoryName}\' already exists` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Category(CategoryName, CategoryDescription) VALUES(: CategoryName, : CategoryDescription)`,
            [CategoryName, CategoryDescription],
            { autoCommit: true }
        );

        console.log('Inserted Category Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully created the Category with Category Name \'${CategoryName}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while creating the Category` };
    });
}

async function updateCategory(CategoryName, NewCategoryDescription) {
    const isCategoryNameValid = await validateCategoryName(CategoryName);
    if (!isCategoryNameValid) {
        return { success: false, message: `A Category with Category Name \'${CategoryName}\' does not exist` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Category SET CategoryDescription =: NewCategoryDescription WHERE CategoryName =: CategoryName`,
            [NewCategoryDescription, CategoryName],
            { autoCommit: true }
        );

        console.log('Updated Category Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully updated the Category with Category Name \'${CategoryName}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while updating the Category` };
    });
}

async function deleteCategory(CategoryName) {
    const isCategoryNameValid = await validateCategoryName(CategoryName);
    if (!isCategoryNameValid) {
        return { success: false, message: `A Category with Category Name \'${CategoryName}\' does not exist` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM Category WHERE CategoryName=:CategoryName',
            [CategoryName],
            { autoCommit: true }
        );

        console.log('Deleted Category Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully deleted the Category with Category Name \'${CategoryName}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while deleting the Category` };
    });
}

async function insertRecipeIntoCategory(RecipeID, CategoryName) {
    const isCategoryNameValid = await validateCategoryName(CategoryName);
    if (!isCategoryNameValid) {
        return { success: false, message: `A Category with Category Name \'${CategoryName}\' does not exist` };
    }

    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    const isRecipeCategoryRelationValid = await validateRecipeCategoryRelation(RecipeID, CategoryName);
    if (isRecipeCategoryRelationValid) {
        return { success: false, message: `The Recipe with ID \'${RecipeID}\' is already associated with the \'${CategoryName}\' Category` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeHasCategory(RecipeID, CategoryName) VALUES(: RecipeID, : CategoryName)`,
            [RecipeID, CategoryName],
            { autoCommit: true }
        );

        console.log('Inserted Recipe into Category Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully added the Recipe with ID \'${RecipeID}\' to the \'${CategoryName}\' Category` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while adding the Recipe to the Category` };
    });
}

async function deleteRecipeFromCategory(RecipeID, CategoryName) {
    const isCategoryNameValid = await validateCategoryName(CategoryName);
    if (!isCategoryNameValid) {
        return { success: false, message: `A Category with Category Name \'${CategoryName}\' does not exist` };
    }

    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    const isRecipeCategoryRelationValid = await validateRecipeCategoryRelation(RecipeID, CategoryName);
    if (!isRecipeCategoryRelationValid) {
        return { success: false, message: `The Recipe with ID \'${RecipeID}\' is not associated with the \'${CategoryName}\' Category` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM RecipeHasCategory WHERE RecipeID=:RecipeID AND CategoryName=:CategoryName',
            [RecipeID, CategoryName],
            { autoCommit: true }
        );

        console.log('Deleted Recipe from Category Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully removed the Recipe with ID \'${RecipeID}\' from the \'${CategoryName}\' Category` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while removing the Recipe from the Category` };
    });
}

async function fetchRecipeList(RecipeListID) {
    // NOTE: Do not need to check that the RecipeListID exists as we dynamically display
    //       all existing RecipeLists to the user in the select bar
    //       so therefore all RecipeListIDs that are submitted to this method, are guaranteed to exist
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
    const isRecipeListIDValid = await validateRecipeListID(RecipeListID);
    if (isRecipeListIDValid) {
        return { success: false, message: `A Recipe List with ID \'${RecipeListID}\' already exists` };
    }

    const isUsernameValid = await validateUsername(Username);
    if (!isUsernameValid) {
        return { success: false, message: `A User with Username \'${Username}\' does not exist` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeList(RecipeListID, RecipeListName, PrivacyLevel, Username) VALUES(:RecipeListID, :RecipeListName, :PrivacyLevel, :Username)`,
            [RecipeListID, RecipeListName, PrivacyLevel, Username],
            { autoCommit: true }
        );

        console.log('Inserted Recipe List Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully created the Recipe List with ID \'${RecipeListID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while creating the Recipe List` };
    });
}

async function updateRecipeList(RecipeListID, RecipeListName, PrivacyLevel) {
    const isRecipeListIDValid = await validateRecipeListID(RecipeListID);
    if (!isRecipeListIDValid) {
        return { success: false, message: `A Recipe List with ID \'${RecipeListID}\' does not exist` };
    }

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
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully updated the Recipe List with ID \'${RecipeListID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while updating the Recipe List` };
    });
}

async function deleteRecipeList(RecipeListID) {
    const isRecipeListIDValid = await validateRecipeListID(RecipeListID);
    if (!isRecipeListIDValid) {
        return { success: false, message: `A Recipe List with ID \'${RecipeListID}\' does not exist` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM RecipeList WHERE RecipeListID=:RecipeListID',
            [RecipeListID],
            { autoCommit: true }
        );

        console.log('Deleted Recipe List Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully deleted the Recipe List with ID \'${RecipeListID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while deleting the Recipe List` };
    });
}

async function insertRecipeIntoRecipeList(RecipeID, RecipeListID) {
    const isRecipeListIDValid = await validateRecipeListID(RecipeListID);
    if (!isRecipeListIDValid) {
        return { success: false, message: `A Recipe List with ID \'${RecipeListID}\' does not exist` };
    }

    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    const isRecipeRecipeListRelationValid = await validateRecipeRecipeListRelation(RecipeID, RecipeListID);
    if (isRecipeRecipeListRelationValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' is already in the Recipe List with ID \'${RecipeListID}\'` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeListHasRecipe(RecipeListID, RecipeID) VALUES(: RecipeListID, : RecipeID)`,
            [RecipeListID, RecipeID],
            { autoCommit: true }
        );

        console.log('Inserted Recipe into Recipe List Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully added the Recipe with ID \'${RecipeID}\' to the Recipe List with ID \'${RecipeListID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while adding the Recipe to the Recipe List` };
    });
}

async function deleteRecipeFromRecipeList(RecipeID, RecipeListID) {
    const isRecipeListIDValid = await validateRecipeListID(RecipeListID);
    if (!isRecipeListIDValid) {
        return { success: false, message: `A Recipe List with ID \'${RecipeListID}\' does not exist` };
    }

    const isRecipeIDValid = await validateRecipeID(RecipeID);
    if (!isRecipeIDValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' does not exist` };
    }

    const isRecipeRecipeListRelationValid = await validateRecipeRecipeListRelation(RecipeID, RecipeListID);
    if (!isRecipeRecipeListRelationValid) {
        return { success: false, message: `A Recipe with Recipe ID \'${RecipeID}\' is not in the Recipe List with ID \'${RecipeListID}\'` };
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM RecipeListHasRecipe WHERE RecipeID=:RecipeID AND RecipeListID=:RecipeListID',
            [RecipeID, RecipeListID],
            { autoCommit: true }
        );

        console.log('Deleted Recipe from Recipe List Successfully');
        return { success: result.rowsAffected && result.rowsAffected > 0, message: `Successfully removed the Recipe with ID \'${RecipeID}\' from the Recipe List with ID \'${RecipeListID}\'` };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, message: `An unexpected error occured while removing the Recipe from the Recipe List` };
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
        console.error('Database error:', error);
        return false;
    }
}

async function updateAllergyList(IngredientListID, newPrivacyLevel, newListDescription, newUsername, newListName) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                `UPDATE AllergyList 
                 SET PrivacyLevel = :newPrivacyLevel, ListDescription = :newListDescription, Username = :newUsername, ListName = :newListName
                 WHERE IngredientListID = :IngredientListID`,
                {
                    newPrivacyLevel: newPrivacyLevel,
                    newListDescription: newListDescription,
                    newUsername: newUsername,
                    newListName: newListName,
                    IngredientListID: IngredientListID
                },
                { autoCommit: true }
            );

            console.log('Updated AllergyList Successfully')
            return result.rowsAffected && result.rowsAffected > 0;
        });
    } catch (error) {
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
    } catch (error) {
        console.error('Database error:', error);
        return false;
    }
}

async function fetchAllergyListByProjectFromDb(userInput) {
    return await withOracleDB(async (connection) => {
        // const formattedColumns = userInput.map(column => `"${column}"`).join(', ');
        const formattedColumns = userInput.map(column => column.toUpperCase()).join(', ');

        const query = `
            SELECT ${formattedColumns}
            FROM AllergyList
        `;

        const result = await connection.execute(query);

        //Added
        if (!result.rows || result.rows.length === 0) {
            return { success: true, data: [] };
        }

        console.log("Query Result:", result.rows);

        const formattedData = result.rows.map(row =>
            Object.fromEntries(result.metaData.map((col, i) => [col.name, row[i]]))
        );

        console.log('Projection successful:', formattedData);
        return { success: true, data: formattedData };
    }).catch((error) => {
        console.error('Database error:', error);
        return { success: false, data: [] };
    });
}

// AllergyListHasAllergicIngredient
async function fetchAllergyListHasAllergicIngredientFromDb() {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute('SELECT * FROM AllergyListHasAllergicIngredient');
            return result.rows;
        });
    } catch (error) {
        console.error('Database error:', error);
        return [];
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

async function validateRecipeID(RecipeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(*) AS count FROM Recipe WHERE RecipeID =: RecipeID`,
            [RecipeID]
        )

        console.log('RecipeID Validated Successfully');
        return result.rows[0][0] > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function validateRecipeIngredientID(RecipeIngredientID, RecipeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(*) AS count FROM RecipeIngredient WHERE RecipeID =: RecipeID AND IngredientID =: RecipeIngredientID`,
            [RecipeID, RecipeIngredientID]
        )

        console.log('RecipeIngredientID Validated Successfully');
        return result.rows[0][0] > 0;
    }).catch((error) => {
        console.error('Database error:', error);
    });
}

async function validateRecipeStep(StepNumber, RecipeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(*) AS count FROM RecipeStep WHERE RecipeID =: RecipeID AND StepNumber =: StepNumber`,
            [RecipeID, StepNumber]
        )

        console.log('StepNumber Validated Successfully');
        return result.rows[0][0] > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function validateCategoryName(CategoryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(*) AS count FROM Category WHERE CategoryName =: CategoryName`,
            [CategoryName]
        )

        console.log('CategoryName Validated Successfully');
        return result.rows[0][0] > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function validateRecipeCategoryRelation(RecipeID, CategoryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(*) AS count FROM RecipeHasCategory WHERE RecipeID =: RecipeID AND CategoryName =: CategoryName`,
            [RecipeID, CategoryName]
        )

        console.log('Recipe and Category relation Validated Successfully');
        return result.rows[0][0] > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function validateRecipeListID(RecipeListID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(*) AS count FROM RecipeList WHERE RecipeListID =: RecipeListID`,
            [RecipeListID]
        )

        console.log('RecipeListID Validated Successfully');
        return result.rows[0][0] > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function validateRecipeRecipeListRelation(RecipeID, RecipeListID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(*) AS count FROM RecipeListHasRecipe WHERE RecipeID =: RecipeID AND RecipeListID =: RecipeListID`,
            [RecipeID, RecipeListID]
        )

        console.log('Recipe and Recipe List relation Validated Successfully');
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
    fetchUserFromDb,
    insertUser,
    deleteUser,
    updateUser,
    viewUsersWithPublicPrivacy,
    viewUsersWhoAreFriendsWithEveryone,
    // areTheyFriends,
    // insertFriend,
    // deleteFriend,

    // Recipe Centric
    fetchRecipeFromDb,
    fetchSimpleOrComplicatedRecipesFromDb,
    fetchCategoryFromDb,
    fetchRecipesByCategoryFromDb,
    fetchRecipeListFromDb,
    fetchRecipesByRecipeListFromDb,
    insertRecipe,
    updateRecipe,
    deleteRecipe,
    fetchRecipeIngredientsForRecipeFromDb,
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
    fetchAllergyListByProjectFromDb,
    fetchAllergyListHasAllergicIngredientFromDb,

    // General
    validateUsername,
    validateRecipeID,
    validateRecipeIngredientID,
    validateRecipeStep,
    validateCategoryName,
    validateRecipeCategoryRelation,
    validateRecipeListID,
    validateRecipeRecipeListRelation,
    initiateTables,
};