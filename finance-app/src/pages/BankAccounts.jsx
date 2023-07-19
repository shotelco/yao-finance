import React, { useEffect, useState } from 'react';

const API_URL = process.env.API_URL || `http://localhost:8000`;

import Link from '../components/Link';
import CardImage from '../assets/card.png';

export default function BankAccounts() {
  const [linkToken, setLinkToken] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const generateToken = async () => {
    const response = await fetch(`${API_URL}/api/create_link_token`, {
      method: 'POST',
    });
    const data = await response.json();

    console.log(data.link_token);
    setLinkToken(data.link_token);
  };

  const getAccounts = async () => {
    const response = await fetch(`${API_URL}/api/accounts`, {
      method: 'GET',
    });
    const data = await response.json();

    console.log(data.accounts);
    setAccounts(data.accounts);
  };

  const removeAccount = async (accountId) => {
    const response = await fetch(`${API_URL}/api/accounts/${accountId}`, {
      method: 'DELETE',
    });
    const data = await response.json();


    const newAccounts = accounts.filter((a) => a.accountId != accountId);
    setAccounts(newAccounts);
  };

  useEffect(() => {
    generateToken();
    getAccounts();
  }, []);

  return (
    <div className="bg-gray-50 pt-[30px] h-[100vh] -mt-[60px]">
      <div className="max-w-[1120px] mx-auto">
        <div className="mb-[35px] px-[30px]">
          <h1 className="text-2xl font-semibold text-gray-700">
            Bank Accounts
          </h1>
          <h2 className="text-lg font-medium text-gray-500">
            Overview of your bank accounts
          </h2>
        </div>

        <div className="grid m-auto better-grid gap-8 justify-items-center">
          <Link linkToken={linkToken} getAccounts={getAccounts}></Link>

          {accounts.map((a, i) => (
            <div key={i} className="bank-card not-blank">
              <div className='flex justify-between'>
                <p className="text-lg">{a.name}</p>
                <p>
                  <span onClick={() => {
                    const ok = window.confirm("Do you want to remove this account?");
                    if (ok) removeAccount(a.accountId);
                  }} title='Remove Account' className="material-symbols-outlined cursor-pointer rounded-md hover:bg-gray-300">delete</span>
                </p>
              </div>

              <p className="h-[48px]">{a.officialName}</p>

              <div className="flex justify-between">
                <p>{a.currency}</p>
                <p>{a.subtype.toUpperCase()}</p>
              </div>
            </div>
          ))}

          {[...new Array(Math.max(5 - accounts.length, 0))].map((x, i) => (
            <div key={i} className="bank-card">
              <img src={CardImage} alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
