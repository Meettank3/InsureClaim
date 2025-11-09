import React, { useState } from 'react';
import { Plus, DollarSign, Calendar, Shield } from 'lucide-react';
import { usePolicies, useBlockchain } from '../../hooks/useBlockchain';
import LoadingSpinner from '../UI/LoadingSpinner';

interface AddPolicyFormProps {
  onSuccess: () => void;
}

const AddPolicyForm: React.FC<AddPolicyFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    premium: '',
    coverageAmount: '',
    duration: '365'
  });
  const [adding, setAdding] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { addPolicy, error } = usePolicies();
  const { connected, user } = useBlockchain();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !user?.isOwner) {
      alert('Admin access required');
      return;
    }

    if (!formData.name || !formData.description || !formData.premium || !formData.coverageAmount) {
      alert('Please fill in all required fields');
      return;
    }

    setAdding(true);
    setTxHash(null);
    try {
      const result = await addPolicy({
        name: formData.name,
        description: formData.description,
        premium: formData.premium,
        coverageAmount: formData.coverageAmount,
        duration: parseInt(formData.duration),
        active: true
      });

      if (result.success) {
        setTxHash(result.txHash || null);
        setFormData({
          name: '',
          description: '',
          premium: '',
          coverageAmount: '',
          duration: '365'
        });
        onSuccess();
      } else {
        alert('Failed to add policy. Please try again.');
      }
    } catch (error) {
      console.error('Add policy error:', error);
      alert('Error adding policy. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Plus className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Add New Policy</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Policy Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Basic Health Insurance"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration (days)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Detailed description of the insurance policy..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="premium" className="block text-sm font-medium text-gray-700 mb-2">
              Premium (ETH) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                id="premium"
                name="premium"
                value={formData.premium}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="coverageAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Coverage Amount (ETH) *
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                id="coverageAmount"
                name="coverageAmount"
                value={formData.coverageAmount}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={adding || !connected || !user?.isOwner}
          className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center ${
            !connected || !user?.isOwner
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
          }`}
        >
          {adding ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Processing Transaction...
            </>
          ) : !connected ? (
            'Connect Wallet Required'
          ) : !user?.isOwner ? (
            'Admin Access Required'
          ) : (
            'Add Policy'
          )}
        </button>
        
        {txHash && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-700 font-medium mb-1">Policy Added Successfully!</p>
            <p className="text-xs text-green-600">
              Transaction Hash: 
              <span className="font-mono ml-1">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddPolicyForm;