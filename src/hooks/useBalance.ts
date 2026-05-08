import { useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useUserStore } from '../context/store';

export function useBalance() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const { setBalance, setBalanceLoading, setSolanaNetwork } = useUserStore();

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance(null);
      setSolanaNetwork(null);
      return;
    }

    try {
      setBalanceLoading(true);
      
      // Fetch balance
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);

      // Check network
      // The connection object contains info about the endpoint
      const endpoint = (connection as any)._rpcEndpoint || '';
      if (endpoint.includes('devnet')) {
        setSolanaNetwork('devnet');
      } else if (endpoint.includes('testnet')) {
        setSolanaNetwork('testnet');
      } else if (endpoint.includes('mainnet')) {
        setSolanaNetwork('mainnet-beta');
      } else {
        setSolanaNetwork('unknown');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, [publicKey, connected, connection, setBalance, setBalanceLoading, setSolanaNetwork]);

  useEffect(() => {
    fetchBalance();

    // Set up a refresh interval every 30 seconds
    const interval = setInterval(fetchBalance, 30000);

    // Also listen for account changes
    let subscriptionId: number | undefined;
    if (publicKey && connected) {
      subscriptionId = connection.onAccountChange(
        publicKey,
        () => {
          fetchBalance();
        },
        'confirmed'
      );
    }

    return () => {
      clearInterval(interval);
      if (subscriptionId !== undefined) {
        connection.removeAccountChangeListener(subscriptionId);
      }
    };
  }, [publicKey, connected, connection, fetchBalance]);

  return { refresh: fetchBalance };
}
