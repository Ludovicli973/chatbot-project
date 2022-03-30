const axios = require("axios");


const options = dish =>( {
  method: 'GET',
  url: 'https://recipe-by-api-ninjas.p.rapidapi.com/v1/recipe',
  params: {query: dish},
  headers: {
    'X-RapidAPI-Host': 'recipe-by-api-ninjas.p.rapidapi.com',
    'X-RapidAPI-Key': '7143b32c4bmshf27bf859b5ab0a3p1b8e7fjsnb504c13fe516'
  }
});


async function dish(query){
  try{
    let returned_data = await axios.request(options(query));
    return returned_data.data[0];
  }
  catch(e){
      console.error(e);
  }
}



module.exports = dish