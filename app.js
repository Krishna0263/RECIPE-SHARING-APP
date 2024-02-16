const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const dataFolderPath = path.join(__dirname, 'data');
const recipesFilePath = path.join(__dirname, 'data', 'recipes.json');
const usersFilePath = path.join(dataFolderPath, 'users.json');

let recipeIdCounter = 9; // Starting ID for new recipes

let users = [];
try {
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    users = JSON.parse(usersData);
} catch (error) {
    console.error('Error reading users file:', error);
}

// Endpoint for user registration
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    // Check if username is already taken
    if (users.find(user => user.username === username)) {
        return res.status(400).send('Username already exists.');
    }

    // Add user to the list
    const newUser = { id: uuidv4(), username, password };
    users.push(newUser);

    // Save users to file
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
        if (err) {
            console.error('Error writing users file:', err);
            return res.status(500).send('Error registering user.');
        }
        res.status(201).send('User registered successfully.');
    });
});

// Function to generate a new recipe ID
function generateRecipeId() {
    return recipeIdCounter++;
}

// Function to add a new recipe
function addNewRecipe(newRecipe) {
    newRecipe.recipeId = generateRecipeId();
    fs.readFile(recipesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading recipes.json:', err);
            return;
        }
        try {
            const recipes = JSON.parse(data);
            recipes.push(newRecipe);
            fs.writeFile(recipesFilePath, JSON.stringify(recipes, null, 2), (err) => {
                if (err) {
                    console.error('Error writing recipes.json:', err);
                    return;
                }
                console.log('New recipe added successfully!');
            });
        } catch (error) {
            console.error('Error parsing recipes.json:', error);
        }
    });
}

function validateUser(req, res, next) {
    const { username, password } = req.headers;

    if (!username || !password) {
        return res.status(401).send('Enter correct username and password to verify your identity.');
    }

    // Check if username and password match any user in the users array
    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
        return res.status(401).send('Invalid username or password.');
    }

    next();
}


app.get('/', (req, res) => {
    res.send("RECIPE API");
});

app.get('/api/recipes/:category', validateUser, (req, res) => {
    const category = req.params.category.toLowerCase();

    fs.readFile(recipesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading recipes.json:', err);
            return res.status(500).send('Error reading recipes');
        }

        try {
            const recipes = JSON.parse(data);
            const filteredRecipes = recipes.filter(recipe => recipe.category.toLowerCase() === category);
            res.json(filteredRecipes);
        } catch (error) {
            console.error('Error parsing recipes.json:', error);
            res.status(500).send('Error parsing recipes');
        }
    });
});
// Route to get all recipes
app.get('/api/recipes', validateUser, (req, res) => {
    // Read the recipes from the JSON file
    fs.readFile(recipesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading recipes.json:', err);
            return res.status(500).send('Error reading recipes.');
        }

        try {
            const recipes = JSON.parse(data);
            res.json(recipes);
        } catch (error) {
            console.error('Error parsing recipes.json:', error);
            res.status(500).send('Error parsing recipes.');
        }
    });
});

// Route to get a recipe by name
app.get('/api/recipes/name/:recipeName', validateUser, (req, res) => {
    const recipeName = req.params.recipeName;

    fs.readFile(recipesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading recipes.json:', err);
            return res.status(500).send('Error reading recipes');
        }

        try {
            const recipes = JSON.parse(data);
            const recipe = recipes.find(recipe => recipe.name === recipeName);

            if (!recipe) {
                return res.status(404).send('Recipe not found');
            }

            res.json(recipe);
        } catch (error) {
            console.error('Error parsing recipes.json:', error);
            res.status(500).send('Error parsing recipes');
        }
    });
});

// Route to get a recipe by ID
app.get('/api/recipes/id/:recipeId', validateUser, (req, res) => {
    const recipeId = req.params.recipeId;

    fs.readFile(recipesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading recipes.json:', err);
            return res.status(500).send('Error reading recipes');
        }

        try {
            const recipes = JSON.parse(data);
            const recipe = recipes.find(recipe => recipe.recipeId === parseInt(recipeId));

            if (!recipe) {
                return res.status(404).send('Recipe not found');
            }

            res.json(recipe);
        } catch (error) {
            console.error('Error parsing recipes.json:', error);
            res.status(500).send('Error parsing recipes');
        }
    });
});

// Route to delete a recipe by ID
app.delete('/api/recipes/:recipeId', validateUser, (req, res) => {
    const recipeId = req.params.recipeId;

    fs.readFile(recipesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading recipes.json:', err);
            return res.status(500).send('Error reading recipes.');
        }

        try {

            let recipes = JSON.parse(data);

            const recipeIndex = recipes.findIndex(recipe => recipe.recipeId === parseInt(recipeId));

            if (recipeIndex === -1) {
                return res.status(404).send('Recipe not found.');
            }

            recipes.splice(recipeIndex, 1);

            fs.writeFile(recipesFilePath, JSON.stringify(recipes, null, 2), (err) => {
                if (err) {
                    console.error('Error writing recipes.json:', err);
                    return res.status(500).send('Error writing recipes.');
                }
                res.status(200).send('Recipe deleted successfully.');
            });
        } catch (error) {
            console.error('Error parsing recipes.json:', error);
            res.status(500).send('Error parsing recipes.');
        }
    });
});


// addNewRecipe endpoint
app.post('/api/recipes/addNewRecipe', validateUser, (req, res) => {
    // Read the existing recipes
    fs.readFile(recipesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading recipes.json:', err);
            return res.status(500).send('Error reading recipes.');
        }

        try {
            const recipes = JSON.parse(data);

            const newRecipe = req.body;
            newRecipe.recipeId = generateRecipeId(); // Generate a new recipe ID

            // Move recipeId to the beginning of the object
            const updatedRecipe = {
                recipeId: newRecipe.recipeId,
                ...newRecipe
            };

            recipes.push(updatedRecipe);

            fs.writeFile(recipesFilePath, JSON.stringify(recipes, null, 2), (err) => {
                if (err) {
                    console.error('Error writing recipes.json:', err);
                    return res.status(500).send('Error writing recipes.');
                }
                res.status(201).send('New recipe added successfully!');
            });
        } catch (error) {
            console.error('Error parsing recipes.json:', error);
            res.status(500).send('Error parsing recipes.');
        }
    });
});


// Read the existing recipes from the file
fs.readFile(recipesFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading recipes.json:', err);
        return;
    }

    try {

        const recipes = JSON.parse(data);

        const newRecipe = {
            recipeId: 3,
            name: "New Recipe Name",
            category: "Category Name",
            ingredients: ["Ingredient 1", "Ingredient 2"],
            instructions: "Recipe instructions go here."
        };

        recipes.push(newRecipe);

        fs.writeFile('recipes.json', JSON.stringify(recipes, null, 2), (err) => {
            if (err) {
                console.error('Error writing recipes.json:', err);
                return;
            }
            console.log('New recipe added successfully!');
        });
    } catch (error) {
        console.error('Error parsing recipes.json:', error);
    }
});

// Edit Existing recipe
app.put('/api/recipes/:recipeId', validateUser, (req, res) => {
    const recipeId = req.params.recipeId;
    const updatedRecipe = req.body;

    try {
        let recipes = JSON.parse(fs.readFileSync(recipesFilePath, 'utf8'));

        const recipeIndex = recipes.findIndex(recipe => recipe.recipeId === parseInt(recipeId));

        if (recipeIndex === -1) {
            return res.status(404).send('Recipe not found.');
        }

        recipes[recipeIndex] = {
            ...recipes[recipeIndex],
            ...updatedRecipe
        };

        fs.writeFile('recipes.json', JSON.stringify(recipes, null, 2), (err) => {
            if (err) {
                console.error('Error writing recipes.json:', err);
                return res.status(500).send('Error updating recipe.');
            }
            res.send('Recipe updated successfully.');
        });
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).send('Error updating recipe.');
    }
});



app.post('/api/recipes', validateUser, (req, res) => {
    fs.readFile(recipesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading recipes.json:', err);
            return res.status(500).send('Error reading recipes');
        }

        try {
            const recipes = JSON.parse(data);
            const newRecipe = {
                recipeId: uuidv4(),
                ...req.body
            };
            recipes.push(newRecipe);

            fs.writeFile(recipesFilePath, JSON.stringify(recipes, null, 4), (err) => {
                if (err) {
                    console.error('Error writing recipes.json:', err);
                    return res.status(500).send('Error writing recipes');
                }
                res.status(201).send('Recipe added successfully');
            });
        } catch (error) {
            console.error('Error parsing recipes.json:', error);
            res.status(500).send('Error parsing recipes');
        }
    });
});

app.put('/api/recipes/:recipeId', validateUser, (req, res) => {
    const recipeId = req.params.recipeId;

    fs.readFile(recipesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading recipes.json:', err);
            return res.status(500).send('Error reading recipes');
        }

        try {
            let recipes = JSON.parse(data);
            const recipeIndex = recipes.findIndex(recipe => recipe.recipeId === recipeId);

            if (recipeIndex === -1) {
                return res.status(404).send('Recipe not found.');
            }

            recipes[recipeIndex] = { ...recipes[recipeIndex], ...req.body };

            fs.writeFile(recipesFilePath, JSON.stringify(recipes, null, 4), (err) => {
                if (err) {
                    console.error('Error writing recipes.json:', err);
                    return res.status(500).send('Error writing recipes');
                }
                res.status(200).send('Recipe modified successfully');
            });
        } catch (error) {
            console.error('Error parsing recipes.json:', error);
            res.status(500).send('Error parsing recipes');
        }
    });
});

app.delete('/api/recipes/:recipeId', validateUser, (req, res) => {
    const recipeId = req.params.recipeId;

    fs.readFile(recipesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading recipes.json:', err);
            return res.status(500).send('Error reading recipes');
        }

        try {
            let recipes = JSON.parse(data);
            const recipeIndex = recipes.findIndex(recipe => recipe.recipeId === recipeId);

            if (recipeIndex === -1) {
                return res.status(404).send('Recipe not found.');
            }

            recipes.splice(recipeIndex, 1);

            fs.writeFile(recipesFilePath, JSON.stringify(recipes, null, 4), (err) => {
                if (err) {
                    console.error('Error writing recipes.json:', err);
                    return res.status(500).send('Error writing recipes');
                }
                res.status(200).send('Recipe deleted successfully');
            });
        } catch (error) {
            console.error('Error parsing recipes.json:', error);
            res.status(500).send('Error parsing recipes');
        }
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
