// src/components/WyomingAuth.js
import { QuantumChat } from 'stone_sdk';

export default function WyomingAuth() {
  const connectWallet = async () => {
    // Wyoming Protocol 7 authentication
    const address = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    const quantumChat = new QuantumChat();
    const response = await quantumChat.send(
      `User ${address[0]} authenticated with Crypto Clashers`,
      { protocol: "Wyoming-7" }
    );
    
    localStorage.setItem('wyoming_proof', response.quantumSignature);
  };

  return (
    <button onClick={connectWallet} className="wyoming-btn">
      🔓 Connect Wyoming Wallet
    </button>
  );
}
