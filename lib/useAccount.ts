'use client';

import { useState, useEffect } from 'react';

export interface AccountSession {
  accountId: string;
  username: string;
}

export function useAccount(): AccountSession | null {
  const [account, setAccount] = useState<AccountSession | null>(null);

  useEffect(() => {
    fetch('/api/account/me')
      .then(r => r.json())
      .then(d => setAccount(d.account ?? null))
      .catch(() => setAccount(null));
  }, []);

  return account;
}
