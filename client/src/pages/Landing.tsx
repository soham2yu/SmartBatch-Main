import React from 'react';
import { Link } from 'wouter';
import { Activity, Cpu, ShieldAlert, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden selection:bg-primary/30">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
      
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">SmartBatch<span className="text-primary">.ai</span></span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth" className="px-6 py-2.5 rounded-full font-medium hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/dashboard" className="px-6 py-2.5 rounded-full font-medium bg-white text-black hover:bg-gray-200 transition-colors shadow-lg">
            Demo Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary mb-8"
        >
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">The Future of Manufacturing Intelligence</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-tight mb-8"
        >
          Optimize Every Batch with <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent neon-text">
            Digital Twin AI
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mb-12"
        >
          Transform raw sensor data into actionable insights. Detect anomalies, predict yields, and reduce carbon emissions in real-time with our advanced machine learning platform.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/dashboard" className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white neon-glow neon-glow-hover transition-all duration-300 hover:-translate-y-1 flex items-center gap-2">
            Start Free Trial <TrendingUp className="w-5 h-5" />
          </Link>
          <a href="#features" className="px-8 py-4 rounded-xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
            Explore Features
          </a>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left" id="features"
        >
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-3">AI Digital Twin</h3>
            <p className="text-muted-foreground">Simulate manufacturing parameters in a risk-free environment to predict yield and optimize settings before physical execution.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-6 border border-accent/30">
              <ShieldAlert className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-3">Anomaly Detection</h3>
            <p className="text-muted-foreground">Identify critical deviations in energy consumption and temperature instantly, preventing costly batch failures.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-6 border border-secondary/30">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-3">Golden Batch Profile</h3>
            <p className="text-muted-foreground">Automatically extract the exact parameter combinations that led to your highest quality runs to standardize excellence.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
