import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  LayoutDashboard, 
  History, 
  Settings, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronDown,
  User,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useUserStore, useThemeStore } from '../context/store';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Sidebar() {
  const location = useLocation();
  const { theme } = useThemeStore();
  
  const navItems = [
    { icon: Plus, path: '/assistant', label: 'Assistant' },
    { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
    { icon: Settings, path: '/settings', label: 'Settings' },
  ];

  return (
    <aside className={cn(
      "hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-50 border-r transition-all duration-300",
      theme === 'dark' ? "bg-[#09090B]/80 border-white/5" : "bg-white/80 border-black/5",
      "backdrop-blur-xl"
    )}>
      <div className="p-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-solana-gradient shadow-[0_0_15px_rgba(153,69,255,0.3)] group-hover:scale-110 transition-transform"></div>
          <span className="text-2xl font-black tracking-tighter italic">VoPay</span>
        </Link>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted mt-2 font-bold font-mono">Security Layer</p>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-all rounded-xl border group",
                isActive 
                  ? "bg-solana-purple/10 border-solana-purple/20 text-foreground" 
                  : "text-muted border-transparent hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <Icon size={18} className={cn(
                "transition-all",
                isActive ? "text-solana-purple" : "text-muted group-hover:text-foreground"
              )} />
              <span className="text-sm font-semibold">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="ml-auto w-1 h-4 bg-solana-purple rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="p-5 rounded-2xl bg-foreground/5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={14} className="text-solana-green" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-solana-green">Active Monitoring</span>
          </div>
          <p className="text-[11px] text-muted leading-relaxed font-medium">
            VoPay is scanning for malicious contract patterns in real-time.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function Header() {
  const { isConnected, walletAddress, setConnection, displayName, balance, isBalanceLoading, solanaNetwork } = useUserStore();
  const { theme, toggleTheme } = useThemeStore();
  const { disconnect, connected, publicKey } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const shortenedAddress = walletAddress 
    ? `${walletAddress.slice(0, 4)}..${walletAddress.slice(-4)}`
    : '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setConnection(false, null);
      setShowProfile(false);
      navigate('/connect');
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/assistant') return 'AI Assistant';
    if (path === '/dashboard') return 'Security Center';
    if (path === '/history') return 'History';
    if (path === '/settings') return 'Settings';
    if (path === '/connect') return 'Wallet Portal';
    return 'Overview';
  };

  const isDevnet = solanaNetwork === 'devnet';

  return (
    <>
      <AnimatePresence>
        {isConnected && !isDevnet && solanaNetwork && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center relative z-[60] overflow-hidden"
          >
            Please switch wallet network to Devnet for testing.
          </motion.div>
        )}
      </AnimatePresence>
      
      <header className="h-20 flex items-center justify-between px-6 md:px-10 z-40 sticky top-0 bg-background/60 backdrop-blur-xl border-b border-border transition-all duration-300">
        <div className="flex flex-col">
          <h1 className="text-sm md:text-lg font-black tracking-tight uppercase italic">{getPageTitle()}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              isDevnet ? "bg-solana-green" : "bg-red-500"
            )} />
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest hidden sm:inline">
              Network: {solanaNetwork ? solanaNetwork.replace('-', ' ') : 'Offline'}
            </span>
            {isConnected && isDevnet && (
              <span className="text-[10px] font-black text-solana-green uppercase tracking-widest ml-1 hidden lg:inline">
                • Connected to Solana Devnet
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-foreground/3">
              <div className="w-4 h-4 rounded-full bg-solana-gradient p-[1px]">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-[8px] font-black">S</div>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-muted font-black uppercase tracking-tighter leading-none mb-0.5">Balance</span>
                <span className="text-[11px] font-mono font-black text-foreground leading-none">
                  {isBalanceLoading ? (
                    <span className="inline-block w-8 h-3 bg-foreground/10 animate-pulse rounded" />
                  ) : (
                    `${balance?.toFixed(3) || '0.000'} SOL`
                  )}
                </span>
              </div>
            </div>
          )}

          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-border bg-foreground/5 text-muted hover:text-foreground hover:bg-foreground/10 transition-all flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isConnected ? (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl border border-border bg-foreground/5 hover:bg-foreground/10 transition-all group"
              >
                <div className="flex flex-col items-end mr-1">
                  <span className="text-[9px] text-solana-purple font-black uppercase tracking-tighter">
                    {displayName ? 'Verified User' : 'Secured Node'}
                  </span>
                  <span className="text-xs font-black italic tracking-tight text-foreground -mt-0.5">
                    {displayName || shortenedAddress}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-solana-gradient p-[1px]">
                  <div className="w-full h-full rounded-[7px] bg-background flex items-center justify-center">
                    <User size={14} className="text-foreground" />
                  </div>
                </div>
                <ChevronDown size={14} className={cn("text-muted transition-transform", showProfile && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 glass-card p-2 z-[60] origin-top-right"
                  >
                    <div className="px-3 py-3 border-b border-border mb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Wallet Connected</p>
                      <p className="text-xs font-mono break-all text-solana-green font-bold">{walletAddress}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[9px] text-muted font-bold uppercase">Balance</span>
                        <span className="text-[10px] font-mono font-black text-foreground">
                          {isBalanceLoading ? '...' : `${balance?.toFixed(4)} SOL`}
                        </span>
                      </div>
                    </div>
                    
                    <Link to="/settings" onClick={() => setShowProfile(false)}>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-foreground/5 text-sm transition-all text-muted hover:text-foreground">
                        <Settings size={16} />
                        <span>Account Settings</span>
                      </button>
                    </Link>
                    
                    <button 
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-sm transition-all text-red-500/70 hover:text-red-500"
                    >
                      <LogOut size={16} />
                      <span className="font-bold">Disconnect Wallet</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/connect">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 bg-solana-gradient rounded-xl text-black text-xs font-black uppercase tracking-widest shadow-xl shadow-solana-purple/20"
              >
                Connect
              </motion.button>
            </Link>
          )}
        </div>
      </header>
    </>
  );
}

export function MobileBottomNav() {
  const location = useLocation();
  const { theme } = useThemeStore();
  
  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: LayoutDashboard, path: '/dashboard', label: 'Monitor' },
    { icon: Plus, path: '/assistant', label: 'VoPay', primary: true },
    { icon: Settings, path: '/settings', label: 'Setup' },
  ];

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 h-20 border-t md:hidden flex items-center justify-around px-2 backdrop-blur-xl transition-all duration-300",
      theme === 'dark' ? "bg-[#09090B]/90 border-white/5" : "bg-white/90 border-black/5"
    )}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        if (item.primary) {
          return (
            <Link 
              key={item.path}
              to={item.path}
              className="w-16 h-16 bg-solana-gradient rounded-2xl flex items-center justify-center -translate-y-6 shadow-2xl shadow-solana-purple/30 border-t border-white/20 active:scale-90 transition-transform"
            >
              <Icon size={28} className="text-black" />
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center gap-1.5 transition-all p-2 rounded-xl group relative',
              isActive ? 'text-solana-purple' : 'text-muted'
            )}
          >
            <Icon size={20} className={cn("transition-transform", isActive && "scale-110")} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
            {isActive && (
              <motion.div 
                layoutId="active-dot"
                className="absolute -top-3 w-1 h-1 bg-solana-purple rounded-full"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
