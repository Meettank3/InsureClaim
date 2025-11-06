import { Policy, Claim, UserPolicy, User } from '../types';

// Mock data storage - in production, this would be blockchain data
export class MockDataStore {
  private static instance: MockDataStore;
  private policies: Policy[] = [
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

  private userPolicies: Map<string, UserPolicy[]> = new Map();
  private claims: Claim[] = [];
  private users: Map<string, User> = new Map();

  static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }

  // Policy methods
  getAllPolicies(): Policy[] {
    return this.policies.filter(p => p.active);
  }

  addPolicy(policy: Omit<Policy, 'policyId' | 'createdAt'>): Policy {
    const newPolicy: Policy = {
      ...policy,
      policyId: Math.max(...this.policies.map(p => p.policyId), 0) + 1,
      createdAt: Date.now()
    };
    this.policies.push(newPolicy);
    return newPolicy;
  }

  // User policy methods
  purchasePolicy(userAddress: string, policyId: number): UserPolicy | null {
    const policy = this.policies.find(p => p.policyId === policyId && p.active);
    if (!policy) return null;

    const userPolicy: UserPolicy = {
      ...policy,
      purchasedAt: Date.now(),
      expiresAt: Date.now() + (policy.duration * 24 * 60 * 60 * 1000)
    };

    const existingPolicies = this.userPolicies.get(userAddress) || [];
    
    // Check if user already owns this policy
    const alreadyOwns = existingPolicies.some(up => up.policyId === policyId);
    if (alreadyOwns) return null;

    existingPolicies.push(userPolicy);
    this.userPolicies.set(userAddress, existingPolicies);
    
    return userPolicy;
  }

  getUserPolicies(userAddress: string): UserPolicy[] {
    return this.userPolicies.get(userAddress) || [];
  }

  getAllUserPolicies(): { userAddress: string; policies: UserPolicy[] }[] {
    const result: { userAddress: string; policies: UserPolicy[] }[] = [];
    this.userPolicies.forEach((policies, userAddress) => {
      result.push({ userAddress, policies });
    });
    return result;
  }

  // Claim methods
  submitClaim(userAddress: string, policyId: number, reason: string, description: string, amount: string): Claim {
    const newClaim: Claim = {
      claimId: this.claims.length + 1,
      policyId,
      user: userAddress,
      reason,
      description,
      requestedAmount: amount,
      status: 'Pending',
      submittedAt: Date.now()
    };
    this.claims.push(newClaim);
    return newClaim;
  }

  getUserClaims(userAddress: string): Claim[] {
    return this.claims.filter(c => c.user === userAddress);
  }

  getAllClaims(): Claim[] {
    return this.claims;
  }

  processClaim(claimId: number, status: 'Approved' | 'Rejected', adminNotes: string): boolean {
    const claim = this.claims.find(c => c.claimId === claimId);
    if (!claim || claim.status !== 'Pending') return false;

    claim.status = status;
    claim.processedAt = Date.now();
    claim.adminNotes = adminNotes;
    return true;
  }

  // User methods
  setUser(address: string, user: User): void {
    this.users.set(address, user);
  }

  getUser(address: string): User | null {
    return this.users.get(address) || null;
  }

  // Statistics
  getTotalPoliciesSold(): number {
    let total = 0;
    this.userPolicies.forEach(policies => {
      total += policies.length;
    });
    return total;
  }

  getTotalPremiumCollected(): number {
    let total = 0;
    this.userPolicies.forEach(policies => {
      policies.forEach(policy => {
        total += parseFloat(policy.premium);
      });
    });
    return total;
  }
}

export const mockDataStore = MockDataStore.getInstance();