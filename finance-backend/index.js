'use strict';

// read env vars from .env file
require('dotenv').config();
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const express = require('express');
const cors = require('cors');

const Datastore = require('nedb');
const accounts = new Datastore({ filename: './data/accounts.db', autoload: true });

const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

const client = new PlaidApi(configuration);

const app = express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  req.client = client;
  req.accounts = accounts;
  next();
});

app.use(require('./api'));

const server = app.listen(APP_PORT, function () {
  console.log('server listening on port ' + APP_PORT);
});
