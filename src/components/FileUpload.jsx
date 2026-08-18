import React, { useState, useRef } from 'react';
import { parseCSV } from '../utils/csvParser';

export default function FileUpload({ onDataParsed }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      try {
        const parsedData = await parseCSV(file);
        onDataParsed(parsedData);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="terminal-card">
      <h2 className="terminal-card-title">Payroll Data Feed</h2>
      <div 
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".csv" 
          style={{ display: 'none' }} 
          onChange={handleChange}
        />
        <div className="drop-zone-icon">⇪</div>
        <p>DRAG & DROP CSV FILE OR CLICK TO BROWSE</p>
        <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '5px' }}>
          Format: address, amount (ETH)
        </p>
      </div>
    </div>
  );
}
