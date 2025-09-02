import React from 'react';
import { Desktop } from '@/components/os/Desktop';
import { useOSStore } from '@/stores/osStore';
import { LoginScreen } from '@/components/os/LoginScreen';

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
