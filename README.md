# Recipe Sharing API
## Members:
-	Cindy Legaspino
-	John Kenneth Fetizanan
-	Elvin Tolin
-	Ashbie Sinsoa
## Overview
A web-based tool called the Recipe Sharing API was created to make it easier for users to create, share, edit, and remove recipes. It provides an extensive collection of endpoints for recipe management in relation to different meal categories, such as breakfast, lunch, dinner, and dessert. Apart from facilitating fundamental features such as authentication and recipe retrieval, users can effortlessly add, edit, and remove recipes to customize their culinary journey.
## Purpose
This project aims to develop an approachable platform that people can use to share their favorite recipes with others, encouraging gastronomic exploration and a sense of community. Users can find, share, and alter recipes with ease using a centralized API that offers powerful recipe management features. This improves cooking experiences and fosters culinary innovation. 



## Features
-	User authentication functionality
-	Retrieve all recipes for breakfast, lunch, dinner, and dessert. 
-	Retrieve a specific recipe by its name or ID.
-	Ability to add a new recipe.
-	Ability to modify an existing recipe.
-	Ability to delete a recipe.

## Setup
1.	Install all the dependencies(node.js, express.js, uuid):
2.	Clone the repository:
3.	Run the server (node app.js):
4.	Access the API endpoints using API tools like Postman.
## API Endpoints
-	GET /api/recipes: Get all recipes.
-	GET /api/recipes/name/:recipeName:  Get a specific breakfast recipe by name.
(if the recipe name has space, change the space with %20, for example /Pork%20BBQ)
-	GET /api/recipes/id/:recipeID: Get specific recipe by recipe ID.
-	GET /api/recipes/Breakfast: Get all the recipes in breakfast category.
-	GET /api/recipes/Lunch: Get all the recipes in lunch category.
-	GET /api/recipes/Dinner: Get all the recipes in dinner category.
-	GET /api/recipes/Dessert: Get all the recipes in Dessert category.
Request body should contain JSON data with the following fields: name, category, ingredients, instructions.
-	PUT /api/recipes/:recipeId: Modify an existing recipe by recipe ID.
(update its details with the new data from the request body.)
-	DELETE /api/recipes/:recipeId: Delete a recipe by recipe ID.
-	POST /api/recipes/addNewRecipe: Add a new recipe.
When sending POST request, make sure to include all the necessary data (recipeID is added automatically to avoid same ID)
example for adding recipe
{
  "name": "New Recipe",
  "category": "Dinner",
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "instructions": ["Instructions 1", "Instructions 2"]
}

