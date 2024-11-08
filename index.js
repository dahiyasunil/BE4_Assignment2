const { initializeDatabase } = require("./db/db.connect");
const Recipe = require("./models/recipe.models");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

initializeDatabase();

const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());

// * Create/Add new recipe
const createNewRecipe = async (recipe) => {
  try {
    const newRecipe = new Recipe(recipe);
    return await newRecipe.save();
  } catch (err) {
    throw err;
  }
};

app.post("/recipes", async (req, res) => {
  try {
    const recipeData = req.body;
    if (
      !recipeData.title ||
      !recipeData.author ||
      !recipeData.prepTime ||
      !recipeData.cookTime ||
      !recipeData.ingredients ||
      !recipeData.instructions ||
      !recipeData.imageUrl
    ) {
      res.status(404).json({
        error: `title, author, prepTime, cookTime, ingredients, instructions and imageUrl are required.`,
      });
    } else {
      const recipe = await createNewRecipe(req.body);
      if (recipe) {
        res
          .status(201)
          .json({ msg: `Recipe added successfully.`, recipe: recipe });
      } else {
        throw new Error();
      }
    }
  } catch (err) {
    res.status(500).json({ error: `Failed to add recipe.`, errMsg: `${err}` });
  }
});

// * Read all Recipes
const readAllRecipes = async () => {
  try {
    return await Recipe.find();
  } catch (err) {
    throw err;
  }
};

app.get("/recipes", async (req, res) => {
  try {
    const allRecipes = await readAllRecipes();
    if (allRecipes.length != 0) {
      res.json(allRecipes);
    } else {
      res.status(200).json({ msg: `No recipes found.` });
    }
  } catch (err) {
    res
      .status(500)
      .json({ err: `Failed to get recipes detail.`, errMsg: `${err}` });
  }
});

// * Read recipe by title
const readRecipeByTitle = async (title) => {
  try {
    return await Recipe.findOne({ title: title });
  } catch (err) {
    throw err;
  }
};

app.get("/recipes/:title", async (req, res) => {
  try {
    const recipe = await readRecipeByTitle(req.params.title);
    if (recipe) {
      res.json(recipe);
    } else {
      res
        .status(200)
        .json({ msg: `No recipe found for title: ${req.params.title}` });
    }
  } catch (err) {
    res.status(500).json({ err: `Failed to get recipe.`, errMsg: `${err}` });
  }
});

// * Read recipes by author
const readRecipesByAuthor = async (author) => {
  try {
    return await Recipe.find({ author: author });
  } catch (err) {
    throw err;
  }
};

app.get("/recipes/authors/:author", async (req, res) => {
  try {
    const recipes = await readRecipesByAuthor(req.params.author);
    if (recipes.length != 0) {
      res.json(recipes);
    } else {
      res
        .status(200)
        .json({ msg: `No recipes found for author: ${req.params.author}` });
    }
  } catch (err) {
    res.status(500).json({ err: `Failed to get recipes.`, errMsg: `${err}` });
  }
});

// * Read recipes by difficulty level
const readRecipesByDifficulty = async (difficultyLevel) => {
  try {
    return await Recipe.find({ difficulty: difficultyLevel });
  } catch (err) {
    throw err;
  }
};

app.get("/recipes/difficulty/:level", async (req, res) => {
  try {
    const recipes = await readRecipesByDifficulty(req.params.level);
    if (recipes.length != 0) {
      res.json(recipes);
    } else {
      res.status(200).json({
        msg: `No recipes found for difficulty level: ${req.params.level}.`,
        options: `[Easy, Intermediate, Difficult]`,
      });
    }
  } catch (err) {
    res.status(500).json({ err: `Failed to get recipes.`, errMsg: `${err}` });
  }
});

// * Update Recipe by Id
const updateRecipeById = async (recipeId, dataToUpdate) => {
  try {
    return await Recipe.findByIdAndUpdate(recipeId, dataToUpdate, {
      new: true,
    });
  } catch (err) {
    throw err;
  }
};

app.post("/recipes/update/id/:id", async (req, res) => {
  try {
    const updatedRecipe = await updateRecipeById(req.params.id, req.body);
    if (updatedRecipe) {
      res.status(200).json({
        msg: `Recipe updated successfully.`,
        updatedRecipe: updatedRecipe,
      });
    } else {
      res.status(200).json({ msg: `No recipe found by id: ${req.params.id}.` });
    }
  } catch (err) {
    res.status(500).json({ err: `Failed to update recipe.`, errMsg: `${err}` });
  }
});

// * Update recipe by title
const updateRecipeByTitle = async (recipeTitle, dataToUpdate) => {
  try {
    return await Recipe.findOneAndUpdate({ title: recipeTitle }, dataToUpdate, {
      new: true,
    });
  } catch (err) {
    throw err;
  }
};

app.post("/recipes/update/title/:title", async (req, res) => {
  try {
    const updatedRecipe = await updateRecipeByTitle(req.params.title, req.body);
    if (updatedRecipe) {
      res.status(200).json({
        msg: `Recipe updated successfully.`,
        updatedRecipe: updatedRecipe,
      });
    } else {
      res
        .status(200)
        .json({ msg: `No recipe found with title: ${req.params.title}` });
    }
  } catch (err) {
    res.status(500).json({ err: `Failed to update recipe.`, errMsg: `${err}` });
  }
});

// * Delete recipe by Id
const deleteRecipeById = async (recipeId) => {
  try {
    return await Recipe.findByIdAndDelete(recipeId);
  } catch (err) {
    throw err;
  }
};

app.delete("/recipes/delete/id/:id", async (req, res) => {
  try {
    const deletedRecipe = await deleteRecipeById(req.params.id);
    if (deletedRecipe) {
      res.status(200).json({ msg: `Recipe deleted successfully.` });
    } else {
      res.status(200).json({ msg: `No recipe found by id: ${req.params.id}` });
    }
  } catch (err) {
    res.status(500).json({ err: `Failed to delete recipe.`, errMsg: `${err}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
