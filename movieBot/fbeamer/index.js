'use strict';
const crypto = require('crypto')
const request = require('request');
const apiVersion = 'v12.0';

class FBeamer {
  constructor({ FB_PAGE_TOKEN, FB_VERIFY_TOKEN, FB_APP_SECRET }) {
    try {
        this.FB_PAGE_TOKEN = FB_PAGE_TOKEN;
        this.FB_VERIFY_TOKEN = FB_VERIFY_TOKEN;
        this.FB_APP_SECRET = FB_APP_SECRET;
    }

    catch (err) {
      console.log(err)
    }
  }

  registerHook(req, res) {
    const params = req.query;
    const mode = params['hub.mode'], token = params['hub.verify_token'], challenge = params['hub.challenge'];

    try {
      if (mode === 'subscribe' && token === this.FB_VERIFY_TOKEN) {
        console.log('Webhook registered');
        res.status(200).send(challenge);
      }
      else {
        console.log('Couldn\'t register WebHook');
        return res.sendStatus(401);
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  verifySignature(req, res, buf) {
    return (req, res, buf) => {
      if (req.method === 'POST') {
        try {
          x_hub_signatures = req.headers['x-hub-signature']
          let tempo_hash = crypto.createHmac('sha1', this.FB_APP_SECRET).update(buf, 'utf-8');
          let hash = tempo_hash.digest('hex');

          if (x_hub_signatures === ("sha1=" + hash)) {
            console.log("Matching signatures!")
            return true;
          }
          else {
            console.log("Signature incorrect!")
            return false;
          }

        }
        catch (err) {
          console.log(err);
        }
      }
    }
  }

  messageHandler(obj) {
    let sender = obj.sender.id;
    let message = obj.message;
    console.log("Message received:", obj.message);
    
    if (message.text) {
      let obj = {
        sender,
        type: 'text',
        content: message.text
      }

      return obj;
    }
  }

  incoming(req, res, cb) {
    res.sendStatus(200);
    if (req.body.object === 'page' && req.body.entry) {
      let data = req.body;
      data.entry.forEach(pageObj => {
        if (pageObj.messaging) {
          pageObj.messaging.forEach(messageObj => {
            if (messageObj.postback) {
              // Handle postbacks
            }
            else {
              return cb(this.messageHandler(messageObj));
            }
          })
        }
      })
    }
  }

  sendMessage(payload) {
    const request = require('request');
    return new Promise((resolve, reject) => {
      request({
        url: `https://graph.facebook.com/${apiVersion}/me/messages`,
        qs: {
          access_token: this.FB_PAGE_TOKEN
        },
        method: 'POST',
        json: payload
      }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          resolve({
            mid: body.message_id
          });
        } else {
          reject(error);
        }
      });
    });
  }

  txt(id, text, messaging_type = 'RESPONSE') {
    let obj = {
      messaging_type,
      recipient: {
        id
      },
      message: {
        text
      }
    }

    return this.sendMessage(obj);
  }

  img(id, image_url, messaging_type = 'RESPONSE') {
    let obj = {
      messaging_type,
      recipient: {
        id
      },
      message: {
        attachment: {
          type: 'image',
          payload: {
            url: image_url,
            is_reusable: true
          }
        }
      }
    }
    return this.sendMessage(obj);
  }

  web_url(id, title, url, image_url, messaging_type='RESPONSE'){
    let obj = {
      messaging_type,
      recipient:{
        id
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            "template_type":"generic",
            "elements":[
               {
                "title":title,
                "image_url":image_url,
                "default_action": {
                  "type": "web_url",
                  "url": url,
                  "webview_height_ratio": "compact"
                },
                 "buttons":[
                   {
                     "type":"web_url",
                     "url": url,
                     "title": "more info",
                   }
                 ]
              },
            ]
          }
        }
      }
    }
  return this.sendMessage(obj);
  }
}

module.exports = FBeamer;