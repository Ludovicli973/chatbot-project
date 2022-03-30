const fs = require('fs');

async function saveUsers(users) {
  if (!fs.existsSync('./chatbot/recipes/Data/users.json')) {
    fs.writeFileSync('./chatbot/recipes/Data/users.json', '[]')
  }
  fs.writeFileSync('./chatbot/recipes/Data/users.json', JSON.stringify(users, '', 2))
}

async function addUpdateUser(id, recipes, users) {
  var user = users.find(function(user) {
    return user.id === id
  });

  if (user && recipes.length > 0) {
    user.recipes = Array.from(new Set(user.recipes.concat(recipes)))
  } else if (user == null && recipes.length > 0) {
    user = {
      "id": id,
      "recipes": recipes
    };
    users.push(user);
  } else if (user == null) {
    user = {
      "id": id,
      "recipes": []
    };
    users.push(user);
  }
  saveUsers(users);
  return user;
}

function resetUserPreferences(id, users) {
  console.log("id:",id);
  let user = users.find(function(user) {
    return user.id === id;
  });
  console.log("user:", user);
  if (user) {
    console.log(users);
    // users[user].recipes=[]
    users = users.filter(x=>x.id!=user.id);
    console.log(users);
    user.recipes = [];
    console.log(user)
    users.push(user);
    console.log(users);
    saveUsers(users);

    return { "status": 200, "message": "Your preferences have been updated :)" };
  }
  else {
    return { "status": 400, "message": "You don't seem to have an history yet..." };
  }
}

function cosineSimilarity(recipe1, recipe2) {
  let dotproduct = 0;
  let mA = 0;
  let mB = 0;

  for (i = 0; i < recipe1.length; i++) {
    dotproduct += (recipe1[i] * recipe2[i]);
    mA += (recipe1[i] * recipe1[i]);
    mB += (recipe2[i] * recipe2[i]);
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);

  let similarity = (dotproduct) / ((mA) * (mB))
  return similarity;
}

function findSimilarRecipes(recipeList, recipes, n) {
  let similarities = [];
  recipeList.forEach(recipe => {
    console.log("Recipe:", recipe)
    let recipeId = recipes.findIndex(r => r.name.toLowerCase() == recipe.toLowerCase());
    let similarity = new Array(recipes.length);
    for (let i = 0; i < recipes.length; i++) {
      similarity[i] = cosineSimilarity(recipes[i].values, recipes[recipeId].values)
    }
    if (similarities.length == 0) {
      similarities = similarity
    } else {
      for (let i = 0; i < similarity.length; i++) {
        similarities[i] += similarity[i];
      }
    }
  });

  let indices = similarities.map((e, i) => {
    return {
      "index": i,
      "value": e
    };
  }).sort((a, b) => {
    return b.value - a.value;
  }).slice(recipeList.length, n + recipeList.length).map(e => e.index);
  let names = indices.map(i => recipes[i].name);
  let recipesToReturn = []
  for (let i = 0; i < names.length; i++) {
    recipesToReturn[i] = {
      'name': names[i]
    }
  }
  return recipesToReturn
};

async function recommendFromRecipe(id, recipeName, n, recipes, users) {
  let user = await addUpdateUser(id, [recipeName], users);
  let recommendations = await findSimilarRecipes([recipeName], recipes, n);
  return {
    "status": 200,
    "message": "Recipe added to your favorites!",
    "recommendations": recommendations
  }
}

async function recommendFromUser(id, n, recipes, users) {
  let user = await addUpdateUser(id, [], users);
  if (user.recipes.length > 0) {
    let recommendations = await findSimilarRecipes(user.recipes, recipes, n);
    return {
      "status": 200,
      "message": "Here's what we suggest for you!",
      "recommendations": recommendations
    };

  } else {
    return {
      "status": 400,
      "message": "You don't seem to have any favorites yet.. Please let me know what they are!"
    };
  }
}

module.exports = {
  recommendFromRecipe,
  recommendFromUser,
  resetUserPreferences
}