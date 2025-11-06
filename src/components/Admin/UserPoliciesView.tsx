import React, { useState } from 'react';
import { Users, Shield, Calendar, DollarSign, Search } from 'lucide-react';
import { UserPolicy } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from '../UI/StatusBadge';
import LoadingSpinner from '../UI/LoadingSpinner';

interface UserPoliciesViewProps {
  allUserPolicies: { userAddress: string; policies: UserPolicy[] }[];
  loading: boolean;
}

const UserPoliciesView: React.FC<UserPoliciesViewProps> = ({ allUserPolicies, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const filteredUserPolicies = allUserPolicies.filter(userPolicies =>
    userPolicies.userAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userPolicies.policies.some(policy => 
      policy.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalUsers = allUserPolicies.length;
  const totalPolicies = allUserPolicies.reduce((sum, up) => sum + up.policies.length, 0);
  const totalValue = allUserPolicies.reduce((sum, up) => 
    sum + up.policies.reduce((pSum, policy) => pSum + parseFloat(policy.premium), 0), 0
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Policies Overview</h2>
            <p className="text-sm text-gray-600">
              {totalUsers} users • {totalPolicies} policies • {totalValue.toFixed(2)} ETH total value
            </p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users or policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filteredUserPolicies.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching results' : 'No policies sold yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'User policies will appear here when purchased'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUserPolicies.map((userPolicies) => (
            <div key={userPolicies.userAddress} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {userPolicies.userAddress.slice(0, 10)}...{userPolicies.userAddress.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {userPolicies.policies.length} {userPolicies.policies.length === 1 ? 'policy' : 'policies'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedUser(
                    selectedUser === userPolicies.userAddress ? null : userPolicies.userAddress
                  )}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {selectedUser === userPolicies.userAddress ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-2 text-blue-600" />
                  <span>
                    Total Coverage: {userPolicies.policies.reduce((sum, p) => sum + parseFloat(p.coverageAmount), 0).toFixed(1)} ETH
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                  <span>
                    Premiums Paid: {userPolicies.policies.reduce((sum, p) => sum + parseFloat(p.premium), 0).toFixed(2)} ETH
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  <span>
                    Active: {userPolicies.policies.filter(p => new Date(p.expiresAt) > new Date()).length}
                  </span>
                </div>
              </div>

              {selectedUser === userPolicies.userAddress && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Policy Details</h4>
                  <div className="space-y-3">
                    {userPolicies.policies.map((policy) => {
                      const isActive = new Date(policy.expiresAt) > new Date();
                      return (
                        <div key={`${userPolicies.userAddress}-${policy.policyId}`} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{policy.name}</h5>
                            <StatusBadge status={isActive ? 'Active' : 'Expired'} size="sm" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPoliciesView;