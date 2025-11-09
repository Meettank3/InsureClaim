import React, { useState, useEffect } from 'react';
import { Shield, FileText, Plus, AlertCircle } from 'lucide-react';
import { useBlockchain, useUserPolicies, useClaims } from '../hooks/useBlockchain';
import ClaimForm from '../components/Claims/ClaimForm';
import ClaimsList from '../components/Claims/ClaimsList';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StatusBadge from '../components/UI/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { user, connected } = useBlockchain();
  const { userPolicies, loading: policiesLoading, fetchUserPolicies } = useUserPolicies();
  const { userClaims, loading: claimsLoading, fetchUserClaims } = useClaims();
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch user data when component mounts or user changes
  useEffect(() => {
    if (connected && user) {
      fetchUserPolicies();
      fetchUserClaims();
    }
  }, [connected, user, refreshTrigger]);

  const handleClaimSubmitSuccess = () => {
    setShowClaimForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePolicyPurchaseSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!connected) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
        <p className="text-gray-600">Please connect your wallet to view your dashboard.</p>
      </div>
    );
  }

  const activePolicies = userPolicies.filter(policy => new Date(policy.expiresAt) > new Date());
  const pendingClaims = userClaims.filter(claim => claim.status === 'Pending');
  const approvedClaims = userClaims.filter(claim => claim.status === 'Approved');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
        <p className="text-gray-600">Manage your insurance policies and claims</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Policies</p>
              <p className="text-2xl font-bold text-gray-900">{activePolicies.length}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Claims</p>
              <p className="text-2xl font-bold text-gray-900">{userClaims.length}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Claims</p>
              <p className="text-2xl font-bold text-gray-900">{pendingClaims.length}</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Approved Claims</p>
              <p className="text-2xl font-bold text-gray-900">{approvedClaims.length}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* My Policies Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">My Policies</h2>
        </div>

        {policiesLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : userPolicies.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Found</h3>
            <p className="text-gray-600">Visit the home page to purchase insurance policies.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPolicies.map((policy) => {
              const isActive = new Date(policy.expiresAt) > new Date();
              return (
                <div key={policy.policyId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
                      <p className="text-sm text-gray-600">Policy ID: {policy.policyId}</p>
                    </div>
                    <StatusBadge status={isActive ? 'Active' : 'Expired'} />
                  </div>

                  <p className="text-gray-700 mb-3">{policy.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Premium:</span> {policy.premium} ETH
                    </div>
                    <div>
                      <span className="font-medium">Coverage:</span> {policy.coverageAmount} ETH
                    </div>
                    <div>
                      <span className="font-medium">Purchased:</span>{' '}
                      {formatDistanceToNow(new Date(policy.purchasedAt), { addSuffix: true })}
                    </div>
                    <div>
                      <span className="font-medium">
                        {isActive ? 'Expires' : 'Expired'}:
                      </span>{' '}
                      {formatDistanceToNow(new Date(policy.expiresAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Claims Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">My Claims</h2>
          </div>
          {activePolicies.length > 0 && (
            <button
              onClick={() => setShowClaimForm(!showClaimForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showClaimForm ? 'Cancel' : 'Submit New Claim'}
            </button>
          )}
        </div>

        {showClaimForm && (
          <div className="mb-6">
            <ClaimForm
              userPolicies={activePolicies}
              onSubmitSuccess={handleClaimSubmitSuccess}
            />
          </div>
        )}

        <ClaimsList
          claims={userClaims}
          loading={claimsLoading}
          title="My Claims History"
        />
      </div>
    </div>
  );
};

export default DashboardPage;