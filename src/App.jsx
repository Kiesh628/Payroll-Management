import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import PaymentDashboard from './components/PaymentDashboard';
import TransferLog from './components/TransferLog';

export default function App() {
  const [payrollData, setPayrollData] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [signer, setSigner] = useState(null);
  const [executionLogs, setExecutionLogs] = useState([]);

  const addLog = (text, status = 'pending', txHash = null) => {
    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toLocaleTimeString();
    const newLog = { id, timestamp, text, status, txHash };
    setExecutionLogs((prev) => [...prev, newLog]);
    return id;
  };

  const updateLog = (id, status, txHash = null, textExtension = '') => {
    setExecutionLogs((prev) =>
      prev.map((log) =>
        log.id === id
          ? {
              ...log,
              status,
              txHash: txHash !== null ? txHash : log.txHash,
              text: log.text + textExtension,
            }
          : log
      )
    );
  };

  const handleDataParsed = (data) => {
    setPayrollData(data);
    addLog(`Successfully loaded ${data.length} records from CSV.`, 'success');
  };

  return (
    <div className="app-container">
      <header className="terminal-header">
        <h1>CYBER-PAY: Web3 Payroll Terminal</h1>
        <div className="subtitle">DECENTRALIZED BATCH PAYMENT TERMINAL // SEPOLIA TESTNET</div>
      </header>

      <main className="split-layout">
        <div className="left-panel">
          <FileUpload onDataParsed={handleDataParsed} />
          <PaymentDashboard
            parsedData={payrollData}
            walletAddress={walletAddress}
            setWalletAddress={setWalletAddress}
            signer={signer}
            setSigner={setSigner}
            addLog={addLog}
            updateLog={updateLog}
          />
        </div>
        <div className="right-panel">
          <TransferLog logs={executionLogs} />
        </div>
      </main>
    </div>
  );
}
