# Kitchen Management Application

### CPSC304 2024W1 Project - Group 28

### Contributors
- Gagenvir Gill
- Preston Lai
- Mave Hur

### Project Summary
This kitchen management application allows users to organize their ingredients, recipes, and other information for future use. It enables users to find recipes based on what they currently have at home or informs them of any missing ingredients for a recipe. The app also assists users in discovering new recipes created by other users, with the ability to filter recipes by categories and the user's allergies.

### Project Description
The goal of this application is to help homeowners efficiently manage their kitchen by organizing ingredients and recipes. Users can check if they have the necessary ingredients to complete a recipe or prioritize perishable items that need to be used first. The app also accommodates allergy and dietary preferences, enabling users to find or create meals for specific needs.

### Domain of the Application
Management of Food Items in a Homeowner's Kitchen

The application is designed for homeowners with kitchens, focusing on ingredient management and recipe organization. Users can:

- See if they can complete a recipe based on the ingredients they have.
- Plan meals that cater to dietary or allergy restrictions.
- Prioritize cooking perishable items.

### Database Models

##### 1. Kitchen Ingredients Management
Users can track their kitchen inventory, ensuring they have enough of each ingredient to prepare meals. The application helps users keep track of quantities and other essential information.

##### 2. Recipes
Users can create and follow recipes by adding ingredients, steps, and optional category tags (e.g., Vegetarian, Dessert). This feature allows for easy recipe recreation in the future.

##### 3. Recipe Lists
Users can store favorite recipes in personalized lists, making it easier to replicate meals later. These lists can be tailored to different dietary or allergy restrictions, and users can browse other users' lists to discover new recipes.

##### 4. Perishable Item Tracking
Users can log the expiry dates of ingredients, helping them prioritize the use of perishable items before they spoil. The app also sends notifications when an item is nearing its expiration date.


# Milestone 1

## Deliverable 2
Project Topic: Kitchen management app

## A Brief Project Description

### The Domain of the Application
Management of Food Items in Homeowners' Kitchen
The domain of our application focuses on homeowners with kitchens. Specifically, it deals with organizing a kitchen's ingredients and a user’s recipes. The user can see, based on a few factors, if they can complete a recipe. This allows them to cater meals to different crowds based on allergy ingredients and ensures they prioritize cooking perishable items. The application will also indicate whether the user can complete a recipe (that they or someone else created) based on whether they have all the necessary ingredients.

### The Aspects of the Domain Modeled by the Database
Kitchen Ingredients Management
Our users will need to track the ingredients in their kitchen to ensure they have enough portion size and quantity of certain items to make the meals they would like to cook.

Recipes
Our users will be able to create and follow recipes by adding the necessary ingredients, steps, and optional category tags. This will allow the user to recreate the recipe in the future by following the steps they (or another user) created.

Recipe Lists
Our users would like to store previous meals or their favorite recipes so that meals will become easier to replicate in the future. They can store recipes within lists of recipes. Additionally, depending on the crowd the user is trying to serve, they can cook meals to navigate dietary or allergy restrictions. Users will also be able to look at other users’ lists to find new recipes to try out. Recipes will have optional category tags to allow for users to filter through them. For example, a possible category tag could be ‘Vegetarian.’

Perishable Item Tracking: 
Our users will have many ingredients on hand which can lead them to be unsure which ones are expiring first. They can combat this by storing an expiry date of each grocery item so they can prioritize cooking the most perishable items first before they expire. The application will also send a notification to a user before an item expires to remind them to utilize the ingredient.

The key distinctions between this project idea and those listed on the blacklist
Domain Difference: 
While most ideas on the blacklist focus on services offered by public organizations, government entities, or corporations, this project is a home kitchen management application designed to assist individuals in the daily tasks of managing food ingredients, cooking, and meal preparation.

Feature Difference: 
This application offers a range of features, including kitchen ingredient management, recipe creation, storage, and expiration date tracking, aimed at optimizing meal planning, cooking, and ingredient usage. In contrast, each idea on the blacklist typically focuses on a single feature.

# Deliverable 3
Database specifications: What functionality will the database provide? i.e., what kinds of things will people using the database be able to do. 

### User Management
CRUD Functionality: 
Users can create an account with their personal information and subsequently read, update, and delete their account details. Based on the account information stored in the database, the application manages activities such as adding ingredients and creating recipes.

### Ingredient Management
CRUD Functionality: 
Users can input and save details of an ingredient such as its name, quantity, and best-before date. They can then read, update, and delete those ingredients as needed.

Expiring Ingredient Lookup: 
Users can select a value for N to view a list of ingredients that will expire within the next N days, calculated as the difference between the system date and the best-before date of each ingredient. The user will also be able to set notification reminders to notify them X days before ingredients expire informing them of the upcoming date.

### Recipe Management
CRUD Functionality: 
Users can input and save ingredient information, cooking instructions for each recipe. They can then read, update, and delete the saved recipes, and read recipes that others have created.

Recipe Display Functionality: 
When following a saved recipe, the application displays the cooking instructions step by step. Additionally, users will be able to filter recipes to only display ones they have the ingredients for, based on their allergy requirements, in addition to specific categories that can be optionally assigned to recipes.

## Deliverable 4
Application Platform / Technical stack
This application will be deployed on a web server.
This application follows the technical stack that is supported by CPSC 304 course staff.
Language: JavaScript
DBMS: Oracle
DB access: SQL *Plus
Front-end: HTML/CSS
Back-end: Node.js, Express

## Deliverable 5
ER Diagram
Both of the IsA relationships have Disjoint overlap constraints and Total covering constraints








