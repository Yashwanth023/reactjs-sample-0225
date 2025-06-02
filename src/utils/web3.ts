
// Web3 integration utility for bonus points
// This provides a foundation for blockchain features

export interface Web3Provider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

export class Web3Integration {
  private provider: Web3Provider | null = null;

  constructor() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.provider = (window as any).ethereum;
    }
  }

  async connectWallet(): Promise<string | null> {
    if (!this.provider) {
      console.warn('MetaMask not detected');
      return null;
    }

    try {
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      });
      return accounts[0] || null;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  }

  async getAccount(): Promise<string | null> {
    if (!this.provider) return null;

    try {
      const accounts = await this.provider.request({
        method: 'eth_accounts',
      });
      return accounts[0] || null;
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }

  async getBalance(address: string): Promise<string | null> {
    if (!this.provider) return null;

    try {
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      // Convert from Wei to ETH
      return (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }

  isAvailable(): boolean {
    return this.provider !== null;
  }
}

// Example usage for task ownership on blockchain
export const web3 = new Web3Integration();

// Mock smart contract interaction for task ownership
export async function createTaskOnBlockchain(taskData: {
  title: string;
  description: string;
  assignee: string;
}): Promise<string | null> {
  if (!web3.isAvailable()) {
    console.log('Web3 not available, using local storage instead');
    return null;
  }

  try {
    const account = await web3.getAccount();
    if (!account) {
      console.log('No wallet connected');
      return null;
    }

    // In a real implementation, this would interact with a smart contract
    console.log('Task would be created on blockchain:', {
      ...taskData,
      creator: account,
      timestamp: new Date().toISOString(),
    });

    // Return mock transaction hash
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  } catch (error) {
    console.error('Error creating task on blockchain:', error);
    return null;
  }
}
