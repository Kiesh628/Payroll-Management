import React, { useState } from 'react';
import { connectWallet, executePayment } from '../utils/web3Helpers';

export default function PaymentDashboard({ 
  parsedData, 
  walletAddress, 
  setWalletAddress, 
  signer, 
  setSigner, 
  addLog, 
  updateLog 
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { signer: web3Signer, address } = await connectWallet();
      setSigner(web3Signer);
      setWalletAddress(address);
      addLog(`Wallet connected: ${address}`, 'success');
    } catch (err) {
      console.error(err);
      addLog(`Connection failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleExecute = async () => {
    if (!signer) {
      alert("Please connect wallet first.");
      return;
    }
    if (parsedData.length === 0) {
      alert("Please upload a CSV file with payroll data.");
      return;
    }

    setIsExecuting(true);
    addLog("Starting batch payroll processing...", 'pending');

    for (const item of parsedData) {
      const { address, amount } = item;
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
      const logId = addLog(`Sending ${amount} ETH to ${shortAddress}`, 'pending');

      try {
        const txHash = await executePayment(signer, address, amount);
        updateLog(logId, 'success', txHash, ` [Tx: ${txHash.slice(0, 6)}...${txHash.slice(-4)}]`);
      } catch (err) {
        console.error(err);
        const errorMsg = err.reason || err.message || 'Transaction rejected';
        updateLog(logId, 'error', null, ` [Failed: ${errorMsg}]`);
      }
    }
    addLog("Batch payroll execution finished.", 'success');
    setIsExecuting(false);
  };

  const totalWallets = parsedData.length;
  const totalETH = parsedData.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(4);

  return (
    <div className="terminal-card purple">
      <h2 className="terminal-card-title">Payment Control</h2>
      
      {walletAddress ? (
        <div className="wallet-display">
          <span className="wallet-label">Connected Wallet:</span>
          <span className="wallet-value">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
      ) : (
        <button 
          className="neon-button-cyan" 
          onClick={handleConnect}
          disabled={isConnecting}
          style={{ width: '100%', marginBottom: '20px' }}
        >
          {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
        </button>
      )}

      <div className="dashboard-stats">
        <div className="stat-box">
          <div className="stat-label">Total Recipients</div>
          <div className="stat-value">{totalWallets}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Required</div>
          <div className="stat-value">{totalETH} ETH</div>
        </div>
      </div>

      <button 
        className="neon-button-red" 
        onClick={handleExecute}
        disabled={isExecuting || parsedData.length === 0 || !walletAddress}
      >
        {isExecuting ? 'EXECUTING BATCH...' : 'EXECUTE PAYROLL'}
      </button>
    </div>
  );
}
