import { useState, useEffect } from 'react';
import { Web3Service, web3Service } from '../services/web3Service';
import { User, Policy, Claim, UserPolicy } from '../types';

export const useBlockchain = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!Web3Service.isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const userData = await web3Service.connectWallet();
      setUser(userData);
      setConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async () => {
    if (!connected) return;
    try {
      const newBalance = await web3Service.updateUserBalance();
      if (user) {
        setUser({ ...user, balance: newBalance });
      }
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  };

  const disconnect = () => {
    web3Service.disconnect();
    setUser(null);
    setConnected(false);
    setError(null);
  };

  const toggleUserRole = () => {
    if (user) {
      const updatedUser = { ...user, isOwner: !user.isOwner };
      setUser(updatedUser);
      web3Service.setCurrentUser(updatedUser);
    }
  };
  useEffect(() => {
    // Check if already connected
    const currentUser = web3Service.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setConnected(true);
    }
  }, []);

  return {
    user,
    loading,
    connected,
    error,
    connectWallet,
    updateBalance,
    disconnect,
    toggleUserRole
  };
};

export const usePolicies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      // For now, use mock data since we don't have a deployed contract
      // In production, this would call: await web3Service.getAllPolicies();
      const mockData = [
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
      const data = mockData;
      setPolicies(data);
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const buyPolicy = async (policyId: number, premiumInEth: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await web3Service.buyPolicy(policyId, premiumInEth);
      if (result.success) {
        console.log('Policy purchased successfully. Transaction hash:', result.txHash);
        return { success: true, txHash: result.txHash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Failed to buy policy:', error);
      setError(error instanceof Error ? error.message : 'Failed to buy policy');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const addPolicy = async (policy: Omit<Policy, 'policyId' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await web3Service.addPolicy(
        policy.name,
        policy.description,
        policy.premium,
        policy.coverageAmount,
        policy.duration
      );
      if (result.success) {
        console.log('Policy added successfully. Transaction hash:', result.txHash);
        await fetchPolicies(); // Refresh the list
        return { success: true, txHash: result.txHash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Failed to add policy:', error);
      setError(error instanceof Error ? error.message : 'Failed to add policy');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return {
    policies,
    loading,
    error,
    fetchPolicies,
    buyPolicy,
    addPolicy
  };
};

export const useClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [userClaims, setUserClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data for now - in production, use web3Service.getUserClaims()
      const data: Claim[] = [];
      setUserClaims(data);
    } catch (error) {
      console.error('Failed to fetch user claims:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch user claims');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data for now - in production, use web3Service.getAllClaims()
      const data: Claim[] = [];
      setClaims(data);
    } catch (error) {
      console.error('Failed to fetch all claims:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch all claims');
    } finally {
      setLoading(false);
    }
  };

  const submitClaim = async (policyId: number, reason: string, description: string, amount: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await web3Service.submitClaim(policyId, reason, description, amount);
      if (result.success) {
        console.log('Claim submitted successfully. Transaction hash:', result.txHash);
        await fetchUserClaims(); // Refresh user claims
        return { success: true, txHash: result.txHash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Failed to submit claim:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit claim');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const processClaim = async (claimId: number, status: 'Approved' | 'Rejected', adminNotes: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await web3Service.processClaim(claimId, status, adminNotes);
      if (result.success) {
        console.log('Claim processed successfully. Transaction hash:', result.txHash);
        await fetchAllClaims(); // Refresh all claims
        return { success: true, txHash: result.txHash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Failed to process claim:', error);
      setError(error instanceof Error ? error.message : 'Failed to process claim');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    claims,
    userClaims,
    loading,
    error,
    fetchUserClaims,
    fetchAllClaims,
    submitClaim,
    processClaim
  };
};

export const useUserPolicies = () => {
  const [userPolicies, setUserPolicies] = useState<UserPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data for now - in production, use web3Service.getUserPolicies()
      const data: UserPolicy[] = [];
      setUserPolicies(data);
    } catch (error) {
      console.error('Failed to fetch user policies:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch user policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPolicies();
  }, []);

  return {
    userPolicies,
    loading,
    error,
    fetchUserPolicies
  };
};