import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserRoles, selectUserGroups } from '@/features/auth/authSlice';

interface AccessGuardProps {
  roles?: string[];
  groups?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AccessGuard: React.FC<AccessGuardProps> = ({ roles, groups, children, fallback = null }) => {
  const userRoles = useSelector(selectUserRoles) || [];
  const userGroups = useSelector(selectUserGroups) || [];

  const hasRole = roles && roles.length > 0 ? roles.some((role) => userRoles.includes(role)) : false;
  const hasGroup = groups && groups.length > 0 ? groups.some((group) => userGroups.includes(group)) : false;

  // If neither roles nor groups are provided, default to allowing access
  if (!roles && !groups) {
    return <>{children}</>;
  }

  if (hasRole || hasGroup) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
