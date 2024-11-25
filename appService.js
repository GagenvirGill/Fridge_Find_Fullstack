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
        return result.rows;
    }).catch(() => {
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
            `INSERT INTO Recipe (RecipeID, RecipeName, PrivacyLevel, Username) VALUES (:RecipeID, :RecipeName, :PrivacyLevel, :Username)`,
            [RecipeID, RecipeName, PrivacyLevel, Username],
            { autoCommit: true }
        );

        console.log('Inserted Recipe Successfully')
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function updateRecipe(RecipeID, NewRecipeName, NewPrivacyLevel) {
    let query = `UPDATE Recipe SET `;
    let queryParams = [];

    if (NewRecipeName == "" && NewPrivacyLevel != "Do Not Change") {
        query += `PrivacyLevel=:NewPrivacyLevel`;
        queryParams.push(NewPrivacyLevel);
    } else if (NewRecipeName != "" && NewPrivacyLevel == "Do Not Change") {
        query += `RecipeName=:NewRecipeName`;
        queryParams.push(NewRecipeName);
    } else {
        query += `RecipeName =: NewRecipeName, PrivacyLevel=:NewPrivacyLevel`;
        queryParams.push(NewRecipeName);
        queryParams.push(NewPrivacyLevel);
    }

    query += ` WHERE RecipeID=:RecipeID`;
    queryParams.push(RecipeID);

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            query,
            queryParams,
            { autoCommit: true }
        );

        console.log('Updated Recipe Successfully')
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
        console.log('Deleted Recipe Successfully')
        return result.rowsAffected && result.rowsAffected > 0;;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function fetchRecipeIngredientsForRecipeFromDb(RecipeID) {
    const intRecipeID = parseInt(RecipeID, 10);

    if (isNaN(intRecipeID)) {
        return false;
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT ri.* 
            FROM RecipeIngredient ri 
            JOIN Recipe r ON r.RecipeID = ri.RecipeID 
            WHERE ri.RecipeID=:RecipeID`,
            [intRecipeID]
        );
        return result.rows;
    }).catch(() => {
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
            WHERE RecipeID=:RecipeID`,
            [intRecipeID]
        );
        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function insertRecipeIngredient(RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement) {
    // validate recipe
    const isRecipeValid = await validateRecipe(RecipeID);

    // If it doesnt return false
    if (!isRecipeValid) {
        return false;
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (:RecipeIngredientID, :RecipeIngredientName, :RecipeID, :Amount, :UnitOfMeasurement)`,
            [RecipeIngredientID, RecipeIngredientName, RecipeID, Amount, UnitOfMeasurement],
            { autoCommit: true }
        );

        console.log('Inserted Recipe Ingredient Successfully')
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}


// ----------------------------------------------------------
// Ingredient Centric service

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

async function insertAllergicIngredient(IngredientID, Name) {
    try {
        // validate username
        const isUsernameValid = await validateUsername(Username);

        // If it doesnt return false
        if (!isUsernameValid) {
            return false;
        }

        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                `INSERT INTO Recipe (IngredientID, Name) VALUES (:IngredientID, :Name)`,
                [IngredientID, Name],
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

async function updateAllergicIngredient(IngredientID, newName) {
    let query = `UPDATE AllergicIngredient SET 
                 SET Name = :newName
                 WHERE IngredientID = :IngredientID`;
    let queryParams = {
        newName: newName,
        IngredientID: IngredientID,
    };

    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                query,
                queryParams,
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
                'DELETE FROM IngredientID WHERE IngredientID=:IngredientID',
                [RecipeID],
                { autoCommit: true }
            );
            console.log('Deleted AllergicIngredient Successfully')
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
            `SELECT COUNT(*) AS count FROM AppUser WHERE Username=:Username`,
            [Username]
        )

        return result.rows[0][0] > 0;
    }).catch(() => {
        return false;
    });
}

async function validateRecipe(RecipeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(*) AS count FROM Recipe WHERE RecipeID=:RecipeID`,
            [RecipeID]
        )

        return result.rows[0][0] > 0;
    }).catch(() => {
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

        console.log('Tables Initialized Successfully')

        return true;
    }).catch(() => {
        return false;
    });
}


// ----------------------------------------------------------

module.exports = {
    testOracleConnection,
    // User Centric


    // Recipe Centric
    fetchRecipeFromDb,
    insertRecipe,
    updateRecipe,
    deleteRecipe,
    fetchRecipeIngredientsForRecipeFromDb,
    fetchRecipesName,
    insertRecipeIngredient,

    // Ingredient Centric

    // General
    validateUsername,
    validateRecipe,
    initiateTables,
};