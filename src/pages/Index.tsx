import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

const Index = () => {
  const { dispatch } = useApp();
  
  useEffect(() => {
    // Redirect to home view
    dispatch({ type: 'SET_VIEW', payload: 'home' });
  }, [dispatch]);

  return null;
};

export default Index;
