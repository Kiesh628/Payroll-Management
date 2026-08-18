import React, { useState, useEffect, useRef } from 'react';
import { connectWallet, executePayment, checkBalance, estimateBatchGas } from '../utils/web3Helpers';

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
  const [walletBalance, setWalletBalance] = useState('0.0');
  const [estimatedGas, setEstimatedGas] = useState('0.0');
  const [completedCount, setCompletedCount] = useState(0);
  const isAborted = useRef(false);

  useEffect(() => {
    const runPreFlight = async () => {
      if (!walletAddress || !signer) return;
      try {
        const bal = await checkBalance(walletAddress);
        setWalletBalance(bal);
        if (parsedData.length > 0) {
          const sample = parsedData[0];
          const gas = await estimateBatchGas(
            signer,
            sample.address,
            sample.amount,
            parsedData.length
          );
          setEstimatedGas(gas);
        } else {
          setEstimatedGas('0.0');
        }
      } catch (err) {
        console.error(err);
      }
    };
    runPreFlight();
  }, [walletAddress, parsedData, signer]);

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
    setCompletedCount(0);
    isAborted.current = false;
    addLog("Starting batch payroll processing...", 'pending');

    for (let i = 0; i < parsedData.length; i++) {
      if (isAborted.current) {
        addLog("EXECUTION ABORTED BY USER", 'error');
        break;
      }

      const item = parsedData[i];
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

      setCompletedCount(i + 1);
    }

    if (!isAborted.current) {
      addLog("Batch payroll execution finished.", 'success');
    }
    setIsExecuting(false);
  };

  const totalWallets = parsedData.length;
  const totalETH = parsedData.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalRequiredWithGas = totalETH + Number(estimatedGas);
  const insufficientFunds = walletAddress && parsedData.length > 0 && (Number(walletBalance) < totalRequiredWithGas);

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
          <div className="stat-value">{totalETH.toFixed(4)} ETH</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Wallet Balance</div>
          <div className="stat-value">{Number(walletBalance).toFixed(4)} ETH</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Est. Gas Cost</div>
          <div className="stat-value">{Number(estimatedGas).toFixed(6)} ETH</div>
        </div>
      </div>

      {insufficientFunds && (
        <div className="text-error">INSUFFICIENT FUNDS</div>
      )}

      {isExecuting && (
        <>
          <div className="progress-container">
            <div 
              className="progress-fill" 
              style={{ width: `${parsedData.length > 0 ? (completedCount / parsedData.length) * 100 : 0}%` }}
            ></div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '0.85rem' }}>
            PROGRESS: {completedCount} / {parsedData.length} COMPLETED
          </div>
        </>
      )}

      {isExecuting ? (
        <button 
          className="neon-button-warning" 
          onClick={() => { isAborted.current = true; }}
        >
          ABORT SEQUENCE
        </button>
      ) : (
        <button 
          className="neon-button-red" 
          onClick={handleExecute}
          disabled={parsedData.length === 0 || !walletAddress || insufficientFunds}
        >
          EXECUTE PAYROLL
        </button>
      )}
    </div>
  );
}
