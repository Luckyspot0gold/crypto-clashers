// src/components/WyomingAuth.js
import React from 'react';

export default function WyomingAuth() {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        // Here you would typically send the account to your backend for verification/signing
        // For now, we'll just store in local state or context
        console.log("Connected account:", account);
        // You can set this account in a context or redux store
      } catch (error) {
        console.error("Connection error:", error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <button onClick={connectWallet} className="wyoming-btn">
      🔓 Connect Wyoming Wallet
    </button>
  );
}