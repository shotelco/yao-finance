const app = require('express').Router();
const axios = require('axios');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

const client = new PlaidApi(configuration);

app.post('/api/create_link_token', async (req, res) => {
  const configs = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: process.env.CURRENT_USER_ID,
    },
    client_name: 'fAInancial',
    products: process.env.PLAID_PRODUCTS.split(','),
    country_codes: ['US'],
    language: 'en',
  };

  configs.redirect_uri = process.env.PLAID_REDIRECT_URI;

  try {
    const tokenData = await client.linkTokenCreate(configs);
    res.status(200).json(tokenData.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

app.post('/api/set_access_token', async (req, res) => {
  const publicToken = req.body.public_token;

  const tokenResponse = await client.itemPublicTokenExchange({
    public_token: publicToken,
  });

  const accessToken = tokenResponse.data.access_token;
  const itemId = tokenResponse.data.item_id;

  const authDetails = await client.authGet({ access_token: accessToken });

  const { accounts } = authDetails.data;

  for (const account of accounts) {
    await new Promise((resolve, reject) => {
      req.accounts.update(
        { accountId: account.account_id },
        { accountId: account.account_id, officialName: account.official_name, name: account.name, subtype: account.subtype, currency: account.balances.iso_currency_code, accessToken, itemId },
        { upsert: true },
        (err, numReplaced, upsert) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  res.json({});
});

app.get('/api/accounts', async (req, res) => {
  req.accounts.find({}, (err, docs) => {
    res.status(200).json({
        accounts: docs.map((d) => ({ accountId: d.accountId, name: d.name, officialName: d.officialName, subtype: d.subtype, currency: d.currency })),
    })
  });
});

app.delete('/api/accounts/:accountId', async (req, res) => {
    const { accountId } = req.params;

    console.log({accountId });

    req.accounts.remove({ accountId }, {}, () => {
        res.status(200).json({});
    });
});








// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
app.get('/api/transactions', async (req, res) => {
    req.accounts.findOne({}, async (err, doc) => {
      const { accessToken } = doc;
  
      // Set cursor to empty to receive all historical updates
      let cursor = null;
  
      // New transaction updates since "cursor"
      let added = [];
      let modified = [];
      // Removed transaction ids
      let removed = [];
      let hasMore = true;
      // Iterate through each page of new transaction updates for item
      while (hasMore) {
        const request = {
          access_token: accessToken,
          cursor: cursor,
        };
        const response = await client.transactionsSync(request);
        const data = response.data;
        // Add this page of results
        added = added.concat(data.added);
        modified = modified.concat(data.modified);
        removed = removed.concat(data.removed);
        hasMore = data.has_more;
        // Update cursor to the next cursor
        cursor = data.next_cursor;
      }
  
      const compareTxnsByDateAscending = (a, b) =>
        (a.date > b.date) - (a.date < b.date);
      // Return the 8 most recent transactions
      const recently_added = [...added]
        .sort(compareTxnsByDateAscending)
        .slice(-8);
      res.json({ latest_transactions: recently_added });
    });
  });

module.exports = app;
