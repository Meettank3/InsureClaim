import React, { useEffect } from 'react';
import { Settings, Plus, FileText, BarChart3 } from 'lucide-react';
import { useBlockchain, usePolicies, useClaims, useAdminData } from '../hooks/useBlockchain';
import AddPolicyForm from '../components/Admin/AddPolicyForm';
import ClaimsManagement from '../components/Admin/ClaimsManagement';
import UserPoliciesView from '../components/Admin/UserPoliciesView';

const AdminPage: React.FC = () => {
  const { user } = useBlockchain();
  const { policies, fetchPolicies } = usePolicies();
  const { claims, fetchAllClaims } = useClaims();
  const { allUserPolicies, fetchAllUserPolicies } = useAdminData();

  useEffect(() => {
    if (user?.isOwner) {
      fetchAllClaims();
      fetchAllUserPolicies();
    }
  }, [user]);

  if (!user?.isOwner) {
    return (
      <div className="text-center py-12">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const totalPoliciesSold = allUserPolicies.reduce((total, userPolicies) => 
    total + userPolicies.policies.length, 0
  );

  const totalRevenue = allUserPolicies.reduce((total, userPolicies) => 
    total + userPolicies.policies.reduce((sum, policy) => sum + parseFloat(policy.premium), 0), 0
  );

  const stats = [
    { 
      name: 'Total Policies', 
      value: policies.length, 
      icon: Plus, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      name: 'All Claims', 
      value: claims.length, 
      icon: FileText, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      name: 'Policies Sold', 
      value: totalPoliciesSold, 
      icon: BarChart3, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    { 
      name: 'Total Revenue', 
      value: `${totalRevenue.toFixed(2)} ETH`, 
      icon: Settings, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const handlePolicyAdded = () => {
    handlePolicyUpdate();
  };

  const handleClaimUpdate = () => {
    fetchAllClaims();
  };

  const handlePolicyUpdate = () => {
    fetchPolicies();
    fetchAllUserPolicies();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage policies and process claims</p>
      </div>

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

      {/* Add New Policy */}
      <AddPolicyForm onSuccess={handlePolicyAdded} />

      {/* User Policies Overview */}
      <UserPoliciesView 
        allUserPolicies={allUserPolicies} 
        loading={false}
      />

      {/* Claims Management */}
      <ClaimsManagement 
        claims={claims} 
        loading={false} 
        onUpdate={handleClaimUpdate}
      />
    </div>
  );
};

export default AdminPage;