const fs = require('fs');

const { recommendFromRecipe, recommendFromUser, resetUserPreferences } = require('./recommander.js');

const users = JSON.parse(fs.readFileSync('./chatbot/recipes/Data/users.json'));
const recipes = JSON.parse(fs.readFileSync('./chatbot/recipes/Data/recipes.json'));

module.exports = (userId, entity, intent) => {
  return new Promise(async function(resolve, reject) {
    try{ entity = entity["recipe:recipe"][0].value;}
    catch(e){ console.log('No entity');}
    if (intent) {
      console.log("Intent received:", intent);

      if (intent === 'suggest_recipes_from_recipe') {
        let recipeName = entity;
        console.log("Recipe to base comparisons on:", recipeName);
        try {
          let result = await recommendFromRecipe(userId, recipeName, 3, recipes, users);
          console.log(result);
          if (result.status === 200) {
            let response = [{
              type: 'text',
              content: 'Here are the recipes I think you might probably enjoy:'
            }];
            for (let i = 0; i < result.recommendations.length; i++) {
              response.push({
                title: result.recommendations[i].name
              })
            }
            resolve(response);
          } else {
            resolve([{
              type: 'text',
              content: 'Sorry, but I wasn\'t able to find the recipe you\'re mentionning... :/ Please try again.'
            }]);
          }
        } catch (e) {
          console.log(e);
          resolve([{
            type: 'text',
            content: 'Sorry, but I wasn\'t able to find the recipe you\'re mentionning... :/ Please try again.'
          }]);
        }
      } else if (intent === 'suggest_recipes_from_preferences') {
        try {
          let result = await recommendFromUser(userId, 3, recipes, users);
          console.log(result);
          if (result.status === 200) {
            let response = [{
              type: 'text',
              content: 'Here are the recipes I think you might liked, based on what you\'ve told me:',
            }];
            for (let i = 0; i < result.recommendations.length; i++) {
              response.push({
                title: result.recommendations[i].name
              });
            }
            resolve(response);
          } else if (result.status === 400) {
            resolve([{
              type: 'text',
              content: result.message
            }]);
          } else {
            resolve([{
              type: 'text',
              content: 'Sorry, it seems like we\'re not able to handle this...'
            }]);
          }
        } catch (e) {
          console.log(e);
          resolve([{
            type: 'text',
            content: 'Sorry, it seems like we\'re not able to handle this...'
          }]);
        }
      } else if (intent === 'help_user') {
        resolve([
          { type: 'text', content: "Welcome (back)!" },
          { type: 'text', content: "Quick tip:" },
          { type: 'text', content: "1. If this is the first time you're using me, give me the name of a recipe you've enjoyed :)" },
          { type: 'text', content: 'For example: "I liked the brownies recipe, can you suggest me anything similar?"' },
          { type: 'text', content: '2. If you have already used me before, you can ask the same question as above.' },
          { type: 'text', content: '3. If you don\'t have any particular recipe to ask about, you can just ask me for recommendations!' },
          { type: 'text', content: '4. Finally, if you ever wish that I forget about your preferences, you can juste ask me to!\nFor example : "Reset my preferences", which will reset your history of liked recipes. You can use this if the feel like I don\'t suggest you correctly anymore... :(' },
          { type: 'text', content: "Have fun cooking!!!" },
        ]);
      } else if(intent == 'reset_preferences'){
        await resetUserPreferences(userId, users);
        resolve([{
          type: 'text',
          content: 'Your recipe history has been cleared! You are invited to give us new ones that you like.'
        }
        ]);
      } else{
        resolve([{
          type:'text',
          content: 'Sorry but I don\'t think I\'m able to reply correctly to this... It might not be working or implemented!'
        }]);
      }
    } else{
      resolve([{
          type:'text',
          content: 'Sorry but I don\'t think I\'m able to reply correctly to this... It might not be working or implemented!'
        }]);
    }
  });
};