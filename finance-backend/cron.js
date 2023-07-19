require('dotenv').config();
const cron = require('node-cron');
const { PlaidEnvironments } = require('plaid');
const axios = require('axios');
const Datastore = require('nedb');
const fs = require('fs');

const accounts = new Datastore({ filename: './data/accounts.db', autoload: true });

const getSubDates = () => {
  // Get today's date
  const today = new Date();

  // Get yesterday's date
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Get the day before yesterday's date
  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(today.getDate() - 2);

  // Format the dates as YYYY-MM-DD strings
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const dayBeforeYesterdayStr = dayBeforeYesterday.toISOString().slice(0, 10);

  return [dayBeforeYesterdayStr, yesterdayStr];
};

const getTransactions = async () => {
  const [x, y] = getSubDates();

  const plaidUrl = PlaidEnvironments[process.env.PLAID_ENV] + '/transactions/get';

  const accessTokens = await new Promise((resolve, reject) => {
    accounts.find({}, (err, docs) => {
        const tokens = Array.from(new Set(docs.map((d) => d.accessToken)));

        resolve(tokens);
    });
  });

  const ps = accessTokens.map((t) =>  {

    const payload = {
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        access_token: t,
        start_date: '2023-01-09', // x,
        end_date: y,
      };

      return axios
        .post(plaidUrl, payload);
  });

  const data = await Promise.all(ps);

  const allTransactions = data.map((d) => d.data.transactions.map((t) => t)).flat();

  console.log('Total ' + allTransactions.length);

  // console.log(allTransactions[0]);
  // console.log(allTransactions[10]);

  const uniqueTransactionIds = data.map((d) => d.data.transactions.map((t) => t.transaction_id)).flat();

  const uniqueTransactions = uniqueTransactionIds
    .map((t) => allTransactions
    .find((ct) => ct.transaction_id === t))
    .map((t) => ({
        "AUTHORIZED DATE": t.authorized_date,
        "DATE": t.date,
        "AMOUNT": t.amount,
        "CATEGORY": t.category.join(' + '),
        "MERCHANT NAME": t.merchant_name,
        "NAME": t.name,
        "PAYMENT CHANNEL": t.payment_channel,
        "TRANSACTION TYPE": t.transaction_type,
        "PENDING": t.pending,
        "PAYMENT_METHOD": t.payment_meta.payment_method,
    }));

  //console.log(uniqueTransactions);

  // const filePath = './data/spreadsheet.csv';
  await addToExistingSpreadsheetAlt(uniqueTransactions);
};

const addToExistingSpreadsheetAlt = async (uniqueTransactions) => {
  let dataToWrite = 'AUTHORIZED DATE,DATE,AMOUNT,CATEGORY,MERCHANT NAME,NAME,PAYMENT CHANNEL,TRANSACTION TYPE,PENDING,PAYMENT_METHOD\n';

  // Convert the uniqueTransactions array data to CSV format
  uniqueTransactions.forEach((transaction) => {
    const transactionValues = Object.values(transaction).join(',');
    dataToWrite += transactionValues + '\n';
  });

  console.log(dataToWrite);

  const webAppUrl = 'https://script.google.com/macros/s/AKfycbyK_hPhYSUDrEalvaLdLp5ziBS2QTWsInHEXSsxc-cmEfa1kx63HQlT42T0rGB7-1buFw/exec'; // Replace with your actual web app URL

  await axios.post(webAppUrl, dataToWrite);

  // .then((response) => {
  //   console.log('Response:', response.data);
  // })
  // .catch((error) => {
  //   console.error('Error:', error.message);
  // });
};

const addToExistingSpreadsheet = (uniqueTransactions, filePath) => {
    let dataToWrite = '';
  
    if (!fs.existsSync(filePath)) {
      // Create the header row if the file doesn't exist
      const headerRow = Object.keys(uniqueTransactions[0]).join(',') + '\n';
      dataToWrite += headerRow;
    }
  
    // Convert the uniqueTransactions array data to CSV format
    uniqueTransactions.forEach((transaction) => {
      const transactionValues = Object.values(transaction).join(',');
      dataToWrite += transactionValues + '\n';
    });
  
    // Append the data to the CSV file
    fs.appendFileSync(filePath, dataToWrite);
  };
  

(async () => {

    await getTransactions();

    process.exit(0);

})();

// cron.schedule('0 0 * * *', () => {
//   console.log('running a task every minute');
// });
