// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
const { DialogflowApp } = require('actions-on-google');
const functions = require('firebase-functions');
const admin = require("firebase-admin");
var serviceAccount = require('./innovationsmartoffice-firebase-adminsdk-2loka-776a2c4a4c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://innovationsmartoffice.firebaseio.com/'
});

exports.innovationSmartOfficeController = functions.https.onRequest((request, response) => {
  const app = new DialogflowApp({request, response});
  const WELCOME_ACTION = 'input.welcome';
  const LIGHT_ACTION = 'input.light-control';

  function welcomeIntent (app) {
    app.ask('Welcome to Innovation Smart Office! How can I help you ?',
    ['I\'m ready for the first request from you',
      'Are there any request ?',
      'If not we can stop here. See you soon.']);
  }

  function lightIntent (app) {
    let status = app.getArgument('status');
    let color = app.getArgument('color');
    storeLightMetaData(status, color);
    app.ask('The ' + color + ' light is turned ' + status + ".");
  }

  function storeLightMetaData(status, color) {
    let color_pin_number = 1;
    let status_code = 1;
    switch (color.toString().trim()) {
      case 'red':
        color_pin_number = 7;
        break;
      case 'yellow':
        color_pin_number = 3;
        break;
      case 'blue':
        color_pin_number = 4;
        break;
      default:
        break;
    }
    if (status.toString().trim() == 'on') {
      status_code = 0;
    } 
    let db = admin.database();
    let light = db.ref('controls/lights/' + color_pin_number);
    light.update({
      "value": status_code
    });
  }

  const actionMap = new Map();
  actionMap.set(WELCOME_ACTION, welcomeIntent);
  actionMap.set(LIGHT_ACTION, lightIntent);

  app.handleRequest(actionMap);
});
