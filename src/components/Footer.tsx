import { Link } from 'react-router-dom';
import { Github, Twitter, Mail, ExternalLink, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-20 px-6 md:px-12 border-t border-border mt-auto relative z-10 bg-background/50 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-solana-gradient rounded-lg rotate-12 flex items-center justify-center shadow-lg shadow-solana-purple/20">
                <span className="text-black font-black text-xs">V</span>
              </div>
              <span className="text-2xl font-black italic tracking-tighter">VoPay</span>
            </div>
            <p className="text-muted text-sm text-center md:text-left leading-relaxed font-medium">
              Open-source security infrastructure translating machine transactions into human-readable actions.
            </p>
          </div>
          
          <div className="flex items-center gap-8 text-[10px] uppercase font-black tracking-[0.2em] text-muted/40">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-solana-green" />
              <span>Devnet Live</span>
            </div>
            <span>© 2026 VOPAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
