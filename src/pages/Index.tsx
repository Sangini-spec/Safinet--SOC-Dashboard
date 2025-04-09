
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard or login based on authentication status
    const isAuthenticated = !!localStorage.getItem('safinetUser');
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null; // This component just handles redirection
};

export default Index;
