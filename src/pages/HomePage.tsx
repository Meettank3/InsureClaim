import React from 'react';
import { Shield, TrendingUp, Users, Award, AlertCircle } from 'lucide-react';
import { usePolicies, useBlockchain } from '../hooks/useBlockchain';
import PolicyList from '../components/Policies/PolicyList';

const HomePage: React.FC = () => {
  const { policies, loading, error } = usePolicies();
  const { connected } = useBlockchain();

  const stats = [
    { name: 'Active Policies', value: policies.length, icon: Shield, color: 'text-blue-600' },
    { name: 'Total Coverage', value: `${policies.reduce((sum, p) => sum + parseFloat(p.coverageAmount), 0).toFixed(1)} ETH`, icon: TrendingUp, color: 'text-green-600' },
    { name: 'Satisfied Customers', value: '1,234', icon: Users, color: 'text-purple-600' },
    { name: 'Claims Processed', value: '5,678', icon: Award, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Connection Warning */}
      {!connected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Wallet Not Connected</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Connect your MetaMask wallet to purchase policies and submit claims.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            Decentralized Insurance on the Blockchain
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Secure, transparent, and trustless insurance powered by smart contracts. 
            Purchase policies and submit claims with complete transparency.
          </p>
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8" />
            <span className="text-lg font-medium">100% Transparent • 100% Secure</span>
          </div>
        </div>
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
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Policies Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Insurance Policies</h2>
          <p className="text-gray-600">
            Choose from our comprehensive range of blockchain-based insurance policies
          </p>
        </div>
        
        <PolicyList policies={policies} loading={loading} />
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error Loading Policies</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl p-8 shadow-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose InsureChain?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Transparent</h3>
            <p className="text-gray-600">
              All transactions are recorded on the blockchain, ensuring complete transparency and immutability.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Claims Processing</h3>
            <p className="text-gray-600">
              Smart contracts automate claim processing, reducing wait times and eliminating intermediaries.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Coverage</h3>
            <p className="text-gray-600">
              Access insurance anywhere in the world with just a crypto wallet and internet connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;