import React, { useState } from 'react';
import { Claim } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Check, X, MessageCircle } from 'lucide-react';
import StatusBadge from '../UI/StatusBadge';
import LoadingSpinner from '../UI/LoadingSpinner';
import { useClaims, useBlockchain } from '../../hooks/useBlockchain';

interface ClaimsManagementProps {
  claims: Claim[];
  loading: boolean;
  onUpdate: () => void;
}

const ClaimsManagement: React.FC<ClaimsManagementProps> = ({ claims, loading, onUpdate }) => {
  const [processingClaim, setProcessingClaim] = useState<number | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [txHash, setTxHash] = useState<string | null>(null);

  const { processClaim, error } = useClaims();
  const { connected, user, updateBalance } = useBlockchain();

  const handleAction = (claim: Claim, actionType: 'approve' | 'reject') => {
    if (!connected || !user?.isOwner) {
      alert('Admin access required');
      return;
    }

    setSelectedClaim(claim);
    setAction(actionType);
    setAdminNotes('');
    setTxHash(null);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedClaim) return;

    setProcessingClaim(selectedClaim.claimId);
    setTxHash(null);
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      const result = await processClaim(selectedClaim.claimId, status, adminNotes);

      if (result.success) {
        setTxHash(result.txHash || null);
        onUpdate();
        await updateBalance(); // Update admin balance after processing claim
        setShowModal(false);
      } else {
        alert('Failed to process claim. Please try again.');
      }
    } catch (error) {
      console.error('Process claim error:', error);
      alert('Error processing claim. Please try again.');
    } finally {
      setProcessingClaim(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const pendingClaims = claims.filter(claim => claim.status === 'Pending');

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <FileText className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Claims Management</h2>
          <span className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            {pendingClaims.length} Pending
          </span>
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Submitted</h3>
            <p className="text-gray-600">Claims will appear here when users submit them.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div
                key={claim.claimId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Claim #{claim.claimId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Policy ID: {claim.policyId} | User: {claim.user.slice(0, 10)}...
                    </p>
                  </div>
                  <StatusBadge status={claim.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Reason:</p>
                    <p className="text-sm text-gray-600">{claim.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Requested Amount:</p>
                    <p className="text-sm text-gray-600">{claim.requestedAmount} ETH</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                  <p className="text-sm text-gray-600">{claim.description}</p>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500">
                    Submitted {formatDistanceToNow(new Date(claim.submittedAt), { addSuffix: true })}
                  </p>
                </div>

                {claim.status === 'Pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAction(claim, 'approve')}
                      disabled={processingClaim === claim.claimId || !connected || !user?.isOwner}
                      className={`flex items-center px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors duration-200 ${
                        !connected || !user?.isOwner
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                      }`}
                    >
                      {processingClaim === claim.claimId ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(claim, 'reject')}
                      disabled={processingClaim === claim.claimId || !connected || !user?.isOwner}
                      className={`flex items-center px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors duration-200 ${
                        !connected || !user?.isOwner
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                      }`}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                )}

                {claim.status !== 'Pending' && claim.adminNotes && (
                  <div className="bg-gray-50 rounded-md p-3 mt-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">Admin Notes:</p>
                    <p className="text-sm text-gray-700">{claim.adminNotes}</p>
                    {claim.processedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Processed {formatDistanceToNow(new Date(claim.processedAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  {action === 'approve' ? 'Approve' : 'Reject'} Claim #{selectedClaim.claimId}
                </h3>
              </div>
              
              <div className="mb-4">
                <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about your decision..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={processingClaim === selectedClaim.claimId}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors duration-200 ${
                    action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-green-400'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400'
                  }`}
                >
                  {processingClaim === selectedClaim.claimId ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing Transaction...
                    </>
                  ) : (
                    `${action === 'approve' ? 'Approve' : 'Reject'} Claim`
                  )}
                </button>
              </div>
              
              {txHash && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-700 font-medium mb-1">Transaction Submitted!</p>
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClaimsManagement;