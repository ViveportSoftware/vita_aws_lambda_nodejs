'use strict';

const fs = require('fs');

let rawEvent = fs.readFileSync('./event.json'); // from working directory
let event = JSON.parse(rawEvent.toString());

let handler = require('./index.js'); // from source code directory

handler.handler ( 
  event,
  {}, // context 
  (error, result) => { 
    if (error) {
      console.error(JSON.stringify(error, null, 2));
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  }
);