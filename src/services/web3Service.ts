import { ethers } from 'ethers';
import { Policy, Claim, UserPolicy, User } from '../types';
import { mockDataStore } from './mockData';

// Contract ABI (simplified for demo - in production, import from compiled contract)
const INSURANCE_CONTRACT_ABI = [
  "function addPolicy(string memory _name, string memory _description, uint256 _premium, uint256 _coverageAmount, uint256 _duration) public",
  "function buyPolicy(uint256 _policyId) public payable",
  "function submitClaim(uint256 _policyId, string memory _reason, string memory _description, uint256 _requestedAmount) public",
  "function processClaim(uint256 _claimId, uint8 _status, string memory _adminNotes) public",
  "function getAllActivePolicies() public view returns (tuple(uint256,string,string,uint256,uint256,uint256,bool,uint256)[])",
  "function getUserClaims(address _user) public view returns (tuple(uint256,uint256,address,string,string,uint256,uint8,uint256,uint256,string)[])",
  "function getAllPendingClaims() public view returns (tuple(uint256,uint256,address,string,string,uint256,uint8,uint256,uint256,string)[])",
  "function owner() public view returns (address)",
  "event PolicyPurchased(uint256 policyId, address user, uint256 amount)",
  "event ClaimSubmitted(uint256 claimId, address user, uint256 policyId)",
  "event ClaimProcessed(uint256 claimId, uint8 status, string adminNotes)"
];

// Mock contract address - replace with actual deployed contract address
const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";

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

      // Check if user is owner (for demo, we'll use a simple check)
      let isOwner = false;
      try {
        const ownerAddress = await this.contract.owner();
        isOwner = address.toLowerCase() === ownerAddress.toLowerCase();
      } catch (error) {
        // If contract call fails, default to false
        console.log('Could not check owner status:', error);
      }

      this.currentUser = {
        address,
        isOwner,
        balance: balanceInEth
      };

      // Store user in mock data store
      mockDataStore.setUser(address, this.currentUser);

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
      // User disconnected
      this.disconnect();
    } else {
      // User switched accounts
      window.location.reload();
    }
  }

  private handleChainChanged() {
    // Reload the page when chain changes
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
    // Update user in mock data store when role changes
    if (user) {
      mockDataStore.setUser(user.address, user);
    }
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

  // Policy Management
  async buyPolicy(policyId: number, premiumInEth: string): Promise<{ success: boolean; txHash?: string }> {
    if (!this.signer || !this.currentUser) {
      throw new Error('Wallet not connected');
    }

    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user has enough balance
      const userBalance = parseFloat(this.currentUser.balance);
      const premium = parseFloat(premiumInEth);
      
      if (userBalance < premium) {
        throw new Error('Insufficient balance');
      }
      
      // Purchase policy in mock data store
      const userPolicy = mockDataStore.purchasePolicy(this.currentUser.address, policyId);
      if (!userPolicy) {
        throw new Error('Policy not available or already owned');
      }
      
      // Update user balance
      this.currentUser.balance = (userBalance - premium).toFixed(4);
      mockDataStore.setUser(this.currentUser.address, this.currentUser);
      
      // Generate mock transaction hash
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      return { success: true, txHash: mockTxHash };
    } catch (error: any) {
      console.error('Failed to buy policy:', error);
      throw new Error(error.reason || error.message || 'Transaction failed');
    }
  }

  async submitClaim(
    policyId: number, 
    reason: string, 
    description: string, 
    requestedAmountInEth: string
  ): Promise<{ success: boolean; txHash?: string }> {
    if (!this.signer || !this.currentUser) {
      throw new Error('Wallet not connected');
    }

    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user owns the policy
      const userPolicies = mockDataStore.getUserPolicies(this.currentUser.address);
      const ownedPolicy = userPolicies.find(p => p.policyId === policyId);
      
      if (!ownedPolicy) {
        throw new Error('You do not own this policy');
      }
      
      // Check if requested amount is within coverage
      if (parseFloat(requestedAmountInEth) > parseFloat(ownedPolicy.coverageAmount)) {
        throw new Error('Requested amount exceeds policy coverage');
      }
      
      // Submit claim
      mockDataStore.submitClaim(
        this.currentUser.address,
        policyId,
        reason,
        description,
        requestedAmountInEth
      );
      
      // Generate mock transaction hash
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      return { success: true, txHash: mockTxHash };
    } catch (error: any) {
      console.error('Failed to submit claim:', error);
      throw new Error(error.reason || error.message || 'Transaction failed');
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
    if (!this.signer || !this.currentUser?.isOwner) {
      throw new Error('Admin access required');
    }

    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add policy to mock data store
      mockDataStore.addPolicy({
        name,
        description,
        premium: premiumInEth,
        coverageAmount: coverageAmountInEth,
        duration,
        active: true
      });
      
      // Generate mock transaction hash
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      return { success: true, txHash: mockTxHash };
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
    if (!this.signer || !this.currentUser?.isOwner) {
      throw new Error('Admin access required');
    }

    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process claim in mock data store
      const success = mockDataStore.processClaim(claimId, status, adminNotes);
      if (!success) {
        throw new Error('Failed to process claim');
      }
      
      // If approved, simulate fund transfer by reducing admin balance
      if (status === 'Approved') {
        const claims = mockDataStore.getAllClaims();
        const claim = claims.find(c => c.claimId === claimId);
        if (claim) {
          const currentBalance = parseFloat(this.currentUser.balance);
          const claimAmount = parseFloat(claim.requestedAmount);
          this.currentUser.balance = Math.max(0, currentBalance - claimAmount).toFixed(4);
          mockDataStore.setUser(this.currentUser.address, this.currentUser);
        }
      }
      
      // Generate mock transaction hash
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      return { success: true, txHash: mockTxHash };
    } catch (error: any) {
      console.error('Failed to process claim:', error);
      throw new Error(error.reason || error.message || 'Transaction failed');
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

  // Mock data methods for MVP
  getAllPoliciesFromStore(): Policy[] {
    return mockDataStore.getAllPolicies();
  }

  getUserPoliciesFromStore(userAddress: string): UserPolicy[] {
    return mockDataStore.getUserPolicies(userAddress);
  }

  getUserClaimsFromStore(userAddress: string): Claim[] {
    return mockDataStore.getUserClaims(userAddress);
  }

  getAllClaimsFromStore(): Claim[] {
    return mockDataStore.getAllClaims();
  }

  getAllUserPoliciesFromStore(): { userAddress: string; policies: UserPolicy[] }[] {
    return mockDataStore.getAllUserPolicies();
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