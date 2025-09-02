import React, { useEffect } from 'react';
import { Desktop } from '@/components/os/Desktop';
import { useOSStore } from '@/stores/osStore';
import { LoginScreen } from '@/components/os/LoginScreen';
import { useTheme } from '@/hooks/useTheme';

const Index: React.FC = () => {
  const { isLoggedIn } = useOSStore();
  useTheme(); // Apply theme settings

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
