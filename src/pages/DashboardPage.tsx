import React, { useEffect } from 'react';
import { User, Shield, FileText, Calendar } from 'lucide-react';
import { useUserPolicies, useClaims, useBlockchain } from '../hooks/useBlockchain';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from '../components/UI/StatusBadge';
import ClaimForm from '../components/Claims/ClaimForm';
import ClaimsList from '../components/Claims/ClaimsList';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { connected } = useBlockchain();
  const { userPolicies, loading: policiesLoading, fetchUserPolicies } = useUserPolicies();
  const { userClaims, loading: claimsLoading, fetchUserClaims } = useClaims();

  useEffect(() => {
    if (connected) {
      fetchUserClaims();
      fetchUserPolicies();
    }
  }, [connected]);

  const handleClaimSubmitSuccess = () => {
    fetchUserClaims();
  };

  const handlePolicyPurchaseSuccess = () => {
    fetchUserPolicies();
  };

  const activePolicies = userPolicies.filter(policy => 
    new Date(policy.expiresAt) > new Date()
  );

  const expiredPolicies = userPolicies.filter(policy => 
    new Date(policy.expiresAt) <= new Date()
  );

  const stats = [
    { 
      name: 'Active Policies', 
      value: activePolicies.length, 
      icon: Shield, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      name: 'Total Claims', 
      value: userClaims.length, 
      icon: FileText, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      name: 'Pending Claims', 
      value: userClaims.filter(c => c.status === 'Pending').length, 
      icon: Calendar, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    { 
      name: 'Approved Claims', 
      value: userClaims.filter(c => c.status === 'Approved').length, 
      icon: User, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
        <p className="text-gray-600">Manage your insurance policies and claims</p>
      </div>

      {!connected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Wallet Not Connected</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please connect your wallet to view your policies and claims.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} rounded-full p-3`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Policies */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">My Policies</h2>
          </div>

          {policiesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : userPolicies.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies</h3>
              <p className="text-gray-600">Purchase a policy to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activePolicies.map((policy) => (
                <div key={policy.policyId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
                    <StatusBadge status="Active" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Premium Paid:</span> {policy.premium} ETH
                    </div>
                    <div>
                      <span className="font-medium">Coverage:</span> {policy.coverageAmount} ETH
                    </div>
                    <div>
                      <span className="font-medium">Purchased:</span>{' '}
                      {formatDistanceToNow(new Date(policy.purchasedAt), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Expires:</span>{' '}
                      {formatDistanceToNow(new Date(policy.expiresAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
              
              {expiredPolicies.map((policy) => (
                <div key={policy.policyId} className="border border-gray-200 rounded-lg p-4 opacity-60">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
                    <StatusBadge status="Expired" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Expired:</span>{' '}
                    {formatDistanceToNow(new Date(policy.expiresAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit New Claim */}
        {connected && (
          <ClaimForm 
            userPolicies={activePolicies} 
            onSubmitSuccess={handleClaimSubmitSuccess}
          />
        )}
      </div>

      {/* My Claims */}
      {connected && (
        <ClaimsList 
          claims={userClaims} 
          loading={claimsLoading} 
          title="My Claims"
        />
      )}
    </div>
  );
};

export default DashboardPage;