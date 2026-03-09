import React from 'react';
import { Link } from 'wouter';
import { Activity } from 'lucide-react';

export default function Auth() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="glass-card w-full max-w-md p-8 md:p-12 relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow mb-6">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in to access your manufacturing digital twin.</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <input 
              type="email" 
              placeholder="operator@plant.com"
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
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <Link href="/dashboard" className="block w-full">
            <button className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white neon-glow hover:opacity-90 transition-opacity mt-4">
              Sign In
            </button>
          </Link>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don't have an account? <a href="#" className="text-primary font-medium hover:underline">Request access</a>
        </p>
      </div>
    </div>
  );
}
