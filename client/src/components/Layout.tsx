import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BarChart2, 
  Activity, 
  Target, 
  Sliders, 
  TrendingUp, 
  Bot,
  Database,
  Menu,
  X
} from 'lucide-react';
import { useDatasets } from '@/hooks/use-smartbatch';
import { useActiveDataset } from '@/context/DatasetContext';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/upload', label: 'Data Upload', icon: UploadCloud },
  { href: '/analytics', label: 'Batch Analytics', icon: BarChart2 },
  { href: '/analysis', label: 'AI Analysis', icon: Activity },
  { href: '/recommendations', label: 'Recommendations', icon: Target },
  { href: '/simulation', label: 'Digital Twin', icon: Sliders },
  { href: '/forecasting', label: 'Forecasting', icon: TrendingUp },
  { href: '/copilot', label: 'AI Copilot', icon: Bot },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: datasets = [] } = useDatasets();
  const { activeDatasetId, setActiveDatasetId } = useActiveDataset();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Auto-select first dataset if none selected
  React.useEffect(() => {
    if (!activeDatasetId && datasets.length > 0) {
      setActiveDatasetId(datasets[0].id);
    }
  }, [datasets, activeDatasetId, setActiveDatasetId]);

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 glass-panel flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            SmartBatch AI
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/10 text-primary font-medium neon-glow' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'opacity-70'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 flex items-center justify-center border border-white/10">
              <span className="font-display font-bold text-sm">OP</span>
            </div>
            <div>
              <p className="text-sm font-medium">Operator 01</p>
              <p className="text-xs text-muted-foreground">Line Alpha</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top Header */}
        <header className="h-20 glass-card !rounded-none !border-x-0 !border-t-0 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-muted-foreground hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-display font-semibold hidden sm:block">
              {NAV_ITEMS.find(i => i.href === location)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/5">
              <Database className="w-4 h-4 text-primary" />
              <select 
                className="bg-transparent text-sm font-medium outline-none cursor-pointer text-white appearance-none"
                value={activeDatasetId || ''}
                onChange={(e) => setActiveDatasetId(Number(e.target.value))}
              >
                <option value="" className="bg-card">Select Dataset</option>
                {datasets.map((ds: any) => (
                  <option key={ds.id} value={ds.id} className="bg-card">
                    {ds.filename}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
