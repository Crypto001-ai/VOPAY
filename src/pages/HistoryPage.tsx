import { motion } from 'motion/react';
import { 
  History as HistoryIcon,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Download
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { cn } from '../lib/utils';

export default function HistoryPage() {
  const history = [
    { title: 'Jupiter Swap', date: '2 mins ago', amount: '+1,200 USDC', risk: 'low', type: 'in', program: 'Jupiter Aggregator', recipient: 'Ax...4p' },
    { title: 'Contract Approval', date: '1 hour ago', amount: '0 SOL', risk: 'high', type: 'out', program: 'Unknown ID: 7x...p9Q', recipient: 'Unknown' },
    { title: 'LP Deposit', date: '5 hours ago', amount: '-50.00 SOL', risk: 'low', type: 'out', program: 'Raydium AMM', recipient: 'Raydium v2' },
    { title: 'Yield Harvest', date: 'Yesterday', amount: '+5.20 SOL', risk: 'medium', type: 'in', program: 'Orca Aquafarm', recipient: 'Orca' },
    { title: 'NFT Mint', date: '2 days ago', amount: '-2.50 SOL', risk: 'low', type: 'out', program: 'Candy Machine', recipient: 'Magic Eden' },
    { title: 'Token Send', date: '3 days ago', amount: '-100.00 PYTH', risk: 'low', type: 'out', program: 'System Program', recipient: '8v...2k' },
    { title: 'USDC Receive', date: '4 days ago', amount: '+500.00 USDC', risk: 'low', type: 'in', program: 'Circle', recipient: 'Direct' },
  ];

  return (
    <div className="min-h-screen p-6 md:p-10 pb-40">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-solana-purple/10 flex items-center justify-center text-solana-purple border border-solana-purple/20">
              <HistoryIcon size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase text-foreground">Transaction History</h2>
              <p className="text-[10px] font-mono font-black uppercase tracking-widest text-muted">Audit logs and safety traces</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search transactions, addresses..." 
                className="w-full bg-foreground/5 border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-solana-purple/50 transition-all"
              />
            </div>
            <button className="px-6 py-3 bg-foreground/5 border border-border rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-muted hover:text-foreground transition-all">
              <Filter size={14} />
              Filter
            </button>
            <button className="px-6 py-3 bg-foreground/5 border border-border rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-muted hover:text-foreground transition-all">
              <Download size={14} />
              Export
            </button>
          </div>
        </header>

        <section className="space-y-4">
          {history.map((tx, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
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
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline opacity-40">{tx.program}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-mono font-black",
                    tx.type === 'in' ? "text-solana-green" : "text-foreground"
                  )}>
                    {tx.amount}
                  </p>
                  <RiskBadge level={tx.risk as any} className="scale-75 origin-right" />
                </div>
                <button className="p-2 rounded-lg bg-foreground/5 text-muted hover:text-foreground transition-all hidden sm:block">
                  <ExternalLink size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="flex justify-center pt-8">
          <button className="px-8 py-4 text-[10px] font-mono font-black uppercase tracking-[0.4em] text-muted/30 hover:text-muted transition-all border border-border/50 rounded-2xl hover:bg-foreground/[0.02]">
            Load More Archives
          </button>
        </div>
      </div>
    </div>
  );
}
