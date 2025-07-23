import { Policy, Claim, UserPolicy, User } from '../types';

// Mock data - in a real app, this would come from the blockchain
let mockPolicies: Policy[] = [
  {
    policyId: 1,
    name: "Basic Health Insurance",
    description: "Comprehensive health coverage for individuals and families",
    premium: "0.1",
    coverageAmount: "5.0",
    duration: 365,
    active: true,
    createdAt: Date.now() - 86400000 * 30
  },
  {
    policyId: 2,
    name: "Auto Insurance Premium",
    description: "Complete vehicle protection with collision and comprehensive coverage",
    premium: "0.15",
    coverageAmount: "10.0",
    duration: 365,
    active: true,
    createdAt: Date.now() - 86400000 * 20
  },
  {
    policyId: 3,
    name: "Home Protection Plan",
    description: "Property insurance covering fire, theft, and natural disasters",
    premium: "0.2",
    coverageAmount: "15.0",
    duration: 365,
    active: true,
    createdAt: Date.now() - 86400000 * 10
  }
];

let mockClaims: Claim[] = [
  {
    claimId: 1,
    policyId: 1,
    user: "0x1234567890123456789012345678901234567890",
    reason: "Medical Emergency",
    description: "Hospital treatment for emergency surgery",
    requestedAmount: "2.5",
    status: "Pending",
    submittedAt: Date.now() - 86400000 * 5,
    adminNotes: ""
  }
];

let mockUserPolicies: UserPolicy[] = [
  {
    policyId: 1,
    name: "Basic Health Insurance",
    description: "Comprehensive health coverage for individuals and families",
    premium: "0.1",
    coverageAmount: "5.0",
    duration: 365,
    active: true,
    createdAt: Date.now() - 86400000 * 30,
    purchasedAt: Date.now() - 86400000 * 15,
    expiresAt: Date.now() + 86400000 * 350
  }
];

let currentUser: User = {
  address: "0x1234567890123456789012345678901234567890",
  isOwner: false,
  balance: "1.5"
};

// Mock blockchain service
export const blockchainService = {
  // Connect wallet (mock)
  connectWallet: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection delay
    return currentUser;
  },

  // Get all active policies
  getAllPolicies: async (): Promise<Policy[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPolicies.filter(p => p.active);
  },

  // Purchase a policy
  buyPolicy: async (policyId: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction time
    
    const policy = mockPolicies.find(p => p.policyId === policyId);
    if (!policy) return false;

    const userPolicy: UserPolicy = {
      ...policy,
      purchasedAt: Date.now(),
      expiresAt: Date.now() + (policy.duration * 24 * 60 * 60 * 1000)
    };

    mockUserPolicies.push(userPolicy);
    return true;
  },

  // Get user's policies
  getUserPolicies: async (): Promise<UserPolicy[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUserPolicies;
  },

  // Submit a claim
  submitClaim: async (policyId: number, reason: string, description: string, amount: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newClaim: Claim = {
      claimId: mockClaims.length + 1,
      policyId,
      user: currentUser.address,
      reason,
      description,
      requestedAmount: amount,
      status: "Pending",
      submittedAt: Date.now()
    };

    mockClaims.push(newClaim);
    return true;
  },

  // Get user's claims
  getUserClaims: async (): Promise<Claim[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockClaims.filter(c => c.user === currentUser.address);
  },

  // Admin functions
  addPolicy: async (policy: Omit<Policy, 'policyId' | 'createdAt'>): Promise<boolean> => {
    if (!currentUser.isOwner) return false;
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newPolicy: Policy = {
      ...policy,
      policyId: Math.max(...mockPolicies.map(p => p.policyId)) + 1,
      createdAt: Date.now()
    };

    mockPolicies.push(newPolicy);
    return true;
  },

  getAllClaims: async (): Promise<Claim[]> => {
    if (!currentUser.isOwner) return [];
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockClaims;
  },

  processClaim: async (claimId: number, status: 'Approved' | 'Rejected', adminNotes: string): Promise<boolean> => {
    if (!currentUser.isOwner) return false;
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const claim = mockClaims.find(c => c.claimId === claimId);
    if (!claim) return false;

    claim.status = status;
    claim.processedAt = Date.now();
    claim.adminNotes = adminNotes;
    
    return true;
  },

  // Toggle user role (for demo purposes)
  toggleAdminRole: (): void => {
    currentUser.isOwner = !currentUser.isOwner;
  },

  getCurrentUser: (): User => currentUser
};