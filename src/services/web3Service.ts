import { ethers } from 'ethers';
import { Policy, Claim, UserPolicy, User } from '../types';

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
    if (!this.contract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const premiumInWei = ethers.parseEther(premiumInEth);
      
      // Estimate gas
      const gasEstimate = await this.contract.buyPolicy.estimateGas(policyId, { value: premiumInWei });
      
      // Send transaction
      const tx = await this.contract.buyPolicy(policyId, { 
        value: premiumInWei,
        gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Update user balance
      await this.updateUserBalance();

      return { success: true, txHash: receipt.hash };
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
    if (!this.contract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const requestedAmountInWei = ethers.parseEther(requestedAmountInEth);
      
      // Estimate gas
      const gasEstimate = await this.contract.submitClaim.estimateGas(
        policyId, 
        reason, 
        description, 
        requestedAmountInWei
      );
      
      // Send transaction
      const tx = await this.contract.submitClaim(
        policyId, 
        reason, 
        description, 
        requestedAmountInWei,
        { gasLimit: gasEstimate * 120n / 100n }
      );

      // Wait for confirmation
      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
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
    if (!this.contract || !this.signer || !this.currentUser?.isOwner) {
      throw new Error('Admin access required');
    }

    try {
      const premiumInWei = ethers.parseEther(premiumInEth);
      const coverageInWei = ethers.parseEther(coverageAmountInEth);
      
      // Estimate gas
      const gasEstimate = await this.contract.addPolicy.estimateGas(
        name,
        description,
        premiumInWei,
        coverageInWei,
        duration
      );
      
      // Send transaction
      const tx = await this.contract.addPolicy(
        name,
        description,
        premiumInWei,
        coverageInWei,
        duration,
        { gasLimit: gasEstimate * 120n / 100n }
      );

      // Wait for confirmation
      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
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
      const statusCode = status === 'Approved' ? 1 : 2; // 0: Pending, 1: Approved, 2: Rejected
      
      // Estimate gas
      const gasEstimate = await this.contract.processClaim.estimateGas(
        claimId,
        statusCode,
        adminNotes
      );
      
      // Send transaction
      const tx = await this.contract.processClaim(
        claimId,
        statusCode,
        adminNotes,
        { gasLimit: gasEstimate * 120n / 100n }
      );

      // Wait for confirmation
      const receipt = await tx.wait();

      // If approved, the contract will automatically transfer funds to the claimant
      // Update admin balance
      await this.updateUserBalance();

      return { success: true, txHash: receipt.hash };
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
}

// Global instance
export const web3Service = new Web3Service();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}