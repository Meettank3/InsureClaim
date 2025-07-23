export interface Policy {
  policyId: number;
  name: string;
  description: string;
  premium: string; // in ETH
  coverageAmount: string; // in ETH
  duration: number; // in days
  active: boolean;
  createdAt: number;
}

export interface UserPolicy extends Policy {
  purchasedAt: number;
  expiresAt: number;
}

export interface Claim {
  claimId: number;
  policyId: number;
  user: string;
  reason: string;
  description: string;
  requestedAmount: string; // in ETH
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: number;
  processedAt?: number;
  adminNotes?: string;
}

export interface User {
  address: string;
  isOwner: boolean;
  balance: string; // in ETH
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}