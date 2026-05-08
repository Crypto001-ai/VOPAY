import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  Activity, 
  Zap, 
  CheckCircle2, 
  ShieldAlert, 
  Lock, 
  Mic, 
  Contact, 
  Settings, 
  Search,
  TrendingUp,
  Fingerprint,
  ArrowRight
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { useUserStore } from '../context/store';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { DisplayNameModal } from '../components/DisplayNameModal';

export default function DashboardPage() {
  const { isConnected, walletAddress, displayName, balance, isBalanceLoading, solanaNetwork } = useUserStore();
  const [showNameModal, setShowNameModal] = useState(false);

  const isDevnet = solanaNetwork === 'devnet';

  useEffect(() => {
    if (isConnected && !displayName) {
      // Small delay to ensure smooth transition after connection
      const timer = setTimeout(() => {
        setShowNameModal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isConnected, displayName]);

  const history = [
    { title: 'Jupiter Swap', date: '2 mins ago', amount: '+1,200 USDC', risk: 'low', type: 'in', program: 'Jupiter Aggregator', recipient: 'Ax...4p' },
    { title: 'Contract Approval', date: '1 hour ago', amount: '0 SOL', risk: 'high', type: 'out', program: 'Unknown ID: 7x...p9Q', recipient: 'Unknown' },
    { title: 'LP Deposit', date: '5 hours ago', amount: '-50.00 SOL', risk: 'low', type: 'out', program: 'Raydium AMM', recipient: 'Raydium v2' },
    { title: 'Yield Harvest', date: 'Yesterday', amount: '+5.20 SOL', risk: 'medium', type: 'in', program: 'Orca Aquafarm', recipient: 'Orca' },
  ];

  const shortenedAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : 'Not Connected';

  return (
    <div className="min-h-screen p-6 md:p-10 pb-40">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* NETWORK WARNING */}
        <AnimatePresence>
          {isConnected && !isDevnet && solanaNetwork && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 40 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="p-6 rounded-2xl bg-red-500/10 border border-red-500 text-red-500 flex flex-col items-center justify-center gap-4 text-center overflow-hidden"
            >
              <ShieldAlert size={40} className="animate-bounce" />
              <div>
                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1">Incompatible Network Detected</h3>
                <p className="text-xs font-mono font-black uppercase tracking-widest opacity-80">
                  VoPay is optimized for Devnet. Current: {solanaNetwork.replace('-', ' ')}
                </p>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] bg-red-500 text-white px-4 py-2 rounded-full">
                Please switch wallet network to Devnet for testing.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP SECTION: Welcome & Balances */}
        <header className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-4xl font-black tracking-tighter italic mb-2 text-foreground">
              {isConnected ? (
                <>Welcome back, <span className="text-solana-purple">{displayName || shortenedAddress}</span></>
              ) : (
                <>Welcome to <span className="text-muted">VoPay</span></>
              )}
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-muted bg-foreground/5 px-3 py-1.5 rounded-lg border border-border">
              <Fingerprint size={12} className="text-solana-purple" />
              {shortenedAddress}
              {isConnected && (
                <span className={cn(
                  "ml-2 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                  isDevnet ? "bg-solana-green/10 text-solana-green" : "bg-red-500/10 text-red-500"
                )}>
                  {solanaNetwork || 'OFFLINE'}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="p-6 md:w-64 glass-card rounded-2xl border border-solana-purple/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <TrendingUp size={20} />
              </div>
              <p className="text-[10px] uppercase text-muted tracking-widest font-mono mb-2 font-black">SOL Balance</p>
              {isConnected ? (
                <div className="text-2xl font-black italic text-foreground">
                  {isBalanceLoading ? (
                    <span className="inline-block w-20 h-8 bg-foreground/10 animate-pulse rounded-lg" />
                  ) : (
                    <>{balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || '0.00'} <span className="text-xs text-muted">SOL</span></>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-black italic text-foreground opacity-30">0.00 <span className="text-xs text-muted">SOL</span></div>
              )}
              {isConnected && isDevnet && <div className="mt-2 text-[10px] text-solana-green font-black uppercase tracking-widest">Devnet Realms</div>}
              {!isDevnet && isConnected && <div className="mt-2 text-[10px] text-red-500 font-black uppercase tracking-widest">Network Mismatch</div>}
            </div>
            <div className="p-6 md:w-64 glass-card rounded-2xl border border-solana-green/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <TrendingUp size={20} />
              </div>
              <p className="text-[10px] uppercase text-muted tracking-widest font-mono mb-2 font-black">USDC Balance</p>
              <div className="text-2xl font-black italic text-foreground opacity-30">
                {isConnected ? '0.00' : '0.00'} <span className="text-xs text-muted">USDC</span>
              </div>
              <div className="mt-2 text-[10px] text-muted font-black uppercase tracking-widest">Mainnet Only</div>
            </div>
          </div>
        </header>

        {/* SECURITY INSIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 flex items-center gap-6 glass-card rounded-2xl group hover:bg-foreground/3 transition-all border border-border">
            <div className="w-14 h-14 rounded-2xl bg-solana-purple/10 flex items-center justify-center text-solana-purple border border-solana-purple/20">
              <Activity size={28} />
            </div>
            <div>
              <p className="text-3xl font-black italic text-foreground">1,402</p>
              <p className="text-[10px] uppercase text-muted tracking-widest font-mono font-black">Analyzed</p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-6 glass-card rounded-2xl group hover:bg-foreground/3 transition-all border border-border">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
              <ShieldAlert size={28} />
            </div>
            <div>
              <p className="text-3xl font-black italic text-foreground">24</p>
              <p className="text-[10px] uppercase text-muted tracking-widest font-mono font-black">Prevented</p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-6 glass-card rounded-2xl group hover:bg-foreground/3 transition-all border border-border">
            <div className="w-14 h-14 rounded-2xl bg-solana-green/10 flex items-center justify-center text-solana-green border border-solana-green/20">
              <Lock size={28} />
            </div>
            <div>
              <p className="text-3xl font-black italic text-foreground">$12.4M</p>
              <p className="text-[10px] uppercase text-muted tracking-widest font-mono font-black">Protected</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* RECENT TRANSACTIONS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xl font-black tracking-tighter italic text-foreground">Recent Safety Audits</h4>
              <button className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-foreground transition-colors">Export Logs</button>
            </div>

            <div className="space-y-4">
              {history.map((tx, idx) => (
                <div 
                  key={idx}
                  className="p-5 flex items-center justify-between group glass-card rounded-2xl border border-border hover:bg-foreground/[0.03] transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                      tx.risk === 'high' ? "bg-red-500/10 border-red-500/20" : "bg-foreground/5 border-border group-hover:border-foreground/20"
                    )}>
                      {tx.type === 'in' ? <ArrowDownLeft className="text-solana-green" size={20} /> : <ArrowUpRight className="text-muted" size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-sm tracking-tight text-foreground italic">{tx.title}</span>
                        {tx.risk === 'low' && <CheckCircle2 size={12} className="text-solana-green" />}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted font-mono font-black">
                        <span className="underline opacity-50">{tx.recipient}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-mono font-black",
                        tx.type === 'in' ? "text-solana-green" : "text-foreground"
                      )}>
                        {tx.amount}
                      </p>
                      <RiskBadge level={tx.risk as any} className="scale-75 origin-right" />
                    </div>
                    <ExternalLink size={16} className="text-muted/20 group-hover:text-muted transition-colors hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-4 text-[10px] font-mono font-black uppercase tracking-[0.4em] text-muted/30 hover:text-muted transition-all border-t border-border">
              Load Audit Archives
            </button>
          </div>

          {/* QUICK ACTIONS */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-xl font-black tracking-tighter italic text-foreground">Quick Actions</h4>
            <div className="grid grid-cols-1 gap-4">
              <Link to="/assistant">
                <div className="p-6 glass-card rounded-2xl border border-border flex items-center justify-between group hover:border-solana-purple/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-solana-purple/10 flex items-center justify-center text-solana-purple border border-solana-purple/20">
                      <Search size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">Analyze Transaction</span>
                  </div>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-solana-purple" />
                </div>
              </Link>
              <Link to="/assistant">
                <div className="p-6 glass-card rounded-2xl border border-border flex items-center justify-between group hover:border-solana-green/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-solana-green/10 flex items-center justify-center text-solana-green border border-solana-green/20">
                      <Mic size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">Voice Assistant</span>
                  </div>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-solana-green" />
                </div>
              </Link>
              <div className="p-6 glass-card rounded-2xl border border-border flex items-center justify-between group hover:bg-foreground/[0.03] transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-muted border border-border">
                    <Contact size={20} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground">Saved Contacts</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-muted" />
              </div>
              <Link to="/settings">
                <div className="p-6 glass-card rounded-2xl border border-border flex items-center justify-between group hover:border-solana-purple transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-muted border border-border">
                      <Settings size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">Security Settings</span>
                  </div>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-solana-purple" />
                </div>
              </Link>
            </div>

            <div className="p-8 rounded-[2rem] glass-card border border-border mt-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-solana-gradient opacity-[0.02] group-hover:opacity-[0.05] transition-opacity" />
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-mono text-muted mb-4 font-black tracking-widest">Vault Health</p>
                <div className="h-2.5 bg-foreground/5 rounded-full overflow-hidden border border-border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '98%' }}
                    className="h-full bg-solana-green shadow-[0_0_20px_rgba(20,241,149,0.4)]"
                  />
                </div>
                <p className="text-[10px] mt-4 font-mono font-black text-solana-green tracking-widest uppercase italic">Secure • 98/100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DisplayNameModal 
        isOpen={showNameModal} 
        onClose={() => setShowNameModal(false)} 
      />
    </div>
  );
}
