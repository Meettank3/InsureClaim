import React, { useState } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import ClaimForm from '../components/Claims/ClaimForm';
import { ClaimsList } from '../components/Claims/ClaimsList';
import { PolicyList } from '../components/Policies/PolicyList';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { Shield, FileText, Plus } from 'lucide-react';
import type { Policy, Claim } from '../types';

export const DashboardPage: React.FC = () => {
  const { userPolicies, userClaims, submitClaim, isLoading } = useBlockchain();
  const [showClaimForm, setShowClaimForm] = useState(false);

  const handleClaimSubmit = async (claimData: Omit<Claim, 'id' | 'status' | 'submissionDate'>) => {
    try {
      await submitClaim(claimData);
      setShowClaimForm(false);
    } catch (error) {
      console.error('Failed to submit claim:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your insurance policies and claims</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Policies Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">My Policies</h2>
          </div>
          
          {userPolicies.length > 0 ? (
            <PolicyList policies={userPolicies} />
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No policies found</p>
              <p className="text-sm text-gray-400 mt-1">
                Visit the home page to purchase insurance policies
              </p>
            </div>
          )}
        </div>

        {/* Claims Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">My Claims</h2>
            </div>
            {userPolicies.length > 0 && (
              <button
                onClick={() => setShowClaimForm(!showClaimForm)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Claim
              </button>
            )}
          </div>

          {showClaimForm && (
            <div className="mb-6">
              <ClaimForm
                policies={userPolicies}
                onSubmit={handleClaimSubmit}
                onCancel={() => setShowClaimForm(false)}
              />
            </div>
          )}

          {userClaims.length > 0 ? (
            <ClaimsList claims={userClaims} />
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No claims submitted</p>
              {userPolicies.length > 0 ? (
                <p className="text-sm text-gray-400 mt-1">
                  Click "New Claim" to submit your first claim
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-1">
                  Purchase a policy first to submit claims
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Active Policies</p>
              <p className="text-2xl font-bold text-blue-900">{userPolicies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Total Claims</p>
              <p className="text-2xl font-bold text-green-900">{userClaims.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Pending Claims</p>
              <p className="text-2xl font-bold text-yellow-900">
                {userClaims.filter(claim => claim.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};