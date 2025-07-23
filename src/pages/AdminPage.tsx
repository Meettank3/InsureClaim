import React, { useEffect } from 'react';
import { Settings, Plus, FileText, BarChart3 } from 'lucide-react';
import { useBlockchain, usePolicies, useClaims } from '../hooks/useBlockchain';
import AddPolicyForm from '../components/Admin/AddPolicyForm';
import ClaimsManagement from '../components/Admin/ClaimsManagement';

const AdminPage: React.FC = () => {
  const { user } = useBlockchain();
  const { policies, fetchPolicies } = usePolicies();
  const { claims, fetchAllClaims } = useClaims();

  useEffect(() => {
    if (user?.isOwner) {
      fetchAllClaims();
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
      name: 'Pending Claims', 
      value: claims.filter(c => c.status === 'Pending').length, 
      icon: BarChart3, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    { 
      name: 'Total Revenue', 
      value: `${policies.reduce((sum, p) => sum + parseFloat(p.premium), 0).toFixed(2)} ETH`, 
      icon: Settings, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const handlePolicyAdded = () => {
    fetchPolicies();
  };

  const handleClaimUpdate = () => {
    fetchAllClaims();
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