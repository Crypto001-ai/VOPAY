import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle, 
  X, 
  Check, 
  Fingerprint, 
  Wallet,
  Lock,
  Loader2
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { RiskBadge } from '../components/RiskBadge';
import { useTransactionStore, useUserStore } from '../context/store';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { executeVopayTransfer, logTransactionMetadata } from '../lib/executeTransfer';

export default function ConfirmationGatePage() {
  const { currentAnalysis, setAnalysis } = useTransactionStore();
  const { isConnected } = useUserStore();
  const navigate = useNavigate();
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentAnalysis) {
    navigate('/assistant');
    return null;
  }

  const { recipient, transaction, riskScore, summary } = currentAnalysis;

  const handleConfirm = async () => {
    if (!wallet.publicKey || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      // Execute the real VoPay transfer via smart contract
      const result = await executeVopayTransfer(
        connection,
        wallet,
        recipient.address,
        transaction.amount,
        riskScore as 'low' | 'medium' | 'high'
      );

      // Log metadata as fire-and-forget
      logTransactionMetadata({
        recipient: recipient.address,
        amount: transaction.amount,
        tokenSymbol: 'SOL',
        riskLevel: result.riskLevel,
        aiSummary: summary
      });

      // Signature exists! Success
      navigate('/success', { 
        state: { 
          signature: result.signature,
          amount: result.amount,
          recipient: result.recipient,
          riskLevel: result.riskLevel
        } 
      });
    } catch (err: any) {
      console.error('Transaction Failed:', err);
      setError(err.message || 'Transaction rejected or failed');
      setIsExecuting(false);
    }
  };

  const handleCancel = () => {
    setAnalysis(null);
    navigate('/assistant');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Pulse */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[150px] rounded-full -z-10 transition-colors duration-1000",
        riskScore === 'high' ? 'bg-red-500/10' : riskScore === 'medium' ? 'bg-orange-500/10' : 'bg-solana-green/10'
      )} />

      <div className="max-w-xl w-full space-y-8 relative z-10">
        <header className="text-center space-y-2">
          <div className="flex justify-center mb-4">
             <div className={cn(
               "w-16 h-16 rounded-3xl flex items-center justify-center border-2 transition-all",
               riskScore === 'high' ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)] text-red-500' : 
               riskScore === 'medium' ? 'bg-orange-500/10 border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.2)] text-orange-500' :
               'bg-solana-green/10 border-solana-green/40 shadow-[0_0_30px_rgba(20,241,149,0.2)] text-solana-green'
             )}>
                {isExecuting ? <Loader2 size={32} className="animate-spin" /> : <Lock size={32} />}
             </div>
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter text-foreground">
            {isExecuting ? 'Requesting Signature' : 'Final Confirmation'}
          </h2>
          <p className="text-muted text-[10px] font-mono uppercase tracking-[0.4em] font-black">VoPay Secure Intercept Protocol</p>
        </header>

        <div className="p-8 space-y-8 relative overflow-hidden glass-card rounded-[2.5rem]">
          {/* Transaction Flow Diagram */}
          <div className="flex items-center justify-between relative bg-foreground/3 p-6 rounded-2xl border border-border">
             <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center border border-border mx-auto">
                   <Wallet size={20} className="text-muted" />
                </div>
                <p className="text-[9px] font-mono text-muted uppercase tracking-widest font-black">Your Wallet</p>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center gap-2 overflow-hidden px-4">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent relative">
                   <motion.div 
                     animate={{ left: isExecuting ? ['-20%', '120%'] : ['0%', '0%'] }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                     className="absolute top-1/2 -translate-y-1/2 w-8 h-1 bg-solana-purple blur-[2px] rounded-full"
                   />
                </div>
                <div className="bg-background/40 px-3 py-1 rounded-full border border-border backdrop-blur-sm">
                   <span className="text-[10px] font-mono font-black text-solana-green">{transaction.amount} {transaction.token}</span>
                </div>
             </div>

             <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-solana-purple/10 rounded-full flex items-center justify-center border border-solana-purple/30 mx-auto text-solana-purple">
                   <span className="font-black italic">{recipient.name[0]}</span>
                </div>
                <p className="text-[9px] font-mono text-muted uppercase tracking-widest font-black">{recipient.name}</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center text-foreground">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest font-black">AI Safety Assessment</span>
              <RiskBadge level={riskScore} />
            </div>
            
            <div className="p-5 rounded-2xl bg-foreground/3 border border-border italic">
               <p className="text-sm text-foreground leading-relaxed font-black">
                 "{summary}"
               </p>
            </div>

            <div className={cn(
              "p-4 rounded-xl border flex items-center gap-4 transition-all",
              error ? "bg-red-500/10 border-red-500/20 text-red-500" : "border-border bg-foreground/3"
            )}>
               {error ? (
                 <>
                   <ShieldAlert size={16} />
                   <p className="text-[10px] font-black uppercase tracking-widest italic">{error}</p>
                 </>
               ) : (
                 <>
                   <ShieldCheck size={16} className="text-solana-green" />
                   <p className="text-[10px] font-mono text-muted uppercase tracking-[.2em] font-black">Devnet Environment Active</p>
                 </>
               )}
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
             <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
             <div className="text-xs text-red-500/80 italic leading-relaxed font-black">
                <span className="font-black uppercase tracking-widest mr-2 underline decoration-red-500/30 underline-offset-4">Mandatory Warning:</span>
                Always verify transactions before signing. VoPay simulates the payload, but standard blockchain risks apply.
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <button 
            disabled={isExecuting}
            onClick={handleCancel}
            className="flex items-center justify-center gap-3 py-5 rounded-2xl glass text-muted font-black uppercase tracking-[0.2em] text-[10px] hover:bg-foreground/5 transition-all hover:text-foreground disabled:opacity-50"
          >
            <X size={16} /> Cancel
          </button>
          <button 
            disabled={isExecuting}
            onClick={handleConfirm}
            className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-foreground text-background font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {isExecuting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
            {isExecuting ? 'Processing...' : 'Confirm Signing'}
          </button>
        </div>

        <p className="text-center text-[9px] font-mono text-muted uppercase tracking-[0.3em] font-black opacity-30">
           Node: VOP-ALPHA-4 • Latency: 24ms
        </p>
      </div>
    </div>
  );
}
