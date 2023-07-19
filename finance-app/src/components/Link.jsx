import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

const API_URL = process.env.API_URL || `http://localhost:8000`;

const Link = (props) => {
  const onSuccess = React.useCallback((public_token, metadata) => {
    const response = fetch(`${API_URL}/api/set_access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_token }),
    });

    response.then(async () => {
      await props.getAccounts();
    });
  }, []);

  const config = {
    token: props.linkToken,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);
  return (
    <div className="bank-card" onClick={() => open()} disabled={!ready}>
      <div className="flex flex-col justify-center text-center h-[inherit] cursor-pointer">
        <p>
          <span className="material-symbols-outlined text-[3rem]">add_circle</span>
        </p>
        <p>Add Bank Account</p>
      </div>
    </div>
  );
};
export default Link;
