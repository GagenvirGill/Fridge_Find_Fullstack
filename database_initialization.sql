-- Delete Existing Tables
DROP TABLE AppUser CASCADE CONSTRAINTS;
DROP TABLE Friends CASCADE CONSTRAINTS;
DROP TABLE NotificationMessage CASCADE CONSTRAINTS;
DROP TABLE Notifications CASCADE CONSTRAINTS;
DROP TABLE AllergyList CASCADE CONSTRAINTS;
DROP TABLE AllergicIngredient CASCADE CONSTRAINTS;
DROP TABLE AllergyListHasAllergicIngredient CASCADE CONSTRAINTS;
DROP TABLE KitchenInventory CASCADE CONSTRAINTS;
DROP TABLE KitchenIngredientPerishableDate CASCADE CONSTRAINTS;
DROP TABLE KitchenIngredient CASCADE CONSTRAINTS;
DROP TABLE Recipe CASCADE CONSTRAINTS;
DROP TABLE RecipeIngredient CASCADE CONSTRAINTS;
DROP TABLE RecipeStep CASCADE CONSTRAINTS;
DROP TABLE Category CASCADE CONSTRAINTS;
DROP TABLE RecipeHasCategory CASCADE CONSTRAINTS;
DROP TABLE RecipeList CASCADE CONSTRAINTS;
DROP TABLE RecipeListHasRecipe CASCADE CONSTRAINTS;

COMMIT;



-- Create Tables
CREATE TABLE AppUser (
    Username VARCHAR2(50) PRIMARY KEY,
    ProfilePicture BLOB,
    Email VARCHAR2(100) NOT NULL UNIQUE,
    FullName VARCHAR2(50) NOT NULL,
    DefaultPrivacyLevel VARCHAR2(20) DEFAULT 'Private' CHECK (DefaultPrivacyLevel IN ('Private', 'Public', 'Friends Only'))
);

CREATE TABLE Friends (
    Username1 VARCHAR2(50),
    Username2 VARCHAR2(50),
    DateAndTimeCreated TIMESTAMP NOT NULL,
    PRIMARY KEY (Username1, Username2),
    FOREIGN KEY (Username1) REFERENCES AppUser(Username),
    FOREIGN KEY (Username2) REFERENCES AppUser(Username)
);

CREATE TABLE NotificationMessage (
    Username VARCHAR2(50),
    DateAndTimeSent TIMESTAMP NOT NULL,
    MessageText VARCHAR2(250) NOT NULL,
    PRIMARY KEY (Username, DateAndTimeSent),
    FOREIGN KEY (Username) REFERENCES AppUser(Username)
);

CREATE TABLE Notifications (
    NotificationID NUMBER PRIMARY KEY,
    DateAndTimeSent TIMESTAMP NOT NULL,
    Username VARCHAR2(50) NOT NULL,
    FOREIGN KEY (Username, DateAndTimeSent) REFERENCES NotificationMessage(Username, DateAndTimeSent)
);

CREATE TABLE AllergyList (
    IngredientListID NUMBER PRIMARY KEY,
    PrivacyLevel VARCHAR2(20) DEFAULT 'Private' CHECK (PrivacyLevel IN ('Private', 'Public', 'Friends Only')),
    ListDescription VARCHAR2(250),
    Username VARCHAR2(50) NOT NULL,
    ListName VARCHAR2(50) DEFAULT 'Untitled Allergy List',
    FOREIGN KEY (Username) REFERENCES AppUser(Username)
);

CREATE TABLE AllergicIngredient (
    IngredientID NUMBER PRIMARY KEY,
    IngredientName VARCHAR2(50) NOT NULL
);

CREATE TABLE AllergyListHasAllergicIngredient (
    IngredientListID NUMBER,
    IngredientID NUMBER,
    Severity NUMBER DEFAULT 10 CHECK (Severity >= 1 AND Severity <= 10),
    PRIMARY KEY (IngredientListID, IngredientID),
    FOREIGN KEY (IngredientListID) REFERENCES AllergyList(IngredientListID),
    FOREIGN KEY (IngredientID) REFERENCES AllergicIngredient(IngredientID)
);

CREATE TABLE KitchenInventory (
    IngredientListID NUMBER PRIMARY KEY,
    PrivacyLevel VARCHAR2(20) DEFAULT 'Private' CHECK (PrivacyLevel IN ('Private', 'Public', 'Friends Only')),
    ExpiryDateThreshold NUMBER,
    Username VARCHAR2(50) NOT NULL,
    DateAndTimeLastUpdated TIMESTAMP,
    ListName VARCHAR2(50) DEFAULT 'Untitled Kitchen Inventory',
    FOREIGN KEY (Username) REFERENCES AppUser(Username)
);

CREATE TABLE KitchenIngredientPerishableDate (
    DatePurchased TIMESTAMP,
    ShelfLife NUMBER,
    ExpiryDate TIMESTAMP,
    PRIMARY KEY (DatePurchased, ShelfLife)
);

CREATE TABLE KitchenIngredient (
    DatePurchased TIMESTAMP,
    ShelfLife NUMBER,
    IngredientID NUMBER PRIMARY KEY,
    IngredientName VARCHAR2(50) NOT NULL,
    IngredientListID NUMBER NOT NULL,
    Amount NUMBER NOT NULL CHECK (Amount > 0),
    UnitOfMeasurement VARCHAR2(20) NOT NULL CHECK (UnitOfMeasurement IN ('piece', 'milliliters', 'liters', 'ounces', 'cups', 'grams', 'pounds', 'kilograms', 'tablespoons',
'teaspoons')),
    FOREIGN KEY (IngredientListID) REFERENCES KitchenInventory(IngredientListID),
    FOREIGN KEY (DatePurchased, ShelfLife) REFERENCES KitchenIngredientPerishableDate(DatePurchased, ShelfLife)
);

CREATE TABLE Recipe (
    RecipeID NUMBER PRIMARY KEY,
    RecipeName VARCHAR2(50) DEFAULT 'Untitled Recipe',
    PrivacyLevel VARCHAR2(20) DEFAULT 'Private' CHECK (PrivacyLevel IN ('Private', 'Public', 'Friends Only')),
    Username VARCHAR2(50) NOT NULL,
    FOREIGN KEY (Username) REFERENCES AppUser(Username)
);

CREATE TABLE RecipeIngredient (
    IngredientID NUMBER,
    IngredientName VARCHAR2(50) NOT NULL,
    RecipeID NUMBER NOT NULL,
    Amount NUMBER NOT NULL CHECK (Amount > 0),
    UnitOfMeasurement VARCHAR2(20) NOT NULL CHECK (UnitOfMeasurement IN ('piece', 'milliliters', 'liters', 'ounces', 'cups', 'grams', 'pounds', 'kilograms', 'tablespoons',
'teaspoons')),
    PRIMARY KEY (IngredientID, RecipeID),
    FOREIGN KEY (RecipeID) REFERENCES Recipe(RecipeID) ON DELETE CASCADE
);

CREATE TABLE RecipeStep (
    RecipeID NUMBER,
    StepNumber NUMBER,
    StepInformation VARCHAR2(250) NOT NULL,
    PRIMARY KEY (RecipeID, StepNumber),
    FOREIGN KEY (RecipeID) REFERENCES Recipe(RecipeID) ON DELETE CASCADE
);

CREATE TABLE Category (
    CategoryName VARCHAR2(50) PRIMARY KEY,
    CategoryDescription VARCHAR2(100)
);

CREATE TABLE RecipeHasCategory (
    RecipeID NUMBER,
    CategoryName VARCHAR2(50),
    PRIMARY KEY (RecipeID, CategoryName),
    FOREIGN KEY (RecipeID) REFERENCES Recipe(RecipeID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryName) REFERENCES Category(CategoryName) ON DELETE CASCADE
);

CREATE TABLE RecipeList (
    RecipeListID NUMBER PRIMARY KEY,
    RecipeListName VARCHAR2(50) DEFAULT 'Untitled Recipe List',
    PrivacyLevel VARCHAR2(20) DEFAULT 'Private' CHECK (PrivacyLevel IN ('Private', 'Public', 'Friends Only')),
    Username VARCHAR2(50) NOT NULL,
    FOREIGN KEY (Username) REFERENCES AppUser(Username)
);

CREATE TABLE RecipeListHasRecipe (
    RecipeListID NUMBER,
    RecipeID NUMBER,
    PRIMARY KEY (RecipeListID, RecipeID),
    FOREIGN KEY (RecipeID) REFERENCES Recipe(RecipeID) ON DELETE CASCADE,
    FOREIGN KEY (RecipeListID) REFERENCES RecipeList(RecipeListID) ON DELETE CASCADE
);



-- Insert Sample Data
INSERT INTO AppUser (Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel) VALUES ('Alice', EMPTY_BLOB(), 'alice@gmail.com', 'Alice Person', 'Private');
INSERT INTO AppUser (Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel) VALUES ('Charlie', HEXTORAW('54657374'), 'charlie@gmail.com', 'Charlie Person', 'Public');
INSERT INTO AppUser (Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel) VALUES ('Bob', EMPTY_BLOB(), 'bob@gmail.com', 'Bob Person', 'Friends Only');
INSERT INTO AppUser (Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel) VALUES ('Kevin', HEXTORAW('496D616765'), 'kevin@gmail.com', 'Kevin Person', 'Private');
INSERT INTO AppUser (Username, ProfilePicture, Email, FullName, DefaultPrivacyLevel) VALUES ('Jason', HEXTORAW('48656C6C6F'), 'jason@gmail.com', 'Jason Person', 'Friends Only');

INSERT INTO Friends (Username1, Username2, DateAndTimeCreated) VALUES ('Alice', 'Charlie', TIMESTAMP '2024-01-15 10:00:00');
INSERT INTO Friends (Username1, Username2, DateAndTimeCreated) VALUES ('Charlie', 'Bob', TIMESTAMP '2022-01-16 11:30:00');
INSERT INTO Friends (Username1, Username2, DateAndTimeCreated) VALUES ('Bob', 'Kevin', TIMESTAMP '2023-01-17 12:15:00');
INSERT INTO Friends (Username1, Username2, DateAndTimeCreated) VALUES ('Kevin', 'Jason', TIMESTAMP '2020-01-18 13:45:00');
INSERT INTO Friends (Username1, Username2, DateAndTimeCreated) VALUES ('Jason', 'Charlie', TIMESTAMP '2021-01-19 14:00:00');

INSERT INTO NotificationMessage (Username, DateAndTimeSent, MessageText) VALUES ('Alice', TIMESTAMP '2024-05-19 10:00:03', 'Your potatoes expire in 7 days');
INSERT INTO NotificationMessage (Username, DateAndTimeSent, MessageText) VALUES ('Alice', TIMESTAMP '2024-05-19 10:00:04', 'Your lettuce expire in 7 days');
INSERT INTO NotificationMessage (Username, DateAndTimeSent, MessageText) VALUES ('Alice', TIMESTAMP '2024-05-19 10:00:05', 'Your rice expire in 7 days');
INSERT INTO NotificationMessage (Username, DateAndTimeSent, MessageText) VALUES ('Alice', TIMESTAMP '2024-05-19 10:00:06', 'Your apples expire in 7 days');
INSERT INTO NotificationMessage (Username, DateAndTimeSent, MessageText) VALUES ('Charlie', TIMESTAMP '2024-9-19 01:00:03', 'Your chicken expires in 3 days');

INSERT INTO Notifications (NotificationID, DateAndTimeSent, Username) VALUES (1, TIMESTAMP '2024-05-19 10:00:03', 'Alice');
INSERT INTO Notifications (NotificationID, DateAndTimeSent, Username) VALUES (2, TIMESTAMP '2024-05-19 10:00:04', 'Alice');
INSERT INTO Notifications (NotificationID, DateAndTimeSent, Username) VALUES (3, TIMESTAMP '2024-05-19 10:00:05', 'Alice');
INSERT INTO Notifications (NotificationID, DateAndTimeSent, Username) VALUES (4, TIMESTAMP '2024-05-19 10:00:06', 'Alice');
INSERT INTO Notifications (NotificationID, DateAndTimeSent, Username) VALUES (5, TIMESTAMP '2024-9-19 01:00:03', 'Charlie');

INSERT INTO AllergyList (IngredientListID, PrivacyLevel, ListDescription, Username, ListName) VALUES (1, 'Private', 'These are the allergies that Alice has', 'Alice', 'Alices Allergies');
INSERT INTO AllergyList (IngredientListID, PrivacyLevel, ListDescription, Username, ListName) VALUES (2, 'Public', 'These are the allergies that Charlie has', 'Alice', 'Charlies Allergies');
INSERT INTO AllergyList (IngredientListID, PrivacyLevel, ListDescription, Username, ListName) VALUES (3, 'Public', 'These are the allergies that Bob has', 'Bob', 'Bobs Allergies');
INSERT INTO AllergyList (IngredientListID, PrivacyLevel, ListDescription, Username, ListName) VALUES (4, 'Public', 'These are the allergies that Kevin has', 'Bob', 'Kevins Allergies');
INSERT INTO AllergyList (IngredientListID, PrivacyLevel, ListDescription, Username, ListName) VALUES (5, 'Friends Only', 'These are the allergies that Jason has', 'Alice', 'Jasons Allergies');

INSERT INTO AllergicIngredient (IngredientID, IngredientName) VALUES (1, 'Peanuts');
INSERT INTO AllergicIngredient (IngredientID, IngredientName) VALUES (2, 'Shellfish');
INSERT INTO AllergicIngredient (IngredientID, IngredientName) VALUES (3, 'Dairy');
INSERT INTO AllergicIngredient (IngredientID, IngredientName) VALUES (4, 'Gluten');
INSERT INTO AllergicIngredient (IngredientID, IngredientName) VALUES (5, 'Soy');

INSERT INTO AllergyListHasAllergicIngredient (IngredientListID, IngredientID, Severity) VALUES (1, 1, 5);
INSERT INTO AllergyListHasAllergicIngredient (IngredientListID, IngredientID, Severity) VALUES (1, 2, 3);
INSERT INTO AllergyListHasAllergicIngredient (IngredientListID, IngredientID, Severity) VALUES (2, 1, 7);
INSERT INTO AllergyListHasAllergicIngredient (IngredientListID, IngredientID, Severity) VALUES (2, 3, 2);
INSERT INTO AllergyListHasAllergicIngredient (IngredientListID, IngredientID, Severity) VALUES (3, 4, 8);
INSERT INTO AllergyListHasAllergicIngredient (IngredientListID, IngredientID, Severity) VALUES (3, 5, 1);
INSERT INTO AllergyListHasAllergicIngredient (IngredientListID, IngredientID, Severity) VALUES (3, 2, 10);

INSERT INTO KitchenInventory (IngredientListID, PrivacyLevel, ExpiryDateThreshold, Username, DateAndTimeLastUpdated, ListName) VALUES (6, 'Private', 5, 'Charlie', TIMESTAMP '2024-09-09 11:02:03', 'Charlies First House');
INSERT INTO KitchenInventory (IngredientListID, PrivacyLevel, ExpiryDateThreshold, Username, DateAndTimeLastUpdated, ListName) VALUES (7, 'Private', 2, 'Charlie', TIMESTAMP '2024-09-09 01:05:03', 'Charlies Second House');
INSERT INTO KitchenInventory (IngredientListID, PrivacyLevel, ExpiryDateThreshold, Username, DateAndTimeLastUpdated, ListName) VALUES (8, 'Private', 3, 'Charlie', TIMESTAMP '2024-09-09 21:00:03', 'Untitled Kitchen Inventory');
INSERT INTO KitchenInventory (IngredientListID, PrivacyLevel, ExpiryDateThreshold, Username, DateAndTimeLastUpdated, ListName) VALUES (9, 'Public', 7, 'Jason', TIMESTAMP '2024-09-20 08:00:33', 'Jasons Kitchen');
INSERT INTO KitchenInventory (IngredientListID, PrivacyLevel, ExpiryDateThreshold, Username, DateAndTimeLastUpdated, ListName) VALUES (10,'Friends Only', 10, 'Kevin', TIMESTAMP '2024-09-12 02:01:03', 'Kevins Kitchen');

INSERT INTO KitchenIngredientPerishableDate (DatePurchased, ShelfLife, ExpiryDate) VALUES (TIMESTAMP '2024-01-01 10:00:00', 3, TIMESTAMP '2024-01-04 10:00:00');
INSERT INTO KitchenIngredientPerishableDate (DatePurchased, ShelfLife, ExpiryDate) VALUES (TIMESTAMP '2024-02-10 11:30:00', 6, TIMESTAMP '2024-02-16 11:30:00');
INSERT INTO KitchenIngredientPerishableDate (DatePurchased, ShelfLife, ExpiryDate) VALUES (TIMESTAMP '2024-03-15 12:45:00', 9, TIMESTAMP '2024-03-24 12:45:00');
INSERT INTO KitchenIngredientPerishableDate (DatePurchased, ShelfLife, ExpiryDate) VALUES (TIMESTAMP '2024-04-18 09:00:00', 12, TIMESTAMP '2024-04-30 09:00:00');
INSERT INTO KitchenIngredientPerishableDate (DatePurchased, ShelfLife, ExpiryDate) VALUES (TIMESTAMP '2024-05-05 08:30:00', 15, TIMESTAMP '2024-05-20 08:30:00');

INSERT INTO KitchenIngredient (DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement) VALUES (TIMESTAMP '2024-01-01 10:00:00', 3, 1, 'Tomato', 6, 5, 'piece');
INSERT INTO KitchenIngredient (DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement) VALUES (TIMESTAMP '2024-02-10 11:30:00', 6, 2, 'Olive Oil', 6, 500, 'milliliters');
INSERT INTO KitchenIngredient (DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement) VALUES (TIMESTAMP '2024-03-15 12:45:00', 9, 3, 'Flour', 7, 1000, 'grams');
INSERT INTO KitchenIngredient (DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement) VALUES (TIMESTAMP '2024-04-18 09:00:00', 12, 4, 'Chicken Breast', 8, 2, 'pounds');
INSERT INTO KitchenIngredient (DatePurchased, ShelfLife, IngredientID, IngredientName, IngredientListID, Amount, UnitOfMeasurement) VALUES (TIMESTAMP '2024-05-05 08:30:00', 15, 5, 'Milk', 9, 1, 'liters');

INSERT INTO Recipe (RecipeID, RecipeName, PrivacyLevel, Username) VALUES (1, 'Apple Pie', 'Public', 'Charlie');
INSERT INTO Recipe (RecipeID, RecipeName, PrivacyLevel, Username) VALUES (2, 'Banana Milkshake', 'Private', 'Charlie');
INSERT INTO Recipe (RecipeID, RecipeName, PrivacyLevel, Username) VALUES (3, 'Salted Butter', 'Public', 'Jason');
INSERT INTO Recipe (RecipeID, RecipeName, PrivacyLevel, Username) VALUES (4, 'Cooked Chicken', 'Public', 'Alice');
INSERT INTO Recipe (RecipeID, RecipeName, PrivacyLevel, Username) VALUES (5, 'Orange Juice Concoction', 'Friends Only', 'Alice');
INSERT INTO Recipe (RecipeID, RecipeName, PrivacyLevel, Username) VALUES (6, 'Apple Pie', 'Public', 'Charlie');

INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (1, 'Apple', 1, 2, 'pounds');
INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (2, 'Banana', 2, 10, 'grams');
INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (3, 'Salt', 3, 5, 'teaspoons');
INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (4, 'Chicken Breast', 4, 10, 'ounces');
INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (5, 'Orange Juice', 5, 1, 'cups');
INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (6, 'Flour', 1, 300, 'milliliters');
INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (7, 'Sugar', 1, 200, 'grams');
INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (8, 'Milk', 2, 250, 'milliliters');
INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (9, 'Butter', 3, 100, 'grams');
INSERT INTO RecipeIngredient (IngredientID, IngredientName, RecipeID, Amount, UnitOfMeasurement) VALUES (10, 'Eggs', 2, 3, 'piece');

INSERT INTO RecipeStep (RecipeID, StepNumber, StepInformation) VALUES (1, 1, 'Preheat oven to 180 degrees.');
INSERT INTO RecipeStep (RecipeID, StepNumber, StepInformation) VALUES (1, 2, 'Mix flour and sugar into a bowl.');
INSERT INTO RecipeStep (RecipeID, StepNumber, StepInformation) VALUES (2, 1, ' Heat the milk in a saucepan until warm.');
INSERT INTO RecipeStep (RecipeID, StepNumber, StepInformation) VALUES (2, 2, 'Whisk eggs into the milk and sugar mix.');
INSERT INTO RecipeStep (RecipeID, StepNumber, StepInformation) VALUES (3, 1, 'Chop veggies and add in olive oil for 5 minutes.');
INSERT INTO RecipeStep (RecipeID, StepNumber, StepInformation) VALUES (4, 1, 'Boil a pot of water.');
INSERT INTO RecipeStep (RecipeID, StepNumber, StepInformation) VALUES (5, 1, 'Take the Orange Juice out of the fridge.');

INSERT INTO Category (CategoryName, CategoryDescription) VALUES ('Dessert', 'sugar food is served after dinner');
INSERT INTO Category (CategoryName, CategoryDescription) VALUES ('Appetizer', 'food before the main course');
INSERT INTO Category (CategoryName, CategoryDescription) VALUES ('Main Course', 'the main dish');
INSERT INTO Category (CategoryName, CategoryDescription) VALUES ('Beverage', 'what you drink during a meal');
INSERT INTO Category (CategoryName, CategoryDescription) VALUES ('Salad', 'all veggies');

INSERT INTO RecipeHasCategory (RecipeID, CategoryName) VALUES (1, 'Dessert');
INSERT INTO RecipeHasCategory (RecipeID, CategoryName) VALUES (2, 'Main Course');
INSERT INTO RecipeHasCategory (RecipeID, CategoryName) VALUES (3, 'Appetizer');
INSERT INTO RecipeHasCategory (RecipeID, CategoryName) VALUES (4, 'Beverage');
INSERT INTO RecipeHasCategory (RecipeID, CategoryName) VALUES (5, 'Salad');

INSERT INTO RecipeList (RecipeListID, RecipeListName, PrivacyLevel, Username) VALUES (1, 'Healthy Food', 'Public', 'Alice');
INSERT INTO RecipeList (RecipeListID, RecipeListName, PrivacyLevel, Username) VALUES (2, 'Fast Food', 'Friends Only', 'Alice');
INSERT INTO RecipeList (RecipeListID, RecipeListName, PrivacyLevel, Username) VALUES (3, 'Desserts', 'Private', 'Jason');
INSERT INTO RecipeList (RecipeListID, RecipeListName, PrivacyLevel, Username) VALUES (4, 'Vegan Dishes', 'Public', 'Jason');
INSERT INTO RecipeList (RecipeListID, RecipeListName, PrivacyLevel, Username) VALUES (5, 'Protein Food', 'Private', 'Jason');

INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALUES (1, 1);
INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALUES (1, 2);
INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALUES (1, 3);
INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALUES (1, 4);
INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALUES (1, 5);
INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALUES (2, 2);
INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALUES (3, 3);
INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALUES (4, 4);
INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALUES (5, 5);
INSERT INTO RecipeListHasRecipe (RecipeListID, RecipeID) VALUES (5, 1);

COMMIT;