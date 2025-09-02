import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockUsers = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@remotionos.com',
    avatar: '👩‍⚕️',
    role: 'therapist' as const,
  },
  {
    id: '2', 
    name: 'Dr. Michael Chen',
    email: 'michael.chen@remotionos.com',
    avatar: '👨‍⚕️',
    role: 'therapist' as const,
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@remotionos.com', 
    avatar: '👨‍💼',
    role: 'admin' as const,
  },
];

export const LoginScreen: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useOSStore();

  const handleLogin = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const user = mockUsers.find(u => u.id === selectedUser);
    if (user) {
      login(user);
    }
    
    setIsLoading(false);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    setPassword('');
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-gradient-desktop flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary)/0.3),transparent)]" />
      </div>

      {/* Login Container */}
      <motion.div
        className="w-full max-w-md mx-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card className="glass-surface border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              className="mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">R</span>
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              ReMotionOS
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Welcome to your therapy workspace
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {!selectedUser ? (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-sm font-medium text-foreground text-center">
                  Select your profile
                </p>
                
                {mockUsers.map((user, index) => (
                  <motion.button
                    key={user.id}
                    className="w-full p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{user.avatar}</div>
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Selected User Display */}
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl">
                    {mockUsers.find(u => u.id === selectedUser)?.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {mockUsers.find(u => u.id === selectedUser)?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {mockUsers.find(u => u.id === selectedUser)?.email}
                    </div>
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleLogin}
                    disabled={!password || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          className="text-center mt-6 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          ReMotionOS v1.0 • Secure Therapy Environment
        </motion.div>
      </motion.div>
    </motion.div>
  );
};