import { ethers } from 'ethers';
import { Policy, Claim, UserPolicy, User } from '../types';

// Your deployed contract ABI
const INSURANCE_CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum InsuranceClaim.ClaimStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "adminNotes",
        "type": "string"
      }
    ],
    "name": "ClaimProcessed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      }
    ],
    "name": "ClaimSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "premium",
        "type": "uint256"
      }
    ],
    "name": "PolicyAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "premium",
        "type": "uint256"
      }
    ],
    "name": "PolicyPurchased",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_premium",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_coverageAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_duration",
        "type": "uint256"
      }
    ],
    "name": "addPolicy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_policyId",
        "type": "uint256"
      }
    ],
    "name": "buyPolicy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "claims",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "requestedAmount",
        "type": "uint256"
      },
      {
        "internalType": "enum InsuranceClaim.ClaimStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "submittedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "processedAt",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "adminNotes",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllActivePolicies",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "policyId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "premium",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "coverageAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "duration",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct InsurancePolicy.Policy[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPendingClaims",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "claimId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "policyId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "reason",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "requestedAmount",
            "type": "uint256"
          },
          {
            "internalType": "enum InsuranceClaim.ClaimStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "submittedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "processedAt",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "adminNotes",
            "type": "string"
          }
        ],
        "internalType": "struct InsuranceClaim.Claim[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserClaims",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "claimId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "policyId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "reason",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "requestedAmount",
            "type": "uint256"
          },
          {
            "internalType": "enum InsuranceClaim.ClaimStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "submittedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "processedAt",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "adminNotes",
            "type": "string"
          }
        ],
        "internalType": "struct InsuranceClaim.Claim[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextClaimId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextPolicyId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "policies",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "premium",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "coverageAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "policyHolders",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "purchasedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiresAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_claimId",
        "type": "uint256"
      },
      {
        "internalType": "enum InsuranceClaim.ClaimStatus",
        "name": "_status",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "_adminNotes",
        "type": "string"
      }
    ],
    "name": "processClaim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_policyId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_reason",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_requestedAmount",
        "type": "uint256"
      }
    ],
    "name": "submitClaim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_policyId",
        "type": "uint256"
      }
    ],
    "name": "togglePolicyStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userClaims",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userOwnsPolicyId",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userPolicies",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// Your deployed contract address
const CONTRACT_ADDRESS = "0x4F30Ddec8AE54eDc0DEDB037a29B2575325361d1";

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private currentUser: User | null = null;

  async connectWallet(): Promise<User> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Get user address
      const address = await this.signer.getAddress();
      
      // Get balance
      const balance = await this.provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);

      // Initialize contract
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, INSURANCE_CONTRACT_ABI, this.signer);

      // Check if user is owner
      let isOwner = false;
      try {
        const ownerAddress = await this.contract.owner();
        isOwner = address.toLowerCase() === ownerAddress.toLowerCase();
      } catch (error) {
        console.log('Could not check owner status:', error);
      }

      this.currentUser = {
        address,
        isOwner,
        balance: balanceInEth
      };

      // Listen for account changes
      window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
      window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));

      return this.currentUser;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw new Error(error.message || 'Failed to connect to MetaMask');
    }
  }

  private handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      this.disconnect();
    } else {
      window.location.reload();
    }
  }

  private handleChainChanged() {
    window.location.reload();
  }

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  async updateUserBalance(): Promise<string> {
    if (!this.provider || !this.currentUser) {
      throw new Error('Wallet not connected');
    }

    const balance = await this.provider.getBalance(this.currentUser.address);
    const balanceInEth = ethers.formatEther(balance);
    this.currentUser.balance = balanceInEth;
    return balanceInEth;
  }

  // Convert blockchain data to frontend format
  private formatPolicy(policyData: any): Policy {
    return {
      policyId: Number(policyData.policyId),
      name: policyData.name,
      description: policyData.description,
      premium: ethers.formatEther(policyData.premium),
      coverageAmount: ethers.formatEther(policyData.coverageAmount),
      duration: Number(policyData.duration),
      active: policyData.active,
      createdAt: Number(policyData.createdAt) * 1000 // Convert to milliseconds
    };
  }

  private formatClaim(claimData: any): Claim {
    const statusMap = ['Pending', 'Approved', 'Rejected'];
    return {
      claimId: Number(claimData.claimId),
      policyId: Number(claimData.policyId),
      user: claimData.user,
      reason: claimData.reason,
      description: claimData.description,
      requestedAmount: ethers.formatEther(claimData.requestedAmount),
      status: statusMap[claimData.status] as 'Pending' | 'Approved' | 'Rejected',
      submittedAt: Number(claimData.submittedAt) * 1000,
      processedAt: claimData.processedAt > 0 ? Number(claimData.processedAt) * 1000 : undefined,
      adminNotes: claimData.adminNotes || undefined
    };
  }

  // Policy Management
  async getAllPolicies(): Promise<Policy[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const policies = await this.contract.getAllActivePolicies();
      return policies.map((policy: any) => this.formatPolicy(policy));
    } catch (error: any) {
      console.error('Failed to fetch policies:', error);
      throw new Error(error.reason || error.message || 'Failed to fetch policies');
    }
  }

  async buyPolicy(policyId: number, premiumInEth: string): Promise<{ success: boolean; txHash?: string }> {
    if (!this.contract || !this.signer || !this.currentUser) {
      throw new Error('Wallet not connected');
    }

    try {
      const premiumInWei = ethers.parseEther(premiumInEth);
      const tx = await this.contract.buyPolicy(policyId, { value: premiumInWei });
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Failed to buy policy:', error);
      throw new Error(error.reason || error.message || 'Transaction failed');
    }
  }

  async getUserPolicies(userAddress: string): Promise<UserPolicy[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Get all policies first
      const allPolicies = await this.contract.getAllActivePolicies();
      const userPolicies: UserPolicy[] = [];

      // Check each policy to see if user owns it
      for (const policy of allPolicies) {
        const policyId = Number(policy.policyId);
        const ownsPolicy = await this.contract.userOwnsPolicyId(userAddress, policyId);
        
        if (ownsPolicy) {
          // Get policy holders for this policy to find purchase details
          try {
            // We need to iterate through policy holders to find this user's purchase
            // This is a limitation of the current contract structure
            const userPolicy: UserPolicy = {
              ...this.formatPolicy(policy),
              purchasedAt: Date.now() - 86400000, // Mock data - contract doesn't store this easily accessible
              expiresAt: Date.now() + (Number(policy.duration) * 24 * 60 * 60 * 1000)
            };
            userPolicies.push(userPolicy);
          } catch (error) {
            console.log('Could not get purchase details for policy', policyId);
          }
        }
      }

      return userPolicies;
    } catch (error: any) {
      console.error('Failed to fetch user policies:', error);
      throw new Error(error.reason || error.message || 'Failed to fetch user policies');
    }
  }

  // Claims Management
  async submitClaim(
    policyId: number, 
    reason: string, 
    description: string, 
    requestedAmountInEth: string
  ): Promise<{ success: boolean; txHash?: string }> {
    if (!this.contract || !this.signer || !this.currentUser) {
      throw new Error('Wallet not connected');
    }

    try {
      const requestedAmountInWei = ethers.parseEther(requestedAmountInEth);
      const tx = await this.contract.submitClaim(policyId, reason, description, requestedAmountInWei);
      
      console.log('Claim transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Claim transaction confirmed:', receipt);
      
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Failed to submit claim:', error);
      throw new Error(error.reason || error.message || 'Transaction failed');
    }
  }

  async getUserClaims(userAddress: string): Promise<Claim[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const claims = await this.contract.getUserClaims(userAddress);
      return claims.map((claim: any) => this.formatClaim(claim));
    } catch (error: any) {
      console.error('Failed to fetch user claims:', error);
      throw new Error(error.reason || error.message || 'Failed to fetch user claims');
    }
  }

  async getAllClaims(): Promise<Claim[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const pendingClaims = await this.contract.getAllPendingClaims();
      return pendingClaims.map((claim: any) => this.formatClaim(claim));
    } catch (error: any) {
      console.error('Failed to fetch all claims:', error);
      throw new Error(error.reason || error.message || 'Failed to fetch all claims');
    }
  }

  // Admin Functions
  async addPolicy(
    name: string,
    description: string,
    premiumInEth: string,
    coverageAmountInEth: string,
    duration: number
  ): Promise<{ success: boolean; txHash?: string }> {
    if (!this.contract || !this.signer || !this.currentUser?.isOwner) {
      throw new Error('Admin access required');
    }

    try {
      const premiumInWei = ethers.parseEther(premiumInEth);
      const coverageInWei = ethers.parseEther(coverageAmountInEth);
      
      const tx = await this.contract.addPolicy(name, description, premiumInWei, coverageInWei, duration);
      
      console.log('Add policy transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Add policy transaction confirmed:', receipt);
      
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Failed to add policy:', error);
      throw new Error(error.reason || error.message || 'Transaction failed');
    }
  }

  async processClaim(
    claimId: number, 
    status: 'Approved' | 'Rejected', 
    adminNotes: string
  ): Promise<{ success: boolean; txHash?: string }> {
    if (!this.contract || !this.signer || !this.currentUser?.isOwner) {
      throw new Error('Admin access required');
    }

    try {
      const statusCode = status === 'Approved' ? 1 : 2; // 0=Pending, 1=Approved, 2=Rejected
      const tx = await this.contract.processClaim(claimId, statusCode, adminNotes);
      
      console.log('Process claim transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Process claim transaction confirmed:', receipt);
      
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Failed to process claim:', error);
      throw new Error(error.reason || error.message || 'Transaction failed');
    }
  }

  // Get all user policies for admin view
  async getAllUserPolicies(): Promise<{ userAddress: string; policies: UserPolicy[] }[]> {
    if (!this.contract || !this.currentUser?.isOwner) {
      throw new Error('Admin access required');
    }

    try {
      // This is a complex query that would require iterating through all policy holders
      // For now, return empty array as the contract doesn't have an efficient way to get this
      // In a production environment, you'd want to add events or additional mappings to the contract
      return [];
    } catch (error: any) {
      console.error('Failed to fetch all user policies:', error);
      throw new Error(error.reason || error.message || 'Failed to fetch user policies');
    }
  }

  // Utility function to check if MetaMask is installed
  static isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash: string) {
    if (!this.provider) {
      throw new Error('Provider not available');
    }
    return await this.provider.getTransactionReceipt(txHash);
  }

  // Fallback methods for compatibility (these now call the real blockchain methods)
  getAllPoliciesFromStore(): Promise<Policy[]> {
    return this.getAllPolicies();
  }

  async getUserPoliciesFromStore(userAddress: string): Promise<UserPolicy[]> {
    return this.getUserPolicies(userAddress);
  }

  async getUserClaimsFromStore(userAddress: string): Promise<Claim[]> {
    return this.getUserClaims(userAddress);
  }

  async getAllClaimsFromStore(): Promise<Claim[]> {
    return this.getAllClaims();
  }

  async getAllUserPoliciesFromStore(): Promise<{ userAddress: string; policies: UserPolicy[] }[]> {
    return this.getAllUserPolicies();
  }
}

// Global instance
export const web3Service = new Web3Service();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}