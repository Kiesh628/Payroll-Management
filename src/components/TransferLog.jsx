import React, { useEffect, useRef } from 'react';

export default function TransferLog({ logs }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getBadgeClass = (status) => {
    switch (status) {
      case 'success':
        return 'badge-success';
      case 'error':
        return 'badge-error';
      case 'pending':
      default:
        return 'badge-pending';
    }
  };

  return (
    <div className="terminal-card">
      <h2 className="terminal-card-title">Transfer Logs & Audit Trail</h2>
      <div className="logs-container" ref={containerRef}>
        {logs.length === 0 ? (
          <div className="log-line" style={{ opacity: 0.5 }}>
            <span className="log-text">TERMINAL IDLE. AWAITING DATA OR CONNECTED WALLET...</span>
          </div>
        ) : (
          logs.map((log) => (
            <div className="log-line" key={log.id}>
              <div className="log-text">
                <span className="log-time">[{log.timestamp}]</span>
                <span>{log.text}</span>
                {log.txHash && (
                  <span>
                    {' -> '}
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${log.txHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="tx-hash-link"
                    >
                      VIEW TX
                    </a>
                  </span>
                )}
              </div>
              <div>
                <span className={getBadgeClass(log.status)}>{log.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
