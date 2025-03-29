
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MentorSessionStatus } from '@/types/mentor';

interface SessionStatusBadgeProps {
  status: MentorSessionStatus;
}

const SessionStatusBadge: React.FC<SessionStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'scheduled':
        return { label: 'Scheduled', variant: 'outline', className: 'border-blue-500 text-blue-500' };
      case 'confirmed':
        return { label: 'Confirmed', variant: 'outline', className: 'border-green-500 text-green-500' };
      case 'completed':
        return { label: 'Completed', variant: 'outline', className: 'border-purple-500 text-purple-500' };
      case 'cancelled':
        return { label: 'Cancelled', variant: 'outline', className: 'border-red-500 text-red-500' };
      case 'upcoming':
        return { label: 'Upcoming', variant: 'outline', className: 'border-amber-500 text-amber-500' };
      case 'past':
        return { label: 'Past', variant: 'outline', className: 'border-gray-500 text-gray-500' };
      default:
        return { label: status, variant: 'outline', className: '' };
    }
  };

  const { label, variant, className } = getStatusConfig();

  return (
    <Badge variant={variant as any} className={className}>
      {label}
    </Badge>
  );
};

export default SessionStatusBadge;
