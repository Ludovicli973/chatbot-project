'use strict';

require("dotenv").config();
const bodyParser = require('body-parser');
const express = require('express');
const config = require('./config')
const fbeamer = require('./fbeamer')
const matcher = require('./matcher');
const nlp = require('./tmdb');
const wit = require('node-wit');

const server = express();
const PORT = process.env.PORT || 3000;

let stream = new fbeamer(config.FB);

server.post('/recipe-bot', bodyParser.json({
  verify: stream.verifySignature.call(stream)
}));

server.post('/recipe-bot', (req, res, next) => {
  return stream.incoming(req, res, async data => {
    try {
      matcher(data.content, async cb => {

        try {
          data.nlp = await nlp(data.content)
        } catch (e) {
          console.log('error in nlp', e)
        }

        console.log(data.nlp);

        switch (cb.intent) {
          case 'Hello':
            stream.txt(data.sender, `${cb.entities.groups.greeting} you!`);
            console.log(`${cb.entities.groups.greeting} you!`);
            break;

          case 'Exit':
            stream.txt(data.sender, 'bye');
            console.log('bye');
            break;

          case 'get weather':
            stream.txt(data.sender, 'metéo');
            console.log('metéo');
            break;

          case 'Current Weather':
            stream.txt(data.sender, 'météo actuelle');
            console.log('météo actuelle');
            break;

          default:
            if (data.nlp.intents[0].confidence > 0.8) {
              console.log(`name: ${data.nlp.intents[0].name}`)
              switch (data.nlp.intents[0].name) {
                case 'movieinfo':
                  stream.txt(data.sender, `Infos sur film ${Object.values(data.nlp.entities)[0][0].value}`);
                  console.log(Object.values(data.nlp.entities)[0][0].value);
                  break;

                case 'director':
                  stream.txt(data.sender, `Infos sur directeur de ${Object.values(data.nlp.entities)[0][0].value}`);
                  console.log(Object.values(data.nlp.entities)[0][0].value);
                  break;

                case 'releaseYear':
                  stream.txt(data.sender, `Infos année sur ${Object.values(data.nlp.entities)[0][0].value}`);
                  console.log(Object.values(data.nlp.entities)[0][0].value);
                  break;

                default:
                  stream.txt(data.sender, `That's not something I'm able to tell you... ${Object.values(data.nlp.entities)[0][0].value}`);
                  console.log(Object.values(data.nlp.entities)[0][0].value);
                  break;
              }
            }
            else {
              switch (data.content) {
                case 'send me image':
                  stream.img(data.sender, 'https://img.buzzfeed.com/buzzfeed-static/static/2017-02/3/16/campaign_images/buzzfeed-prod-fastlane-03/a-french-consulate-in-brazil-actually-used-a-pepe-2-8670-1486156846-0_dblbig.jpg');
                  console.log('pepe image link');
                  break;

                default:
                  stream.txt(data.sender, 'I\'m sorry but I\'m stuck...');
                  console.log('I\'m sorry but I\'m stuck...');
                  break;
              }
            }
        }
      })

    } catch (e) {
      console.log('error' + e);
    }
  });
});

server.get('/', (req, res) => res.send(`<h1>Hello world!</h1></br>Verify token is: ${stream.FB_VERIFY_TOKEN}</br>Access token is: ${stream.FB_PAGE_TOKEN}`));

server.get('/recipe-bot', (req, res) => stream.registerHook(req, res));

server.listen(PORT, () => console.log(`The bot server is running on port ${PORT}`));
