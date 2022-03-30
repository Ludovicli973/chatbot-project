'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const recipesRecom = require("./recipes");
const config = require('./config')
const fbeamer = require('./fbeamer');
const nlp = require('./wit-api');
const dish=require("./api/index")

const server = express();
const PORT = process.env.PORT || 3000;

let stream = new fbeamer(config.FB);

// Submit data to this endpoint
server.post('/recipe-bot', bodyParser.json({
  verify: stream.verifySignature.call(stream)
}));

// Submit data to this endpoint
server.post('/recipe-bot', (req, res, next) => {
  return stream.incoming(req, res, async data => {
    try {
      
      data.nlp = await nlp(data.content);
      
      console.log("nlp.intents[0] : ",data.nlp.intents[0]);
      console.log("nlp.entities1 : ",data.nlp.entities);
      //console.log("nlp.entities2 : ",data.nlp.entities["recipe:recipe"][0].value);

      // If the length is >0, that means if found some intents
      if(data.nlp.intents.length>0){
        console.log("confidence: ",data.nlp.intents[0].confidence);
        // If there are intents and the confidence is >0.8, we can respond to the user
        if(data.nlp.intents[0].confidence > 0.8){
          try{
            switch(data.nlp.intents[0].name){
              case "suggest_recipe_from_dishname":
                let temp_dish=await dish(data.nlp.entities["recipe:recipe"][0].value);
                stream.txt(data.sender,displayRecipe(temp_dish))
                break;
              default:
                let recipeData = await recipesRecom(data.sender, data.nlp.entities, data.nlp.intents[0].name)
                console.log(recipeData.length);
                for (let i = 0 ; i < recipeData.length ; i++){
                  if(recipeData[i].type == 'text'){
                    console.log('Im in here')
                    await stream.txt(data.sender, recipeData[i].content)
                  }
                  else{
                    await stream.txt(data.sender, "Stuck here");
                  }
                  
                console.log("im out");
            }
            }
            
          }
            
          catch (e) {
            stream.txt(data.sender, e)
          }
        }
        else{
          console.log("confidence too low");
          stream.txt(data.sender,"can't answer");
        }
      }
      else{// Else, there is no intent in this sentence
        console.log("doesn't find any intents in this sentence");
        stream.txt(data.sender,"can't answer");
      }
    } catch (e) {
      console.log('error : ',e);
    }
  });
});

server.get('/', (req, res) => res.send(`<h1>Hello world!</h1></br>Verify token is: ${stream.FB_VERIFY_TOKEN}</br>Access token is: ${stream.FB_PAGE_TOKEN}`));

//Create the endpoint, fetch data
server.get('/recipe-bot', (req, res) => {
 console.log("Registering...");
  stream.registerHook(req, res);
});

server.listen(PORT, () => console.log(`The bot server is running on port ${PORT}`));


function displayRecipe(dish){
  let msg="*"+dish.title+"*";
  msg+= "\n\n"+
    "*Ingredients :*\n";
  dish.ingredients.split("|").forEach(ingredient=>msg+="• "+ingredient+"\n")
  msg+="\n"+
    "*For how many people ?*\n"+
    dish.servings+"\n\n"+
    "*Steps :*\n"+
    dish.instructions;
  return msg;
}