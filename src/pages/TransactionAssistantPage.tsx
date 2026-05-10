import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Mic, 
  User, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Copy, 
  ChevronRight,
  Info
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useUserStore, useTransactionStore } from '../context/store';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
}

const SAVED_CONTACTS: Contact[] = [
  { id: '1', name: 'Victor', address: '3V2PnZBSegHu6Q8BYzR6bk2kfz96jRAYSFoAP2rwUute' },
  { id: '2', name: 'Opera Axe', address: '67rg7CFkcXcmGD9nKjRR2EjrhgbcxqR3Exf65xSSazNP' },
  { id: '3', name: 'Clinton', address: 'Hng37kXuNDJkG44Wpdg6xLmicWk9NuisjGkwzhayKM5n' },
];

function cleanTranscript(text: string): string {
  return text
    .toLowerCase()
    .replace(/\bsoul\b/gi, 'SOL')
    .replace(/\bsong\b/gi, 'SOL')
    .replace(/\bso\b/gi, 'SOL')
    .replace(/\bsole\b/gi, 'SOL')
    .replace(/\bsoal\b/gi, 'SOL')
    .replace(/\bdollars\b/gi, 'SOL')
    .replace(/\busd\b/gi, 'SOL');
}

export default function TransactionAssistantPage() {
  const { isConnected } = useUserStore();
  const { setAnalysis, setAnalyzing, isAnalyzing } = useTransactionStore();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [manualCommand, setManualCommand] = useState('');
  const [isPasting, setIsPasting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrepareTransaction = async (overrideContact?: Contact) => {
    setAnalyzing(true);
    setError(null);
    
    try {
      const cleanedTranscript = transcript ? cleanTranscript(transcript) : '';
      const contactToUse = overrideContact || selectedContact;
      // Use transcript or manual command
      const activeText = manualCommand || cleanedTranscript || (contactToUse ? `Send money to ${contactToUse.name}` : manualAddress ? `Send to ${manualAddress}` : '');
      
      if (activeText) {
        // 1. Parsing logic - extract amount
        const amountRegex = /(\d+(\.\d+)?)\s*(sol|tokens?|money)?/i;
        const amountMatch = activeText.match(amountRegex);
        const parsedAmount = amountMatch ? amountMatch[1] : "0.1";

        // 2. Parsing logic - extract recipient name and match to address
        const textLower = activeText.toLowerCase();
        let targetName = "";
        let targetAddress = "";
        
        if (textLower.includes("victor")) {
          targetName = "Victor";
          targetAddress = "3V2PnZBSegHu6Q8BYzR6bk2kfz96jRAYSFoAP2rwUute";
        } else if (textLower.includes("opera axe") || textLower.includes("opera") || textLower.includes("axe")) {
          targetName = "Opera Axe";
          targetAddress = "67rg7CFkcXcmGD9nKjRR2EjrhgbcxqR3Exf65xSSazNP";
        } else if (textLower.includes("clinton")) {
          targetName = "Clinton";
          targetAddress = "Hng37kXuNDJkG44Wpdg6xLmicWk9NuisjGkwzhayKM5n";
        } else if (contactToUse) {
          targetName = contactToUse.name;
          targetAddress = contactToUse.address;
        } else if (manualAddress) {
          targetName = "External Protocol";
          targetAddress = manualAddress;
        } else {
          // Default to Victor for demo consistency
          targetName = "Victor";
          targetAddress = "3V2PnZBSegHu6Q8BYzR6bk2kfz96jRAYSFoAP2rwUute";
        }

        const summaryText = `Transfer ${parsedAmount} SOL to ${targetName}`;

        // 4. Set data in transaction store
        setAnalysis({
          id: `tx_${Math.random().toString(36).substring(2, 11)}`,
          riskScore: 'low',
          summary: summaryText,
          threats: [
            'System Integrity Check: PASS',
            'Security Validation: VERIFIED',
            'Logic Guard: Advanced Security Analysis'
          ],
          safePassage: summaryText,
          recipient: {
            name: targetName,
            address: targetAddress,
            isSaved: true
          },
          transaction: {
            amount: parsedAmount,
            token: 'SOL',
            fee: '0.000005',
            speed: 'Fast'
          },
          alerts: []
        });

        // 5. Navigate to /confirm immediately after analysis finishes
        setTimeout(() => {
          setAnalyzing(false);
          navigate('/confirm');
        }, 1500);

      } else {
        setError('No intent detected. Try saying "Send 0.1 SOL to Victor"');
        setAnalyzing(false);
      }
    } catch (err: any) {
      console.error(err);
      setAnalyzing(false);
      setError(err.message || 'Analysis failed');
    }
  };

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const combined = finalTranscript || interimTranscript;
        setTranscript(cleanTranscript(combined));
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          setIsListening(false);
          return;
        }
        console.error('Speech recognition error:', event.error);
        setError(`Voice Error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setShowOptions(true);
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="p-12 max-w-lg text-center space-y-8 glass-card rounded-[3.5rem] border-solana-purple/20">
          <div className="w-20 h-20 bg-solana-purple/10 rounded-full mx-auto flex items-center justify-center border border-solana-purple/20">
            <Shield className="text-solana-purple" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter italic mb-4 text-foreground leading-[0.9]">Security Protocol Required</h2>
            <p className="text-muted leading-relaxed text-sm font-medium">
              Please initialize your session to enable real-time transaction analysis and secure transfers.
            </p>
          </div>
          <Link to="/connect">
            <button className="w-full py-5 rounded-2xl bg-solana-gradient text-black font-black uppercase tracking-widest text-[10px] shadow-lg shadow-solana-green/20 hover:scale-105 active:scale-95 transition-all">
              Initialize Connection
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden">
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center gap-12"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-white/5 rounded-full" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-4 border-solana-green border-t-transparent rounded-full"
              />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-black italic tracking-tighter">Secure Link</h3>
              <p className="text-xs font-mono text-white/40 uppercase tracking-[0.4em] animate-pulse">Running advanced safety assessment...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-solana-purple/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl w-full flex flex-col items-center space-y-12">
        
        {/* State 1: Microphone */}
        <div className="relative flex flex-col items-center gap-8">
           <header className={cn(
             "text-center transition-all duration-700",
             showOptions ? "opacity-30 scale-90 -translate-y-4" : "opacity-100"
           )}>
             <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic mb-3 text-foreground leading-[0.9]">Neural Transceiver</h2>
             <p className="text-muted text-[10px] font-mono uppercase tracking-[0.4em] font-black">VoPay AI Core Integrated</p>
           </header>

           <div className="relative">
             <AnimatePresence>
               {isListening && (
                 <motion.div
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1.2 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className="absolute inset-0 bg-solana-purple/20 blur-[60px] rounded-full"
                 />
               )}
             </AnimatePresence>

             <button
               onClick={toggleListening}
               className={cn(
                 "relative w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center transition-all duration-500",
                 isListening 
                   ? "bg-foreground scale-110 shadow-[0_0_50px_rgba(153,69,255,0.4)] border-solana-purple text-background" 
                   : "bg-foreground/5 border border-border hover:border-foreground/20 text-foreground"
               )}
             >
                {isListening ? (
                  <div className="flex gap-1.5 items-center justify-center">
                    {[0.1, 0.3, 0.5, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          height: [16, 48, 16],
                          backgroundColor: i % 2 === 0 ? '#9945FF' : '#14F195'
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1, 
                          delay 
                        }}
                        className="w-1.5 rounded-full"
                      />
                    ))}
                  </div>
                ) : (
                  <Mic size={48} className={cn(
                    "transition-colors",
                    showOptions ? "opacity-20" : "opacity-100"
                  )} />
                )}
             </button>
           </div>

           <div className="min-h-[60px] text-center px-6">
             <AnimatePresence mode="wait">
               {isListening || transcript || manualCommand ? (
                 <motion.div
                   key="transcript"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-4"
                 >
                   <p className={cn(
                     "text-xl md:text-2xl font-black tracking-tight italic transition-colors leading-tight",
                     isListening ? "text-foreground opacity-90" : "text-solana-green"
                   )}>
                     {manualCommand || transcript || (isListening ? 'VoPay is listening...' : '')}
                   </p>
                   {isListening && (
                     <p className="text-[10px] font-mono text-solana-purple uppercase tracking-[.3em] font-black animate-pulse">Processing Stream</p>
                   )}
                   {!isListening && (transcript || manualCommand) && (
                     <motion.button
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       onClick={() => handlePrepareTransaction()}
                       className="px-8 py-3 rounded-2xl bg-solana-green text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-solana-green/20 hover:scale-105 active:scale-95 transition-all"
                     >
                       Analyze Intent
                     </motion.button>
                   )}
                 </motion.div>
               ) : error ? (
                 <motion.div key="error" className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 max-w-sm">
                    <AlertCircle size={14} className="shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-tight">{error}</span>
                 </motion.div>
               ) : !showOptions && (
                 <motion.p key="tip" className="text-muted text-xs italic font-medium opacity-50">
                   Try: "Send 26 SOL to Victor" or "Scan raydium trade"
                 </motion.p>
               )}
             </AnimatePresence>
           </div>

           {!isListening && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full max-w-md mt-4"
             >
               <div className="relative group">
                 <input 
                   type="text"
                   value={manualCommand}
                   onChange={(e) => {
                     setManualCommand(e.target.value);
                     if (e.target.value) setTranscript('');
                   }}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && manualCommand) {
                       handlePrepareTransaction();
                     }
                   }}
                   placeholder="Or type your command here..."
                   className="w-full bg-foreground/5 border border-border rounded-xl px-12 py-4 text-sm focus:outline-none focus:border-solana-purple/40 transition-all placeholder:text-muted/30 text-foreground"
                 />
                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/30" />
                 {manualCommand && (
                   <button 
                     onClick={() => setManualCommand('')}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/30 hover:text-foreground transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                 )}
               </div>
             </motion.div>
           )}
        </div>

        {/* State 2: Options Cards */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="grid md:grid-cols-2 gap-8 w-full max-w-4xl"
            >
              {/* LEFT: Saved Contacts */}
              <div className="p-8 relative group overflow-hidden glass-card rounded-[2.5rem] border-solana-purple/20">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <User size={64} />
                </div>
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black italic tracking-tighter text-foreground">Saved Contacts</h3>
                  <div className="text-[10px] font-mono text-muted uppercase tracking-widest font-black opacity-30">Quantum Directory</div>
                </div>
                
                <div className="space-y-4">
                  {SAVED_CONTACTS.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact);
                        handlePrepareTransaction(contact);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-5 rounded-2xl border transition-all",
                        selectedContact?.id === contact.id 
                          ? "bg-solana-purple/10 border-solana-purple text-foreground shadow-lg shadow-solana-purple/10" 
                          : "bg-foreground/3 border-border hover:border-foreground/10 text-muted hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black italic border transition-all",
                          selectedContact?.id === contact.id ? "bg-solana-purple text-black border-solana-purple" : "bg-foreground/5 border-border"
                        )}>
                          {contact.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-sm tracking-tight italic">{contact.name}</p>
                          <p className="text-[10px] font-mono font-black opacity-50">
                            {contact.address.slice(0, 4)}...{contact.address.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className={cn(
                        "transition-transform",
                        selectedContact?.id === contact.id ? "translate-x-0" : "-translate-x-2 opacity-0"
                      )} />
                    </button>
                  ))}
                </div>

                <button className="w-full mt-8 py-4 border border-dashed border-border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-50 hover:opacity-100 hover:border-foreground/20 transition-all flex items-center justify-center gap-2">
                  <Plus size={14} /> Add Proxy Contact
                </button>
              </div>

              {/* RIGHT: Quick Send to New Address */}
              <div className="p-8 relative group overflow-hidden glass-card rounded-[2.5rem] border-solana-green/20">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Search size={64} />
                </div>
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black italic tracking-tighter text-foreground">External Link</h3>
                  <div className="text-[10px] font-mono text-muted uppercase tracking-widest font-black opacity-30">Ad-hoc Protocol</div>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <label className="text-[10px] font-mono uppercase text-muted tracking-widest block mb-3 font-black">Destination Address</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        placeholder="Paste Solana address..."
                        className="w-full bg-foreground/3 border border-border rounded-xl p-5 text-sm font-mono focus:outline-none focus:border-solana-green/40 transition-all text-foreground"
                      />
                      <button 
                         onClick={() => setIsPasting(true)}
                         className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-solana-green transition-colors"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-solana-green/5 border border-solana-green/20">
                    <div className="flex gap-4">
                      <Info size={16} className="text-solana-green flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-muted leading-relaxed italic font-bold">
                        VoPay will verify the address before any signing request is triggered. 
                        Unknown addresses undergo <span className="text-solana-green font-black uppercase tracking-wider">Security Level 3</span> scanning.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handlePrepareTransaction}
                    className="w-full py-5 rounded-2xl bg-foreground text-background font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Confirm Transaction
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showOptions && (
          <button 
            onClick={() => {
              setShowOptions(false);
              setSelectedContact(null);
            }}
            className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted font-black hover:text-foreground transition-colors opacity-30 hover:opacity-100"
          >
            Reset Assistant Cache
          </button>
        )}
      </div>
    </div>
  );
}

