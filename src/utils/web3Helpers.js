import { ethers } from 'ethers';

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== 11155111n) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.ankr.com/eth_sepolia'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { signer, address };
};

export const executePayment = async (signer, address, amount) => {
  const tx = await signer.sendTransaction({
    to: address,
    value: ethers.parseEther(amount),
  });
  return tx.hash;
};

export const checkBalance = async (address) => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

export const estimateBatchGas = async (signer, sampleAddress, sampleAmount, count) => {
  const feeData = await signer.provider.getFeeData();
  const gasPrice = feeData.gasPrice || 20000000000n;
  const gasLimit = await signer.estimateGas({
    to: sampleAddress,
    value: ethers.parseEther(sampleAmount),
  });
  const totalGasWei = gasLimit * gasPrice * BigInt(count);
  return ethers.formatEther(totalGasWei);
};
