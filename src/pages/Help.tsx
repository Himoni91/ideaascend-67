
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Help() {
  const navigate = useNavigate();

  // Redirect to new help center
  useEffect(() => {
    navigate('/help', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
