import { motion } from 'motion/react';
import { 
  Shield, 
  Mic, 
  Zap, 
  Cpu, 
  Smartphone,
  Layers, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Lock,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-solana-green/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-40 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-solana-purple/10 blur-[120px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-solana-green/5 blur-[120px] -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-solana-purple/20 bg-solana-purple/5">
              <div className="w-1.5 h-1.5 rounded-full bg-solana-green animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-solana-purple">Built on Solana Devnet</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mb-12"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 bg-black rounded-3xl border-2 border-white/5 flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-solana-gradient blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-3xl" />
              <div className="relative z-10 flex flex-col items-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <Shield className="text-white mb-1" size={40} />
                </motion.div>
                <div className="flex gap-1 items-end h-4">
                  <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-solana-green rounded-full" />
                  <motion.div animate={{ height: [12, 16, 12] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-white rounded-full" />
                  <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 bg-solana-purple rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter italic px-4 leading-[0.9] mb-4"
            >
              <span className="block overflow-visible py-1">VoiceGuard for</span>
              <span className="text-gradient block overflow-visible py-1">Solana</span>
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-4xl font-black italic tracking-tight text-muted"
            >
              Understand Before You Sign.
            </motion.h2>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted/80 text-base md:text-lg max-w-2xl mb-12 font-medium tracking-tight px-6 leading-relaxed"
          >
            AI-powered voice transaction protection that explains risks <br className="hidden md:block" />
            before anything moves on-chain.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <Link to="/connect">
              <button className="px-10 py-5 rounded-2xl bg-solana-gradient text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-solana-purple/20 hover:scale-[1.03] active:scale-95 transition-all">
                Protect My Wallet
              </button>
            </Link>
            <button 
              onClick={() => alert("Demo video coming soon")}
              className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 hover:scale-[1.03] active:scale-95 transition-all"
            >
              Watch Demo
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-4 text-muted/40 font-black uppercase tracking-[0.3em] text-[8px]"
          >
            <div className="px-4 py-2 rounded-full border border-border bg-foreground/3 flex items-center gap-2 group hover:border-solana-green/30 hover:bg-solana-green/5 transition-all transition-all shadow-[0_0_15px_rgba(20,241,149,0.05)] hover:shadow-solana-green/10">
              <div className="w-1 h-1 rounded-full bg-solana-green" />
              <span>Built on Solana</span>
            </div>
            <div className="px-4 py-2 rounded-full border border-border bg-foreground/3 flex items-center gap-2 group hover:border-solana-purple/30 hover:bg-solana-purple/5 transition-all shadow-[0_0_15px_rgba(153,69,255,0.05)] hover:shadow-solana-purple/10">
              <div className="w-1 h-1 rounded-full bg-solana-purple" />
              <span>Powered by ElevenLabs</span>
            </div>
            <div className="px-4 py-2 rounded-full border border-border bg-foreground/3 flex items-center gap-2 group hover:border-white/20 hover:bg-white/5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-white/10">
              <div className="w-1 h-1 rounded-full bg-white" />
              <span>Infrastructure on Vercel</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* IMPACT / TRUST BAR */}
      <section className="py-12 bg-black border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-solana-gradient opacity-[0.03]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-red-500 mb-2">$530M+</span>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-tight">lost to scams <br/>and phishing</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-solana-purple mb-2">1.5B+</span>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-tight">failed transactions <br/>during congestion</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-solana-green mb-2">90%</span>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-tight">Users sign transactions <br/>they do not understand</p>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center text-center">
            <div className="h-px w-24 bg-border/40 mb-6" />
            <p className="text-xs md:text-sm font-black italic uppercase tracking-tighter text-foreground max-w-sm">
              VoPay explains every transaction <span className="text-solana-green">before</span> you approve it.
            </p>
          </div>
        </div>
      </section>

      {/* 2. WHY THIS MATTERS */}
      <section className="py-32 px-6 bg-foreground/[0.02] border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                <AlertTriangle size={12} /> The Problem
              </motion.div>
              <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black tracking-tighter italic text-foreground">
                Signing Blindly is <br /> 
                <span className="text-muted">the New Normal.</span>
              </motion.h2>
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex gap-4 p-4 rounded-2xl hover:bg-foreground/[0.02] transition-colors border border-transparent hover:border-border">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex flex-shrink-0 items-center justify-center text-muted font-mono text-xs font-black">01</div>
                  <p className="text-muted leading-relaxed text-sm font-medium">Most users approve transactions without understanding the code, risking total wallet drainage.</p>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl hover:bg-foreground/[0.02] transition-colors border border-transparent hover:border-border">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex flex-shrink-0 items-center justify-center text-muted font-mono text-xs font-black">02</div>
                  <p className="text-muted leading-relaxed text-sm font-medium">Sophisticated phishing sites mimic official dApps, stealing assets through "silent approvals".</p>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl hover:bg-foreground/[0.02] transition-colors border border-transparent hover:border-border">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex flex-shrink-0 items-center justify-center text-muted font-mono text-xs font-black">03</div>
                  <p className="text-muted leading-relaxed text-sm font-medium">Hidden fees and slippage can wipe out gains on high-frequency trades.</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="p-8 rounded-[2rem] glass-card border-solana-purple/30 glow-purple rotate-1 md:rotate-3">
                <div className="font-mono text-[10px] text-muted mb-4 uppercase tracking-[0.2em] font-black">Incoming Transaction</div>
                <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6 font-mono">
                  <p className="text-xs text-red-500 font-bold mb-1 italic uppercase tracking-wider">DANGER DETECTED</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-bold">This program contains a "CloseAccount" instruction directed at your primary SOL vault.</p>
                </div>
                <div className="space-y-2 opacity-20">
                  <div className="h-2 bg-foreground/20 rounded-full w-full" />
                  <div className="h-2 bg-foreground/20 rounded-full w-[80%]" />
                  <div className="h-2 bg-foreground/20 rounded-full w-[60%]" />
                </div>
              </div>
              <div className="absolute -inset-4 bg-solana-purple/20 blur-3xl -z-10 rounded-full dark:opacity-50" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. HOW VOPAY WORKS */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
             <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 italic text-foreground">The VoPay Workflow</h2>
             <p className="text-muted font-mono text-[10px] font-black uppercase tracking-[0.3em]">Three steps to complete security</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                step: '01', 
                title: 'Speak', 
                desc: 'Describe what you want to do or simply initiate a transaction. VoPay listens to the intent.', 
                icon: Mic,
                color: '#9945FF'
              },
              { 
                step: '02', 
                title: 'Analyze', 
                desc: 'Our AI engine simulates the transaction in a sandbox, checking for malicious instructions.', 
                icon: Smartphone,
                color: '#3B82F6'
              },
              { 
                step: '03', 
                title: 'Confirm', 
                desc: 'Review the human-readable breakdown. If it matches your intent, sign with confidence.', 
                icon: Shield,
                color: '#14F195'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
              >
                <div className="p-10 h-full glass-card rounded-[2.5rem] group hover:scale-[1.02] transition-all">
                  <div className="mb-8 flex justify-between items-start">
                    <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-foreground group-hover:text-background transition-all border border-border"
                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <item.icon size={28} />
                    </div>
                    <span className="text-5xl font-black italic opacity-[0.03]">{item.step}</span>
                  </div>
                  <h3 className="text-3xl font-black mb-4 italic tracking-tighter text-foreground">{item.title}</h3>
                  <p className="text-muted leading-relaxed text-sm font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECURITY FEATURES */}
      <section className="py-32 px-6 bg-foreground/[0.02] relative border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 border-b border-border pb-12">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 italic text-foreground leading-[0.9]">Hardened Security</h2>
              <p className="text-muted text-sm font-medium">Multi-layered protection powered by edge AI and real-time ledger analysis.</p>
            </div>
            <Link to="/assistant" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-solana-green hover:gap-4 transition-all">
              Try VoPay Assistant <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Risk Detection', desc: 'Real-time scans for rugpull patterns, burner wallets, and dangerous authority skips.', icon: Search },
              { title: 'AI Explanation', desc: 'Translates machine-level bytecode into plain English actions you can actually understand.', icon: Layers },
              { title: 'Voice Confirmation', desc: 'Optional voice biometrics to ensure the person clicking "Approve" is really you.', icon: Mic },
              { title: 'Safety Layer', desc: 'An invisible barrier between your seed phrase and the volatile web3 ecosystem.', icon: Lock },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-[2rem] glass-card group hover:bg-foreground/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-solana-green/10 group-hover:text-solana-green transition-colors">
                  <feature.icon size={20} className="text-muted group-hover:text-solana-green" />
                </div>
                <h4 className="text-xl font-black mb-3 italic tracking-tighter text-foreground">{feature.title}</h4>
                <p className="text-[13px] text-muted leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SOLANA ECOSYSTEM */}
      <section className="py-40 px-6">
        <div className="max-w-5xl mx-auto rounded-[3.5rem] bg-solana-gradient p-[1px] shadow-2xl shadow-solana-purple/20">
          <div className="bg-background rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-solana-gradient opacity-[0.02] group-hover:opacity-[0.05] transition-opacity" />
            <div className="relative z-10">
              <Globe className="text-solana-green mx-auto mb-10 scale-125" size={64} />
              <h2 className="text-4xl md:text-8xl font-black tracking-tighter mb-10 italic text-foreground leading-[0.85]">Built for <br/><span className="text-solana-purple">Solana.</span></h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto mb-16">
                <div className="p-6 rounded-3xl bg-foreground/3">
                   <p className="text-5xl font-black italic tracking-tighter mb-2 text-foreground">0.5ms</p>
                   <p className="text-[10px] uppercase text-muted tracking-[0.3em] font-black font-mono">Analysis Speed</p>
                </div>
                <div className="p-6 rounded-3xl bg-foreground/3">
                   <p className="text-5xl font-black italic tracking-tighter mb-2 text-foreground">2.8k+</p>
                   <p className="text-[10px] uppercase text-muted tracking-[0.3em] font-black font-mono">Real-time TPS</p>
                </div>
                <div className="p-6 rounded-3xl bg-foreground/3">
                   <p className="text-5xl font-black italic tracking-tighter mb-2 text-foreground">Free</p>
                   <p className="text-[10px] uppercase text-muted tracking-[0.3em] font-black font-mono">Developer Tier</p>
                </div>
              </div>

              <Link to="/connect">
                <button className="px-16 py-7 rounded-2xl bg-foreground text-background font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  Get Started Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
