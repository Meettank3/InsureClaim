import React, { useState } from 'react';
import { UserPolicy } from '../../types';
import { FileText, DollarSign } from 'lucide-react';
import { useClaims, useBlockchain } from '../../hooks/useBlockchain';
import LoadingSpinner from '../UI/LoadingSpinner';

interface ClaimFormProps {
  userPolicies: UserPolicy[];
  onSubmitSuccess: () => void;
}

const ClaimForm: React.FC<ClaimFormProps> = ({ userPolicies, onSubmitSuccess }) => {
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { submitClaim, error } = useClaims();
  const { connected } = useBlockchain();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!selectedPolicyId || !reason || !description || !requestedAmount) {
      alert('Please fill in all fields');
      return;
    }

    const policy = userPolicies.find(p => p.policyId.toString() === selectedPolicyId);
    if (!policy) {
      alert('Invalid policy selected');
      return;
    }

    if (parseFloat(requestedAmount) > parseFloat(policy.coverageAmount)) {
      alert('Requested amount exceeds policy coverage');
      return;
    }

    if (parseFloat(requestedAmount) <= 0) {
      alert('Requested amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    setTxHash(null);
    try {
      const result = await submitClaim(
        parseInt(selectedPolicyId),
        reason,
        description,
        requestedAmount
      );

      if (result.success) {
        setTxHash(result.txHash || null);
        setSelectedPolicyId('');
        setReason('');
        setDescription('');
        setRequestedAmount('');
        onSubmitSuccess();
      } else {
        alert('Failed to submit claim. Please try again.');
      }
    } catch (error) {
      console.error('Claim submission error:', error);
      alert('Error submitting claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (userPolicies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies to Claim</h3>
        <p className="text-gray-600">You need to purchase a policy before submitting a claim.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <FileText className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Submit New Claim</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="policy" className="block text-sm font-medium text-gray-700 mb-2">
            Select Policy
          </label>
          <select
            id="policy"
            value={selectedPolicyId}
            onChange={(e) => setSelectedPolicyId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Choose a policy...</option>
            {userPolicies.map((policy) => (
              <option key={policy.policyId} value={policy.policyId}>
                {policy.name} (Coverage: {policy.coverageAmount} ETH)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Claim Reason
          </label>
          <input
            type="text"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Medical Emergency, Car Accident, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Please provide detailed information about your claim..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Requested Amount (ETH)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              id="amount"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !connected}
          className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center ${
            !connected 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
          }`}
        >
          {submitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Processing Transaction...
            </>
          ) : !connected ? (
            'Connect Wallet to Submit Claim'
          ) : (
            'Submit Claim'
          )}
        </button>
        
        {txHash && (
          <div className="mt-3 p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-700 font-medium mb-1">Claim Submitted Successfully!</p>
            <p className="text-xs text-green-600">
              Transaction Hash: 
              <span className="font-mono ml-1">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ClaimForm;