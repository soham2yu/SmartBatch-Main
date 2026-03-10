import React from 'react';
import { useLocation } from 'wouter';
import { Activity } from 'lucide-react';
import { useLogin, useRegister } from '@/hooks/use-auth';

export default function Auth() {
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const isPending = loginMutation.isPending || registerMutation.isPending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    try {
      if (mode === 'login') {
        await loginMutation.mutateAsync({ email, password });
      } else {
        await registerMutation.mutateAsync({ email, password });
      }
      setLocation('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="glass-card w-full max-w-md p-8 md:p-12 relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow mb-6">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to access your manufacturing digital twin.'
              : 'Create your account to secure your SmartBatch workspace.'}
          </p>
        </div>

        <div className="flex mb-6 rounded-xl border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-sm font-medium ${mode === 'login' ? 'bg-primary text-primary-foreground' : 'bg-black/20 text-muted-foreground'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 text-sm font-medium ${mode === 'register' ? 'bg-primary text-primary-foreground' : 'bg-black/20 text-muted-foreground'}`}
          >
            Register
          </button>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <input 
              type="email" 
              placeholder="operator@plant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {mode === 'register' && (
            <p className="text-xs text-muted-foreground">Password must be at least 8 characters.</p>
          )}

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white neon-glow hover:opacity-90 transition-opacity mt-4 disabled:opacity-60"
          >
            {isPending ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-primary font-medium hover:underline"
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
