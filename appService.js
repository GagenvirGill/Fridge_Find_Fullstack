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

async function insertUser(Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel) {
    if (!Username || !Email || !FullName) {
        throw new Error('Required fields (Username, Email, FullName) are missing');
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO AppUser(Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel) VALUES (:Username, :ProfilePicture, :Email, :FullName, :DefaultPrivacyLevel)`,
            [Username, ProfilePicture || null, Email, FullName, DefaultPrivacyLevel || 'Private'],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Error inserting user:', error);
        return false;
    });
}

async function deleteUser(Username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'DELETE FROM AppUser WHERE Username=:Username',
            [Username],
            { autoCommit: true }
        );
        console.log('Deleted AppUser Successfully')
        return result.rowsAffected && result.rowsAffected > 0;;
    }).catch((error) => {
        console.error('Database error:', error);
        return false;
    });
}

async function updateUser(username, newProfilePicture, newEmail, newFullName, newDefaultPrivacyLevel) {
    return await withOracleDB(async (connection) => {
        let query = 'UPDATE AppUser SET ';
        const params = [];
        const updates = [];

        if (newProfilePicture !== undefined) {
            updates.push('ProfilePicture = :newProfilePicture');
            params.push(newProfilePicture);
        }
        if (newEmail !== undefined) {
            updates.push('Email = :newEmail');
            params.push(newEmail);
        }
        if (newFullName !== undefined) {
            updates.push('FullName = :newFullName');
            params.push(newFullName);
        }
        if (newDefaultPrivacyLevel !== undefined) {
            updates.push('DefaultPrivacyLevel = :newDefaultPrivacyLevel');
            params.push(newDefaultPrivacyLevel);
        }
        if (updates.length === 0) {
            throw new Error('No fields provided for update');
        }

        query += updates.join(', ') + ' WHERE Username = :username';
        params.push(username);

        const result = await connection.execute(query, params, { autoCommit: true });

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
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


async function fetchFriends(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Friends WHERE Username1 = :username OR Username2 = :username`,
            [username]
        );

        return result.rows;
    }).catch((error) => {
        console.error('Error fetching friends:', error);
        return [];
    });
}

async function insertFriend(username1, username2) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Friends (Username1, Username2, DateAndTimeCreated)
             VALUES (:username1, :username2, SYSTIMESTAMP)`,
            [username1, username2],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Error inserting friend:', error);
        return false;
    });
}

async function deleteFriend(username1, username2) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM Friends
             WHERE (Username1 = :username1 AND Username2 = :username2)
                OR (Username1 = :username2 AND Username2 = :username1)`,
            [username1, username2],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Error deleting friend:', error);
        return false;
    });
}

async function areTheyFriends(username1, username2) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Friends
             WHERE (Username1 = :username1 AND Username2 = :username2)
                OR (Username1 = :username2 AND Username2 = :username1)`,
            [username1, username2]
        );

        return result.rows.length > 0;
    }).catch((error) => {
        console.error('Error checking friend relationship:', error);
        return false;
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

        return result.rows.map(row => row[0]);
    }).catch((error) => {
        console.error('Error fetching users who are friends with everyone:', error);
        return [];
    });
}

async function fetchNotificationMessages(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM NotificationMessage WHERE Username = :username`,
            [username]
        );

        return result.rows;
    }).catch((error) => {
        console.error('Error fetching notification messages:', error);
        return [];
    });
}

async function insertNotificationMessage(username, messageText) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO NotificationMessage (Username, DateAndTimeSent, MessageText)
             VALUES (:username, SYSTIMESTAMP, :messageText)`,
            [username, messageText],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Error inserting notification message:', error);
        return false;
    });
}

async function deleteNotificationMessage(username, dateAndTimeSent) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM NotificationMessage WHERE Username = :username AND DateAndTimeSent = :dateAndTimeSent`,
            [username, dateAndTimeSent],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Error deleting notification message:', error);
        return false;
    });
}

async function fetchNotifications(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Notifications WHERE Username = :username`,
            [username]
        );

        return result.rows;
    }).catch((error) => {
        console.error('Error fetching notifications:', error);
        return [];
    });
}

async function insertNotification(notificationID, username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Notifications (NotificationID, DateAndTimeSent, Username)
             SELECT :notificationID, DateAndTimeSent, :username
             FROM NotificationMessage
             WHERE Username = :username
             ORDER BY DateAndTimeSent DESC FETCH FIRST 1 ROWS ONLY`,
            [notificationID, username, username],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Error inserting notification:', error);
        return false;
    });
}

async function deleteNotification(notificationID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM Notifications WHERE NotificationID = :notificationID`,
            [notificationID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Error deleting notification:', error);
        return false;
    });
}

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
    fetchUserFromDb,
    insertUser,
    deleteUser,
    updateUser,
    viewUser,
    fetchFriends,
    insertFriend,
    deleteFriend,
    areTheyFriends,
    fetchNotificationMessages,
    insertNotificationMessage,
    deleteNotificationMessage,
    fetchNotifications,
    insertNotification,
    deleteNotification,


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