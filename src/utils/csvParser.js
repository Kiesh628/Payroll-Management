import Papa from 'papaparse';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const parsed = [];
        const addressRegex = /^0x[a-fA-F0-9]{40}$/;

        for (const row of data) {
          const address = (row.address || '').trim();
          const amount = (row.amount || '').trim();

          if (!addressRegex.test(address)) {
            alert(`Invalid Ethereum address found: "${address}"`);
            reject(new Error(`Invalid Ethereum address: ${address}`));
            return;
          }

          if (isNaN(Number(amount)) || Number(amount) <= 0) {
            alert(`Invalid amount found for address ${address}: "${amount}"`);
            reject(new Error(`Invalid amount: ${amount}`));
            return;
          }

          parsed.push({ address, amount });
        }
        resolve(parsed);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
