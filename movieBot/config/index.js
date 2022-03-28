'use strict';

if(process.env.NODE_ENV === 'production'){
  module.exports = {
    FB: {
      FB_PAGE_TOKEN: process.env.FB_PAGE_TOKEN,
      FB_VERIFY_TOKEN: process.env.FB_VERIFY_TOKEN,
      FB_APP_SECRET: process.env.FB_APP_SECRET,
    },
    WIT_TOKEN: process.env.WIT_TOKEN
  }
}

else{
  console.log('Check environment variables');
}