const axios = require('axios');
const config = require('../config')
const witToken = config.WIT_TOKEN

const nlp = text => {
  return new Promise((resolve, reject) => {
    axios.get(
      `https://api.wit.ai/message?v=20220131&q=${text}`,
      { headers: { Authorization: `Bearer ${witToken}` } }
    ).then(resp => {
      // console.log(resp.data)
      resolve(resp.data)
    }).catch(error => {
      // console.log('error in get nlp', error.response.data)
      reject(error.response.data);
    });
  });
}

module.exports = nlp