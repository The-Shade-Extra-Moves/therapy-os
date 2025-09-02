import React, { useEffect } from 'react';
import { Desktop } from '@/components/os/Desktop';
import { useOSStore } from '@/stores/osStore';
import { LoginScreen } from '@/components/os/LoginScreen';

const Index: React.FC = () => {
  const { isLoggedIn } = useOSStore();

  // Basic SEO
  useEffect(() => {
    document.title = isLoggedIn ? 'ReMotionOS Desktop' : 'ReMotionOS — Login';
  }, [isLoggedIn]);
  
  return (
    <>
      {!isLoggedIn && <LoginScreen />}
      <Desktop />
    </>
  );
};

export default Index;
