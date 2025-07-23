import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Expired';
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const baseClasses = size === 'sm' 
    ? 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
    : 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';

  const statusConfig = {
    Pending: {
      classes: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
    },
    Approved: {
      classes: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    Rejected: {
      classes: 'bg-red-100 text-red-800',
      icon: XCircle,
    },
    Active: {
      classes: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    Expired: {
      classes: 'bg-gray-100 text-gray-800',
      icon: XCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <span className={`${baseClasses} ${config.classes}`}>
      <Icon className={`${iconSize} mr-1`} />
      {status}
    </span>
  );
};

export default StatusBadge;