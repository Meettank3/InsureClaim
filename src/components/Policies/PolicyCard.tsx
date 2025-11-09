import React, { useState } from 'react';
import { Policy } from '../../types';
import { Calendar, DollarSign, Shield, Clock } from 'lucide-react';
import { usePolicies, useBlockchain } from '../../hooks/useBlockchain';
import LoadingSpinner from '../UI/LoadingSpinner';

interface PolicyCardProps {
  policy: Policy;
  onPurchaseSuccess?: () => void;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onPurchaseSuccess }) => {
  const [purchasing, setPurchasing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { buyPolicy, error } = usePolicies();
  const { connected, updateBalance } = useBlockchain();

  const handlePurchase = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    setPurchasing(true);
    setTxHash(null);
    try {
      const result = await buyPolicy(policy.policyId, policy.premium);
      if (result.success) {
        setTxHash(result.txHash || null);
        onPurchaseSuccess?.();
        await updateBalance(); // Update user balance after purchase
      } else {
        alert('Failed to purchase policy. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert(`Error purchasing policy: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">{policy.name}</h3>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
          Active
        </span>
      </div>

      <p className="text-gray-600 mb-6">{policy.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
          <span>Premium: {policy.premium} ETH</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Shield className="h-4 w-4 mr-2 text-blue-600" />
          <span>Coverage: {policy.coverageAmount} ETH</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-blue-600" />
          <span>Duration: {policy.duration} days</span>
        </div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={purchasing || !connected}
        className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center ${
          !connected 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
        }`}
      >
        {purchasing ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Processing Transaction...
          </>
        ) : !connected ? (
          'Connect Wallet to Purchase'
        ) : (
          `Purchase for ${policy.premium} ETH`
        )}
      </button>
      
      {txHash && (
        <div className="mt-3 p-2 bg-green-50 rounded-md">
          <p className="text-xs text-green-700">
            Transaction Hash: 
            <span className="font-mono ml-1">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
          </p>
        </div>
      )}
      
      {error && (
        <div className="mt-3 p-2 bg-red-50 rounded-md">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PolicyCard;