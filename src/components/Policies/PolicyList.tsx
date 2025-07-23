import React from 'react';
import { Shield } from 'lucide-react';
import { Policy } from '../../types';
import PolicyCard from './PolicyCard';
import LoadingSpinner from '../UI/LoadingSpinner';

interface PolicyListProps {
  policies: Policy[];
  loading: boolean;
  onPurchaseSuccess?: () => void;
}

const PolicyList: React.FC<PolicyListProps> = ({ policies, loading, onPurchaseSuccess }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Available</h3>
        <p className="text-gray-600">Check back later for new insurance policies.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {policies.map((policy) => (
        <PolicyCard
          key={policy.policyId}
          policy={policy}
          onPurchaseSuccess={onPurchaseSuccess}
        />
      ))}
    </div>
  );
};

export default PolicyList;