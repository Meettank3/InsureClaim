import React from 'react';
import { Claim } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Calendar, DollarSign } from 'lucide-react';
import StatusBadge from '../UI/StatusBadge';
import LoadingSpinner from '../UI/LoadingSpinner';

interface ClaimsListProps {
  claims: Claim[];
  loading: boolean;
  title: string;
}

const ClaimsList: React.FC<ClaimsListProps> = ({ claims, loading, title }) => {
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
      <div className="flex items-center mb-6">
        <FileText className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Found</h3>
          <p className="text-gray-600">No claims have been submitted yet.</p>
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
                  <p className="text-sm text-gray-600">Policy ID: {claim.policyId}</p>
                </div>
                <StatusBadge status={claim.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Reason: {claim.reason}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Amount: {claim.requestedAmount} ETH</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  <span>
                    Submitted {formatDistanceToNow(new Date(claim.submittedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-3">{claim.description}</p>

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
  );
};

export default ClaimsList;