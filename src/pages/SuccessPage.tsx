import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  ArrowRight, 
  LayoutDashboard, 
  Plus,
  Volume2,
  Share2,
  FileText
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTransactionStore, useUserStore } from '../context/store';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentAnalysis, setAnalysis } = useTransactionStore();
  const { displayName } = useUserStore();
  const [copied, setCopied] = useState(false);
  
  // Get transaction signature from navigation state
  const txSignature = location.state?.signature || "4p9Q7xKXv3p9Ab2xL0p4Ax4p9zT1Ab2xL0p4Ax4p9";
  const shortHash = `${txSignature.slice(0, 12)}...${txSignature.slice(-12)}`;

  useEffect(() => {
    // Voice confirmation placeholder
    console.log("Play Voice: 'Transaction completed successfully.'");
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(txSignature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Success Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-solana-green/10 blur-[150px] rounded-full -z-10" />

      <div className="max-w-xl w-full space-y-10 relative z-10">
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 
            }}
            className="w-24 h-24 bg-solana-green/10 rounded-full flex items-center justify-center border-4 border-solana-green/30 shadow-[0_0_50px_rgba(20,241,149,0.2)] mx-auto"
          >
            <CheckCircle2 size={48} className="text-solana-green" />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-5xl font-black italic tracking-tighter text-foreground leading-[0.9]">
               {displayName ? `Great success, ${displayName}` : 'Transaction Sent'}
            </h2>
            <div className="flex items-center justify-center gap-2 text-muted text-[10px] font-mono uppercase tracking-[0.4em] font-black">
               <Volume2 size={12} className="text-solana-purple" />
               Voice Confirmed
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-8 space-y-8 glass-card rounded-[2.5rem] border-solana-green/20">
            {/* Header: Receipt */}
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-xl font-black italic tracking-tighter flex items-center gap-2 text-foreground">
                    <FileText size={20} className="text-solana-green" />
                    Transaction Receipt
                  </h3>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest font-black mt-1 opacity-50">Solana Devnet</p>
               </div>
               <div className="bg-solana-green/10 text-solana-green px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-solana-green/20">
                  Settled
               </div>
            </div>

            {/* Receipt Details */}
            <div className="space-y-2">
               <div className="flex justify-between items-center py-5 border-b border-border">
                  <span className="text-[10px] text-muted font-mono uppercase tracking-widest font-black">Amount Paid</span>
                  <span className="text-2xl font-black italic text-foreground underline decoration-solana-green decoration-2 underline-offset-4">
                    {location.state?.amount || currentAnalysis?.transaction.amount || '0.00'} SOL
                  </span>
               </div>
               <div className="flex justify-between items-center py-5 border-b border-border">
                  <span className="text-[10px] text-muted font-mono uppercase tracking-widest font-black">Recipient</span>
                  <span className="text-sm font-black text-foreground italic">
                    {currentAnalysis?.recipient.name || location.state?.recipient || 'External Wallet'}
                  </span>
               </div>
               <div className="flex justify-between items-center py-5">
                  <span className="text-[10px] text-muted font-mono uppercase tracking-widest font-black">Risk Clearance</span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                    (location.state?.riskLevel === 1 || currentAnalysis?.riskScore === 'low') ? "bg-solana-green/10 text-solana-green" :
                    (location.state?.riskLevel === 2 || currentAnalysis?.riskScore === 'medium') ? "bg-orange-500/10 text-orange-500" :
                    "bg-red-500/10 text-red-500"
                  )}>
                    {location.state?.riskLevel === 1 ? 'LOW RISK' : location.state?.riskLevel === 2 ? 'MEDIUM RISK' : 'HIGH RISK'}
                  </span>
               </div>
            </div>

            {/* Transaction Hash Card */}
            <div className="p-5 bg-foreground/3 rounded-2xl border border-border space-y-4">
               <span className="text-[10px] font-mono text-muted uppercase tracking-widest font-black opacity-30 block">Signature (TXID)</span>
               <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted font-black truncate mr-4">{shortHash}</span>
                  <div className="flex gap-2 shrink-0">
                     <button 
                       onClick={handleCopy}
                       className={cn(
                         "p-2.5 rounded-xl transition-all border",
                         copied ? "bg-solana-green/20 text-solana-green border-solana-green/20" : "bg-foreground/5 text-muted border-border hover:text-foreground hover:bg-foreground/10"
                       )}
                     >
                        <Copy size={16} />
                     </button>
                     <a 
                       href={location.state?.explorerUrl || `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="p-2.5 bg-foreground/5 border border-border rounded-xl transition-all text-muted hover:text-foreground hover:bg-foreground/10"
                     >
                        <ExternalLink size={16} />
                     </a>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-5"
        >
          <button 
            onClick={() => {
              setAnalysis(null);
              navigate('/dashboard');
            }}
            className="flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl glass text-muted font-black uppercase tracking-[0.2em] text-[10px] hover:bg-foreground/5 transition-all hover:text-foreground"
          >
            <LayoutDashboard size={18} /> Return Dashboard
          </button>
          <button 
            onClick={() => {
              setAnalysis(null);
              navigate('/assistant');
            }}
            className="flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl bg-foreground text-background font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={18} /> Send Another
          </button>
        </motion.div>
        
        <div className="text-center">
           <button className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em] hover:text-solana-purple transition-colors flex items-center gap-2 mx-auto">
             <Share2 size={12} /> Share Social Proof
           </button>
        </div>
      </div>
    </div>
  );
}
