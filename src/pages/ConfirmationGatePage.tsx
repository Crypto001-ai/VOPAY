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
        wallet as any, // WalletContextState satisfies AnchorWallet if publicKey is present
        recipient.address,
        transaction.amount,
        riskScore as 'low' | 'medium' | 'high'
      );

      // Log metadata as fire-and-forget
      logTransactionMetadata({
        connection,
        wallet: wallet as any,
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
            {isExecuting ? 'Sending Transaction' : 'Confirm Transaction'}
          </h2>
          <p className="text-muted text-[10px] font-mono uppercase tracking-[0.4em] font-black">VoPay Secure Transfer</p>
        </header>

        <div className="p-8 space-y-8 relative overflow-hidden glass-card rounded-[2.5rem]">
          {/* Detailed Confirmation Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-center py-4 border-b border-white/5">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest font-black">Sending</span>
              <span className="text-lg font-black italic text-solana-green">{transaction.amount} SOL</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-white/5">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest font-black">To</span>
              <div className="text-right">
                <p className="text-sm font-black italic text-foreground">{recipient.name}</p>
                <p className="text-[9px] font-mono text-muted opacity-50">{recipient.address.slice(0, 4)}...{recipient.address.slice(-4)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-white/5">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest font-black">Network Fee</span>
              <span className="text-[10px] font-mono text-foreground font-black">~0.00025 SOL</span>
            </div>
            <div className="flex justify-between items-center py-4 font-black">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Network</span>
              <span className="text-[10px] font-mono text-solana-purple uppercase tracking-widest">Devnet</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center text-foreground">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest font-black">Safety Analysis</span>
              <RiskBadge level={riskScore} />
            </div>
            
            <div className="p-5 rounded-2xl bg-foreground/3 border border-border italic text-center">
               <p className="text-sm text-foreground leading-relaxed font-black mb-2 uppercase tracking-tighter">AI Verification Complete</p>
               <p className="text-xs text-muted leading-relaxed font-bold">
                 "{summary}"
               </p>
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
            {isExecuting ? 'Processing...' : 'SEND NOW'}
          </button>
        </div>

        <p className="text-center text-[9px] font-mono text-muted uppercase tracking-[0.3em] font-black opacity-30">
           Node: VOP-ALPHA-4 • Latency: 24ms
        </p>
      </div>
    </div>
  );
}
