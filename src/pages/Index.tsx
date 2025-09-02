import React from 'react';
import { Desktop } from '@/components/os/Desktop';

const Index = () => {
  const { isLoggedIn } = useOSStore();
  
  return (
    <>
      {!isLoggedIn && <LoginScreen />}
      <Desktop />
    </>
  );
};

export default Index;
